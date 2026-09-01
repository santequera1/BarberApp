import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  bogotaToUtc,
  addDays,
  todayBogota,
  formatTime12,
  formatDateLong,
} from "@/lib/core/dates";
import { formatCOP } from "@/lib/core/money";
import { STATUS_LABELS, type AppointmentStatus } from "@/lib/core/status";
import {
  Calendar,
  Clock,
  QrCode,
  User,
  Scissors,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  XCircle,
  Store,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { AgendaActions } from "@/components/AgendaActions";

const STATUS_CONFIG: Record<
  string,
  { badgeBg: string; badgeText: string; icon: typeof CheckCircle2 }
> = {
  CONFIRMADA: {
    badgeBg: "bg-emerald-500/20 border-emerald-500/40",
    badgeText: "text-[#00e575]",
    icon: CheckCircle2,
  },
  EN_CURSO: {
    badgeBg: "bg-emerald-500/20 border-emerald-500/40 animate-pulse",
    badgeText: "text-[#00e575]",
    icon: Scissors,
  },
  COMPLETADA: {
    badgeBg: "bg-secondary text-muted-foreground border-border",
    badgeText: "text-muted-foreground",
    icon: CheckCircle2,
  },
  CANCELADA: {
    badgeBg: "bg-destructive/20 border-destructive/40",
    badgeText: "text-destructive",
    icon: XCircle,
  },
  NO_ASISTIO: {
    badgeBg: "bg-destructive/20 border-destructive/40",
    badgeText: "text-destructive",
    icon: AlertCircle,
  },
  PENDIENTE: {
    badgeBg: "bg-amber-500/20 border-amber-500/40",
    badgeText: "text-amber-500",
    icon: Clock,
  },
};

export default async function BarberoPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "CLIENTE") redirect("/inicio");

  const barber = await prisma.barber.findFirst({
    where: { user: { id: session.userId } },
    include: { barbershop: true },
  });
  if (!barber) redirect("/");

  const { date: dateParam } = await searchParams;
  const today = todayBogota();
  const date =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today;

  const dayStart = bogotaToUtc(date, "00:00");
  const dayEnd = bogotaToUtc(addDays(date, 1), "00:00");

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId: barber.id,
      startsAt: { gte: dayStart, lt: dayEnd },
    },
    include: { services: true, client: true, barbershop: true },
    orderBy: { startsAt: "asc" },
  });

  const active = appointments.filter((a) =>
    ["CONFIRMADA", "EN_CURSO", "COMPLETADA"].includes(a.status)
  );
  const completed = appointments.filter((a) => a.status === "COMPLETADA");
  const income = completed.reduce((sum, a) => sum + a.total, 0);
  const expected = active.reduce((sum, a) => sum + a.total, 0);

  const nextAppt = appointments.find(
    (a) =>
      (a.status === "EN_CURSO" || a.status === "CONFIRMADA") &&
      a.endsAt >= new Date()
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-32 pt-5">
      <HeaderNav
        userName={barber.displayName}
        subtitle={barber.barbershop?.name || "Panel de Barbero"}
        role="BARBERO"
      />

      {/* Metrics Bar */}
      <section className="mb-6 grid grid-cols-3 gap-2.5">
        <div className="world-card p-3.5 text-center flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Citas Hoy
          </span>
          <p className="font-mono text-xl font-black text-foreground mt-1">
            {completed.length} <span className="text-xs text-muted-foreground font-normal">/ {active.length}</span>
          </p>
        </div>

        <div className="world-card p-3.5 text-center flex flex-col justify-between border-[#00e575]/30">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#00e575]">
            Cobrado
          </span>
          <p className="font-mono text-base font-black text-foreground mt-1 truncate">
            {formatCOP(income)}
          </p>
        </div>

        <div className="world-card p-3.5 text-center flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Esperado
          </span>
          <p className="font-mono text-base font-black text-foreground mt-1 truncate">
            {formatCOP(expected)}
          </p>
        </div>
      </section>

      {/* Date Switcher */}
      <div className="world-card mb-6 flex items-center justify-between p-2">
        <Link
          href={`/barbero?date=${addDays(date, -1)}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
          title="Día anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00e575]">
            {date === today ? "Agenda de Hoy" : "Agenda de Fecha"}
          </span>
          <p className="text-xs font-bold text-foreground">
            {formatDateLong(date)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {date !== today && (
            <Link
              href="/barbero"
              className="rounded-full bg-[#00e575]/15 px-3 py-1 text-[10px] font-black text-[#00e575] hover:bg-[#00e575] hover:text-black transition-colors"
            >
              Hoy
            </Link>
          )}
          <Link
            href={`/barbero?date=${addDays(date, 1)}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
            title="Día siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="world-card p-10 text-center border-dashed">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-bold text-foreground">
            No hay citas programadas para este día
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Los clientes podrán reservar en tus horarios libres.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {appointments.map((a) => {
            const isNext = a.id === nextAppt?.id;
            const dim = ["COMPLETADA", "CANCELADA", "EXPIRADA"].includes(
              a.status
            );
            const statusCfg = STATUS_CONFIG[a.status] || {
              badgeBg: "bg-secondary border-border",
              badgeText: "text-muted-foreground",
              icon: Clock,
            };
            const StatusIcon = statusCfg.icon;

            return (
              <li
                key={a.id}
                className={`world-card p-5 transition-all duration-200 ${
                  dim ? "opacity-70" : ""
                } ${
                  isNext
                    ? "border-[#00e575] shadow-lg shadow-[#00e575]/10 ring-1 ring-[#00e575]/50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-foreground">
                      {formatTime12(a.startsAt)}
                    </span>
                    {isNext && (
                      <span className="rounded-full bg-[#00e575] px-2.5 py-0.5 text-[9px] font-black uppercase text-black">
                        Siguiente
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusCfg.badgeBg} ${statusCfg.badgeText}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    <span>{STATUS_LABELS[a.status as AppointmentStatus] ?? a.status}</span>
                  </div>
                </div>

                <div className="my-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold text-foreground ${a.status === "CANCELADA" ? "line-through opacity-60" : ""}`}>
                        {a.client.name}
                      </p>
                      {a.client.phone && (
                        <a
                          href={`https://wa.me/57${a.client.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Contactar por WhatsApp"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00e575]/20 text-[#00e575] hover:bg-[#00e575] hover:text-black transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.services.map((s) => s.nameSnapshot).join(" + ")}
                    </p>
                    {a.clientNotes && (
                      <p className="mt-1.5 rounded-xl bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground italic">
                        “{a.clientNotes}”
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-black text-foreground">
                      {formatCOP(a.total)}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-semibold">
                      {a.paymentStatus === "PAGADO" ? "✓ Cobrado" : "Pendiente"}
                    </span>
                  </div>
                </div>

                <AgendaActions
                  appointmentId={a.id}
                  status={a.status}
                  isPast={a.startsAt < new Date()}
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* Floating QR Scanner Button */}
      <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-lg">
        <Link
          href="/barbero/escanear"
          className="btn-world flex h-13 w-full items-center justify-center gap-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-2xl transition-transform active:scale-95"
        >
          <QrCode className="h-5 w-5 stroke-[2.5]" />
          <span>Escanear Pase QR de Cliente</span>
        </Link>
      </div>
    </main>
  );
}
