import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creando segunda barbería de pruebas...");

  // 1. Crear Dueño / Barbero 1
  const ownerEmail = "andres.royalfade@gmail.com";
  let ownerUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!ownerUser) {
    ownerUser = await prisma.user.create({
      data: {
        name: "Andrés Díaz",
        email: ownerEmail,
        phone: "3109876543",
        passwordHash: await bcrypt.hash("barber123", 10),
        role: "DUEÑO",
      },
    });
  }

  // 2. Crear Barbero 2
  const barber2Email = "carlos.mendoza@gmail.com";
  let barber2User = await prisma.user.findUnique({ where: { email: barber2Email } });
  if (!barber2User) {
    barber2User = await prisma.user.create({
      data: {
        name: "Carlos 'The Blade' Mendoza",
        email: barber2Email,
        phone: "3015554321",
        passwordHash: await bcrypt.hash("barber123", 10),
        role: "BARBERO",
      },
    });
  }

  // 3. Crear Cliente de Prueba
  const clientEmail = "juan.perez@gmail.com";
  let clientUser = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (!clientUser) {
    clientUser = await prisma.user.create({
      data: {
        name: "Juan David Pérez",
        email: clientEmail,
        phone: "3209876543",
        passwordHash: await bcrypt.hash("cliente123", 10),
        role: "CLIENTE",
      },
    });
  }

  // 4. Crear Barbería "Royal Fade Studio — Bocagrande"
  const shop = await prisma.barbershop.upsert({
    where: { slug: "royal-fade-bocagrande" },
    update: {
      name: "Royal Fade Studio — Bocagrande",
      description: "Especialistas en degradados perfectos, perfilado a navaja tradicional y ambiente VIP en el corazón de Bocagrande.",
      address: "Cra. 2 # 7-40, Edificio Royal",
      city: "Cartagena",
      phone: "3109876543",
      instagram: "royalfade.ctg",
      tiktok: "royalfadestudio",
      coverUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=60",
      logoUrl: "/logo.jpg",
      latitude: 10.4045,
      longitude: -75.5562,
      rating: 4.9,
      reviewCount: 28,
      status: "ACTIVA",
      ownerId: ownerUser.id,
    },
    create: {
      name: "Royal Fade Studio — Bocagrande",
      slug: "royal-fade-bocagrande",
      description: "Especialistas en degradados perfectos, perfilado a navaja tradicional y ambiente VIP en el corazón de Bocagrande.",
      address: "Cra. 2 # 7-40, Edificio Royal",
      city: "Cartagena",
      phone: "3109876543",
      instagram: "royalfade.ctg",
      tiktok: "royalfadestudio",
      coverUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=60",
      logoUrl: "/logo.jpg",
      latitude: 10.4045,
      longitude: -75.5562,
      rating: 4.9,
      reviewCount: 28,
      status: "ACTIVA",
      ownerId: ownerUser.id,
    },
  });

  // 5. Vincular Barberos
  const b1 = await prisma.barber.upsert({
    where: { userId: ownerUser.id },
    update: {
      barbershopId: shop.id,
      displayName: "Andrés 'FadeMaster' Díaz",
      specialties: "Skin Fade, Taper, Degradados modernos",
      status: "ACTIVO",
    },
    create: {
      userId: ownerUser.id,
      barbershopId: shop.id,
      displayName: "Andrés 'FadeMaster' Díaz",
      specialties: "Skin Fade, Taper, Degradados modernos",
      status: "ACTIVO",
    },
  });

  const b2 = await prisma.barber.upsert({
    where: { userId: barber2User.id },
    update: {
      barbershopId: shop.id,
      displayName: "Carlos 'The Blade' Mendoza",
      specialties: "Ritual de Barba, Navaja Clásica, Diseños",
      status: "ACTIVO",
    },
    create: {
      userId: barber2User.id,
      barbershopId: shop.id,
      displayName: "Carlos 'The Blade' Mendoza",
      specialties: "Ritual de Barba, Navaja Clásica, Diseños",
      status: "ACTIVO",
    },
  });

  // Horarios de la barbería
  for (let day = 0; day <= 6; day++) {
    await prisma.barbershopHours.upsert({
      where: {
        barbershopId_dayOfWeek: {
          barbershopId: shop.id,
          dayOfWeek: day,
        },
      },
      update: { openTime: "08:00", closeTime: "21:00", isClosed: false },
      create: {
        barbershopId: shop.id,
        dayOfWeek: day,
        openTime: "08:00",
        closeTime: "21:00",
        isClosed: false,
      },
    });
  }

  // Horarios de los barberos
  for (const barber of [b1, b2]) {
    const existing = await prisma.barberSchedule.count({ where: { barberId: barber.id } });
    if (existing === 0) {
      await prisma.barberSchedule.createMany({
        data: [1, 2, 3, 4, 5, 6].map((day) => ({
          barberId: barber.id,
          dayOfWeek: day,
          startTime: "08:00",
          endTime: "20:00",
        })),
      });
    }
  }

  // 6. Crear Servicios
  await prisma.service.deleteMany({ where: { barbershopId: shop.id } });

  const servicesData = [
    {
      name: "Skin Fade + Perfilado de Cejas",
      description: "Degradado a ras con máquina shaver y acabado a navaja en contornos.",
      price: 28000,
      durationMinutes: 40,
      category: "corte",
      imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60",
      sortOrder: 0,
    },
    {
      name: "Ritual de Barba con Toalla Caliente",
      description: "Afeitado y perfilado con vapor de ozono, aceites premium y bálsamo hidratante.",
      price: 20000,
      durationMinutes: 30,
      category: "barba",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60",
      sortOrder: 1,
    },
    {
      name: "Combo Real VIP (Corte + Barba + Mascarilla Black)",
      description: "Servicio completo con limpieza facial de puntos negros, corte y perfilado total.",
      price: 45000,
      durationMinutes: 60,
      category: "combo",
      imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=60",
      sortOrder: 2,
    },
    {
      name: "Diseño Freestyle a Navaja",
      description: "Líneas artísticas personalizadas sobre corte o degradado.",
      price: 15000,
      durationMinutes: 20,
      category: "corte",
      imageUrl: "https://images.unsplash.com/photo-1517832606589-7629c3395907?w=500&auto=format&fit=crop&q=60",
      sortOrder: 3,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.create({
      data: {
        barbershopId: shop.id,
        name: s.name,
        description: s.description,
        price: s.price,
        durationMinutes: s.durationMinutes,
        category: s.category,
        imageUrl: s.imageUrl,
        sortOrder: s.sortOrder,
        isActive: true,
      },
    });
  }

  // 7. Crear un par de citas de prueba
  const today = new Date();
  const starts1 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0);
  const ends1 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 40);

  await prisma.appointment.upsert({
    where: { code: "ROYAL-001" },
    update: {},
    create: {
      code: "ROYAL-001",
      clientId: clientUser.id,
      barbershopId: shop.id,
      barberId: b1.id,
      startsAt: starts1,
      endsAt: ends1,
      subtotal: 28000,
      total: 28000,
      status: "COMPLETADA",
      paymentStatus: "PAGADO",
      clientNotes: "Fade medio comprimido",
    },
  });

  const starts2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0);
  const ends2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0);

  await prisma.appointment.upsert({
    where: { code: "ROYAL-002" },
    update: {},
    create: {
      code: "ROYAL-002",
      clientId: clientUser.id,
      barbershopId: shop.id,
      barberId: b2.id,
      startsAt: starts2,
      endsAt: ends2,
      subtotal: 45000,
      total: 45000,
      status: "CONFIRMADA",
      paymentStatus: "PENDIENTE",
      clientNotes: "Combo VIP para evento",
    },
  });

  console.log("✅ Segunda barbería 'Royal Fade Studio' creada con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
