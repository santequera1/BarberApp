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
  Share2,
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
    <div className="min-h-dvh bg-background text-foreground pb-20">
      {/* Top Header */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <Link
            href="/"
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary"
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
      <div className="mx-auto max-w-lg px-4 pt-5">
        <div className="world-card p-6 relative overflow-hidden mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00e575]">
                Sede Oficial
              </span>
              <h1 className="text-2xl font-black text-foreground mt-0.5">
                {shop.name}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-[#00e575] shrink-0" />
                <span>{shop.address}, {shop.city}</span>
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                <span>{shop.rating}</span>
              </span>
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="mt-2 flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-[#00e575]"
                >
                  <Phone className="h-3 w-3 text-[#00e575]" />
                  <span>{shop.phone}</span>
                </a>
              )}
            </div>
          </div>

          {shop.description && (
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
              {shop.description}
            </p>
          )}
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
