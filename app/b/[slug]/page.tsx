import { Metadata } from "next";
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
  Navigation,
  Share2,
  CalendarCheck,
  MessageCircle,
} from "lucide-react";
import { BookingFlow } from "@/components/BookingFlow";
import { BarbershopShareQr } from "@/components/BarbershopShareQr";
import { ThemeToggle } from "@/components/ThemeToggle";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = await prisma.barbershop.findUnique({
    where: { slug },
  });

  if (!shop) {
    return { title: "Barbería no encontrada — BarberApp" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barber.wailus.co";
  const cover = shop.coverUrl || `${appUrl}/logo.jpg`;

  return {
    title: `${shop.name} — BarberApp`,
    description: `Agenda tu cita en ${shop.name} (${shop.city}). Elige tus cortes favoritos y reserva tu turno sin filas con Pase QR.`,
    openGraph: {
      title: `${shop.name} — BarberApp`,
      description: `Agenda tu cita en ${shop.name} (${shop.city}). Elige tus cortes favoritos y reserva tu turno sin filas con Pase QR.`,
      url: `${appUrl}/b/${shop.slug}`,
      siteName: "BarberApp",
      images: [
        {
          url: cover,
          width: 1200,
          height: 630,
          alt: shop.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${shop.name} — BarberApp`,
      description: `Agenda tu cita en ${shop.name} (${shop.city}). Reserva sin filas con Pase QR.`,
      images: [cover],
    },
  };
}

export default async function PublicBarbershopPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { slug } = await params;
  const { serviceId } = await searchParams;
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

  // Limpiar formatos para links
  const cleanPhone = shop.phone.replace(/[^0-9]/g, "");
  const waNumber = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;
  const waText = encodeURIComponent(`¡Hola! Quisiera información sobre citas en ${shop.name}.`);
  const mapsQuery = encodeURIComponent(`${shop.name}, ${shop.address}, ${shop.city}`);

  return (
    <div className="min-h-dvh bg-black text-white pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <Link
            href="/"
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
            {shop.name}
          </span>

          <div className="flex items-center gap-2">
            <BarbershopShareQr shopName={shop.name} slug={shop.slug} qrSvg={qrSvg} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-lg px-4 pt-4">
        {/* Linktree / Marketplace Profile Hero Card */}
        <div className="app-card overflow-hidden mb-5 border border-white/15 bg-zinc-950 shadow-2xl">
          {/* Cover Photo */}
          <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
            <img
              src={shop.coverUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60"}
              alt={shop.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            {/* Rating Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs font-black text-amber-400 backdrop-blur-md border border-white/10">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{shop.rating || 5.0}</span>
            </div>

            {/* Shop Title Info */}
            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                Sede Verificada
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

          <div className="p-4 flex flex-col gap-4">
            {shop.description && (
              <p className="text-xs text-zinc-400 leading-relaxed">
                {shop.description}
              </p>
            )}

            {/* Linktree Style Quick Action Links */}
            <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Enlaces & Redes Oficiales
              </span>

              <div className="grid grid-cols-2 gap-2">
                {shop.phone && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-900/40 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    <span className="truncate">WhatsApp Chat</span>
                  </a>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/30 p-2.5 text-xs font-bold text-blue-400 hover:bg-blue-900/40 transition-colors"
                >
                  <Navigation className="h-4 w-4 shrink-0" />
                  <span className="truncate">Cómo Llegar (Maps)</span>
                </a>

                {shop.instagram && (
                  <a
                    href={`https://instagram.com/${shop.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-pink-500/30 bg-pink-950/30 p-2.5 text-xs font-bold text-pink-400 hover:bg-pink-900/40 transition-colors"
                  >
                    <InstagramIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">@{shop.instagram.replace("@", "")}</span>
                  </a>
                )}

                {shop.tiktok && (
                  <a
                    href={`https://tiktok.com/@${shop.tiktok.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2.5 text-xs font-bold text-cyan-400 hover:bg-cyan-900/40 transition-colors"
                  >
                    <TikTokIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">TikTok Oficial</span>
                  </a>
                )}
              </div>
            </div>

            {/* Barber availability pill */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-red-500" />
                <span className="font-bold text-white">{shop.barbers.length} {shop.barbers.length === 1 ? "barbero disponible" : "barberos disponibles"}</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {shop.services.length} cortes en catálogo
              </span>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Agendar Turno Express
            </h2>
          </div>
          <span className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-[10px] font-black text-blue-400 border border-blue-500/30">
            Pase QR Digital
          </span>
        </div>

        {/* Embedded Scoped Booking Flow */}
        <BookingFlow
          barbershops={[shop]}
          selectedShopId={shop.id}
          services={shop.services}
          barbers={shop.barbers}
          initialServiceId={serviceId}
          currentUser={session ? { name: session.name, userId: session.userId } : null}
        />
      </div>
    </div>
  );
}
