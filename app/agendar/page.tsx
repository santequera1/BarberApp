import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BookingFlow } from "@/components/BookingFlow";

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    barbershopId?: string;
    barberId?: string;
    serviceId?: string;
  }>;
}) {
  const session = await getSession();

  const {
    barbershopId: paramShopId,
    barberId: initialBarberId,
    serviceId: initialServiceId,
  } = await searchParams;

  const barbershops = await prisma.barbershop.findMany({
    where: { status: "ACTIVA" },
    orderBy: { rating: "desc" },
    select: { id: true, name: true, address: true, city: true, rating: true },
  });

  const selectedShopId =
    paramShopId ||
    (barbershops.length > 0 ? barbershops[0].id : undefined);

  const [services, barbers] = await Promise.all([
    prisma.service.findMany({
      where: {
        isActive: true,
        ...(selectedShopId ? { barbershopId: selectedShopId } : {}),
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        durationMinutes: true,
        price: true,
        category: true,
        barbershopId: true,
      },
    }),
    prisma.barber.findMany({
      where: {
        status: "ACTIVO",
        ...(selectedShopId ? { barbershopId: selectedShopId } : {}),
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        displayName: true,
        specialties: true,
        bio: true,
        barbershopId: true,
      },
    }),
  ]);

  return (
    <BookingFlow
      barbershops={barbershops}
      selectedShopId={selectedShopId}
      services={services}
      barbers={barbers}
      initialBarberId={initialBarberId}
      initialServiceId={initialServiceId}
      currentUser={session ? { name: session.name, userId: session.userId } : null}
    />
  );
}
