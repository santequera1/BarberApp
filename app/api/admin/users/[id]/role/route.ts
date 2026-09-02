import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const updateRoleSchema = z.object({
  role: z.enum(["CLIENTE", "BARBERO", "DUEÑO", "ADMIN"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DUEÑO")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
    });

    // Si se cambia a BARBERO y no tiene registro en Barber, crearlo
    if (parsed.data.role === "BARBERO") {
      await prisma.barber.upsert({
        where: { userId: id },
        update: { status: "ACTIVO", displayName: user.name },
        create: {
          userId: id,
          displayName: user.name,
          specialties: "Cortes modernos, Barba",
          status: "ACTIVO",
        },
      });
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Error al actualizar rol de usuario:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el rol del usuario." },
      { status: 500 }
    );
  }
}
