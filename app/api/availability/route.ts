import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSlotsForBarber } from "@/lib/booking";
import { utcToBogota } from "@/lib/core/dates";
import { ACTIVE_STATUSES } from "@/lib/core/status";
import { bogotaToUtc, addDays } from "@/lib/core/dates";

// GET /api/availability?date=YYYY-MM-DD&serviceIds=a,b&barberId=xxx|any&barbershopId=yyy
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");
  const serviceIds = (searchParams.get("serviceIds") ?? "")
    .split(",")
    .filter(Boolean);
  const barberId = searchParams.get("barberId") ?? "any";
  const barbershopId = searchParams.get("barbershopId") ?? undefined;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || serviceIds.length === 0) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
  });
  if (services.length !== serviceIds.length) {
    return NextResponse.json({ error: "Servicio inválido" }, { status: 400 });
  }
  const duration = services.reduce((a, s) => a + s.durationMinutes, 0);

  const barbers =
    barberId === "any"
      ? await prisma.barber.findMany({
          where: {
            status: "ACTIVO",
            ...(barbershopId ? { barbershopId } : {}),
          },
        })
      : await prisma.barber.findMany({
          where: { id: barberId, status: "ACTIVO" },
        });

  if (barbers.length === 0) {
    return NextResponse.json({ error: "Barbero no disponible" }, { status: 400 });
  }

  // Carga del día por barbero (para asignar "cualquiera" al de menor carga)
  const dayStart = bogotaToUtc(date, "00:00");
  const dayEnd = bogotaToUtc(addDays(date, 1), "00:00");
  const loads = new Map<string, number>();
  for (const b of barbers) {
    loads.set(
      b.id,
      await prisma.appointment.count({
        where: {
          barberId: b.id,
          status: { in: ACTIVE_STATUSES },
          startsAt: { gte: dayStart, lt: dayEnd },
        },
      })
    );
  }

  // Slot por hora de inicio; si varios barberos están libres, gana el de menor carga
  const byTime = new Map<
    string,
    { time: string; start: string; end: string; barberId: string; barberName: string }
  >();

  for (const b of barbers) {
    const slots = await getSlotsForBarber(b.id, date, duration);
    for (const slot of slots) {
      const time = utcToBogota(slot.start).timeStr;
      const current = byTime.get(time);
      if (
        !current ||
        (loads.get(b.id) ?? 0) < (loads.get(current.barberId) ?? 0)
      ) {
        byTime.set(time, {
          time,
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          barberId: b.id,
          barberName: b.displayName,
        });
      }
    }
  }

  const slots = [...byTime.values()].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return NextResponse.json({ date, durationMinutes: duration, slots });
}
