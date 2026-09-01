import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/core/money";
import { formatDuration } from "@/lib/core/dates";
import {
  Scissors,
  Calendar,
  Clock,
  QrCode,
  Star,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Phone,
  UserCheck,
  Store,
  Globe,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function LandingPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "BARBERO" ? "/barbero" : "/inicio");
  }

  const [barbershops, services, barbers] = await Promise.all([
    prisma.barbershop.findMany({
      where: { status: "ACTIVA" },
      orderBy: { rating: "desc" },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.barber.findMany({
      where: { status: "ACTIVO" },
      include: { barbershop: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="min-h-dvh bg-background text-foreground selection:bg-[#00e575] selection:text-black">
      {/* Top Navbar */}
      <header className="glass sticky top-0 z-50 transition-all border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-black shadow-lg shadow-[#00e575]/25">
              <img src="/logo.jpg" alt="Barber Market Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-foreground">
                BarberApp
              </span>
              <span className="block text-[9px] font-black uppercase tracking-widest text-[#00e575]">
                Marketplace & Reservas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/ingreso"
              className="hidden text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground sm:inline-block"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className="btn-world flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-xs font-black uppercase tracking-wider"
            >
              <span>Agendar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
        {/* Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-full max-w-3xl -translate-x-1/2 rounded-full bg-[#00e575]/15 blur-[120px]"
        />

        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00e575]/30 bg-[#00e575]/10 px-4 py-1.5 text-xs font-black text-[#00e575] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>BarberApp — Marketplace de Barberías con Pase QR</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl sm:leading-[1.15]">
            Reserva tu silla en las mejores barberías de la <span className="text-[#00e575]">ciudad</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg sm:leading-relaxed">
            Explora sedes, elige a tu barbero experto y agenda tu turno en segundos. Sin filas ni esperas por WhatsApp, con pase digital QR instantáneo.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/registro"
              className="btn-world flex h-13 w-full items-center justify-center gap-2 rounded-full px-8 text-sm font-black uppercase tracking-wider shadow-xl sm:w-auto"
            >
              <Calendar className="h-4 w-4 text-black" />
              <span>Explorar y Agendar Cita</span>
            </Link>
            <Link
              href="/crear-barberia"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-8 text-sm font-bold text-foreground transition-colors hover:border-[#00e575] hover:bg-[#00e575]/5 sm:w-auto"
            >
              <Store className="h-4 w-4 text-[#00e575]" />
              <span>Registrar mi Barbería</span>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-12 grid grid-cols-3 gap-2 rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-md sm:gap-4 sm:p-6">
            <div>
              <p className="text-2xl font-black text-[#00e575] sm:text-3xl">4.9 ★</p>
              <p className="text-xs text-muted-foreground sm:text-sm">+1,200 Clientes</p>
            </div>
            <div className="border-x border-border">
              <p className="text-2xl font-black text-[#00e575] sm:text-3xl">100%</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Sin Esperas</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#00e575] sm:text-3xl">{barbershops.length}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Sedes Activas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Barbershops Showcase (Marketplace) */}
      <section className="border-y border-border bg-secondary/30 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#00e575]">
              Sedes Disponibles
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
              Nuestras Barberías Asociadas
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ubicaciones estratégicas con los más altos estándares de calidad.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {barbershops.map((shop) => (
              <div
                key={shop.id}
                className="world-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {shop.name}
                    </h3>
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-500">
                      ★ {shop.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {shop.description}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-[#00e575] shrink-0" />
                    <span>{shop.address}, {shop.city}</span>
                  </p>
                </div>

                <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {shop.phone}
                  </span>
                  <Link
                    href={`/registro`}
                    className="flex h-9 items-center justify-center gap-1 rounded-full bg-secondary px-4 text-xs font-bold text-foreground hover:bg-[#00e575] hover:text-black transition-colors"
                  >
                    <span>Ver Silla</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#00e575]">
              Servicios Destacados
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
              Cortes, Barba y Paquetes VIP
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="world-card p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground text-base">
                      {service.name}
                    </h3>
                    <span className="rounded-full bg-[#00e575]/15 px-2.5 py-0.5 text-xs font-bold text-[#00e575]">
                      {formatDuration(service.durationMinutes)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {service.description || "Atención profesional con acabado de navaja y toalla caliente."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Precio</span>
                    <p className="font-mono text-base font-black text-foreground">
                      {formatCOP(service.price)}
                    </p>
                  </div>
                  <Link
                    href="/registro"
                    className="flex h-9 items-center justify-center gap-1 rounded-full bg-secondary px-4 text-xs font-bold text-foreground hover:bg-[#00e575] hover:text-black transition-colors"
                  >
                    <span>Elegir</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} Barber Market. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-[#00e575] hover:underline font-bold">
              Panel Super Admin
            </Link>
            <Link href="/ingreso" className="text-muted-foreground hover:underline">
              Ingreso Staff
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
