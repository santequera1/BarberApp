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
  Search,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { BottomNav } from "@/components/BottomNav";

export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
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
    barbershops.find((s) => s.slug === shopSlug) || barbershops[0];

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
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-5">
      <HeaderNav userName={session.name} role={session.role} subtitle="Bienvenido," />

      {/* Worldcoin Style: Stacked Wallet Cards (Upcoming Appointment or Booking Hero) */}
      <section className="mb-8">
        {nextAppointment ? (
          <div className="relative">
            {/* Main Green Stacked Card */}
            <div className="stacked-card-green p-6 relative z-10 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-black/70">
                  Próxima Cita Reservada
                </span>
                <span className="rounded-full bg-black/15 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                  {STATUS_LABELS[nextAppointment.status as AppointmentStatus] ?? nextAppointment.status}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <p className="font-mono text-3xl font-black text-black">
                    {formatTime12(nextAppointment.startsAt)}
                  </p>
                  <p className="text-xs font-bold text-black/80 mt-0.5">
                    {formatDateShort(nextAppointment.startsAt)} · {nextAppointment.barbershop?.name || "La Barbería"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-black text-black">
                    {formatCOP(nextAppointment.total)}
                  </span>
                  <p className="text-[10px] font-bold text-black/70">En sede</p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Link
                  href={`/citas/${nextAppointment.id}`}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black text-xs font-black uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95"
                >
                  <QrCode className="h-4 w-4 text-[#00e575]" />
                  <span>Ver Pase QR</span>
                </Link>
                <Link
                  href="/citas"
                  className="flex h-11 items-center justify-center rounded-full bg-black/10 px-5 text-xs font-bold text-black hover:bg-black/20"
                >
                  Mis Citas
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="world-card p-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#00e575]">
                {activeShop?.name || "La Barbería"}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>{activeShop?.rating || 4.9}</span>
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground">
              Reserva tu corte en {activeShop?.city || "Cartagena"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sin filas, con pase digital QR y confirmación instantánea.
            </p>

            <Link
              href={`/agendar?barbershopId=${activeShop?.id || ""}`}
              className="btn-world mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg"
            >
              <CalendarPlus className="h-4 w-4 text-black" />
              <span>Agendar en esta sede</span>
            </Link>
          </div>
        )}
      </section>

      {/* Worldcoin Circular Quick Actions */}
      <div className="mb-8 flex items-center justify-around rounded-3xl border border-border bg-card/60 p-4">
        <Link
          href={`/agendar?barbershopId=${activeShop?.id || ""}`}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="btn-circle group-hover:bg-[#00e575]">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-foreground">Agendar</span>
        </Link>

        <Link href="/citas" className="flex flex-col items-center gap-2 group">
          <div className="btn-circle group-hover:bg-[#00e575]">
            <Calendar className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-foreground">Mis Citas</span>
        </Link>

        <Link href="/crear-barberia" className="flex flex-col items-center gap-2 group">
          <div className="btn-circle group-hover:bg-[#00e575]">
            <Store className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-foreground">Crear Sede</span>
        </Link>
      </div>

      {/* Marketplace: Barbershops Selector / Explorer */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#00e575]">
            Sedes y Barberías ({barbershops.length})
          </h2>
          <span className="text-[11px] text-muted-foreground">Marketplace</span>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {barbershops.map((shop) => {
            const isCurrent = shop.id === activeShop?.id;
            return (
              <Link
                key={shop.id}
                href={`/inicio?shop=${shop.slug}`}
                className={`flex min-w-[240px] flex-col justify-between rounded-3xl border p-4 transition-all duration-200 ${
                  isCurrent
                    ? "border-[#00e575] bg-[#00e575]/10 shadow-lg shadow-[#00e575]/5 ring-1 ring-[#00e575]"
                    : "border-border bg-card hover:border-zinc-500"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">
                      {shop.name}
                    </h3>
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                      ★ {shop.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
                    <MapPin className="h-3 w-3 text-[#00e575] shrink-0" />
                    <span>{shop.address}</span>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px]">
                  <span className="text-muted-foreground">
                    {shop._count.barbers} barberos · {shop._count.services} servicios
                  </span>
                  <span className="font-bold text-[#00e575]">
                    {isCurrent ? "✓ Activa" : "Elegir →"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Barbers of the Selected Shop */}
      {activeShop && (
        <section aria-labelledby="barberos-title" className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 id="barberos-title" className="text-xs font-black uppercase tracking-widest text-[#00e575]">
                Equipo de {activeShop.name}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Barberos certificados disponibles
              </p>
            </div>
            <Link
              href={`/agendar?barbershopId=${activeShop.id}`}
              className="text-xs font-bold text-[#00e575] hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {barbers.map((b) => (
              <Link
                key={b.id}
                href={`/agendar?barbershopId=${activeShop.id}&barberId=${b.id}`}
                className="world-card group flex flex-col items-center rounded-3xl p-3.5 text-center transition-all hover:border-[#00e575]/60"
              >
                <div className="relative mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 font-bold text-white shadow-md transition-transform group-hover:scale-105">
                  {b.displayName[0]}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#00e575] ring-2 ring-card" />
                </div>
                <p className="text-xs font-bold text-foreground">{b.displayName}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground capitalize">
                  {b.specialties.split(",")[0]}
                </p>
                <span className="mt-2 rounded-full bg-[#00e575]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#00e575]">
                  Agendar
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Services Menu of the Selected Shop */}
      {activeShop && (
        <section aria-labelledby="servicios-title">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 id="servicios-title" className="text-xs font-black uppercase tracking-widest text-[#00e575]">
                Servicios y Tarifas
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {activeShop.name} · Precios en COP
              </p>
            </div>
            <Link
              href={`/agendar?barbershopId=${activeShop.id}`}
              className="text-xs font-bold text-[#00e575] hover:underline"
            >
              + Agendar
            </Link>
          </div>

          <div className="world-card divide-y divide-border/60 overflow-hidden rounded-3xl">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/agendar?barbershopId=${activeShop.id}&serviceId=${s.id}`}
                className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/40"
              >
                <div className="pr-3">
                  <p className="text-sm font-bold text-foreground">{s.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-[#00e575]" />
                    <span>{formatDuration(s.durationMinutes)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-black text-foreground">
                    {formatCOP(s.price)}
                  </span>
                  <span className="block text-[10px] font-bold text-[#00e575]">
                    + Elegir
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <BottomNav role={session.role} />
    </main>
  );
}
