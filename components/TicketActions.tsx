"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { Copy, Check, Calendar, MapPin } from "lucide-react";

export function TicketActions({
  backupCode,
  appointment,
}: {
  backupCode: string;
  appointment: {
    code: string;
    services: string;
    barberName: string;
    startsAt: string;
    endsAt: string;
    address: string;
  };
}) {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (searchParams.get("nueva") === "1") {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#00e575", "#00ff83", "#ffffff", "#18181b"],
        });
      } catch {}
    }
  }, [searchParams]);

  function copyCode() {
    navigator.clipboard.writeText(backupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function addToCalendar() {
    const title = encodeURIComponent(`Cita en La Barbería: ${appointment.services}`);
    const details = encodeURIComponent(
      `Cita con ${appointment.barberName} en ${appointment.address}.\nCódigo de cita: ${appointment.code}\nCódigo de respaldo: ${backupCode}`
    );
    const location = encodeURIComponent(appointment.address || "La Barbería, Cartagena");
    
    const startIso = new Date(appointment.startsAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endIso = new Date(appointment.endsAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
    window.open(gcalUrl, "_blank");
  }

  return (
    <div className="flex flex-col gap-3.5">
      {backupCode && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
            Código de Respaldo Manual
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-black tracking-widest text-[#00e575]">
              {backupCode.split("").join(" ")}
            </span>
            <button
              onClick={copyCode}
              aria-label="Copiar código de respaldo"
              title="Copiar código"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-[#00e575] hover:text-black active:scale-95"
            >
              {copied ? (
                <Check className="h-5 w-5 text-[#00e575]" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
          {copied && (
            <p className="mt-1.5 text-xs font-bold text-[#00e575]">
              ¡Código copiado al portapapeles!
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={addToCalendar}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-xs font-bold text-white transition-colors hover:bg-white/10"
        >
          <Calendar className="h-4 w-4 text-[#00e575]" />
          <span>Google Calendar</span>
        </button>

        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(appointment.address || "La Barbería")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-xs font-bold text-white transition-colors hover:bg-white/10"
        >
          <MapPin className="h-4 w-4 text-[#00e575]" />
          <span>Cómo llegar</span>
        </a>
      </div>
    </div>
  );
}
