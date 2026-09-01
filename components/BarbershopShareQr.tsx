"use client";

import { useState, useRef } from "react";
import { QrCode, Download, Share2, Copy, Check, X, Printer } from "lucide-react";

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
    : `https://barberia.app/b/${slug}`;

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
        className="flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-bold text-foreground transition-all hover:bg-secondary hover:border-[#00e575] active:scale-95"
      >
        <QrCode className="h-4 w-4 text-[#00e575]" />
        <span>QR de la Sede</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="world-card w-full max-w-sm p-6 text-center">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#00e575]">
                Pase QR Oficial
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-black text-foreground">{shopName}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Coloca este QR en tu local o compártelo para que tus clientes agenden sin filas.
            </p>

            <div className="my-6 flex justify-center">
              <div
                ref={qrRef}
                className="rounded-3xl bg-white p-4 shadow-2xl ring-4 ring-[#00e575]/30 w-[210px] h-[210px] [&_svg]:w-full [&_svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={shareWhatsApp}
                className="btn-world flex h-11 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider"
              >
                <Share2 className="h-4 w-4 text-black" />
                <span>Compartir en WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyLink}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary"
                >
                  {copied ? <Check className="h-4 w-4 text-[#00e575]" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "¡Copiado!" : "Copiar Link"}</span>
                </button>

                <button
                  onClick={downloadSvg}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary"
                >
                  <Download className="h-4 w-4 text-[#00e575]" />
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
