import { prisma } from "./prisma";
import { computeSlots, hasConflict, type Slot } from "./core/availability";
import {
  bogotaToUtc,
  dayOfWeekBogota,
  todayBogota,
  addDays,
} from "./core/dates";
import { ACTIVE_STATUSES, DomainError } from "./core/status";
import {
  generateAppointmentCode,
  generateBackupCode,
  generateCheckinToken,
} from "./core/codes";

export async function getSettings() {
  const s = await prisma.barbershopSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!s) {
    return {
      minBookingNotice: 30,
      maxBookingHorizon: 30,
      cancellationWindow: 120,
      bufferMinutes: 5,
      lateTolerance: 30,
      checkinWindowBefore: 20,
      address: "Cartagena, Colombia",
      name: "La Barbería",
    };
  }
  return s;
}

/** Citas activas + bloqueos del barbero para un día local de Bogotá. */
export async function getBusyIntervals(barberId: string, date: string) {
  const dayStart = bogotaToUtc(date, "00:00");
  const dayEnd = bogotaToUtc(addDays(date, 1), "00:00");

  const [appointments, timeOff] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId,
        status: { in: ACTIVE_STATUSES },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.barberTimeOff.findMany({
      where: { barberId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  return [...appointments, ...timeOff];
}

/** Slots libres de un barbero para una fecha y una lista de servicios. */
export async function getSlotsForBarber(
  barberId: string,
  date: string,
  durationMinutes: number
): Promise<Slot[]> {
  const settings = await getSettings();
  const dow = dayOfWeekBogota(date);

  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    select: { id: true, barbershopId: true },
  });

  const [hours, schedules, busy] = await Promise.all([
    barber?.barbershopId
      ? prisma.barbershopHours.findFirst({
          where: { barbershopId: barber.barbershopId, dayOfWeek: dow },
        })
      : prisma.barbershopHours.findFirst({ where: { dayOfWeek: dow } }),
    prisma.barberSchedule.findMany({ where: { barberId, dayOfWeek: dow } }),
    getBusyIntervals(barberId, date),
  ]);

  // Si no hay horario configurado específico, usamos el horario estándar 09:00 - 19:00 (domingos cerrado)
  const defaultOpen = dow !== 0;
  const shopHours = hours
    ? !hours.isClosed
      ? { openTime: hours.openTime, closeTime: hours.closeTime }
      : null
    : defaultOpen
    ? { openTime: "09:00", closeTime: "19:00" }
    : null;

  return computeSlots({
    date,
    durationMinutes,
    bufferMinutes: settings.bufferMinutes,
    shopHours,
    barberWindows: schedules.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
    })),
    busy,
    now: new Date(),
    minNoticeMinutes: settings.minBookingNotice,
  });
}

export interface CreateAppointmentInput {
  clientId: string;
  barberId: string;
  barbershopId?: string;
  serviceIds: string[];
  /** "YYYY-MM-DD" local Bogotá */
  date: string;
  /** "HH:mm" local Bogotá */
  time: string;
  clientNotes?: string;
}

/** Crea una cita validando todas las reglas de negocio. */
export async function createAppointment(input: CreateAppointmentInput) {
  const settings = await getSettings();

  // Regla 4: horizonte máximo
  const today = todayBogota();
  const maxDate = addDays(today, settings.maxBookingHorizon);
  if (input.date < today || input.date > maxDate) {
    throw new DomainError(
      `Solo puedes reservar entre hoy y ${settings.maxBookingHorizon} días adelante`
    );
  }

  const services = await prisma.service.findMany({
    where: { id: { in: input.serviceIds }, isActive: true },
  });
  if (services.length === 0 || services.length !== input.serviceIds.length) {
    throw new DomainError("Alguno de los servicios no existe o no está activo");
  }

  const durationMinutes = services.reduce((a, s) => a + s.durationMinutes, 0);
  const subtotal = services.reduce((a, s) => a + s.price, 0);

  const barber = await prisma.barber.findUnique({
    where: { id: input.barberId },
  });
  if (!barber || barber.status !== "ACTIVO") {
    throw new DomainError("El barbero no está disponible");
  }

  const shopId = input.barbershopId || barber.barbershopId;

  // Reglas 2, 3, 5 y 6: el horario pedido debe estar entre los slots libres
  const slots = await getSlotsForBarber(
    input.barberId,
    input.date,
    durationMinutes
  );
  const startsAt = bogotaToUtc(input.date, input.time);
  const slot = slots.find((s) => s.start.getTime() === startsAt.getTime());
  if (!slot) {
    throw new DomainError(
      "Ese horario se acaba de ocupar. Elige otro de los disponibles."
    );
  }
  const endsAt = slot.end;

  return prisma.$transaction(async (tx) => {
    const busy = await tx.appointment.findMany({
      where: {
        barberId: input.barberId,
        status: { in: ACTIVE_STATUSES },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { startsAt: true, endsAt: true },
    });
    if (hasConflict(startsAt, endsAt, busy, 0)) {
      throw new DomainError(
        "Ese horario se acaba de ocupar. Elige otro de los disponibles."
      );
    }

    const appointment = await tx.appointment.create({
      data: {
        code: generateAppointmentCode(),
        clientId: input.clientId,
        barberId: input.barberId,
        barbershopId: shopId,
        startsAt,
        endsAt,
        status: "CONFIRMADA",
        subtotal,
        total: subtotal,
        clientNotes: input.clientNotes ?? "",
        services: {
          create: services.map((s) => ({
            serviceId: s.id,
            nameSnapshot: s.name,
            priceSnapshot: s.price,
            durationSnapshot: s.durationMinutes,
          })),
        },
        checkin: {
          create: {
            checkinToken: generateCheckinToken(),
            backupCode: generateBackupCode(),
          },
        },
      },
      include: { services: true, checkin: true, barber: true },
    });

    return appointment;
  });
}
