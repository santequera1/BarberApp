import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendBarberInvitationEmail } from "@/lib/email";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const createSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: z.string().min(3, "Ingresa una dirección válida"),
  city: z.string().min(2, "Ingresa la ciudad").default("Cartagena"),
  phone: z.string().optional().default(""),
  description: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
  coverUrl: z.string().optional().default(""),
  photos: z.array(z.string()).optional().default([]),
  services: z
    .array(
      z.object({
        name: z.string().min(2, "Nombre de servicio requerido"),
        description: z.string().optional().default(""),
        price: z.number().min(1000, "Precio mínimo $1.000"),
        durationMinutes: z.number().min(5).default(30),
        category: z.string().default("corte"),
        imageUrl: z.string().optional().default(""),
      })
    )
    .min(1, "Debes agregar al menos 1 servicio"),
  barberEmails: z
    .array(
      z.object({
        email: z.string().email("Correo de barbero inválido").toLowerCase(),
        name: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),
  openTime: z.string().default("08:00"),
  closeTime: z.string().default("20:00"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    name,
    address,
    city,
    phone,
    description,
    logoUrl,
    coverUrl,
    photos,
    services,
    barberEmails,
    openTime,
    closeTime,
  } = parsed.data;

  // Generar slug único
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.barbershop.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  try {
    // 1. Crear Barbería
    const barbershop = await prisma.barbershop.create({
      data: {
        name,
        slug,
        address,
        city,
        phone,
        description,
        logoUrl: logoUrl || "/logo.jpg",
        coverUrl: coverUrl || "",
        photos: JSON.stringify(photos || []),
        ownerId: session?.userId || null,
        status: "ACTIVA",
      },
    });

    // 2. Crear Servicios con Fotos
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      await prisma.service.create({
        data: {
          barbershopId: barbershop.id,
          name: s.name,
          description: s.description,
          price: s.price,
          durationMinutes: s.durationMinutes,
          category: s.category,
          imageUrl: s.imageUrl,
          sortOrder: i,
          isActive: true,
        },
      });
    }

    // 3. Crear Horarios de Atención (Lunes a Domingo)
    for (let day = 0; day <= 6; day++) {
      await prisma.barbershopHours.create({
        data: {
          barbershopId: barbershop.id,
          dayOfWeek: day,
          openTime,
          closeTime,
          isClosed: day === 0 ? false : false, // Abierto todos los días por defecto
        },
      });
    }

    // 4. Si el creador es usuario autenticado, vincularlo como Barbero/Dueño principal
    if (session) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { role: session.role === "ADMIN" ? "ADMIN" : "DUEÑO" },
      });

      const ownerBarber = await prisma.barber.upsert({
        where: { userId: session.userId },
        update: {
          barbershopId: barbershop.id,
          status: "ACTIVO",
        },
        create: {
          userId: session.userId,
          barbershopId: barbershop.id,
          displayName: session.name || "Master Barber",
          specialties: "Cortes modernos, Barba, Asesoría",
          status: "ACTIVO",
        },
      });

      // Crear horarios del dueño
      const existingOwnerSched = await prisma.barberSchedule.count({
        where: { barberId: ownerBarber.id },
      });
      if (existingOwnerSched === 0) {
        await prisma.barberSchedule.createMany({
          data: [1, 2, 3, 4, 5, 6].map((day) => ({
            barberId: ownerBarber.id,
            dayOfWeek: day,
            startTime: openTime,
            endTime: closeTime,
          })),
        });
      }
    }

    // 5. Procesar Invitaciones del Equipo de Barberos
    for (const b of barberEmails) {
      const email = b.email.trim().toLowerCase();
      if (!email) continue;

      // Crear registro de invitación
      await prisma.barbershopInvitation.upsert({
        where: {
          barbershopId_email: {
            barbershopId: barbershop.id,
            email,
          },
        },
        update: {
          barberName: b.name || "",
          status: "PENDIENTE",
        },
        create: {
          barbershopId: barbershop.id,
          email,
          barberName: b.name || "",
          status: "PENDIENTE",
        },
      });

      // Si el usuario ya existe en el sistema, vincularlo de inmediato
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        if (existingUser.role !== "ADMIN") {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: "BARBERO" },
          });
        }

        const barber = await prisma.barber.upsert({
          where: { userId: existingUser.id },
          update: {
            barbershopId: barbershop.id,
            status: "ACTIVO",
            displayName: b.name || existingUser.name,
          },
          create: {
            userId: existingUser.id,
            barbershopId: barbershop.id,
            displayName: b.name || existingUser.name,
            specialties: "Cortes modernos, Barba, Perfilado",
            status: "ACTIVO",
          },
        });

        // Crear horarios
        const schedCount = await prisma.barberSchedule.count({
          where: { barberId: barber.id },
        });
        if (schedCount === 0) {
          await prisma.barberSchedule.createMany({
            data: [1, 2, 3, 4, 5, 6].map((day) => ({
              barberId: barber.id,
              dayOfWeek: day,
              startTime: openTime,
              endTime: closeTime,
            })),
          });
        }

        await prisma.barbershopInvitation.update({
          where: {
            barbershopId_email: {
              barbershopId: barbershop.id,
              email,
            },
          },
          data: { status: "ACEPTADA" },
        });
      }

      // Enviar correo de notificación al barbero
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barber.wailus.co";
      void sendBarberInvitationEmail({
        toEmail: email,
        barberName: b.name,
        barbershopName: barbershop.name,
        inviteLink: `${appUrl}/ingreso`,
      });
    }

    return NextResponse.json({ ok: true, barbershop });
  } catch (err) {
    console.error("Error al crear barbería:", err);
    return NextResponse.json(
      { error: "No se pudo registrar la barbería. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const barbershops = await prisma.barbershop.findMany({
    where: { status: "ACTIVA" },
    include: {
      services: { where: { isActive: true } },
      barbers: { where: { status: "ACTIVO" } },
      invitations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ barbershops });
}
