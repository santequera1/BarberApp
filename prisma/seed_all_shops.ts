import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando barberías físicas y barbero independiente a domicilio...");

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

  // 3. Barbero Independiente
  const freelanceOwner = await prisma.user.upsert({
    where: { email: "mateo.freelance@gmail.com" },
    update: { name: "Mateo 'El Profe' Martínez", phone: "3007654321" },
    create: {
      name: "Mateo 'El Profe' Martínez",
      email: "mateo.freelance@gmail.com",
      phone: "3007654321",
      passwordHash,
      role: "BARBERO",
    },
  });

  // 4. Barberos adicionales para sedes
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

  // 5. Shop 1: Cannan Barber Club (Sede Física)
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
      isFreelance: false,
      homeServiceFee: 0,
      coverageArea: "Sede Física",
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
      isFreelance: false,
      homeServiceFee: 0,
      coverageArea: "Sede Física",
      status: "ACTIVA",
      ownerId: cannanOwner.id,
    },
  });

  // 6. Shop 2: Royal Fade Studio (Sede Física)
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
      isFreelance: false,
      homeServiceFee: 0,
      coverageArea: "Sede Física",
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
      isFreelance: false,
      homeServiceFee: 0,
      coverageArea: "Sede Física",
      status: "ACTIVA",
      ownerId: royalOwner.id,
    },
  });

  // 7. Shop 3: Barbero Independiente a Domicilio
  const freelanceShop = await prisma.barbershop.upsert({
    where: { slug: "mateo-barber-domicilio" },
    update: {
      name: "Mateo 'El Profe' — Barbero a Domicilio VIP",
      description: "Servicio de barbería premium en la comodidad de tu hogar, hotel u oficina. Equipos profesionales esterilizados y atención de alto nivel.",
      address: "Servicio a Domicilio en Cartagena",
      city: "Cartagena",
      phone: "3007654321",
      instagram: "mateo.barbervip",
      tiktok: "mateobarberhome",
      coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      logoUrl: "/logo.jpg",
      latitude: 10.4000,
      longitude: -75.5500,
      rating: 5.0,
      reviewCount: 28,
      isFreelance: true,
      homeServiceFee: 12000,
      coverageArea: "Bocagrande, Castillogrande, Manga, Marbella, Crespo y Centro",
      status: "ACTIVA",
      ownerId: freelanceOwner.id,
    },
    create: {
      name: "Mateo 'El Profe' — Barbero a Domicilio VIP",
      slug: "mateo-barber-domicilio",
      description: "Servicio de barbería premium en la comodidad de tu hogar, hotel u oficina. Equipos profesionales esterilizados y atención de alto nivel.",
      address: "Servicio a Domicilio en Cartagena",
      city: "Cartagena",
      phone: "3007654321",
      instagram: "mateo.barbervip",
      tiktok: "mateobarberhome",
      coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      logoUrl: "/logo.jpg",
      latitude: 10.4000,
      longitude: -75.5500,
      rating: 5.0,
      reviewCount: 28,
      isFreelance: true,
      homeServiceFee: 12000,
      coverageArea: "Bocagrande, Castillogrande, Manga, Marbella, Crespo y Centro",
      status: "ACTIVA",
      ownerId: freelanceOwner.id,
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

  // Barbero Independiente (Exclusivo, un solo barbero en este perfil)
  await prisma.barber.upsert({
    where: { userId: freelanceOwner.id },
    update: { barbershopId: freelanceShop.id, displayName: "Mateo 'El Profe' Martínez", specialties: "Corte VIP a Domicilio, Ritual Barba, Cejas", status: "ACTIVO" },
    create: { userId: freelanceOwner.id, barbershopId: freelanceShop.id, displayName: "Mateo 'El Profe' Martínez", specialties: "Corte VIP a Domicilio, Ritual Barba, Cejas", status: "ACTIVO" },
  });

  // Horarios para todas (el barbero independiente tiene horario extendido)
  for (const s of [cannanShop, royalShop, freelanceShop]) {
    for (let day = 0; day <= 6; day++) {
      await prisma.barbershopHours.upsert({
        where: { barbershopId_dayOfWeek: { barbershopId: s.id, dayOfWeek: day } },
        update: { openTime: s.isFreelance ? "07:00" : "08:00", closeTime: s.isFreelance ? "22:00" : "21:00", isClosed: false },
        create: { barbershopId: s.id, dayOfWeek: day, openTime: s.isFreelance ? "07:00" : "08:00", closeTime: s.isFreelance ? "22:00" : "21:00", isClosed: false },
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

  // Servicios Barbero a Domicilio (Mateo)
  await prisma.service.deleteMany({ where: { barbershopId: freelanceShop.id } });
  const freelanceServices = [
    {
      name: "Corte VIP a Domicilio + Acabado Navaja",
      description: "Servicio en casa u oficina con silla portátil, desinfección total de cuchillas y estilo personalizado.",
      price: 35000,
      originalPrice: 45000,
      isOffer: true,
      offerBadge: "DOMICILIO VIP",
      durationMinutes: 45,
      category: "corte",
      imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
      sortOrder: 0,
    },
    {
      name: "Combo Domicilio Oro (Corte + Barba + Cejas)",
      description: "El paquete completo a tu puerta. Corte fade, toalla térmica, perfilado de barba con aceite y cejas.",
      price: 55000,
      originalPrice: 70000,
      isOffer: true,
      offerBadge: "TOP PEDIDO",
      durationMinutes: 60,
      category: "combo",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
      sortOrder: 1,
    },
    {
      name: "Ritual Barba Express a Domicilio",
      description: "Perfilado impecable con navaja descartable nueva y bálsamo aromático.",
      price: 25000,
      originalPrice: 30000,
      isOffer: false,
      offerBadge: "",
      durationMinutes: 30,
      category: "barba",
      imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
      sortOrder: 2,
    },
  ];

  for (const s of freelanceServices) {
    await prisma.service.create({
      data: {
        barbershopId: freelanceShop.id,
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

  console.log("✅ Barberías físicas y Barbero Independiente a domicilio sembrados exitosamente!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
