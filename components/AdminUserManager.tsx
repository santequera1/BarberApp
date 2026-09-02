"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Shield,
  Store,
  UserCheck,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { formatDateLong } from "@/lib/core/dates";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: Date | string;
  barber?: {
    id: string;
    displayName: string;
    status: string;
    barbershopId: string | null;
  } | null;
  ownedBarbershops?: Array<{
    id: string;
    name: string;
    slug: string;
    isFreelance: boolean;
  }>;
}

export function AdminUserManager({
  initialUsers,
}: {
  initialUsers: AdminUserItem[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchRole = roleFilter === "TODOS" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  async function handleRoleChange(userId: string, newRole: string) {
    setLoadingId(userId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar el rol");
        setLoadingId(null);
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setMessage(`Rol de usuario actualizado a ${newRole} correctamente.`);
      router.refresh();
    } catch {
      alert("Error de conexión al actualizar el rol");
    } finally {
      setLoadingId(null);
    }
  }

  const roleColors: Record<string, { bg: string; text: string; label: string }> = {
    ADMIN: { bg: "bg-purple-500/20 border-purple-500/40", text: "text-purple-400", label: "Super Admin" },
    DUEÑO: { bg: "bg-red-500/20 border-red-500/40", text: "text-red-400", label: "Dueño / Sede" },
    BARBERO: { bg: "bg-blue-500/20 border-blue-500/40", text: "text-blue-400", label: "Barbero Profesional" },
    CLIENTE: { bg: "bg-zinc-800 border-white/10", text: "text-zinc-300", label: "Cliente" },
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-red-500" />
            <span>Directorio de Usuarios Registrados ({users.length})</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Administra clientes, barberos a domicilio y propietarios de sedes.
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 animate-fade-in-up">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Search and Role Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 pl-10 pr-3 text-xs font-bold text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-zinc-300 focus:border-red-500 focus:outline-none"
          >
            <option value="TODOS">Todos los roles ({users.length})</option>
            <option value="CLIENTE">Clientes ({users.filter((u) => u.role === "CLIENTE").length})</option>
            <option value="BARBERO">Barberos ({users.filter((u) => u.role === "BARBERO").length})</option>
            <option value="DUEÑO">Dueños ({users.filter((u) => u.role === "DUEÑO").length})</option>
            <option value="ADMIN">Admins ({users.filter((u) => u.role === "ADMIN").length})</option>
          </select>
        </div>
      </div>

      {/* User Cards List */}
      <div className="flex flex-col gap-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => {
            const currentStyle = roleColors[u.role] || roleColors.CLIENTE;
            const isTarget = loadingId === u.id;
            const createdAtStr =
              typeof u.createdAt === "string"
                ? u.createdAt.slice(0, 10)
                : u.createdAt.toISOString().slice(0, 10);

            return (
              <div
                key={u.id}
                className="app-card border border-white/10 bg-zinc-900/90 p-4 shadow-xl flex flex-col gap-3 transition-all hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/15 text-sm font-black text-white">
                      {u.name ? u.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-black text-white">
                          {u.name || "Usuario sin nombre"}
                        </h4>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${currentStyle.bg} ${currentStyle.text}`}
                        >
                          {currentStyle.label}
                        </span>
                      </div>
                      <p className="truncate text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-zinc-500 shrink-0" />
                        <span>{u.email}</span>
                        {u.phone && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <Phone className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span>{u.phone}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Role Selector Dropdown */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {isTarget ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="h-8 rounded-xl border border-white/15 bg-zinc-800 px-2.5 text-xs font-bold text-zinc-200 focus:border-red-500 focus:outline-none"
                      >
                        <option value="CLIENTE">Cliente</option>
                        <option value="BARBERO">Barbero</option>
                        <option value="DUEÑO">Dueño de Sede</option>
                        <option value="ADMIN">Super Admin</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Perfiles asociados */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2 flex-wrap">
                    {u.ownedBarbershops && u.ownedBarbershops.length > 0 ? (
                      u.ownedBarbershops.map((shop) => (
                        <span
                          key={shop.id}
                          className="flex items-center gap-1 rounded-lg bg-red-950/40 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300"
                        >
                          <span>{shop.isFreelance ? "🛵" : "🏬"}</span>
                          <span>{shop.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-500">Sin sede propia registrada</span>
                    )}
                  </div>

                  <span className="text-zinc-500 font-mono text-[10px]">
                    Registrado: {createdAtStr}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
            <Users className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm font-bold text-white">No se encontraron usuarios con ese filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}
