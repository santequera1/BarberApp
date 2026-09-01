import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BookingFlow } from "@/components/BookingFlow";
import { HeaderNav } from "@/components/HeaderNav";
import { BottomNav } from "@/components/BottomNav";
import {
  Store,
  MapPin,
  Star,
  ChevronRight,
  Scissors,
  ArrowRight,
  Clock,
} from "lucide-react";
import { formatCOP } from "@/lib/core/money";

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
    include: {
      services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      barbers: { where: { status: "ACTIVO" } },
    },
  });

  // Si no se pasó barbershopId por parámetro, mostrar la selección de sede limpia
  if (!paramShopId) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-6 text-white">
        <HeaderNav
          userName={session?.name}
          role={session?.role}
          subtitle="Paso 1: Selecciona tu Sede"
        />

        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
            ¿Dónde deseas atenderte?
          </span>
          <h1 className="text-lg font-black text-white">
            Elige una Barbería para tu Cita
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Selecciona la sede más cercana o donde trabaje tu barbero de confianza.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {barbershops.map((shop) => {
            const minPrice = Math.min(...shop.services.map((s) => s.price), 20000);
            return (
              <div
                key={shop.id}
                className="app-card overflow-hidden border border-white/10 p-0 shadow-2xl transition-all hover:border-red-500/40 bg-zinc-900/90"
              >
                {/* Cover Image */}
                <div className="relative h-36 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={shop.coverUrl || "/logo.jpg"}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs font-black text-amber-400 backdrop-blur-md border border-white/10">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{shop.rating || 5.0}</span>
                  </div>

                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-black text-white shadow-lg">
                      Desde {formatCOP(minPrice)}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black text-white font-black text-xs">
                      {shop.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-white">
                        {shop.name}
                      </h3>
                      <p className="truncate text-xs text-zinc-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                        <span>{shop.address}, {shop.city}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info & Action Button */}
                <div className="p-4 flex items-center justify-between border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    <span>{shop.barbers.length} barberos disponibles</span>
                  </div>

                  <Link
                    href={`/agendar?barbershopId=${shop.id}`}
                    className="btn-red flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-xs font-black uppercase tracking-wider"
                  >
                    <span>Seleccionar Sede</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <BottomNav role={session?.role} />
      </main>
    );
  }

  // Sede seleccionada
  const selectedShop = barbershops.find((s) => s.id === paramShopId);
  const services = selectedShop ? selectedShop.services : [];
  const barbers = selectedShop ? selectedShop.barbers : [];

  return (
    <BookingFlow
      barbershops={barbershops.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        city: s.city,
        rating: s.rating,
      }))}
      selectedShopId={paramShopId}
      services={services}
      barbers={barbers}
      initialBarberId={initialBarberId}
      initialServiceId={initialServiceId}
      currentUser={session ? { name: session.name, userId: session.userId } : null}
    />
  );
}
