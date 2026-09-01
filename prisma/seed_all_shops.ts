import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando ambas barberías con ofertas y fotos HD...");

  const passwordHash = await bcrypt.hash("barber123", 10);

  // 1. Dueño Cannan
  const cannanOwner = await prisma.user.upsert({
    where: { email: "mateo@cannan.co" },
    update: { name: "Mateo Cannan", phone: "3001234567" },
    create: {
      name: "Mateo Cannan",
      email: "mateo@cannan.co",
      phone: "3001234567",
      passwordHash,
      role: "DUEÑO",
    },
  });

  // 2. Dueño Royal Fade
  const royalOwner = await prisma.user.upsert({
    where: { email: "andres.royalfade@gmail.com" },
    update: { name: "Andrés Díaz", phone: "3109876543" },
    create: {
      name: "Andrés Díaz",
      email: "andres.royalfade@gmail.com",
      phone: "3109876543",
      passwordHash,
      role: "DUEÑO",
    },
  });

  // 3. Barberos adicionales
  const barberCannan2 = await prisma.user.upsert({
    where: { email: "sebastian.cannan@gmail.com" },
    update: { name: "Sebastián 'El Flaco'" },
    create: {
      name: "Sebastián 'El Flaco'",
      email: "sebastian.cannan@gmail.com",
      phone: "3007654321",
      passwordHash,
      role: "BARBERO",
    },
  });

  const barberRoyal2 = await prisma.user.upsert({
    where: { email: "carlos.mendoza@gmail.com" },
    update: { name: "Carlos 'The Blade' Mendoza" },
    create: {
      name: "Carlos 'The Blade' Mendoza",
      email: "carlos.mendoza@gmail.com",
      phone: "3015554321",
      passwordHash,
      role: "BARBERO",
    },
  });

  // 4. Shop 1: Cannan Barber Club
  const cannanShop = await prisma.barbershop.upsert({
    where: { slug: "cannan" },
    update: {
      name: "Cannan Barber Club",
      description: "Estilo urbano auténtico, los mejores degradados y atención de primera clase.",
      address: "Calle 31 # 54-12, Barrio Olaya Herrera",
      city: "Cartagena",
      phone: "3001234567",
      instagram: "cannanbarber",
      tiktok: "cannanbarberclub",
      coverUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80",
      logoUrl: "/logo.jpg",
      latitude: 10.4124,
      longitude: -75.5123,
      rating: 4.8,
      reviewCount: 35,
      status: "ACTIVA",
      ownerId: cannanOwner.id,
    },
    create: {
      name: "Cannan Barber Club",
      slug: "cannan",
      description: "Estilo urbano auténtico, los mejores degradados y atención de primera clase.",
      address: "Calle 31 # 54-12, Barrio Olaya Herrera",
      city: "Cartagena",
      phone: "3001234567",
      instagram: "cannanbarber",
      tiktok: "cannanbarberclub",
      coverUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80",
      logoUrl: "/logo.jpg",
      latitude: 10.4124,
      longitude: -75.5123,
      rating: 4.8,
      reviewCount: 35,
      status: "ACTIVA",
      ownerId: cannanOwner.id,
    },
  });

  // 5. Shop 2: Royal Fade Studio
  const royalShop = await prisma.barbershop.upsert({
    where: { slug: "royal-fade-bocagrande" },
    update: {
      name: "Royal Fade Studio — Bocagrande",
      description: "Especialistas en degradados perfectos, perfilado a navaja tradicional y ambiente VIP en el corazón de Bocagrande.",
      address: "Cra. 2 # 7-40, Edificio Royal",
      city: "Cartagena",
      phone: "3109876543",
      instagram: "royalfade.ctg",
      tiktok: "royalfadestudio",
      coverUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80",
      logoUrl: "/logo.jpg",
      latitude: 10.4045,
      longitude: -75.5562,
      rating: 4.9,
      reviewCount: 42,
      status: "ACTIVA",
      ownerId: royalOwner.id,
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
      coverUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80",
      logoUrl: "/logo.jpg",
      latitude: 10.4045,
      longitude: -75.5562,
      rating: 4.9,
      reviewCount: 42,
      status: "ACTIVA",
      ownerId: royalOwner.id,
    },
  });

  // Barberos Cannan
  await prisma.barber.upsert({
    where: { userId: cannanOwner.id },
    update: { barbershopId: cannanShop.id, displayName: "Mateo Cannan", specialties: "Skin Fade, Cejas, Barba", status: "ACTIVO" },
    create: { userId: cannanOwner.id, barbershopId: cannanShop.id, displayName: "Mateo Cannan", specialties: "Skin Fade, Cejas, Barba", status: "ACTIVO" },
  });
  await prisma.barber.upsert({
    where: { userId: barberCannan2.id },
    update: { barbershopId: cannanShop.id, displayName: "Sebastián 'El Flaco'", specialties: "Cortes Clásicos, Navaja", status: "ACTIVO" },
    create: { userId: barberCannan2.id, barbershopId: cannanShop.id, displayName: "Sebastián 'El Flaco'", specialties: "Cortes Clásicos, Navaja", status: "ACTIVO" },
  });

  // Barberos Royal
  await prisma.barber.upsert({
    where: { userId: royalOwner.id },
    update: { barbershopId: royalShop.id, displayName: "Andrés 'FadeMaster' Díaz", specialties: "Skin Fade, Taper, Moderno", status: "ACTIVO" },
    create: { userId: royalOwner.id, barbershopId: royalShop.id, displayName: "Andrés 'FadeMaster' Díaz", specialties: "Skin Fade, Taper, Moderno", status: "ACTIVO" },
  });
  await prisma.barber.upsert({
    where: { userId: barberRoyal2.id },
    update: { barbershopId: royalShop.id, displayName: "Carlos 'The Blade' Mendoza", specialties: "Ritual de Barba, Diseños", status: "ACTIVO" },
    create: { userId: barberRoyal2.id, barbershopId: royalShop.id, displayName: "Carlos 'The Blade' Mendoza", specialties: "Ritual de Barba, Diseños", status: "ACTIVO" },
  });

  // Horarios para ambas
  for (const s of [cannanShop, royalShop]) {
    for (let day = 0; day <= 6; day++) {
      await prisma.barbershopHours.upsert({
        where: { barbershopId_dayOfWeek: { barbershopId: s.id, dayOfWeek: day } },
        update: { openTime: "08:00", closeTime: "21:00", isClosed: false },
        create: { barbershopId: s.id, dayOfWeek: day, openTime: "08:00", closeTime: "21:00", isClosed: false },
      });
    }
  }

  // Servicios Cannan
  await prisma.service.deleteMany({ where: { barbershopId: cannanShop.id } });
  const cannanServices = [
    {
      name: "Corte Clásico + Lavado",
      description: "Corte tradicional a tijera o máquina con acabado natural y lavado refrescante.",
      price: 22000,
      originalPrice: 28000,
      isOffer: true,
      offerBadge: "-21% EN APP",
      durationMinutes: 35,
      category: "corte",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
      sortOrder: 0,
    },
    {
      name: "Fade Urbano + Marcado de Barba",
      description: "Degradado bajo/medio con perfilado a navaja y toalla tibia.",
      price: 32000,
      originalPrice: 40000,
      isOffer: true,
      offerBadge: "PROMO APP",
      durationMinutes: 50,
      category: "combo",
      imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
      sortOrder: 1,
    },
    {
      name: "Perfilado & Arreglo de Barba",
      description: "Alineación de contornos a navaja con bálsamo nutritivo.",
      price: 18000,
      originalPrice: 22000,
      isOffer: true,
      offerBadge: "OFERTA",
      durationMinutes: 25,
      category: "barba",
      imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
      sortOrder: 2,
    },
  ];

  for (const s of cannanServices) {
    await prisma.service.create({
      data: {
        barbershopId: cannanShop.id,
        name: s.name,
        description: s.description,
        price: s.price,
        originalPrice: s.originalPrice,
        isOffer: s.isOffer,
        offerBadge: s.offerBadge,
        durationMinutes: s.durationMinutes,
        category: s.category,
        imageUrl: s.imageUrl,
        sortOrder: s.sortOrder,
        isActive: true,
      },
    });
  }

  // Servicios Royal Fade
  await prisma.service.deleteMany({ where: { barbershopId: royalShop.id } });
  const royalServices = [
    {
      name: "Skin Fade + Perfilado de Cejas",
      description: "Degradado a ras con máquina shaver y acabado a navaja en contornos.",
      price: 28000,
      originalPrice: 35000,
      isOffer: true,
      offerBadge: "-20% EN APP",
      durationMinutes: 40,
      category: "corte",
      imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
      sortOrder: 0,
    },
    {
      name: "Ritual de Barba con Toalla Caliente",
      description: "Afeitado y perfilado con vapor de ozono, aceites premium y bálsamo hidratante.",
      price: 20000,
      originalPrice: 25000,
      isOffer: true,
      offerBadge: "PROMO APP",
      durationMinutes: 30,
      category: "barba",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
      sortOrder: 1,
    },
    {
      name: "Combo Real VIP (Corte + Barba + Mascarilla Black)",
      description: "Servicio completo con limpieza facial de puntos negros, corte y perfilado total.",
      price: 42000,
      originalPrice: 55000,
      isOffer: true,
      offerBadge: "-24% EN APP",
      durationMinutes: 60,
      category: "combo",
      imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
      sortOrder: 2,
    },
    {
      name: "Diseño Freestyle a Navaja",
      description: "Líneas artísticas personalizadas y grecas sobre degradado.",
      price: 15000,
      originalPrice: 20000,
      isOffer: true,
      offerBadge: "OFERTA HOY",
      durationMinutes: 20,
      category: "corte",
      imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
      sortOrder: 3,
    },
  ];

  for (const s of royalServices) {
    await prisma.service.create({
      data: {
        barbershopId: royalShop.id,
        name: s.name,
        description: s.description,
        price: s.price,
        originalPrice: s.originalPrice,
        isOffer: s.isOffer,
        offerBadge: s.offerBadge,
        durationMinutes: s.durationMinutes,
        category: s.category,
        imageUrl: s.imageUrl,
        sortOrder: s.sortOrder,
        isActive: true,
      },
    });
  }

  console.log("✅ Todas las barberías y cortes sembrados exitosamente!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
