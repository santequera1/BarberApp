"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserX, Loader2, AlertCircle } from "lucide-react";

export function AgendaActions({
  appointmentId,
  status,
  isPast,
}: {
  appointmentId: string;
  status: string;
  isPast: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "complete" | "no-show") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/${action}`, {
        method: "PATCH",
      });
      const data = await res.json();
      setLoading(null);
      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar la cita.");
        return;
      }
      router.refresh();
    } catch {
      setLoading(null);
      setError("Error de conexión.");
    }
  }

  if (status !== "EN_CURSO" && !(status === "CONFIRMADA" && isPast)) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      {error && (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex gap-2">
        {status === "EN_CURSO" && (
          <button
            onClick={() => void act("complete")}
            disabled={loading !== null}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#00e575] font-black text-xs uppercase tracking-wider text-black shadow-md transition-all hover:bg-[#00ff83] active:scale-95 disabled:opacity-60"
          >
            {loading === "complete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>{loading === "complete" ? "Guardando..." : "Completar y Cobrar"}</span>
          </button>
        )}
        {status === "CONFIRMADA" && isPast && (
          <button
            onClick={() => void act("no-show")}
            disabled={loading !== null}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 font-bold text-xs text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-60"
          >
            {loading === "no-show" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserX className="h-4 w-4" />
            )}
            <span>{loading === "no-show" ? "Guardando..." : "Marcar No Asistió"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
