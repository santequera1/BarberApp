import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/booking";
import {
  assertTransition,
  DomainError,
  type AppointmentStatus,
} from "@/lib/core/status";

const schema = z.object({ reason: z.string().max(300).optional() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "La cita no existe" }, { status: 404 });
  }

  const isOwner = appointment.clientId === session.userId;
  const isStaff = session.role === "BARBERO" || session.role === "ADMIN";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  try {
    assertTransition(appointment.status as AppointmentStatus, "CANCELADA");
  } catch (e) {
    if (e instanceof DomainError) {
      return NextResponse.json(
        { error: "Esta cita ya no se puede cancelar" },
        { status: 409 }
      );
    }
    throw e;
  }

  // Política de cancelación: dentro de la ventana cuenta como tardía
  const settings = await getSettings();
  const late =
    appointment.startsAt.getTime() - Date.now() <
    settings.cancellationWindow * 60_000;

  await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELADA",
      cancelledAt: new Date(),
      cancelledBy: session.userId,
      cancellationReason:
        (parsed.success ? parsed.data.reason : "") ?? "",
    },
  });

  return NextResponse.json({ ok: true, lateCancellation: late });
}
