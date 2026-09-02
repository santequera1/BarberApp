import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/core/money";
import {
  Shield,
  Store,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { BottomNav } from "@/components/BottomNav";
import { AdminMap } from "@/components/AdminMap";
import { AdminShopManager } from "@/components/AdminShopManager";
import { AdminUserManager } from "@/components/AdminUserManager";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/ingreso?next=/admin");
  if (session.role !== "ADMIN" && session.role !== "DUEÑO") {
    redirect("/ingreso?error=Acceso+restringido+a+administradores");
  }

  const [barbershops, totalBarbers, appointments, totalClients, allUsers] =
    await Promise.all([
      prisma.barbershop.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
          barbers: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
              _count: { select: { appointments: true } },
            },
          },
          services: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          appointments: {
            orderBy: { startsAt: "desc" },
            take: 20,
            include: {
              client: { select: { name: true, email: true, phone: true } },
              barber: { select: { displayName: true } },
            },
          },
          _count: {
            select: { barbers: true, services: true, appointments: true },
          },
        },
      }),
      prisma.barber.count({ where: { status: "ACTIVO" } }),
      prisma.appointment.findMany({
        select: { total: true, status: true },
      }),
      prisma.user.count({ where: { role: "CLIENTE" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          barber: true,
          ownedBarbershops: {
            select: { id: true, name: true, slug: true, isFreelance: true },
          },
        },
      }),
    ]);

  const activeShops = barbershops.filter((s) => s.status === "ACTIVA");
  const completedAppts = appointments.filter((a) => a.status === "COMPLETADA");
  const totalVolume = completedAppts.reduce((sum, a) => sum + a.total, 0);

  const mapShops = barbershops.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    address: s.address,
    city: s.city,
    phone: s.phone,
    latitude: s.latitude,
    longitude: s.longitude,
    rating: s.rating,
    status: s.status,
  }));

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-32 pt-5">
      <HeaderNav userName={session.name} role="ADMIN" subtitle="Super Administrador" />

      {/* Global Metrics Bar */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="app-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Sedes Activas
            </span>
            <Store className="h-4 w-4 text-red-500" />
          </div>
          <p className="font-mono text-2xl font-black text-white mt-1">
            {activeShops.length}{" "}
            <span className="text-xs text-zinc-500 font-normal">/ {barbershops.length}</span>
          </p>
        </div>

        <div className="app-card p-4 border-blue-500/40 bg-blue-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
              Barberos Activos
            </span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <p className="font-mono text-2xl font-black text-white mt-1">
            {totalBarbers}
          </p>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Total Citas
            </span>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="font-mono text-2xl font-black text-white mt-1">
            {appointments.length}
          </p>
        </div>

        <div className="app-card p-4 border-red-500/40 bg-red-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
              Usuarios Registrados
            </span>
            <Users className="h-4 w-4 text-red-400" />
          </div>
          <p className="font-mono text-xl font-black text-white mt-1 truncate">
            {allUsers.length}
          </p>
        </div>
      </section>

      {/* Directory of Registered Users */}
      <section className="mb-8">
        <AdminUserManager initialUsers={allUsers} />
      </section>

      {/* Map Section */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white">
              Mapa de Cobertura de Sedes
            </h3>
            <p className="text-xs text-zinc-400">
              Ubicación geográfica de las barberías registradas
            </p>
          </div>
          <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-black text-blue-400">
            OpenStreetMap
          </span>
        </div>

        <div className="app-card overflow-hidden p-1 border border-white/10 shadow-xl">
          <AdminMap shops={mapShops} />
        </div>
      </section>

      {/* Barbershops Management */}
      <AdminShopManager initialShops={barbershops} />

      <BottomNav role="ADMIN" />
    </main>
  );
}
