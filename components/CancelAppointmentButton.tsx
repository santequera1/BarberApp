"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";

export function CancelAppointmentButton({
  appointmentId,
  cancellationWindowMinutes,
}: {
  appointmentId: string;
  cancellationWindowMinutes: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelada por el cliente" }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "No se pudo cancelar.");
        return;
      }
      router.refresh();
    } catch {
      setLoading(false);
      setError("Error de conexión al cancelar.");
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
      >
        <X className="h-4 w-4" />
        <span>Cancelar esta cita</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 animate-fade-in-up">
      <div className="flex items-start gap-2.5 text-destructive mb-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs">¿Confirmas la cancelación?</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Recuerda que cancelaciones con menos de {Math.round(cancellationWindowMinutes / 60)} horas de anticipación son notificadas al barbero.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-2 text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => void cancel()}
          disabled={loading}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-destructive text-xs font-bold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <span>Sí, cancelar cita</span>
          )}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex h-10 flex-1 items-center justify-center rounded-xl border border-border bg-card text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
