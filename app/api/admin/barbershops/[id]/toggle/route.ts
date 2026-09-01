import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DUEÑO")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const shop = await prisma.barbershop.findUnique({
    where: { id },
  });

  if (!shop) {
    return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
  }

  const newStatus = shop.status === "ACTIVA" ? "INACTIVA" : "ACTIVA";

  const updated = await prisma.barbershop.update({
    where: { id },
    data: { status: newStatus },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
