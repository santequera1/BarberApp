import Link from "next/link";
import { redirect } from "next/navigation";
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
  RotateCcw,
  Store,
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

export default async function CitasPage() {
  const session = await getSession();
  if (!session) redirect("/");

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

  function AppointmentCard({ a }: { a: (typeof appointments)[number] }) {
    const isCancelled = a.status === "CANCELADA";
    const statusCfg = STATUS_CONFIG[a.status] || {
      badgeBg: "bg-secondary border-border",
      badgeText: "text-muted-foreground",
      icon: Clock,
    };
    const StatusIcon = statusCfg.icon;

    return (
      <div
        className="world-card p-5 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Calendar className="h-3.5 w-3.5 text-[#00e575]" />
            <span>{formatDateShort(a.startsAt)} · {formatTime12(a.startsAt)}</span>
          </div>

          <div
            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusCfg.badgeBg} ${statusCfg.badgeText}`}
          >
            <StatusIcon className="h-3 w-3" />
            <span>{STATUS_LABELS[a.status as AppointmentStatus] ?? a.status}</span>
          </div>
        </div>

        <div className="my-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1">
            <Store className="h-3.5 w-3.5 text-[#00e575]" />
            <span>{a.barbershop?.name || "La Barbería"}</span>
          </div>
          <p className={`text-base font-bold text-foreground ${isCancelled ? "line-through opacity-60" : ""}`}>
            {a.services.map((s) => s.nameSnapshot).join(" + ")}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#00e575]" />
              <span>Barbero: <strong className="text-foreground">{a.barber.displayName}</strong></span>
            </div>
            <span className="font-mono text-sm font-black text-foreground">
              {formatCOP(a.total)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-3">
          {ACTIVE_STATUSES.includes(a.status as AppointmentStatus) && a.endsAt >= new Date() ? (
            <Link
              href={`/citas/${a.id}`}
              className="btn-world flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-xs font-black uppercase tracking-wider"
            >
              <QrCode className="h-4 w-4 text-black" />
              <span>Ver Pase QR</span>
            </Link>
          ) : (
            <Link
              href={`/agendar?barbershopId=${a.barbershopId || ""}&barberId=${a.barberId}`}
              className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#00e575]" />
              <span>Reagendar</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-5">
      <HeaderNav userName={session.name} role={session.role} subtitle="Mis Citas" />

      {/* Upcoming Section */}
      <section aria-labelledby="proximas-title" className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="proximas-title" className="text-xs font-black uppercase tracking-widest text-[#00e575]">
            Próximas Citas ({upcoming.length})
          </h2>
          <Link
            href="/agendar"
            className="flex items-center gap-1 text-xs font-black text-[#00e575] hover:underline"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            <span>+ Agendar</span>
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="world-card p-8 text-center border-dashed">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground">
              No tienes citas activas
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Explora las barberías disponibles y agenda tu turno.
            </p>
            <Link
              href="/agendar"
              className="btn-world mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-xs font-black uppercase tracking-wider"
            >
              <CalendarPlus className="h-4 w-4 text-black" />
              <span>Agendar Ahora</span>
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

      {/* History Section */}
      {history.length > 0 && (
        <section aria-labelledby="historial-title">
          <h2 id="historial-title" className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
            Historial de Citas ({history.length})
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
