import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/booking";
import {
  formatDateLong,
  formatTime12,
  formatDuration,
} from "@/lib/core/dates";
import { formatCOP } from "@/lib/core/money";
import { STATUS_LABELS, type AppointmentStatus } from "@/lib/core/status";
import {
  ArrowLeft,
  Scissors,
  User,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  QrCode as QrIcon,
} from "lucide-react";
import { CancelAppointmentButton } from "@/components/CancelAppointmentButton";
import { TicketActions } from "@/components/TicketActions";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      services: true,
      barber: true,
      checkin: true,
      barbershop: true,
    },
  });

  if (!appointment) notFound();

  const isOwner = session ? appointment.clientId === session.userId : true;
  const isStaff = session ? (session.role === "BARBERO" || session.role === "ADMIN" || session.role === "DUEÑO") : false;

  const settings = await getSettings();
  const status = appointment.status as AppointmentStatus;

  // El código QR siempre se muestra si la cita tiene checkin y no ha sido cancelada
  const showQr =
    Boolean(appointment.checkin) &&
    ["CONFIRMADA", "PENDIENTE", "EN_CURSO", "COMPLETADA"].includes(status);

  // QR con corrección de error nivel Q y margen, sobre blanco puro para escaneo instantáneo
  const qrSvg = showQr && appointment.checkin
    ? await QRCode.toString(appointment.checkin.checkinToken, {
        type: "svg",
        errorCorrectionLevel: "Q",
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      })
    : null;

  const backupCode = appointment.checkin?.backupCode ?? "";
  const totalDuration = appointment.services.reduce(
    (a, s) => a + s.durationSnapshot,
    0
  );
  const servicesSummary = appointment.services
    .map((s) => s.nameSnapshot)
    .join(" + ");
  const shopName = appointment.barbershop?.name || settings.name;
  const shopAddress = appointment.barbershop?.address || settings.address;

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
      badgeBg: "bg-zinc-800 border-white/10",
      badgeText: "text-zinc-400",
      icon: CheckCircle2,
    },
    PENDIENTE: {
      badgeBg: "bg-amber-500/20 border-amber-500/40",
      badgeText: "text-amber-400",
      icon: Clock,
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

  const statusStyle = STATUS_CONFIG[status] || {
    badgeBg: "bg-blue-500/20 border-blue-500/40",
    badgeText: "text-blue-400",
    icon: Sparkles,
  };
  const StatusIcon = statusStyle.icon;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-24 pt-5 text-white">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={session?.role === "BARBERO" ? "/barbero" : session ? "/citas" : "/"}
          aria-label="Volver"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-white transition-all hover:bg-zinc-800 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs font-black uppercase tracking-widest text-red-500">
          Pase Digital VIP
        </span>
        <div className="h-10 w-10 opacity-0" />
      </div>

      {/* World ID VIP Credential Card */}
      <div className="world-id-pass animate-fade-in-up">
        {/* Holographic Header */}
        <div className="relative border-b border-white/10 p-6 dot-matrix-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00e575] text-black font-black shadow-lg shadow-[#00e575]/30">
                <Scissors className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-sm font-extrabold uppercase tracking-wider text-white">
                  {shopName}
                </span>
                <span className="block text-[11px] font-mono text-zinc-400">
                  CITA: {appointment.code}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${statusStyle.badgeBg} ${statusStyle.badgeText}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{STATUS_LABELS[status] ?? status}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-zinc-400">
              {formatDateLong(appointment.startsAt.toISOString().slice(0, 10))}
            </p>
            <p className="font-mono text-4xl font-black text-white mt-0.5">
              {formatTime12(appointment.startsAt)}
            </p>
          </div>
        </div>

        {/* Credential Body */}
        <div className="p-6">
          <div className="grid gap-3.5">
            <div className="flex items-start justify-between gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">
                  Servicio(s)
                </span>
                <p className="text-base font-bold text-white mt-0.5">
                  {servicesSummary}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock className="h-3.5 w-3.5 text-[#00e575]" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">
                  Total
                </span>
                <p className="font-mono text-lg font-black text-white mt-0.5">
                  {formatCOP(appointment.total)}
                </p>
                <span className="text-[10px] text-[#00e575] font-bold">En sede</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/20 font-black text-white text-base">
                  {appointment.barber.displayName[0]}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">
                    Barbero Asignado
                  </span>
                  <p className="text-sm font-bold text-white">
                    {appointment.barber.displayName}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#00e575]/20 px-3 py-1 text-[11px] font-bold text-[#00e575] border border-[#00e575]/30">
                Verificado
              </span>
            </div>

            {appointment.clientNotes && (
              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 text-xs text-zinc-300">
                <strong className="text-[#00e575]">Nota:</strong> “{appointment.clientNotes}”
              </div>
            )}
          </div>

          {/* QR Code Container - SIEMPRE VISIBLE */}
          {qrSvg ? (
            <div className="mt-8 flex flex-col items-center">
              <div className="relative rounded-[28px] bg-white p-4 shadow-2xl ring-4 ring-[#00e575]/30">
                <div
                  aria-label={`Código QR de tu cita ${appointment.code}`}
                  role="img"
                  className="w-[220px] h-[220px] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </div>
              <p className="mt-4 text-center text-xs font-bold text-zinc-300">
                Presenta este QR al barbero al llegar a la sede 💈
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-white/5 p-6 text-center border border-white/10">
              <QrIcon className="mx-auto h-8 w-8 text-zinc-500 mb-2" />
              <p className="text-xs text-zinc-400">
                {status === "CANCELADA"
                  ? "Esta cita fue cancelada."
                  : "Código QR no disponible para esta cita."}
              </p>
            </div>
          )}
        </div>

        {/* Ticket Footer / Actions */}
        <div className="border-t border-white/10 bg-black/60 p-6">
          <TicketActions
            backupCode={backupCode}
            appointment={{
              code: appointment.code,
              services: servicesSummary,
              barberName: appointment.barber.displayName,
              startsAt: appointment.startsAt.toISOString(),
              endsAt: appointment.endsAt.toISOString(),
              address: shopAddress,
            }}
          />

          {showQr && isOwner && status !== "COMPLETADA" && status !== "CANCELADA" && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <CancelAppointmentButton
                appointmentId={appointment.id}
                cancellationWindowMinutes={settings.cancellationWindow}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
