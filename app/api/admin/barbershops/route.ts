import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const createBarbershopSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().default(""),
  address: z.string().min(3),
  city: z.string().default("Cartagena"),
  phone: z.string().default(""),
  latitude: z.number().default(10.4236),
  longitude: z.number().default(-75.5503),
});

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DUEÑO")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const barbershops = await prisma.barbershop.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { barbers: true, services: true, appointments: true } },
    },
  });

  return NextResponse.json({ barbershops });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createBarbershopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const existing = await prisma.barbershop.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una barbería con ese nombre/slug." },
        { status: 409 }
      );
    }

    const shop = await prisma.barbershop.create({
      data: {
        ...parsed.data,
        ownerId: session.userId,
        status: "ACTIVA",
      },
    });

    // Crear horarios por defecto para la nueva sede (Lunes a Sábado 9:00 - 19:00)
    for (let day = 0; day <= 6; day++) {
      await prisma.barbershopHours.create({
        data: {
          barbershopId: shop.id,
          dayOfWeek: day,
          openTime: "09:00",
          closeTime: "19:00",
          isClosed: day === 0,
        },
      });
    }

    return NextResponse.json({ ok: true, barbershop: shop });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al crear la barbería." },
      { status: 500 }
    );
  }
}
