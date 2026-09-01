"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Camera,
  Keyboard,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Scissors,
  Clock,
  User,
  Sparkles,
} from "lucide-react";
import { BackupCodeInput } from "./BackupCodeInput";

type CheckinResponse =
  | {
      ok: true;
      appointment: {
        clientName: string;
        services: string[];
        time: string;
        barberName: string;
      };
    }
  | { ok: false; reason: string; detail: string };

type View = "camera" | "manual" | "success" | "error";

export function Scanner() {
  const router = useRouter();
  const [view, setView] = useState<View>("camera");
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const busyRef = useRef(false);

  const submit = useCallback(
    async (payload: { token?: string; backupCode?: string }) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      try {
        const endpoint = payload.token ? "/api/checkin/scan" : "/api/checkin/code";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data: CheckinResponse = await res.json();
        setResult(data);
        if (data.ok) {
          try {
            navigator.vibrate?.([40, 60, 40]);
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.5 },
              colors: ["#00e575", "#00ff83", "#ffffff", "#18181b"],
            });
          } catch {}
          setView("success");
          setTimeout(() => router.push("/barbero"), 2800);
        } else {
          setView("error");
        }
      } catch {
        setResult({
          ok: false,
          reason: "RED",
          detail: "Error de conexión con el servidor. Intenta de nuevo.",
        });
        setView("error");
      } finally {
        setBusy(false);
        busyRef.current = false;
      }
    },
    [router]
  );

  // Iniciar lector de cámara
  useEffect(() => {
    if (view !== "camera") return;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 12, qrbox: { width: 240, height: 240 } },
          (text) => {
            void scanner.stop().catch(() => {});
            void submit({ token: text.trim() });
          },
          () => {}
        );
      } catch {
        if (!cancelled) setCameraError(true);
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [view, submit]);

  // Pantalla de Éxito
  if (view === "success" && result?.ok) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 text-center text-white animate-fade-in-up">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#00e575] text-black shadow-2xl shadow-[#00e575]/50">
          <CheckCircle2 className="h-14 w-14 stroke-[2.5]" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-[#00e575]">
          ¡Cita Validada con Éxito!
        </span>
        <h2 className="mt-2 text-3xl font-black">{result.appointment.clientName}</h2>

        <div className="mt-6 w-full max-w-xs rounded-3xl bg-white/10 p-5 backdrop-blur-md text-left border border-white/10">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Scissors className="h-4 w-4 text-[#00e575]" />
            <span>{result.appointment.services.join(" + ")}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#00e575]" />
              <span>{result.appointment.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#00e575]" />
              <span>{result.appointment.barberName}</span>
            </div>
          </div>
        </div>

        <p className="mt-8 flex items-center gap-2 text-xs text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00e575]" />
          <span>Regresando a la agenda de trabajo...</span>
        </p>
      </div>
    );
  }

  // Pantalla de Error
  if (view === "error" && result && !result.ok) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 text-center text-white animate-fade-in-up">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20 text-destructive border-2 border-destructive shadow-xl">
          <XCircle className="h-12 w-12" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-destructive">
          No se pudo validar
        </span>
        <h3 className="mt-2 text-lg font-bold max-w-xs">{result.detail}</h3>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => {
              setResult(null);
              setView("manual");
            }}
            className="btn-world flex h-12 items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider"
          >
            <Keyboard className="h-4 w-4" />
            <span>Digitar Código Manual</span>
          </button>
          <button
            onClick={() => {
              setResult(null);
              setCameraError(false);
              setView("camera");
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Escanear de Nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  // Modo Manual (PIN de 6 dígitos)
  if (view === "manual") {
    return (
      <div className="flex flex-col items-center px-4 pt-6 animate-fade-in-up">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00e575]/15 text-[#00e575]">
          <Keyboard className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Código de Respaldo</h2>
        <p className="mt-1 text-center text-xs text-muted-foreground max-w-xs mb-8">
          Pídele al cliente el código alfanumérico de 6 dígitos que aparece en su Pase Digital.
        </p>

        <BackupCodeInput
          disabled={busy}
          onComplete={(code) => void submit({ backupCode: code })}
        />

        {busy && (
          <div className="mt-6 flex items-center gap-2 text-xs text-[#00e575]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validando código con el servidor...</span>
          </div>
        )}

        <button
          onClick={() => {
            setCameraError(false);
            setView("camera");
          }}
          className="mt-10 flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
        >
          <Camera className="h-4 w-4 text-[#00e575]" />
          <span>Volver a la Cámara</span>
        </button>
      </div>
    );
  }

  // Vista de Cámara
  return (
    <div className="flex flex-col items-center px-4 pt-2">
      <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl">
        <div id="qr-reader" className="min-h-[300px] w-full [&_video]:!w-full [&_video]:!object-cover" />

        {/* Laser scanner animation */}
        {!cameraError && (
          <div
            aria-hidden="true"
            className="animate-laser pointer-events-none absolute inset-x-8 h-1 rounded-full bg-gradient-to-r from-transparent via-[#00e575] to-transparent shadow-lg shadow-[#00e575]/50"
          />
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-card">
            <Camera className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-xs text-foreground font-medium">
              No se pudo abrir la cámara. Revisa los permisos de tu navegador o usa el código manual.
            </p>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs font-medium text-muted-foreground text-center">
        Apunta la cámara al código QR del cliente
      </p>

      {/* Manual PIN Fallback button */}
      <button
        onClick={() => setView("manual")}
        className="world-card mt-6 flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider text-foreground hover:border-[#00e575] transition-all"
      >
        <Keyboard className="h-4 w-4 text-[#00e575]" />
        <span>Digitar Código Manual (6 dígitos)</span>
      </button>
    </div>
  );
}
