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
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  XCircle,
  Store,
  PlusCircle,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { AgendaActions } from "@/components/AgendaActions";
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
  PENDIENTE: {
    badgeBg: "bg-amber-500/20 border-amber-500/40",
    badgeText: "text-amber-400",
    icon: Clock,
  },
};

export default async function BarberoPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/ingreso");

  const barber = await prisma.barber.findFirst({
    where: { userId: session.userId },
    include: { barbershop: true },
  });

  // Si no está registrado como barbero aún, mostrar pantalla para crear o vincular barbería
  if (!barber) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-32 pt-6 text-white">
        <HeaderNav userName={session.name} role="BARBERO" />

        <div className="app-card p-8 text-center border border-white/15 shadow-2xl mt-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-600/20 text-red-500 border border-red-500/30">
            <Store className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-black text-white">
            ¡Bienvenido a BarberApp!
          </h2>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Aún no estás vinculado a ninguna barbería activa. Puedes registrar tu propia barbería o pedirle al dueño de tu barbería que te invite con tu correo:
          </p>

          <div className="my-4 rounded-xl bg-zinc-900 border border-white/10 p-2.5 font-mono text-xs text-blue-400">
            {session.name}
          </div>

          <Link
            href="/crear-barberia"
            className="btn-red flex h-12 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Registrar Mi Barbería Ahora</span>
          </Link>
        </div>

        <BottomNav role={session.role} />
      </main>
    );
  }

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
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-32 pt-5 text-white">
      <HeaderNav
        userName={barber.displayName}
        subtitle={barber.barbershop?.name || "Panel Barbero"}
        role="BARBERO"
      />

      {/* Sede Info Banner */}
      {barber.barbershop && (
        <div className="app-card mb-4 p-3.5 flex items-center justify-between border border-white/10 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <Store className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs font-black text-white">{barber.barbershop.name}</p>
              <p className="text-[10px] text-zinc-400">{barber.barbershop.address}</p>
            </div>
          </div>

          <Link
            href={`/b/${barber.barbershop.slug}`}
            className="flex h-8 items-center justify-center rounded-full bg-zinc-800 px-3 text-[11px] font-bold text-white hover:bg-zinc-700"
          >
            Ver QR / Web ↗
          </Link>
        </div>
      )}

      {/* Metrics Bar */}
      <section className="mb-5 grid grid-cols-3 gap-2.5">
        <div className="app-card p-3.5 text-center flex flex-col justify-between border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Citas Hoy
          </span>
          <p className="font-mono text-xl font-black text-white mt-1">
            {completed.length} <span className="text-xs text-zinc-500 font-normal">/ {active.length}</span>
          </p>
        </div>

        <div className="app-card p-3.5 text-center flex flex-col justify-between border-red-500/40 bg-red-950/10">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
            Cobrado
          </span>
          <p className="font-mono text-base font-black text-white mt-1 truncate">
            {formatCOP(income)}
          </p>
        </div>

        <div className="app-card p-3.5 text-center flex flex-col justify-between border-blue-500/40 bg-blue-950/10">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
            Esperado
          </span>
          <p className="font-mono text-base font-black text-white mt-1 truncate">
            {formatCOP(expected)}
          </p>
        </div>
      </section>

      {/* Date Switcher */}
      <div className="app-card mb-5 flex items-center justify-between p-2 border border-white/10">
        <Link
          href={`/barbero?date=${addDays(date, -1)}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:bg-zinc-800"
          title="Día anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
            {date === today ? "Agenda de Hoy" : "Agenda de Fecha"}
          </span>
          <p className="text-xs font-bold text-white">
            {formatDateLong(date)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {date !== today && (
            <Link
              href="/barbero"
              className="rounded-full bg-blue-600/20 px-3 py-1 text-[10px] font-black text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
            >
              Hoy
            </Link>
          )}
          <Link
            href={`/barbero?date=${addDays(date, 1)}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:bg-zinc-800"
            title="Día siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="app-card p-10 text-center border-dashed border-white/15">
          <Calendar className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
          <p className="text-sm font-bold text-white">
            No hay citas programadas para este día
          </p>
          <p className="mt-1 text-xs text-zinc-400">
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
              badgeBg: "bg-zinc-800 border-white/10",
              badgeText: "text-zinc-400",
              icon: Clock,
            };
            const StatusIcon = statusCfg.icon;

            return (
              <li
                key={a.id}
                className={`app-card p-5 transition-all duration-200 ${
                  dim ? "opacity-70" : ""
                } ${
                  isNext
                    ? "border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500/50"
                    : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-white">
                      {formatTime12(a.startsAt)}
                    </span>
                    {isNext && (
                      <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[9px] font-black uppercase text-white">
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
                      <p className={`text-sm font-bold text-white ${a.status === "CANCELADA" ? "line-through opacity-60" : ""}`}>
                        {a.client.name}
                      </p>
                      {a.client.phone && (
                        <a
                          href={`tel:${a.client.phone}`}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{a.client.phone}</span>
                        </a>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {a.services.map((s) => s.nameSnapshot).join(" + ")}
                    </p>
                    {a.clientNotes && (
                      <p className="mt-1 rounded-lg bg-zinc-900 border border-white/5 p-2 text-xs italic text-zinc-300">
                        &quot;{a.clientNotes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-black text-white">
                      {formatCOP(a.total)}
                    </span>
                    <span className="block text-[10px] font-mono text-zinc-500">
                      #{a.code}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <AgendaActions
                    appointmentId={a.id}
                    status={a.status}
                    isPast={a.endsAt < new Date()}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Floating QR Scanner Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Link
          href="/barbero/escanear"
          className="btn-red flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95"
          title="Escanear Pase QR de Cliente"
        >
          <QrCode className="h-6 w-6" />
        </Link>
      </div>

      <BottomNav role={session.role} />
    </main>
  );
}
