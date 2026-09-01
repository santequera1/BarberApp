import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DAYS = [0, 1, 2, 3, 4, 5, 6]; // 0 = domingo

async function main() {
  console.log("Sembrando datos del Marketplace…");

  // Usuario Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@barberia.app" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@barberia.app",
      passwordHash: adminPassword,
      name: "Administrador Global",
      role: "ADMIN",
      phone: "3009998877",
    },
  });

  // Usuario Dueño de Barbería
  const ownerPassword = await bcrypt.hash("dueno123", 12);
  const ownerUser = await prisma.user.upsert({
    where: { email: "dueno@barberia.app" },
    update: { role: "DUEÑO" },
    create: {
      email: "dueno@barberia.app",
      passwordHash: ownerPassword,
      name: "Carlos Propietario",
      role: "DUEÑO",
      phone: "3008887766",
    },
  });

  // Barberías iniciales en Cartagena (con coordenadas geográficas reales)
  const barbershopsData = [
    {
      name: "La Barbería Centro Histórico",
      slug: "centro-historico",
      description: "Sede principal colonial con servicio VIP, café de cortesía y ambiente climatizado.",
      address: "Calle de la Moneda # 7-42, Centro Histórico",
      city: "Cartagena",
      phone: "3001234567",
      latitude: 10.4236,
      longitude: -75.5503,
      rating: 4.9,
      reviewCount: 184,
      status: "ACTIVA",
      ownerId: ownerUser.id,
    },
    {
      name: "La Barbería Bocagrande Lounge",
      slug: "bocagrande",
      description: "Elegancia moderna junto a la bahía. Especialistas en diseño de barbas y degradados.",
      address: "Carrera 3 # 6-45, Bocagrande",
      city: "Cartagena",
      phone: "3007654321",
      latitude: 10.4042,
      longitude: -75.5558,
      rating: 4.8,
      reviewCount: 142,
      status: "ACTIVA",
      ownerId: ownerUser.id,
    },
    {
      name: "La Barbería Manga Club",
      slug: "manga-club",
      description: "Ambiente relajado en el corazón de Manga. Cortes clásicos, niños y perfilado a navaja.",
      address: "Calle Real de Manga # 22-10",
      city: "Cartagena",
      phone: "3005559988",
      latitude: 10.4132,
      longitude: -75.5341,
      rating: 4.9,
      reviewCount: 96,
      status: "ACTIVA",
      ownerId: ownerUser.id,
    },
  ];

  const createdShops = [];
  for (const shop of barbershopsData) {
    const s = await prisma.barbershop.upsert({
      where: { slug: shop.slug },
      update: shop,
      create: shop,
    });
    createdShops.push(s);

    // Horario por sede
    for (const day of DAYS) {
      await prisma.barbershopHours.upsert({
        where: {
          barbershopId_dayOfWeek: {
            barbershopId: s.id,
            dayOfWeek: day,
          },
        },
        update: {},
        create: {
          barbershopId: s.id,
          dayOfWeek: day,
          openTime: "09:00",
          closeTime: "19:00",
          isClosed: day === 0,
        },
      });
    }
  }

  // Servicios estándar por barbería
  const baseServices = [
    { name: "Corte Clásico / Fade", price: 18000, durationMinutes: 30, category: "corte", description: "Degradado o corte clásico con acabado pulcro y peinado." },
    { name: "Corte + Arreglo de Barba", price: 25000, durationMinutes: 45, category: "combo", description: "Corte completo con perfilado de barba a navaja y toalla caliente." },
    { name: "Corte Niño (hasta 12 años)", price: 15000, durationMinutes: 30, category: "corte", description: "Corte moderno o clásico para los más pequeños." },
    { name: "Perfilado de Barba", price: 10000, durationMinutes: 20, category: "barba", description: "Arreglo, hidratación y perfilado con navaja profesional." },
    { name: "Cerquillos y Contornos", price: 8000, durationMinutes: 15, category: "detalle", description: "Limpieza de contornos, nuca y líneas con navaja." },
    { name: "Cejas a Navaja", price: 5000, durationMinutes: 10, category: "detalle", description: "Limpieza y perfilado simétrico de cejas." },
  ];

  for (const shop of createdShops) {
    let order = 1;
    for (const s of baseServices) {
      const existing = await prisma.service.findFirst({
        where: { name: s.name, barbershopId: shop.id },
      });
      if (existing) {
        await prisma.service.update({
          where: { id: existing.id },
          data: { ...s, sortOrder: order++ },
        });
      } else {
        await prisma.service.create({
          data: { ...s, barbershopId: shop.id, sortOrder: order++ },
        });
      }
    }
  }

  // Barberos: Rolando (Centro), Jesus (Bocagrande), Angel (Manga)
  const barberPassword = await bcrypt.hash("barbero123", 12);
  const barbersData = [
    { name: "Rolando", email: "rolando@barberia.app", specialties: "fade,clásico,barba", shopIdx: 0, sortOrder: 1 },
    { name: "Jesus", email: "jesus@barberia.app", specialties: "fade,diseño,niños", shopIdx: 1, sortOrder: 2 },
    { name: "Angel", email: "angel@barberia.app", specialties: "barba,cerquillos,clásico", shopIdx: 2, sortOrder: 3 },
  ];

  for (const b of barbersData) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: { role: "BARBERO" },
      create: {
        email: b.email,
        passwordHash: barberPassword,
        name: b.name,
        role: "BARBERO",
      },
    });

    const shop = createdShops[b.shopIdx];
    const barber = await prisma.barber.upsert({
      where: { userId: user.id },
      update: {
        displayName: b.name,
        specialties: b.specialties,
        sortOrder: b.sortOrder,
        barbershopId: shop.id,
      },
      create: {
        userId: user.id,
        displayName: b.name,
        specialties: b.specialties,
        sortOrder: b.sortOrder,
        bio: `Master Barbero en ${shop.name}.`,
        barbershopId: shop.id,
      },
    });

    await prisma.barberSchedule.deleteMany({ where: { barberId: barber.id } });
    for (const day of DAYS) {
      if (day === 0) continue;
      await prisma.barberSchedule.create({
        data: { barberId: barber.id, dayOfWeek: day, startTime: "09:00", endTime: "19:00" },
      });
    }
  }

  // Cliente demo
  const clientPassword = await bcrypt.hash("cliente123", 12);
  await prisma.user.upsert({
    where: { email: "cliente@demo.app" },
    update: {},
    create: {
      email: "cliente@demo.app",
      passwordHash: clientPassword,
      name: "Cliente Demo",
      phone: "3000000000",
      role: "CLIENTE",
    },
  });

  console.log("Sembrado listo.");
  console.log("Super Admin: admin@barberia.app (clave: admin123)");
  console.log("Dueño: dueno@barberia.app (clave: dueno123)");
  console.log("Barberos: rolando@ / jesus@ / angel@barberia.app (clave: barbero123)");
  console.log("Cliente demo: cliente@demo.app (clave: cliente123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
