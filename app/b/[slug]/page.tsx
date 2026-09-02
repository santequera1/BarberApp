import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  Scissors,
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Users,
  Navigation,
  Share2,
  CalendarCheck,
  Flame,
  DollarSign,
  Calendar,
} from "lucide-react";
import { BookingFlow } from "@/components/BookingFlow";
import { BarbershopShareQr } from "@/components/BarbershopShareQr";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatCOP } from "@/lib/core/money";

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
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
    where: { slug, status: "ACTIVA" },
    select: { name: true, description: true, coverUrl: true, city: true, slug: true },
  });

  if (!shop) return { title: "Barbería no encontrada — BarberApp" };

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barber.wailus.co";
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

  // Calcular rango de precios
  const prices = shop.services.map((s) => s.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 18000;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 45000;

  return (
    <div className="min-h-dvh bg-black text-white pb-32">
      {/* Top Bar Header */}
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
              src={shop.coverUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80"}
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
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                <span>{shop.isFreelance ? "🛵 Barbero Independiente VIP" : "Sede Verificada"}</span>
              </span>
              <h1 className="text-2xl font-black text-white">
                {shop.name}
              </h1>
              <p className="flex items-center gap-1 text-xs text-zinc-300 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span>{shop.isFreelance ? `Cobertura: ${shop.coverageArea || shop.city}` : `${shop.address}, ${shop.city}`}</span>
              </p>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {shop.description && (
              <p className="text-xs text-zinc-300 leading-relaxed">
                {shop.description}
              </p>
            )}

            {/* Price Range & Business Hours Information Strip */}
            <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-zinc-900/90 p-3 border border-white/10">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{shop.isFreelance ? "Tarifas de Cortes" : "Rango de Precios"}</span>
                </span>
                <p className="font-mono text-xs font-black text-white">
                  Desde {formatCOP(minPrice)}
                </p>
                {shop.isFreelance && shop.homeServiceFee > 0 && (
                  <span className="text-[10px] font-bold text-amber-400">
                    + {formatCOP(shop.homeServiceFee)} domicilio base
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 border-l border-white/10 pl-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{shop.isFreelance ? "Disponibilidad Domicilios" : "Horario de Atención"}</span>
                </span>
                <p className="text-xs font-bold text-white">
                  {shop.isFreelance ? "Lunes a Domingo: 7 AM – 10 PM" : "Lun - Sáb: 8:00 AM – 9:00 PM"}
                </p>
              </div>
            </div>

            {/* Social Icons Row (Iconos circulares compactos y todos en rojo oficial) */}
            <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Redes & Contacto Directo
              </span>

              <div className="flex items-center gap-2.5">
                {/* WhatsApp */}
                {shop.phone && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp Oficial"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/25 transition-transform hover:scale-105 active:scale-95"
                  >
                    <WhatsAppIcon className="h-4.5 w-4.5" />
                  </a>
                )}

                {/* Google Maps Pin */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Cómo Llegar en Google Maps"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/25 transition-transform hover:scale-105 active:scale-95"
                >
                  <Navigation className="h-4.5 w-4.5" />
                </a>

                {/* Instagram */}
                {shop.instagram && (
                  <a
                    href={`https://instagram.com/${shop.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Instagram @${shop.instagram.replace("@", "")}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/25 transition-transform hover:scale-105 active:scale-95"
                  >
                    <InstagramIcon className="h-4.5 w-4.5" />
                  </a>
                )}

                {/* TikTok */}
                {shop.tiktok && (
                  <a
                    href={`https://tiktok.com/@${shop.tiktok.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`TikTok @${shop.tiktok.replace("@", "")}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/25 transition-transform hover:scale-105 active:scale-95"
                  >
                    <TikTokIcon className="h-4.5 w-4.5" />
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

        {/* Agendamiento Express Header */}
        <div className="mb-4 flex items-center justify-between">
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
