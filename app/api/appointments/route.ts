import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession, createSession } from "@/lib/session";
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
  // Campos opcionales si ya está autenticado, requeridos para Guest Checkout
  guestName: z.string().min(2).optional(),
  guestPhone: z.string().min(7).optional(),
  guestEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de reserva inválidos" }, { status: 400 });
  }

  let clientId: string;

  if (session) {
    clientId = session.userId;
    if (!rateLimit(`book:${session.userId}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera un minuto." },
        { status: 429 }
      );
    }
  } else {
    // Guest Checkout: Validar datos del cliente invitado
    const { guestName, guestPhone, guestEmail } = parsed.data;
    if (!guestName || !guestPhone || !guestEmail) {
      return NextResponse.json(
        { error: "Por favor ingresa tu nombre, WhatsApp y correo para confirmar la cita." },
        { status: 400 }
      );
    }

    const email = guestEmail.toLowerCase().trim();
    if (!rateLimit(`book_guest:${email}`, 6, 60_000)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera un minuto." },
        { status: 429 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36) + Date.now().toString(36),
        10
      );
      user = await prisma.user.create({
        data: {
          email,
          name: guestName.trim(),
          phone: guestPhone.trim(),
          passwordHash: randomPassword,
          role: "CLIENTE",
        },
      });
    } else {
      // Actualizar teléfono si no lo tenía o cambió
      if (guestPhone.trim()) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone: guestPhone.trim(), name: user.name || guestName.trim() },
        });
      }
    }

    clientId = user.id;

    // Crear sesión automática para que pueda ver su pase digital QR y futuras citas
    await createSession({
      userId: user.id,
      role: user.role as "CLIENTE" | "BARBERO" | "DUEÑO" | "ADMIN",
      name: user.name,
    });
  }

  try {
    const appointment = await createAppointment({
      clientId,
      barberId: parsed.data.barberId,
      barbershopId: parsed.data.barbershopId,
      serviceIds: parsed.data.serviceIds,
      date: parsed.data.date,
      time: parsed.data.time,
      clientNotes: parsed.data.clientNotes,
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
    include: { services: true, barber: true, barbershop: true },
    orderBy: { startsAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ appointments });
}
