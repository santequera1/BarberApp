import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ACTIVE_STATUSES, STATUS_LABELS, type AppointmentStatus } from "@/lib/core/status";
import { formatDateShort, formatTime12 } from "@/lib/core/dates";
import { formatCOP } from "@/lib/core/money";
import {
  Calendar,
  CalendarPlus,
  QrCode,
  Scissors,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Store,
  Ticket,
  ArrowRight,
  Search,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { BottomNav } from "@/components/BottomNav";

const STATUS_CONFIG: Record<
  string,
  { badgeBg: string; badgeText: string; icon: typeof CheckCircle2 }
> = {
  CONFIRMADA: {
    badgeBg: "bg-blue-500/20 border-blue-500/40",
    badgeText: "text-blue-400",
    icon: CheckCircle2,
  },
  EN_CURSO: {
    badgeBg: "bg-red-500/20 border-red-500/40 animate-pulse",
    badgeText: "text-red-400",
    icon: Scissors,
  },
  COMPLETADA: {
    badgeBg: "bg-zinc-800 text-zinc-400 border-white/10",
    badgeText: "text-zinc-400",
    icon: CheckCircle2,
  },
  CANCELADA: {
    badgeBg: "bg-red-950/40 border-red-500/40",
    badgeText: "text-red-400",
    icon: XCircle,
  },
  NO_ASISTIO: {
    badgeBg: "bg-red-950/40 border-red-500/40",
    badgeText: "text-red-400",
    icon: AlertCircle,
  },
};

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const session = await getSession();
  const { code: searchCode } = await searchParams;

  // Si no está autenticado
  if (!session) {
    let directAppointment = null;
    if (searchCode) {
      directAppointment = await prisma.appointment.findUnique({
        where: { code: searchCode.trim().toUpperCase() },
        include: { services: true, barber: true, barbershop: true },
      });
    }

    return (
      <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10">
              <Ticket className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">Mis Pases QR</h1>
              <p className="text-xs text-zinc-400">Consulta tus turnos y reservas</p>
            </div>
          </div>
        </div>

        {directAppointment ? (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-400 font-bold">
              ✓ Pase QR encontrado para el código: {directAppointment.code}
            </div>
            <AppointmentCard a={directAppointment} />
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {/* Google Sign In Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 mb-4">
                <QrCode className="h-7 w-7" />
              </div>
              <h2 className="text-base font-black text-white">
                Accede para ver tus Citas y Pases
              </h2>
              <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
                Inicia sesión con Google para ver todos tus turnos reservados, escanear en la barbería y recibir confirmaciones.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href="/api/auth/google"
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-white text-xs font-black text-black shadow-xl hover:bg-zinc-200 transition-all active:scale-[0.98]"
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

                <Link
                  href="/ingreso?next=/citas"
                  className="flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-xs font-bold text-white hover:bg-zinc-800"
                >
                  Entrar con Correo y Contraseña
                </Link>
              </div>
            </div>

            {/* Buscar por Código de Reserva */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                ¿Agendaste como invitado?
              </span>
              <p className="text-xs text-zinc-300 mb-3">
                Ingresa el código de tu cita para ver tu pase QR inmediatamente:
              </p>
              <form method="GET" action="/citas" className="flex gap-2">
                <input
                  name="code"
                  defaultValue={searchCode || ""}
                  placeholder="Ej: CANNAN-001 o ROYAL-001"
                  className="h-11 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-3.5 text-xs text-white uppercase placeholder:normal-case placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-red flex h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-black"
                >
                  <Search className="h-4 w-4" />
                  <span>Buscar</span>
                </button>
              </form>
            </div>
          </div>
        )}

        <BottomNav />
      </main>
    );
  }

  // Usuario Autenticado
  const appointments = await prisma.appointment.findMany({
    where: { clientId: session.userId },
    include: { services: true, barber: true, barbershop: true },
    orderBy: { startsAt: "desc" },
    take: 50,
  });

  const upcoming = appointments
    .filter(
      (a) =>
        ACTIVE_STATUSES.includes(a.status as AppointmentStatus) &&
        a.endsAt >= new Date()
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const history = appointments.filter((a) => !upcoming.includes(a));

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-5 text-white">
      <HeaderNav userName={session.name} role={session.role} subtitle="Mis Pases QR" />

      {/* Próximas Citas */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Pases Activos ({upcoming.length})
          </h2>
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] font-black text-red-400 hover:text-red-300"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            <span>Nueva Cita</span>
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900/40 p-8 text-center">
            <Ticket className="mx-auto h-10 w-10 text-zinc-600 mb-2" />
            <h3 className="text-sm font-bold text-white">No tienes citas activas</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
              Elige tu corte favorito en el marketplace y agenda tu pase QR express.
            </p>
            <Link
              href="/"
              className="btn-red mx-auto mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-xs font-black uppercase tracking-wider"
            >
              <span>Explorar Cortes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>

      {/* Historial de Citas */}
      {history.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
            Historial ({history.length})
          </h2>
          <div className="flex flex-col gap-3.5">
            {history.map((a) => (
              <AppointmentCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      <BottomNav role={session.role} />
    </main>
  );
}

function AppointmentCard({ a }: { a: any }) {
  const statusCfg = STATUS_CONFIG[a.status] || {
    badgeBg: "bg-zinc-800 border-white/10",
    badgeText: "text-zinc-400",
    icon: Clock,
  };
  const StatusIcon = statusCfg.icon;

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-4 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Store className="h-3.5 w-3.5 text-red-500" />
          <span>{a.barbershop?.name || "Barbería"}</span>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${statusCfg.badgeBg} ${statusCfg.badgeText}`}
        >
          <StatusIcon className="h-2.5 w-2.5" />
          <span>{STATUS_LABELS[a.status as AppointmentStatus] ?? a.status}</span>
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-2xl font-black text-white">
            {formatTime12(a.startsAt)}
          </p>
          <p className="text-xs text-zinc-300 font-bold">
            {formatDateShort(a.startsAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-black text-red-400">
            {formatCOP(a.total)}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono">
            Pase: {a.code}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-black/50 p-3 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <User className="h-3.5 w-3.5 text-blue-400" />
          <span>Barbero: <strong className="text-white">{a.barber?.displayName || "Cualquiera"}</strong></span>
        </div>
        <Link
          href={`/citas/${a.id}`}
          className="flex items-center gap-1 text-xs font-bold text-red-400 hover:underline"
        >
          <QrCode className="h-3.5 w-3.5" />
          <span>Ver Pase QR</span>
        </Link>
      </div>
    </div>
  );
}
