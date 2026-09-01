// Datos de demostración: clientes de prueba y citas en todos los estados,
// generadas alrededor de la fecha actual para poder probar la app de una vez.
//
//   npm run db:demo
//
// Borra TODAS las citas existentes y las vuelve a crear. Los barberos,
// servicios y horarios del seed base no se tocan (corre `npm run db:setup`
// primero si la base está vacía).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  todayBogota,
  addDays,
  bogotaToUtc,
  dayOfWeekBogota,
  formatTime12,
  utcToBogota,
} from "../lib/core/dates";
import {
  generateAppointmentCode,
  generateBackupCode,
  generateCheckinToken,
} from "../lib/core/codes";

const prisma = new PrismaClient();

const DEMO_CLIENTS = [
  { name: "Carlos Pérez", email: "carlos@demo.app", phone: "3001112233" },
  { name: "Andrés Mejía", email: "andres@demo.app", phone: "3002223344" },
  { name: "Juan Camilo Rojas", email: "juancamilo@demo.app", phone: "3003334455" },
  { name: "Santiago Torres", email: "santiago@demo.app", phone: "3004445566" },
  { name: "Miguel Díaz", email: "miguel@demo.app", phone: "3005556677" },
  { name: "David Castro", email: "david@demo.app", phone: "3006667788" },
  { name: "Sebastián Gómez", email: "sebastian@demo.app", phone: "3007778899" },
  { name: "Daniel Herrera", email: "daniel@demo.app", phone: "3008889900" },
];

type ServiceRow = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
};

