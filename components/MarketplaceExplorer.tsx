"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Scissors,
  DollarSign,
  Filter,
  Map as MapIcon,
  LayoutGrid,
  ChevronRight,
  Clock,
  Sparkles,
  Phone,
  ExternalLink,
  X,
  SlidersHorizontal,
  Store,
  Check,
  Flame,
  Tag,
} from "lucide-react";
import { formatCOP } from "@/lib/core/money";

export interface ExplorerShopItem {
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
  reviewCount: number;
  status: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number | null;
    isOffer?: boolean;
    offerBadge?: string | null;
    durationMinutes: number;
    category: string;
    imageUrl?: string | null;
  }>;
  barbers: Array<{
    id: string;
    displayName: string;
    status: string;
  }>;
}

export interface FlatCorteItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  isOffer: boolean;
  offerBadge: string;
  durationMinutes: number;
  category: string;
  imageUrl: string;
  shopId: string;
  shopName: string;
  shopSlug: string;
  shopAddress: string;
  shopCity: string;
  shopRating: number;
  shopLogoUrl: string;
}

const CATEGORY_OPTIONS = [
  { id: "corte", label: "Fades & Cortes" },
  { id: "barba", label: "Barbas & Afeitados" },
  { id: "combo", label: "Combos VIP" },
];

const PRICE_RANGE_PRESETS = [
  { id: "range-1", label: "$10.000 – $25.000", min: 10000, max: 25000 },
  { id: "range-2", label: "$25.000 – $38.000", min: 25000, max: 38000 },
  { id: "range-3", label: "$38.000 – $60.000+", min: 38000, max: 999999 },
];

