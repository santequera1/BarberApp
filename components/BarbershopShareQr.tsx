"use client";

import { useState, useRef } from "react";
import { QrCode, Download, Share2, Copy, Check, X } from "lucide-react";

export function BarbershopShareQr({
  shopName,
  slug,
  qrSvg,
}: {
  shopName: string;
  slug: string;
  qrSvg: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/b/${slug}`
    : `https://barber.wailus.co/b/${slug}`;

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `¡Agenda tu cita en ${shopName}! Reserva tu turno en segundos sin filas aquí: ${publicUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  function downloadSvg() {
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 px-3.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 hover:border-red-500 active:scale-95"
      >
        <QrCode className="h-4 w-4 text-red-500" />
        <span>QR de la Sede</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in-up">
          <div className="app-card w-full max-w-sm p-6 text-center border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-red-500">
                Pase QR Oficial
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-black text-white">{shopName}</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Coloca este QR en tu local o compártelo para que tus clientes agenden sin filas.
            </p>

            <div className="my-6 flex justify-center">
              <div
                ref={qrRef}
                className="rounded-3xl bg-white p-4 shadow-2xl ring-4 ring-red-500/30 w-[210px] h-[210px] [&_svg]:w-full [&_svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={shareWhatsApp}
                className="btn-red flex h-11 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider"
              >
                <Share2 className="h-4 w-4 text-white" />
                <span>Compartir en WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyLink}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-zinc-900 text-xs font-bold text-white hover:bg-zinc-800"
                >
                  {copied ? <Check className="h-4 w-4 text-blue-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "¡Copiado!" : "Copiar Link"}</span>
                </button>

                <button
                  onClick={downloadSvg}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-zinc-900 text-xs font-bold text-white hover:bg-zinc-800"
                >
                  <Download className="h-4 w-4 text-red-400" />
                  <span>Descargar QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