interface CreateOpts {
  clientId: string;
  barberId: string;
  barbershopId?: string | null;
  startsAt: Date;
  services: ServiceRow[];
  status: string;
  paymentStatus?: string;
  clientNotes?: string;
  checkinUsed?: boolean;
  validatedById?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

async function createAppt(opts: CreateOpts) {
  const duration = opts.services.reduce((a, s) => a + s.durationMinutes, 0);
  const subtotal = opts.services.reduce((a, s) => a + s.price, 0);
  const endsAt = new Date(opts.startsAt.getTime() + duration * 60_000);
  const cancelled = opts.status === "CANCELADA";

  return prisma.appointment.create({
    data: {
      code: generateAppointmentCode(),
      clientId: opts.clientId,
      barberId: opts.barberId,
      barbershopId: opts.barbershopId,
      startsAt: opts.startsAt,
      endsAt,
      status: opts.status,
      subtotal,
      total: subtotal,
      paymentStatus:
        opts.paymentStatus ?? (opts.status === "COMPLETADA" ? "PAGADO" : "PENDIENTE"),
      clientNotes: opts.clientNotes ?? "",
      cancelledAt: cancelled ? new Date(opts.startsAt.getTime() - 4 * 3600_000) : null,
      cancelledBy: cancelled ? opts.cancelledBy ?? opts.clientId : null,
      cancellationReason: cancelled
        ? opts.cancellationReason ?? "Me salió un imprevisto"
        : null,
      services: {
        create: opts.services.map((s) => ({
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
          usedAt: opts.checkinUsed
            ? new Date(opts.startsAt.getTime() + 2 * 60_000)
            : null,
          validatedById: opts.checkinUsed ? opts.validatedById ?? null : null,
        },
      },
    },
    include: { checkin: true, services: true, barber: true, client: true },
  });
}

/** Redondea un Date al múltiplo de 5 minutos más cercano. */
function round5(date: Date): Date {
  const ms = 5 * 60_000;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

async function main() {
  console.log("Sembrando contenido demostrativo…\n");

  const barbers = await prisma.barber.findMany({
    include: { user: true },
    orderBy: { sortOrder: "asc" },
  });
  const serviceRows = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  if (barbers.length === 0 || serviceRows.length === 0) {
    throw new Error(
      "No hay barberos o servicios. Corre primero: npm run db:setup"
    );
  }

  const byName = new Map(serviceRows.map((s) => [s.name, s]));
  const corte = byName.get("Corte")!;
  const corteBarba = byName.get("Corte con barba")!;
  const corteNino = byName.get("Corte niño")!;
  const barba = byName.get("Barba")!;
  const cerquillos = byName.get("Cerquillos")!;
  const cejas = byName.get("Cejas")!;

  // Clientes de prueba (contraseña: cliente123)
  const passwordHash = await bcrypt.hash("cliente123", 12);
  const clients: { id: string; name: string }[] = [];
  for (const c of DEMO_CLIENTS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { name: c.name, phone: c.phone },
      create: { ...c, passwordHash, role: "CLIENTE" },
    });
    clients.push({ id: user.id, name: user.name });
  }
  const demoUser = await prisma.user.findUnique({
    where: { email: "cliente@demo.app" },
  });
  if (demoUser) clients.push({ id: demoUser.id, name: demoUser.name });

  // Empezar de cero con las citas
  await prisma.appointmentCheckin.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();

  const today = todayBogota();
  const now = new Date();
  let clientIdx = 0;
  const nextClient = () => clients[clientIdx++ % clients.length];

  // Combinaciones de servicios para variar las citas
  const combos: ServiceRow[][] = [
    [corte],
    [corteBarba],
    [corte, cejas],
    [corteNino],
    [barba],
    [cerquillos],
    [corte, barba],
    [corteBarba, cejas],
  ];
  let comboIdx = 0;
  const nextCombo = () => combos[comboIdx++ % combos.length];

  let created = 0;

  // ---- Historial: últimos 6 días (sin domingos) ----
  const PAST_HOURS = ["09:30", "11:00", "14:30", "16:30", "18:00"];
  for (let d = -6; d <= -1; d++) {
    const date = addDays(today, d);
    if (dayOfWeekBogota(date) === 0) continue; // domingo cerrado
    for (const [bIdx, barber] of barbers.entries()) {
      // 3–5 citas por barbero por día, horas escalonadas
      const count = 3 + ((d + bIdx + 6) % 3);
      for (let i = 0; i < count; i++) {
        const startsAt = bogotaToUtc(date, PAST_HOURS[i]);
        // Un no-show y un par de canceladas repartidas en la semana
        let status = "COMPLETADA";
        if (d === -3 && bIdx === 2 && i === 2) status = "NO_ASISTIO";
        if (d === -2 && bIdx === 1 && i === 3) status = "CANCELADA";
        if (d === -5 && bIdx === 0 && i === 1) status = "CANCELADA";
        await createAppt({
          clientId: nextClient().id,
          barberId: barber.id,
          barbershopId: barber.barbershopId,
          startsAt,
          services: nextCombo(),
          status,
          checkinUsed: status === "COMPLETADA",
          validatedById: barber.user.id,
        });
        created++;
      }
    }
  }

  // ---- Hoy, alrededor de la hora actual ----
  const todayNotes = [
    "Fade medio, no muy alto",
    "",
    "Primera vez, me recomendó Carlos",
    "",
  ];
  for (const [bIdx, barber] of barbers.entries()) {
    // Dos completadas más temprano
    for (const minsAgo of [200, 110]) {
      await createAppt({
        clientId: nextClient().id,
        barberId: barber.id,
        barbershopId: barber.barbershopId,
        startsAt: round5(new Date(now.getTime() - minsAgo * 60_000)),
        services: nextCombo(),
        status: "COMPLETADA",
        checkinUsed: true,
        validatedById: barber.user.id,
      });
      created++;
    }

    // Rolando tiene una cita EN CURSO ahora mismo (QR ya validado)
    if (bIdx === 0) {
      await createAppt({
        clientId: nextClient().id,
        barberId: barber.id,
        barbershopId: barber.barbershopId,
        startsAt: round5(new Date(now.getTime() - 10 * 60_000)),
        services: [corteBarba],
        status: "EN_CURSO",
        checkinUsed: true,
        validatedById: barber.user.id,
        clientNotes: "La barba solo perfilada",
      });
      created++;
    }

    // Una cita CONFIRMADA dentro de la ventana de check-in
    // (empieza en ~15 min: se puede escanear/digitar el código YA)
    const soonOffset = bIdx === 0 ? 45 : 15; // Rolando después de su EN_CURSO
    await createAppt({
      clientId: nextClient().id,
      barberId: barber.id,
      barbershopId: barber.barbershopId,
      startsAt: round5(new Date(now.getTime() + soonOffset * 60_000)),
      services: nextCombo(),
      status: "CONFIRMADA",
      clientNotes: todayNotes[bIdx % todayNotes.length],
    });
    created++;

    // Y otra más tarde
    await createAppt({
      clientId: nextClient().id,
      barberId: barber.id,
      barbershopId: barber.barbershopId,
      startsAt: round5(new Date(now.getTime() + (150 + bIdx * 30) * 60_000)),
      services: nextCombo(),
      status: "CONFIRMADA",
    });
    created++;
  }

  // ---- Próximos días ----
  const FUTURE_HOURS = ["09:00", "10:30", "15:00", "17:00"];
  for (let d = 1; d <= 3; d++) {
    const date = addDays(today, d);
    if (dayOfWeekBogota(date) === 0) continue;
    for (const [bIdx, barber] of barbers.entries()) {
      const count = 2 + ((d + bIdx) % 2);
      for (let i = 0; i < count; i++) {
        await createAppt({
          clientId: nextClient().id,
          barberId: barber.id,
          barbershopId: barber.barbershopId,
          startsAt: bogotaToUtc(date, FUTURE_HOURS[i]),
          services: nextCombo(),
          status: "CONFIRMADA",
        });
        created++;
      }
    }
  }

  // ---- Citas del cliente demo (cliente@demo.app) ----
  if (demoUser) {
    const tomorrow = addDays(today, dayOfWeekBogota(addDays(today, 1)) === 0 ? 2 : 1);
    await createAppt({
      clientId: demoUser.id,
      barberId: barbers[0].id,
      barbershopId: barbers[0].barbershopId,
      startsAt: bogotaToUtc(tomorrow, "11:30"),
      services: [corteBarba],
      status: "CONFIRMADA",
      clientNotes: "Fade medio y barba perfilada",
    });
    await createAppt({
      clientId: demoUser.id,
      barberId: barbers[1].id,
      barbershopId: barbers[1].barbershopId,
      startsAt: bogotaToUtc(addDays(today, -4), "15:30"),
      services: [corte, cejas],
      status: "COMPLETADA",
      checkinUsed: true,
      validatedById: barbers[1].user.id,
    });
    await createAppt({
      clientId: demoUser.id,
      barberId: barbers[2].id,
      barbershopId: barbers[2].barbershopId,
      startsAt: bogotaToUtc(addDays(today, -6), "10:00"),
      services: [barba],
      status: "CANCELADA",
    });
    created += 3;
  }

  // ---- Resumen ----
  console.log(`${created} citas creadas y ${DEMO_CLIENTS.length} clientes de prueba.\n`);

  console.log("CITAS DE HOY que puedes validar ya (escáner o código manual):");
  const validatable = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMADA",
      startsAt: {
        gte: new Date(now.getTime() - 20 * 60_000),
        lte: new Date(now.getTime() + 60 * 60_000),
      },
    },
    include: { checkin: true, barber: true, client: true, services: true },
    orderBy: { startsAt: "asc" },
  });
  for (const a of validatable) {
    console.log(
      `  ${formatTime12(a.startsAt)} · ${a.barber.displayName.padEnd(8)} · ${a.client.name.padEnd(20)} · código: ${a.checkin?.backupCode}`
    );
  }

  const b = utcToBogota(now);
  console.log(`\n(Hora actual en Bogotá: ${b.dateStr} ${b.timeStr})`);
  console.log("\nEntra como barbero (rolando@ / jesus@ / angel@barberia.app · barbero123)");
  console.log("o como cliente (cliente@demo.app / carlos@demo.app / … · cliente123).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
