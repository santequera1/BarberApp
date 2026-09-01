import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createAppointment } from "@/lib/booking";
import { DomainError } from "@/lib/core/status";
import { rateLimit } from "@/lib/rate-limit";

const createSchema = z.object({
  barberId: z.string().min(1),
  barbershopId: z.string().optional(),
  serviceIds: z.array(z.string().min(1)).min(1).max(6),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  clientNotes: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!rateLimit(`book:${session.userId}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un minuto." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const appointment = await createAppointment({
      clientId: session.userId,
      ...parsed.data,
    });
    return NextResponse.json({ ok: true, id: appointment.id });
  } catch (e) {
    if (e instanceof DomainError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo agendar. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { clientId: session.userId },
    include: { services: true, barber: true },
    orderBy: { startsAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ appointments });
}
