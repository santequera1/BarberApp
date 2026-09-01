"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  MapPin,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";

export default function CrearBarberiaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const slug =
      (form.get("slug") as string) ||
      name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const address = form.get("address") as string;
    const city = (form.get("city") as string) || "Cartagena";
    const phone = (form.get("phone") as string) || "";
    const latitude = parseFloat((form.get("latitude") as string) || "10.4236");
    const longitude = parseFloat((form.get("longitude") as string) || "-75.5503");

    try {
      const res = await fetch("/api/admin/barbershops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          address,
          city,
          phone,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la barbería.");
        return;
      }

      router.push(`/inicio?shop=${data.barbershop.slug}`);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Error de conexión al registrar la sede.");
    }
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-20 pt-5">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/inicio"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-[#00e575]">
          Marketplace
        </span>
        <div className="h-11 w-11 opacity-0" />
      </div>

      <div className="world-card p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#00e575] text-black shadow-xl shadow-[#00e575]/25">
            <Store className="h-7 w-7 stroke-[2.5]" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00e575]/10 px-3 py-1 text-[11px] font-black text-[#00e575] mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Únete al Marketplace</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Registra tu Barbería
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Publica tu sede para que miles de clientes agenden citas con tus barberos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
              Nombre de tu Negocio / Sede *
            </label>
            <input
              name="name"
              required
              placeholder="Ej: Deluxe Barber Lounge"
              className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
              Dirección de la Sede *
            </label>
            <input
              name="address"
              required
              placeholder="Ej: Calle 30 # 15-20, Pie de la Popa"
              className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                Ciudad
              </label>
              <input
                name="city"
                defaultValue="Cartagena"
                className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                Teléfono / WhatsApp
              </label>
              <input
                name="phone"
                placeholder="3001234567"
                className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-world mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registrando sede...</span>
              </>
            ) : (
              <span>Publicar Barbería en el Mapa</span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
