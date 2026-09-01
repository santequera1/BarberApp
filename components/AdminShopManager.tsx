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
  Calendar,
  DollarSign,
  Loader2,
  X,
  CheckCircle2,
  ExternalLink,
  Eye,
  Mail,
  Clock,
  User,
  Share2,
} from "lucide-react";
import { formatCOP } from "@/lib/core/money";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.93-4.5V8.55a8.28 8.28 0 0 0 4.84 1.55V6.69z" />
    </svg>
  );
}

export interface AdminShopItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  logoUrl: string;
  coverUrl: string;
  latitude: number;
  longitude: number;
  rating: number;
  status: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  barbers?: Array<{
    id: string;
    displayName: string;
    specialties: string;
    status: string;
    user?: {
      name: string;
      email: string;
      phone: string | null;
    };
    _count?: {
      appointments: number;
    };
  }>;
  services?: Array<{
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
    category: string;
    imageUrl?: string | null;
  }>;
  appointments?: Array<{
    id: string;
    code: string;
    startsAt: Date | string;
    total: number;
    status: string;
    client?: {
      name: string;
      email: string;
      phone: string | null;
    } | null;
    barber?: {
      displayName: string;
    } | null;
  }>;
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
  const [selectedShop, setSelectedShop] = useState<AdminShopItem | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "barbers" | "clients">("info");
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
        if (selectedShop && selectedShop.id === id) {
          setSelectedShop((prev) => (prev ? { ...prev, status: data.status } : null));
        }
        router.refresh();
      }
    } catch {
      setLoadingId(null);
    }
  }

  // Create Barbershop from Admin Modal
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const address = form.get("address") as string;
    const city = (form.get("city") as string) || "Cartagena";
    const phone = (form.get("phone") as string) || "";
    const instagram = (form.get("instagram") as string) || "";
    const tiktok = (form.get("tiktok") as string) || "";
    const ownerName = (form.get("ownerName") as string) || "";
    const ownerEmail = (form.get("ownerEmail") as string) || "";

    try {
      const res = await fetch("/api/barbershops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          city,
          phone,
          instagram,
          tiktok,
          ownerName,
          ownerEmail,
          services: [
            {
              name: "Corte Clásico / Fade",
              price: 25000,
              durationMinutes: 40,
              category: "corte",
              imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60",
            },
            {
              name: "Perfilado de Barba",
              price: 18000,
              durationMinutes: 30,
              category: "barba",
              imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60",
            },
          ],
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
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
            Panel de Control Maestro
          </span>
          <h3 className="text-base font-black text-white">
            Directorio de Barberías ({shops.length})
          </h3>
          <p className="text-xs text-zinc-400">
            Supervisa el estado, equipo de barberos y clientes de cada sede en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-red flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-xs font-black uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Barbería</span>
        </button>
      </div>

      {/* Barbershops Grid as Rich Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {shops.map((shop) => {
          const isActive = shop.status === "ACTIVA";
          const isLoading = loadingId === shop.id;

          return (
            <div
              key={shop.id}
              className={`app-card overflow-hidden border border-white/10 p-0 shadow-xl transition-all ${
                !isActive ? "opacity-60 bg-zinc-950" : "bg-zinc-900/90"
              }`}
            >
              {/* Cover Banner */}
              <div className="relative h-28 w-full bg-zinc-950">
                {shop.coverUrl ? (
                  <img
                    src={shop.coverUrl}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-red-950/40 via-zinc-900 to-blue-950/40 flex items-center justify-center">
                    <Store className="h-8 w-8 text-zinc-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Status Badge */}
                <div className="absolute right-3 top-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isActive
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {shop.status}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute left-3 top-3">
                  <span className="flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-black text-amber-400 backdrop-blur-md border border-white/10">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{shop.rating || 5.0}</span>
                  </span>
                </div>

                {/* Shop Name on Cover */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black text-white font-black text-xs">
                    {shop.logoUrl ? (
                      <img src={shop.logoUrl} alt="Logo" className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      shop.name[0]
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-black text-white">
                      {shop.name}
                    </h4>
                    <p className="truncate text-[11px] text-zinc-300 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                      <span>{shop.address}, {shop.city}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/60 p-2.5 text-center text-xs border border-white/5 mb-3.5">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Barberos</span>
                    <p className="font-mono text-base font-black text-white">{shop._count.barbers}</p>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Servicios</span>
                    <p className="font-mono text-base font-black text-white">{shop._count.services}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Citas</span>
                    <p className="font-mono text-base font-black text-red-400">{shop._count.appointments}</p>
                  </div>
                </div>

                {/* Social Chips (if present) */}
                {(shop.instagram || shop.tiktok || shop.phone) && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
                    {shop.phone && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-white/5">
                        <Phone className="h-2.5 w-2.5 text-blue-400" />
                        <span>{shop.phone}</span>
                      </span>
                    )}
                    {shop.instagram && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-pink-400 bg-pink-950/30 px-2 py-0.5 rounded-lg border border-pink-500/20">
                        <InstagramIcon className="h-2.5 w-2.5" />
                        <span>@{shop.instagram.replace("@", "")}</span>
                      </span>
                    )}
                    {shop.tiktok && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                        <TikTokIcon className="h-2.5 w-2.5" />
                        <span>@{shop.tiktok.replace("@", "")}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                  {/* Botón Ver Perfil Completo */}
                  <button
                    onClick={() => {
                      setSelectedShop(shop);
                      setActiveTab("info");
                    }}
                    className="btn-dark flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-400" />
                    <span>Ver Perfil</span>
                  </button>

                  {/* Ver Linktree / Web */}
                  <a
                    href={`/b/${shop.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 items-center justify-center gap-1 rounded-xl border border-white/10 bg-zinc-800 px-3 text-xs font-bold text-white hover:bg-zinc-700"
                    title="Abrir Ficha Pública / Linktree"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </a>

                  {/* Activar / Inhabilitar */}
                  <button
                    onClick={() => toggleStatus(shop.id)}
                    disabled={isLoading}
                    className={`flex h-9 items-center justify-center gap-1 rounded-xl px-3 text-xs font-black transition-colors ${
                      isActive
                        ? "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : "border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                    }`}
                    title={isActive ? "Inhabilitar sede" : "Activar sede"}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isActive ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETALLADO DE INSPECCIÓN DE BARBERÍA */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in-up">
          <div className="app-card max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/15 bg-zinc-950 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white font-black text-lg shadow-lg shadow-red-500/20">
                  {selectedShop.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      {selectedShop.name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                        selectedShop.status === "ACTIVA"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {selectedShop.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-red-400" />
                    <span>{selectedShop.address}, {selectedShop.city}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedShop(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="my-4 flex rounded-2xl bg-zinc-900 p-1 border border-white/5">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  activeTab === "info"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Información & Redes
              </button>
              <button
                onClick={() => setActiveTab("barbers")}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  activeTab === "barbers"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Barberos ({selectedShop.barbers?.length || selectedShop._count.barbers})
              </button>
              <button
                onClick={() => setActiveTab("clients")}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  activeTab === "clients"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Clientes & Citas ({selectedShop._count.appointments})
              </button>
            </div>

            {/* TAB 1: INFORMACIÓN & REDES */}
            {activeTab === "info" && (
              <div className="flex flex-col gap-4 text-xs">
                {/* Dueño / Administrador */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-2">
                    Dueño / Administrador Principal
                  </span>
                  {selectedShop.owner ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold text-white">{selectedShop.owner.name}</p>
                      <p className="text-zinc-400 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-zinc-500" />
                        <span>{selectedShop.owner.email}</span>
                      </p>
                      {selectedShop.owner.phone && (
                        <p className="text-zinc-400 flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-zinc-500" />
                          <span>{selectedShop.owner.phone}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-zinc-400 italic">Sede sin dueño asignado directamente (gestionada por Super Admin).</p>
                  )}
                </div>

                {/* Redes y Contacto */}
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-3">
                    Redes Sociales & Enlaces Linktree
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-400" />
                      <div>
                        <span className="text-[10px] text-zinc-500 block">WhatsApp</span>
                        <span className="font-bold text-white">{selectedShop.phone || "No registrado"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <InstagramIcon className="h-4 w-4 text-pink-400" />
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Instagram</span>
                        <span className="font-bold text-white">
                          {selectedShop.instagram ? `@${selectedShop.instagram.replace("@", "")}` : "No configurado"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TikTokIcon className="h-4 w-4 text-cyan-400" />
                      <div>
                        <span className="text-[10px] text-zinc-500 block">TikTok</span>
                        <span className="font-bold text-white">
                          {selectedShop.tiktok ? `@${selectedShop.tiktok.replace("@", "")}` : "No configurado"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-blue-400" />
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Ficha Linktree</span>
                        <a
                          href={`/b/${selectedShop.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-400 hover:underline"
                        >
                          /b/{selectedShop.slug} ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Servicios de la Sede */}
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
                    Cortes & Servicios ({selectedShop.services?.length || 0})
                  </span>
                  <div className="flex flex-col gap-2">
                    {selectedShop.services?.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl bg-black/50 p-2.5 border border-white/5"
                      >
                        <div>
                          <p className="font-bold text-white">{s.name}</p>
                          <span className="text-[10px] text-zinc-400">{s.durationMinutes} min · {s.category}</span>
                        </div>
                        <span className="font-mono font-bold text-red-400">
                          {formatCOP(s.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EQUIPO DE BARBEROS */}
            {activeTab === "barbers" && (
              <div className="flex flex-col gap-3">
                {selectedShop.barbers && selectedShop.barbers.length > 0 ? (
                  selectedShop.barbers.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/80 p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 font-black border border-blue-500/30">
                          {b.displayName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white">{b.displayName}</h4>
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                              {b.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{b.specialties}</p>
                          {b.user?.email && (
                            <span className="text-[10px] text-zinc-500 block">{b.user.email}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">Citas</span>
                        <span className="font-mono text-sm font-black text-white">
                          {b._count?.appointments || 0}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-8 text-center text-xs text-zinc-500">
                    No hay barberos vinculados aún a esta sede.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CLIENTES Y CITAS */}
            {activeTab === "clients" && (
              <div className="flex flex-col gap-2.5">
                {selectedShop.appointments && selectedShop.appointments.length > 0 ? (
                  selectedShop.appointments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/80 p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-white">
                            {a.client?.name || "Cliente Invitado"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                              a.status === "COMPLETADA"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : a.status === "CANCELADA"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Barbero: {a.barber?.displayName || "Asignado"} · {new Date(a.startsAt).toLocaleDateString("es-CO")}
                        </p>
                        {a.client?.phone && (
                          <span className="text-[10px] text-zinc-500">{a.client.phone}</span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-black text-red-400 block">
                          {formatCOP(a.total)}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">#{a.code}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-8 text-center text-xs text-zinc-500">
                    Aún no se han agendado citas en esta barbería.
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-6 flex justify-end gap-2 border-t border-white/10 pt-4">
              <button
                onClick={() => setSelectedShop(null)}
                className="btn-dark rounded-xl px-5 py-2 text-xs font-bold"
              >
                Cerrar
              </button>
              <a
                href={`/b/${selectedShop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-red flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-wider"
              >
                <span>Ver Ficha Pública</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVA BARBERÍA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in-up">
          <div className="app-card max-h-[90vh] w-full max-w-lg overflow-y-auto border border-white/15 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                  Alta de Sede
                </span>
                <h3 className="text-base font-black text-white">
                  Registrar Nueva Barbería
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1 block">
                  Nombre de la Barbería *
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: King Barber Studio"
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1 block">
                    Ciudad *
                  </label>
                  <input
                    name="city"
                    defaultValue="Cartagena"
                    required
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1 block">
                    WhatsApp / Celular
                  </label>
                  <input
                    name="phone"
                    placeholder="3001234567"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1 block">
                  Dirección Exacta *
                </label>
                <input
                  name="address"
                  required
                  placeholder="Ej: Cra. 2 # 7-40, Bocagrande"
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1 block">
                    Instagram (@usuario)
                  </label>
                  <input
                    name="instagram"
                    placeholder="@kingbarber"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1 block">
                    TikTok (@usuario)
                  </label>
                  <input
                    name="tiktok"
                    placeholder="@kingbarber"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3">
                <span className="text-[11px] font-bold text-blue-400 block mb-2">
                  Datos del Dueño / Creador
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="ownerName"
                    placeholder="Nombre del dueño"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black px-2.5 text-base text-white focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    name="ownerEmail"
                    type="email"
                    placeholder="correo@gmail.com"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black px-2.5 text-base text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-dark rounded-xl px-4 py-2 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-red flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-wider"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <span>Crear Barbería</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
