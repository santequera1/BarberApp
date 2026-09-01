import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  assertTransition,
  DomainError,
  type AppointmentStatus,
} from "@/lib/core/status";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "BARBERO" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "La cita no existe" }, { status: 404 });
  }

  try {
    assertTransition(appointment.status as AppointmentStatus, "COMPLETADA");
  } catch (e) {
    if (e instanceof DomainError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    throw e;
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "COMPLETADA", paymentStatus: "PAGADO" },
  });

  return NextResponse.json({ ok: true });
}
