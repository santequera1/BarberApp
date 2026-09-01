import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ACTIVE_STATUSES, STATUS_LABELS, type AppointmentStatus } from "@/lib/core/status";
import { formatDateShort, formatTime12, formatDuration } from "@/lib/core/dates";
import { formatCOP } from "@/lib/core/money";
import {
  CalendarPlus,
  QrCode,
  Clock,
  User,
  Scissors,
  Sparkles,
  ArrowRight,
  Calendar,
  MapPin,
  Star,
  Store,
  ChevronRight,
  Plus,
  PlusCircle,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { BottomNav } from "@/components/BottomNav";

export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/ingreso");
  if (session.role === "BARBERO") redirect("/barbero");

  const { shop: shopSlug } = await searchParams;

  // Cargar todas las barberías activas
  const barbershops = await prisma.barbershop.findMany({
    where: { status: "ACTIVA" },
    orderBy: { rating: "desc" },
    include: {
      _count: { select: { barbers: true, services: true } },
    },
  });

  const activeShop =
    barbershops.find((s) => s.slug === shopSlug) || barbershops[0] || null;

  const [nextAppointment, services, barbers] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        clientId: session.userId,
        status: { in: ACTIVE_STATUSES },
        endsAt: { gte: new Date() },
      },
      include: { services: true, barber: true, barbershop: true },
      orderBy: { startsAt: "asc" },
    }),
    activeShop
      ? prisma.service.findMany({
          where: { barbershopId: activeShop.id, isActive: true },
          orderBy: { sortOrder: "asc" },
        })
      : [],
    activeShop
      ? prisma.barber.findMany({
          where: { barbershopId: activeShop.id, status: "ACTIVO" },
          orderBy: { sortOrder: "asc" },
        })
      : [],
  ]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-5 text-white">
      <HeaderNav userName={session.name} role={session.role} subtitle="Bienvenido," />

      {/* Próxima Cita Reservada o Quick Booking Banner */}
      <section className="mb-6">
        {nextAppointment ? (
          <div className="rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/60 via-zinc-900 to-black p-6 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-red-400">
                Próxima Cita Reservada
              </span>
              <span className="rounded-full bg-red-500/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400 border border-red-500/30">
                {STATUS_LABELS[nextAppointment.status as AppointmentStatus] ?? nextAppointment.status}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="font-mono text-3xl font-black text-white">
                  {formatTime12(nextAppointment.startsAt)}
                </p>
                <p className="text-xs font-bold text-zinc-300 mt-0.5">
                  {formatDateShort(nextAppointment.startsAt)} · {nextAppointment.barbershop?.name || "BarberApp"}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-black text-white">
                  {formatCOP(nextAppointment.total)}
                </span>
                <p className="text-[10px] font-bold text-zinc-400">En sede</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href={`/citas/${nextAppointment.id}`}
                className="btn-red flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg"
              >
                <QrCode className="h-4 w-4" />
                <span>Ver Mi Pase QR</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-zinc-900 to-black p-6 shadow-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-black text-blue-400 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Reserva Inmediata</span>
            </span>
            <h2 className="text-2xl font-black text-white">
              ¿Listo para tu próximo corte?
            </h2>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Explora las barberías disponibles, elige a tu barbero y agenda tu turno en segundos.
            </p>
            <div className="mt-5">
              <Link
                href="/agendar"
                className="btn-blue flex h-12 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg"
              >
                <CalendarPlus className="h-4 w-4" />
                <span>Agendar Cita Ahora</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Explorador de Sedes / Barberías */}
      {barbershops.length > 0 ? (
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-white">
              Barberías Disponibles
            </h2>
            <Link
              href="/crear-barberia"
              className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Registrar Barbería</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {barbershops.map((shop) => (
              <div
                key={shop.id}
                className="app-card overflow-hidden border border-white/10 bg-zinc-900/90 transition-all hover:border-white/20"
              >
                <div className="relative h-32 w-full overflow-hidden bg-zinc-800">
                  <img
                    src={shop.coverUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60"}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-black text-amber-400 backdrop-blur-md">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{shop.rating}</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {shop.name}
                      </h3>
                      <p className="flex items-center gap-1 text-[10px] text-zinc-300">
                        <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                        <span>{shop.address}, {shop.city}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between gap-2 border-t border-white/5">
                  <span className="text-[11px] text-zinc-400">
                    {shop._count.barbers} barberos · {shop._count.services} servicios
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/b/${shop.slug}`}
                      className="flex h-8 items-center justify-center rounded-full bg-zinc-800 px-3 text-[11px] font-bold text-white hover:bg-zinc-700"
                    >
                      Ver QR
                    </Link>
                    <Link
                      href={`/agendar?barbershopId=${shop.id}`}
                      className="btn-red flex h-8 items-center justify-center gap-1 rounded-full px-3.5 text-[11px] font-black uppercase tracking-wider"
                    >
                      <span>Agendar</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="app-card p-8 text-center border-dashed border-white/15">
          <Store className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
          <h3 className="text-sm font-bold text-white">Aún no hay barberías registradas</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Sé el primero en registrar tu barbería y empezar a recibir citas hoy.
          </p>
          <Link
            href="/crear-barberia"
            className="btn-red mx-auto mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-xs font-black uppercase tracking-wider"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Registrar Barbería</span>
          </Link>
        </section>
      )}

      <BottomNav role={session.role} />
    </main>
  );
}