export function MarketplaceExplorer({
  initialShops,
}: {
  initialShops: ExplorerShopItem[];
}) {
  const [viewMode, setViewMode] = useState<"cortes" | "shops">("cortes");
  const [showFullMap, setShowFullMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Ningún filtro seleccionado por defecto
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [maxPriceSlider, setMaxPriceSlider] = useState<number>(70000);
  const [useSlider, setUseSlider] = useState(false);
  const [activeShop, setActiveShop] = useState<ExplorerShopItem | null>(null);

  // Extract unique cities/zones
  const cities = useMemo(() => {
    const set = new Set<string>();
    initialShops.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set);
  }, [initialShops]);

  // Flatten all services into discrete Haircut / Service items
  const allCortes: FlatCorteItem[] = useMemo(() => {
    const list: FlatCorteItem[] = [];
    initialShops.forEach((shop) => {
      shop.services.forEach((s) => {
        list.push({
          id: s.id,
          name: s.name,
          description: s.description || "",
          price: s.price,
          originalPrice: s.originalPrice || null,
          isOffer: Boolean(s.isOffer || (s.originalPrice && s.originalPrice > s.price)),
          offerBadge: s.offerBadge || (s.originalPrice ? `PROMO APP` : ""),
          durationMinutes: s.durationMinutes,
          category: s.category,
          imageUrl:
            s.imageUrl ||
            (s.category === "barba"
              ? "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
              : s.category === "combo"
              ? "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80"),
          shopId: shop.id,
          shopName: shop.name,
          shopSlug: shop.slug,
          shopAddress: shop.address,
          shopCity: shop.city,
          shopRating: shop.rating,
          shopLogoUrl: shop.logoUrl,
        });
      });
    });
    return list;
  }, [initialShops]);

  // Determine active price boundaries
  const priceBounds = useMemo(() => {
    if (useSlider) {
      return { min: 0, max: maxPriceSlider };
    }
    if (selectedPriceRange) {
      const preset = PRICE_RANGE_PRESETS.find((p) => p.id === selectedPriceRange);
      if (preset) return { min: preset.min, max: preset.max };
    }
    return { min: 0, max: 999999 };
  }, [useSlider, maxPriceSlider, selectedPriceRange]);

  // Filtered Cortes (Items)
  const filteredCortes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allCortes.filter((corte) => {
      // 1. Text Search (corte name, shop name, address, city)
      if (query) {
        const matchName = corte.name.toLowerCase().includes(query);
        const matchShop = corte.shopName.toLowerCase().includes(query);
        const matchAddress = corte.shopAddress.toLowerCase().includes(query);
        const matchCity = corte.shopCity.toLowerCase().includes(query);
        if (!matchName && !matchShop && !matchAddress && !matchCity) return false;
      }

      // 2. City Filter
      if (selectedCity && corte.shopCity.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory && corte.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 4. Price Range Filter
      if (corte.price < priceBounds.min || corte.price > priceBounds.max) {
        return false;
      }

      return true;
    });
  }, [allCortes, searchQuery, selectedCity, selectedCategory, priceBounds]);

  // Filtered Shops (Grouping)
  const filteredShops = useMemo(() => {
    const validShopIds = new Set(filteredCortes.map((c) => c.shopId));
    return initialShops.filter((shop) => validShopIds.has(shop.id));
  }, [initialShops, filteredCortes]);

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedPriceRange("");
    setSelectedCity("");
    setUseSlider(false);
    setMaxPriceSlider(70000);
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    Boolean(selectedPriceRange) ||
    Boolean(selectedCity) ||
    useSlider;

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="h-4 w-4 text-zinc-400 absolute left-4 pointer-events-none" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca corte (Fade, Barba, VIP), barbería o zona..."
          className="h-13 w-full rounded-2xl border border-white/10 bg-zinc-900/90 pl-11 pr-10 text-base text-white placeholder:text-zinc-500 shadow-xl focus:border-red-500 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Top 2-Option View Switcher (Por Cortes / Por Barberías) */}
      <div className="grid grid-cols-2 rounded-2xl bg-zinc-900/90 p-1 border border-white/10 shadow-lg">
        <button
          onClick={() => setViewMode("cortes")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
            viewMode === "cortes"
              ? "bg-red-500 text-white shadow-md shadow-red-500/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Scissors className="h-4 w-4" />
          <span>Catálogo de Cortes ({filteredCortes.length})</span>
        </button>

        <button
          onClick={() => setViewMode("shops")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
            viewMode === "shops"
              ? "bg-red-500 text-white shadow-md shadow-red-500/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Barberías ({filteredShops.length})</span>
        </button>
      </div>

      {/* Category Chips Carousel (Sin ninguno seleccionado por defecto) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORY_OPTIONS.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(active ? "" : cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                active
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 font-black"
                  : "bg-zinc-900/90 text-zinc-400 border border-white/10 hover:text-white"
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
              {active && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      {/* Rango de Precios (Presets + Slider) */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-red-500" />
            <span>Rango de Presupuesto</span>
          </span>

          <span className="font-mono text-xs font-black text-red-400">
            {useSlider
              ? `Hasta ${formatCOP(maxPriceSlider)}`
              : selectedPriceRange
              ? PRICE_RANGE_PRESETS.find((p) => p.id === selectedPriceRange)?.label
              : "Sin límite"}
          </span>
        </div>

        {/* Range Preset Buttons */}
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {PRICE_RANGE_PRESETS.map((preset) => {
            const active = !useSlider && selectedPriceRange === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setUseSlider(false);
                  setSelectedPriceRange(active ? "" : preset.id);
                }}
                className={`rounded-xl px-2 py-1.5 text-center text-[11px] font-bold transition-all ${
                  active
                    ? "bg-red-500 text-white font-extrabold shadow-sm"
                    : "bg-black/60 text-zinc-400 border border-white/5 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Price Range Slider */}
        <div className="flex flex-col gap-1 border-t border-white/10 pt-2.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Ajuste fino de presupuesto:</span>
            <span className="font-mono font-bold text-white">{formatCOP(maxPriceSlider)}</span>
          </div>
          <input
            type="range"
            min={10000}
            max={70000}
            step={2000}
            value={maxPriceSlider}
            onChange={(e) => {
              setUseSlider(true);
              setSelectedPriceRange("");
              setMaxPriceSlider(Number(e.target.value));
            }}
            className="h-2 w-full accent-red-500 cursor-pointer bg-zinc-800 rounded-lg"
          />
        </div>
      </div>

      {/* Sub-Filters: Cities & Reset Filter button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {cities.length > 1 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-9 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-zinc-300 focus:border-red-500 focus:outline-none"
            >
              <option value="">Todas las zonas ({cities.length})</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-9 rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-[11px] font-bold text-red-400 hover:bg-red-500/20"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <span className="text-[11px] text-zinc-400 font-bold">
          {filteredCortes.length} resultados
        </span>
      </div>

      {/* ========================================================= */}
      {/* VISTA 1: CATÁLOGO DE CORTES (CORTES CON OFERTAS APP)      */}
      {/* ========================================================= */}
      {viewMode === "cortes" && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredCortes.length > 0 ? (
            filteredCortes.map((corte) => (
              <div
                key={`${corte.shopId}-${corte.id}`}
                className="app-card overflow-hidden border border-white/10 p-0 shadow-xl transition-all hover:border-red-500/40 bg-zinc-900/90 flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Overlay Info */}
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                    <img
                      src={corte.imageUrl}
                      alt={corte.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {/* Price & Offer Badges */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      {corte.isOffer && corte.offerBadge && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/30 animate-pulse">
                          <Flame className="h-3 w-3 fill-black" />
                          <span>{corte.offerBadge}</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 font-mono text-xs font-black text-white shadow-xl shadow-red-600/40 border border-white/20">
                        {corte.originalPrice && corte.originalPrice > corte.price && (
                          <span className="text-[10px] text-red-200 line-through font-normal">
                            {formatCOP(corte.originalPrice)}
                          </span>
                        )}
                        <span>{formatCOP(corte.price)}</span>
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300 backdrop-blur-md border border-white/10">
                        <Clock className="h-3 w-3 text-red-400" />
                        <span>{corte.durationMinutes} min</span>
                      </span>
                    </div>

                    {/* Barber Shop Name Tag */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-400 block mb-0.5">
                        {corte.category}
                      </span>
                      <h3 className="truncate text-base font-black text-white leading-snug">
                        {corte.name}
                      </h3>
                    </div>
                  </div>

                  {/* Shop Details & Location */}
                  <div className="p-3.5 flex flex-col gap-2">
                    {corte.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {corte.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between rounded-xl bg-black/50 p-2.5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-white font-black text-[10px] border border-white/10">
                          {corte.shopName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white text-[11px]">{corte.shopName}</p>
                          <p className="truncate text-[10px] text-zinc-400">{corte.shopAddress}, {corte.shopCity}</p>
                        </div>
                      </div>

                      <span className="flex items-center gap-1 font-bold text-amber-400 text-[11px] shrink-0">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{corte.shopRating || 5.0}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Booking Button */}
                <div className="p-3.5 pt-0">
                  <Link
                    href={`/b/${corte.shopSlug}?serviceId=${corte.id}`}
                    className="btn-red flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/20 active:scale-[0.98]"
                  >
                    <span>Agendar este Corte</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 rounded-3xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
              <Scissors className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-white">No hay cortes con este filtro</p>
              <p className="text-xs text-zinc-500 mt-1">
                Prueba ampliando el rango de precio o buscando otro estilo.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-xl border border-white/20 bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700"
              >
                Restablecer Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 2: LISTA DE BARBERÍAS (SEDES)                       */}
      {/* ========================================================= */}
      {viewMode === "shops" && (
        <div className="flex flex-col gap-4">
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => {
              const startPrice = Math.min(...shop.services.map((s) => s.price), 20000);
              return (
                <div
                  key={shop.id}
                  className="app-card overflow-hidden border border-white/10 p-0 shadow-2xl transition-all hover:border-red-500/40"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={shop.coverUrl || "/logo.jpg"}
                      alt={shop.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs font-black text-amber-400 backdrop-blur-md border border-white/10">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{shop.rating || 5.0}</span>
                    </div>

                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-black text-white shadow-lg">
                        Desde {formatCOP(startPrice)}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black text-white font-black text-xs">
                        {shop.name[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black text-white">
                          {shop.name}
                        </h3>
                        <p className="truncate text-xs text-zinc-300 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                          <span>{shop.address}, {shop.city}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {shop.services.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="shrink-0 rounded-lg bg-zinc-800/80 px-2.5 py-1 text-[11px] font-bold text-zinc-300 border border-white/5"
                        >
                          {s.name} · <span className="text-red-400 font-mono">{formatCOP(s.price)}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-xs text-zinc-400 font-medium">
                        {shop.barbers.length} barberos disponibles
                      </span>

                      <Link
                        href={`/b/${shop.slug}`}
                        className="btn-red flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-xs font-black uppercase tracking-wider"
                      >
                        <span>Ver Sede & Cortes</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
              <p className="text-sm font-bold text-white">No se encontraron barberías</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECCIÓN DEDICADA ABAJO: MAPA DE COBERTURA COMPLETO        */}
      {/* ========================================================= */}
      <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-900/80 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <MapIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Mapa de Barberías Cercanas
              </h3>
              <p className="text-[11px] text-zinc-400">
                {initialShops.length} sedes registradas en Cartagena
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFullMap(!showFullMap)}
            className="rounded-xl border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700 transition-colors"
          >
            {showFullMap ? "Ocultar Mapa" : "Ver Mapa Completo"}
          </button>
        </div>

        {showFullMap && (
          <div className="flex flex-col gap-3 animate-fade-in-up">
            <ClientInteractiveMap
              shops={initialShops}
              activeShop={activeShop}
              onSelectShop={(s) => setActiveShop(s)}
            />

            {/* Floating Card for Selected Pin */}
            {activeShop && (
              <div className="app-card overflow-hidden border border-red-500/40 bg-zinc-950 p-0 shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-red-950/40 via-zinc-900 to-black">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-800">
                      <img
                        src={activeShop.coverUrl || "/logo.jpg"}
                        alt={activeShop.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{activeShop.name}</h4>
                      <p className="text-[11px] text-zinc-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                        <span>{activeShop.address}, {activeShop.city}</span>
                      </p>
                      <span className="text-[10px] font-bold text-red-400">
                        {activeShop.services.length} cortes disponibles
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/b/${activeShop.slug}`}
                    className="btn-red flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-black uppercase tracking-wider"
                  >
                    <span>Agendar Aquí</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// Client Leaflet Interactive Map Component
function ClientInteractiveMap({
  shops,
  activeShop,
  onSelectShop,
}: {
  shops: ExplorerShopItem[];
  activeShop: ExplorerShopItem | null;
  onSelectShop: (shop: ExplorerShopItem) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let mapInstance: any = null;

    (async () => {
      const L = (await import("leaflet")).default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("client-map-container");
      if (!container) return;

      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
      }

      const defaultLat = shops[0]?.latitude || 10.4236;
      const defaultLng = shops[0]?.longitude || -75.5503;

      const map = L.map(container, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: false,
      });
      mapInstance = map;
      mapRef.current = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const latLngs: [number, number][] = [];

      shops.forEach((shop) => {
        const isSelected = activeShop?.id === shop.id;
        const lat = Number(shop.latitude) || defaultLat;
        const lng = Number(shop.longitude) || defaultLng;
        latLngs.push([lat, lng]);

        const customHtml = `
          <div style="
            background: ${isSelected ? "#2563EB" : "#EF4444"};
            color: #FFFFFF;
            width: ${isSelected ? "44px" : "36px"};
            height: ${isSelected ? "44px" : "36px"};
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: ${isSelected ? "18px" : "15px"};
            box-shadow: 0 4px 20px rgba(0,0,0,0.7);
            border: 3px solid #FFFFFF;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            💈
          </div>
        `;

        const icon = L.divIcon({
          className: "custom-client-pin",
          html: customHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);

        marker.on("click", () => {
          onSelectShop(shop);
          map.setView([lat, lng], 15, { animate: true });
        });
      });

      if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }

      [100, 300, 700].forEach((delay) => {
        setTimeout(() => {
          if (mapInstance) mapInstance.invalidateSize();
        }, delay);
      });
    })();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mounted, shops, activeShop]);

  if (!mounted) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-3xl border border-white/10 bg-zinc-950">
        <p className="text-xs text-zinc-500 font-bold">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      <div id="client-map-container" className="h-full w-full" />
    </div>
  );
}
