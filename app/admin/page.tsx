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

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "ADMIN" && session.role !== "DUEÑO") {
    redirect("/inicio");
  }

  const [barbershops, totalBarbers, appointments, totalClients] =
    await Promise.all([
      prisma.barbershop.findMany({
        orderBy: { createdAt: "desc" },
        include: {
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
    ]);

  const activeShops = barbershops.filter((s) => s.status === "ACTIVA");
  const completedAppts = appointments.filter((a) => a.status === "COMPLETADA");
  const totalVolume = completedAppts.reduce((sum, a) => sum + a.total, 0);

  const mapShops = barbershops.map((s) => ({
    id: s.id,
    name: s.name,
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

      {/* Global KPI Metrics */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="world-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Barberías</span>
            <Store className="h-4 w-4 text-[#00e575]" />
          </div>
          <p className="font-mono text-2xl font-black text-foreground">
            {activeShops.length}{" "}
            <span className="text-xs text-muted-foreground font-normal">/ {barbershops.length}</span>
          </p>
          <span className="text-[10px] font-bold text-[#00e575]">Sedes activas</span>
        </div>

        <div className="world-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Barberos</span>
            <Users className="h-4 w-4 text-[#00e575]" />
          </div>
          <p className="font-mono text-2xl font-black text-foreground">
            {totalBarbers}
          </p>
          <span className="text-[10px] font-bold text-muted-foreground">En plataforma</span>
        </div>

        <div className="world-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Citas</span>
            <Calendar className="h-4 w-4 text-[#00e575]" />
          </div>
          <p className="font-mono text-2xl font-black text-foreground">
            {appointments.length}
          </p>
          <span className="text-[10px] font-bold text-[#00e575]">
            {completedAppts.length} completadas
          </span>
        </div>

        <div className="world-card p-4 border-[#00e575]/30">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00e575]">Volumen Total</span>
            <DollarSign className="h-4 w-4 text-[#00e575]" />
          </div>
          <p className="font-mono text-xl font-black text-foreground truncate">
            {formatCOP(totalVolume)}
          </p>
          <span className="text-[10px] font-bold text-muted-foreground">Facturado en sede</span>
        </div>
      </section>

      {/* OpenSource Map Section */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-[#00e575]">
              Mapa Geográfico de Sedes (OpenStreetMap)
            </h2>
            <p className="text-xs text-muted-foreground">
              Ubicaciones en tiempo real en Cartagena y alrededores.
            </p>
          </div>
          <span className="rounded-full bg-[#00e575]/10 px-3 py-1 text-[11px] font-bold text-[#00e575]">
            OpenSource Map
          </span>
        </div>

        <AdminMap shops={mapShops} />
      </section>

      {/* Barbershops Directory & Management */}
      <section>
        <AdminShopManager initialShops={barbershops as any} />
      </section>

      <BottomNav role={session.role} />
    </main>
  );
}
