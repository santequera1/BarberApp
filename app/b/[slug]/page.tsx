import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  Scissors,
  MapPin,
  Phone,
  Star,
  Clock,
  ArrowLeft,
  Users,
} from "lucide-react";
import { BookingFlow } from "@/components/BookingFlow";
import { BarbershopShareQr } from "@/components/BarbershopShareQr";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function PublicBarbershopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();

  const shop = await prisma.barbershop.findUnique({
    where: { slug, status: "ACTIVA" },
    include: {
      barbers: { where: { status: "ACTIVO" } },
      services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      hours: true,
    },
  });

  if (!shop) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shopUrl = `${appUrl}/b/${shop.slug}`;

  const qrSvg = await QRCode.toString(shopUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });

  return (
    <div className="min-h-dvh bg-black text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <Link
            href="/"
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2">
            <BarbershopShareQr shopName={shop.name} slug={shop.slug} qrSvg={qrSvg} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Barbershop Hero Card */}
      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="app-card overflow-hidden mb-6 border border-white/15 shadow-xl">
          {/* Cover Photo */}
          <div className="relative h-44 w-full overflow-hidden bg-zinc-800">
            <img
              src={shop.coverUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60"}
              alt={shop.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs font-black text-amber-400 backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{shop.rating}</span>
            </div>

            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                Sede Oficial
              </span>
              <h1 className="text-2xl font-black text-white">
                {shop.name}
              </h1>
              <p className="flex items-center gap-1 text-xs text-zinc-300 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span>{shop.address}, {shop.city}</span>
              </p>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {shop.description && (
              <p className="text-xs text-zinc-400 leading-relaxed">
                {shop.description}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-400" />
                <span>{shop.barbers.length} {shop.barbers.length === 1 ? "barbero disponible" : "barberos disponibles"}</span>
              </div>

              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="flex items-center gap-1 font-bold text-white hover:text-red-400"
                >
                  <Phone className="h-3.5 w-3.5 text-red-500" />
                  <span>{shop.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Embedded Scoped Booking Flow */}
        <BookingFlow
          barbershops={[shop]}
          selectedShopId={shop.id}
          services={shop.services}
          barbers={shop.barbers}
          currentUser={session ? { name: session.name, userId: session.userId } : null}
        />
      </div>
    </div>
  );
}
