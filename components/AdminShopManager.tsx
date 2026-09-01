"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Plus,
  Power,
  PowerOff,
  MapPin,
  Phone,
  Star,
  Users,
  Scissors,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

export interface AdminShopItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  rating: number;
  status: string;
  _count: {
    barbers: number;
    services: number;
    appointments: number;
  };
}

export function AdminShopManager({
  initialShops,
}: {
  initialShops: AdminShopItem[];
}) {
  const router = useRouter();
  const [shops, setShops] = useState<AdminShopItem[]>(initialShops);
  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle Status (Activar / Inhabilitar)
  async function toggleStatus(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/barbershops/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      setLoadingId(null);
      if (res.ok) {
        setShops((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: data.status } : s))
        );
        router.refresh();
      }
    } catch {
      setLoadingId(null);
    }
  }

  // Create Barbershop
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const slug = (form.get("slug") as string) || name.toLowerCase().replace(/[^a-z0-9]/g, "-");
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
      setCreating(false);

      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la barbería.");
        return;
      }

      setShowModal(false);
      router.refresh();
    } catch {
      setCreating(false);
      setError("Error de conexión.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#00e575]">
            Directorio de Barberías ({shops.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra sedes registradas, habilita o deshabilita en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-world flex h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-black uppercase tracking-wider"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Nueva Barbería</span>
        </button>
      </div>

      {/* Barbershops Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {shops.map((shop) => {
          const isActive = shop.status === "ACTIVA";
          const isLoading = loadingId === shop.id;

          return (
            <div
              key={shop.id}
              className={`world-card p-5 flex flex-col justify-between transition-all ${
                !isActive ? "opacity-70 bg-secondary/30" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl font-black text-black ${
                        isActive ? "bg-[#00e575]" : "bg-zinc-600"
                      }`}
                    >
                      <Store className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {shop.name}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#00e575]" />
                        <span>{shop.address}, {shop.city}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isActive
                        ? "bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/30"
                        : "bg-destructive/20 text-destructive border border-destructive/30"
                    }`}
                  >
                    {shop.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-secondary/40 p-2.5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Barberos</span>
                    <p className="font-bold text-foreground">{shop._count.barbers}</p>
                  </div>
                  <div className="border-x border-border">
                    <span className="text-[10px] text-muted-foreground">Servicios</span>
                    <p className="font-bold text-foreground">{shop._count.services}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Citas</span>
                    <p className="font-bold text-foreground">{shop._count.appointments}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{shop.rating}</span>
                </span>

                <button
                  onClick={() => toggleStatus(shop.id)}
                  disabled={isLoading}
                  className={`flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold transition-colors ${
                    isActive
                      ? "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : "border border-[#00e575]/40 bg-[#00e575]/10 text-[#00e575] hover:bg-[#00e575]/20"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isActive ? (
                    <>
                      <PowerOff className="h-3.5 w-3.5" />
                      <span>Inhabilitar</span>
                    </>
                  ) : (
                    <>
                      <Power className="h-3.5 w-3.5" />
                      <span>Activar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create New Barbershop */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="world-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#00e575]" />
                <h3 className="text-base font-bold text-foreground">
                  Registrar Nueva Barbería
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Nombre de la Barbería *
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: Barber Studio Elite"
                  className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Slug (identificador web)
                </label>
                <input
                  name="slug"
                  placeholder="Ej: barber-studio-elite (opcional)"
                  className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Dirección Física *
                </label>
                <input
                  name="address"
                  required
                  placeholder="Ej: Carrera 3 # 12-40, Bocagrande"
                  className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
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
                    className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Teléfono
                  </label>
                  <input
                    name="phone"
                    placeholder="3001234567"
                    className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-[#00e575] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Latitud (Mapa)
                  </label>
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    defaultValue="10.4236"
                    className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-[#00e575] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Longitud (Mapa)
                  </label>
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    defaultValue="-75.5503"
                    className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-[#00e575] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {error}
                </p>
              )}

              <div className="mt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-world flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-60"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Guardar y Publicar Sede</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-xs font-bold text-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
