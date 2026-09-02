import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  Scissors,
  Store,
  UserCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  MapPin,
  Star,
  Shield,
  PlusCircle,
  Clock,
  Ticket,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { MarketplaceExplorer } from "@/components/MarketplaceExplorer";

export default async function AppHomePage() {
  const session = await getSession();

  const barbershops = await prisma.barbershop.findMany({
    where: { status: "ACTIVA" },
    include: {
      services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      barbers: { where: { status: "ACTIVO" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-dvh bg-black text-white pb-28">
      {/* App Top Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="relative -mb-6 flex shrink-0 items-center justify-center transition-transform active:scale-95"
            >
              <img
                src="/logo.png"
                alt="BarberApp"
                className="h-16 w-auto object-contain drop-shadow-[0_0_2px_rgba(255,255,255,0.95)] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] drop-shadow-[0_8px_16px_rgba(239,68,68,0.4)]"
              />
            </Link>
            <div>
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>BarberApp</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
              </span>
              <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Marketplace de Barberías
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session ? (
              <Link
                href={session.role === "BARBERO" ? "/barbero" : session.role === "ADMIN" ? "/admin" : "/citas"}
                className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{session.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/ingreso"
                className="flex h-9 items-center justify-center rounded-full bg-zinc-900 border border-white/10 px-4 text-xs font-extrabold text-white hover:bg-zinc-800 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="mx-auto max-w-lg px-4 pt-4 flex flex-col gap-5">
        {session ? (
          /* ========================================================================= */
          /* LOGGED IN USER HERO: Bienvenida visual sin los 2 botones redundantes      */
          /* ========================================================================= */
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-red-600/15 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-600/15 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Sesión Iniciada
                  </span>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">
                  {session.role === "ADMIN"
                    ? "Super Admin"
                    : session.role === "BARBERO"
                    ? "Barbero"
                    : "Cliente"}
                </span>
              </div>

              <div>
                <h1 className="text-xl font-black text-white">
                  ¡Hola, {session.name.split(" ")[0]}! 👋
                </h1>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Explora los mejores estilos de la ciudad, agenda con tu barbero favorito y reserva en segundos con tu Pase QR digital.
                </p>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <Link
                  href="/citas"
                  className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-900/40 transition-colors"
                >
                  <Ticket className="h-3.5 w-3.5 text-blue-400" />
                  <span>Mis Pases QR</span>
                </Link>

                {session.role === "BARBERO" || session.role === "ADMIN" ? (
                  <Link
                    href={session.role === "ADMIN" ? "/admin" : "/barbero"}
                    className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-950/40 px-3.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/40 transition-colors"
                  >
                    <Store className="h-3.5 w-3.5 text-red-400" />
                    <span>Panel de Gestión</span>
                  </Link>
                ) : (
                  <Link
                    href="/crear-barberia"
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5 text-red-400" />
                    <span>Registrar mi Barbería</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* GUEST VISITOR HERO: Google 1-Click + Dual Role Cards                      */
          /* ========================================================================= */
          <>
            <a
              href="/api/auth/google"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-zinc-900/90 text-xs font-extrabold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Acceder con Google en 1 Clic</span>
            </a>

            <div className="grid grid-cols-2 gap-3">
              {/* Soy Cliente Card */}
              <Link
                href="/agendar"
                className="group relative flex flex-col justify-between rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-zinc-900 to-black p-4 text-left shadow-xl transition-all hover:border-blue-400 hover:shadow-blue-500/10 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-400">
                    Clientes
                  </span>
                </div>

                <div className="mt-4">
                  <h2 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                    Soy Cliente
                  </h2>
                  <p className="mt-0.5 text-[11px] text-zinc-400 leading-tight">
                    Agendar corte express sin filas ni cuenta obligatoria.
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1 text-[11px] font-black text-blue-400">
                  <span>Reservar cita</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Soy Barbero Card */}
              <Link
                href="/barbero"
                className="group relative flex flex-col justify-between rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-zinc-900 to-black p-4 text-left shadow-xl transition-all hover:border-red-400 hover:shadow-red-500/10 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/30">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-400">
                    Barberos
                  </span>
                </div>

                <div className="mt-4">
                  <h2 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                    Soy Barbero
                  </h2>
                  <p className="mt-0.5 text-[11px] text-zinc-400 leading-tight">
                    Panel de agenda, escaneo de pases QR y horarios.
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1 text-[11px] font-black text-red-400">
                  <span>Mi Panel</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>

            {/* Register Shop CTA Banner */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-4 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-white border border-white/10">
                  <Store className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">
                    ¿Tienes una Barbería?
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Sube tus fotos, invita a tus barberos y recibe citas hoy.
                  </p>
                </div>
              </div>

              <Link
                href="/crear-barberia"
                className="btn-red flex h-9 shrink-0 items-center justify-center rounded-full px-3.5 text-xs font-black uppercase tracking-wider"
              >
                <span>Crear Sede</span>
              </Link>
            </div>
          </>
        )}

        {/* Marketplace Explorer with Search, Filters, Map and Cards */}
        <div>
          <div className="mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Marketplace de Sedes
            </span>
            <h2 className="text-base font-black text-white">
              Explorar & Agendar Citas
            </h2>
          </div>

          {barbershops.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-zinc-900/40 p-8 text-center">
              <Store className="mx-auto h-10 w-10 text-zinc-600 mb-2" />
              <h3 className="text-sm font-bold text-white">
                Aún no hay barberías creadas
              </h3>
              <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
                Sé el primero en registrar tu barbería, subir tus fotos y compartir tu código QR oficial.
              </p>
              <Link
                href="/crear-barberia"
                className="btn-red mx-auto mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-xs font-black uppercase tracking-wider"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Registrar Barbería Ahora</span>
              </Link>
            </div>
          ) : (
            <MarketplaceExplorer initialShops={barbershops} />
          )}
        </div>
      </main>

      {/* Persistent Bottom App Bar */}
      <BottomNav role={session?.role} />
    </div>
  );
}
