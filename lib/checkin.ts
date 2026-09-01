import { prisma } from "./prisma";
import { getSettings } from "./booking";
import { formatTime12 } from "./core/dates";
import { assertTransition, type AppointmentStatus } from "./core/status";

export type CheckinResult =
  | {
      ok: true;
      appointment: {
        id: string;
        clientName: string;
        services: string[];
        time: string;
        barberName: string;
      };
    }
  | {
      ok: false;
      reason: "NO_EXISTE" | "YA_USADA" | "FUERA_DE_HORARIO" | "ESTADO_INVALIDO";
      detail: string;
    };

interface ValidateInput {
  token?: string;
  backupCode?: string;
  validatorUserId: string;
  deviceInfo?: string;
}

/** Valida un check-in por token de QR o código de respaldo. Un solo uso. */
export async function validateCheckin(
  input: ValidateInput
): Promise<CheckinResult> {
  const where = input.token
    ? { checkinToken: input.token }
    : { backupCode: (input.backupCode ?? "").toUpperCase().trim() };

  const checkin = await prisma.appointmentCheckin.findUnique({
    where: where as { checkinToken: string } | { backupCode: string },
    include: {
      appointment: {
        include: {
          client: true,
          barber: true,
          services: true,
        },
      },
    },
  });

  if (!checkin) {
    return { ok: false, reason: "NO_EXISTE", detail: "No existe" };
  }

  const appt = checkin.appointment;

  if (checkin.usedAt) {
    return {
      ok: false,
      reason: "YA_USADA",
      detail: `Ya fue usada · ${formatTime12(checkin.usedAt)}`,
    };
  }

  if (appt.status !== "CONFIRMADA") {
    return {
      ok: false,
      reason: "ESTADO_INVALIDO",
      detail: `La cita está en estado ${appt.status.toLowerCase().replace("_", " ")}`,
    };
  }

  const settings = await getSettings();
  const now = Date.now();
  const windowStart =
    appt.startsAt.getTime() - settings.checkinWindowBefore * 60_000;
  const windowEnd = appt.startsAt.getTime() + settings.lateTolerance * 60_000;

  if (now < windowStart) {
    const mins = Math.ceil((windowStart - now) / 60_000);
    const detail =
      mins >= 60
        ? `Fuera de horario · faltan ${Math.round(mins / 60)} h`
        : `Fuera de horario · faltan ${mins} min`;
    return { ok: false, reason: "FUERA_DE_HORARIO", detail };
  }
  if (now > windowEnd) {
    return {
      ok: false,
      reason: "FUERA_DE_HORARIO",
      detail: "Fuera de horario · la ventana ya pasó",
    };
  }

  // Transición de estado validada por la máquina de estados
  assertTransition(appt.status as AppointmentStatus, "EN_CURSO");

  // Un solo uso: el update condicional a usedAt=null evita el doble canje
  const updated = await prisma.appointmentCheckin.updateMany({
    where: { id: checkin.id, usedAt: null },
    data: {
      usedAt: new Date(),
      validatedById: input.validatorUserId,
      deviceInfo: input.deviceInfo ?? null,
    },
  });
  if (updated.count === 0) {
    return { ok: false, reason: "YA_USADA", detail: "Ya fue usada" };
  }

  await prisma.appointment.update({
    where: { id: appt.id },
    data: { status: "EN_CURSO" },
  });

  return {
    ok: true,
    appointment: {
      id: appt.id,
      clientName: appt.client.name,
      services: appt.services.map((s) => s.nameSnapshot),
      time: formatTime12(appt.startsAt),
      barberName: appt.barber.displayName,
    },
  };
}
