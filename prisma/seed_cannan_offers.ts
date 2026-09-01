import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cannan = await prisma.barbershop.findFirst({
    where: { slug: { in: ["cannan", "cannan-barber-club"] } },
  });

  if (cannan) {
    await prisma.service.deleteMany({ where: { barbershopId: cannan.id } });

    const services = [
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
        name: "Fade Moderno + Marcado de Barba",
        description: "Degradado bajo/medio/alto con perfilado de barba y toalla tibia.",
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

    for (const s of services) {
      await prisma.service.create({
        data: {
          barbershopId: cannan.id,
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
    console.log("✅ Servicios de Cannan actualizados con ofertas y fotos");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
