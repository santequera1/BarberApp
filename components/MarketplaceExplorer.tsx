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
  ChevronDown,
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
  { id: "corte", label: "💈 Fades & Cortes" },
  { id: "barba", label: "🧔 Barba & Afeitado" },
  { id: "cejas", label: "✂️ Cejas & Perfilado" },
  { id: "combo", label: "👑 Combos VIP" },
  { id: "freestyle", label: "🔥 Diseños Freestyle" },
  { id: "facial", label: "💆 Faciales & Spa" },
];

const PRICE_PRESETS = [
  { id: "p-all", label: "Todos", min: 0, max: 120000 },
  { id: "p-1", label: "$10k – $30k", min: 10000, max: 30000 },
  { id: "p-2", label: "$30k – $60k", min: 30000, max: 60000 },
  { id: "p-3", label: "$60k – $100k+", min: 60000, max: 150000 },
];

export function MarketplaceExplorer({
  initialShops,
}: {
  initialShops: ExplorerShopItem[];
}) {
  const [viewMode, setViewMode] = useState<"cortes" | "shops">("cortes");
  const [showFullMap, setShowFullMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(100000);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [shopsLimit, setShopsLimit] = useState<number>(10);
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
      if (selectedCategory) {
        const cat = selectedCategory.toLowerCase();
        const corteCat = corte.category.toLowerCase();
        const corteName = corte.name.toLowerCase();
        if (cat === "corte" && !corteCat.includes("corte") && !corteName.includes("fade") && !corteName.includes("corte")) {
          return false;
        } else if (cat === "barba" && !corteCat.includes("barba") && !corteName.includes("barba") && !corteName.includes("afeitado")) {
          return false;
        } else if (cat === "cejas" && !corteName.includes("ceja")) {
          return false;
        } else if (cat === "combo" && !corteCat.includes("combo") && !corteName.includes("combo") && !corteName.includes("vip")) {
          return false;
        } else if (cat === "freestyle" && !corteName.includes("freestyle") && !corteName.includes("diseño") && !corteName.includes("navaja")) {
          return false;
        } else if (cat === "facial" && !corteName.includes("facial") && !corteName.includes("mascarilla") && !corteName.includes("black")) {
          return false;
        }
      }

      // 4. Min & Max Price Range Filter
      if (corte.price < minBudget || corte.price > maxBudget) {
        return false;
      }

      return true;
    });
  }, [allCortes, searchQuery, selectedCity, selectedCategory, minBudget, maxBudget]);

  // Filtered Shops (Grouping)
  const filteredShops = useMemo(() => {
    const validShopIds = new Set(filteredCortes.map((c) => c.shopId));
    return initialShops.filter((shop) => validShopIds.has(shop.id));
  }, [initialShops, filteredCortes]);

  const displayedShops = useMemo(() => {
    return filteredShops.slice(0, shopsLimit);
  }, [filteredShops, shopsLimit]);

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCity("");
    setMinBudget(0);
    setMaxBudget(100000);
    setSelectedPreset("");
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    Boolean(selectedCity) ||
    minBudget > 0 ||
    maxBudget < 100000 ||
    Boolean(selectedPreset);

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar corte, fade, barbería o zona..."
          className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900/90 pl-11 pr-10 text-xs font-bold text-white placeholder-zinc-500 shadow-xl backdrop-blur-md focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Two Main View Toggle Tabs (Simplificados a: Ver Cortes / Ver Barberías) */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-900/90 p-1.5 border border-white/10 shadow-lg">
        <button
          onClick={() => setViewMode("cortes")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
            viewMode === "cortes"
              ? "bg-red-500 text-white shadow-md shadow-red-500/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Scissors className="h-4 w-4" />
          <span>Ver Cortes ({filteredCortes.length})</span>
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
          <span>Ver Barberías ({filteredShops.length})</span>
        </button>
      </div>

      {/* Category Chips Carousel */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORY_OPTIONS.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(active ? "" : cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                active
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 font-black"
                  : "bg-zinc-900/90 text-zinc-400 border border-white/10 hover:text-white"
              }`}
            >
              <span>{cat.label}</span>
              {active && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      {/* Rango de Presupuesto (Mínimo Y Máximo) */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-red-500" />
            <span>Rango de Presupuesto</span>
          </span>

          <span className="font-mono text-xs font-black text-red-400">
            {minBudget === 0 && maxBudget >= 100000
              ? "Cualquier precio"
              : `${formatCOP(minBudget)} – ${formatCOP(maxBudget)}`}
          </span>
        </div>

        {/* Quick Range Preset Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {PRICE_PRESETS.map((preset) => {
            const active =
              selectedPreset === preset.id ||
              (minBudget === preset.min && maxBudget === preset.max);
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  setMinBudget(preset.min);
                  setMaxBudget(preset.max);
                }}
                className={`rounded-xl px-2 py-1.5 text-center text-[10px] font-bold transition-all ${
                  active
                    ? "bg-red-500 text-white font-black shadow-sm"
                    : "bg-black/60 text-zinc-400 border border-white/5 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Dual Interactive Sliders for Min and Max */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-2.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Mínimo:</span>
              <span className="font-mono font-bold text-white">{formatCOP(minBudget)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={60000}
              step={5000}
              value={minBudget}
              onChange={(e) => {
                setSelectedPreset("");
                const val = Number(e.target.value);
                setMinBudget(val);
                if (val > maxBudget) setMaxBudget(val + 5000);
              }}
              className="h-1.5 w-full accent-red-500 cursor-pointer bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Máximo:</span>
              <span className="font-mono font-bold text-white">{formatCOP(maxBudget)}</span>
            </div>
            <input
              type="range"
              min={20000}
              max={120000}
              step={5000}
              value={maxBudget}
              onChange={(e) => {
                setSelectedPreset("");
                const val = Number(e.target.value);
                setMaxBudget(val);
                if (val < minBudget) setMinBudget(Math.max(0, val - 5000));
              }}
              className="h-1.5 w-full accent-red-500 cursor-pointer bg-zinc-800 rounded-lg"
            />
          </div>
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
          {viewMode === "cortes"
            ? `${filteredCortes.length} cortes disponibles`
            : `${filteredShops.length} barberías encontradas`}
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

                    <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-xs text-zinc-400">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-white/10 text-[10px] font-black text-white">
                          {corte.shopName[0]}
                        </div>
                        <span className="truncate font-bold text-white text-[11px]">
                          {corte.shopName}
                        </span>
                      </div>

                      <span className="shrink-0 text-[10px] text-zinc-500 font-medium">
                        {corte.shopCity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Booking Button for this Cut */}
                <div className="px-3.5 pb-3.5">
                  <Link
                    href={`/b/${corte.shopSlug}?serviceId=${corte.id}`}
                    className="btn-red flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/20"
                  >
                    <span>Agendar este Corte</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
              <Scissors className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-white">No se encontraron cortes con estos filtros</p>
              <button
                onClick={clearFilters}
                className="mt-3 text-xs font-bold text-red-400 underline"
              >
                Restablecer búsqueda
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 2: LISTA DE BARBERÍAS (CARDS HORIZONTALES COMPACTAS)  */}
      {/* ========================================================= */}
      {viewMode === "shops" && (
        <div className="flex flex-col gap-3">
          {displayedShops.length > 0 ? (
            displayedShops.map((shop) => {
              const prices = shop.services.map((s) => s.price);
              const minPrice = prices.length > 0 ? Math.min(...prices) : 18000;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : 45000;

              return (
                <div
                  key={shop.id}
                  className="app-card overflow-hidden border border-white/10 p-3 shadow-xl transition-all hover:border-red-500/40 bg-zinc-900/90 flex items-center gap-3.5"
                >
                  {/* Foto Izquierda */}
                  <div className="relative h-26 w-26 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-zinc-950 border border-white/10">
                    <img
                      src={shop.coverUrl || "/logo.jpg"}
                      alt={shop.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  {/* Contenido Derecha */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 gap-1">
                    <div className="flex items-center justify-between gap-1">
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-xs font-black text-amber-400">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <Star className="h-3 w-3 fill-amber-400" />
                          <Star className="h-3 w-3 fill-amber-400" />
                          <Star className="h-3 w-3 fill-amber-400" />
                          <Star className="h-3 w-3 fill-amber-400" />
                        </div>
                        <span>{shop.rating || 5.0}</span>
                      </div>

                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {shop.city}
                      </span>
                    </div>

                    <h3 className="truncate text-sm font-black text-white leading-tight">
                      {shop.name}
                    </h3>

                    <p className="truncate text-[11px] text-zinc-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                      <span>{shop.address}</span>
                    </p>

                    <div className="flex items-center justify-between mt-1 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                          Rango de Precios
                        </span>
                        <span className="font-mono text-xs font-black text-red-400">
                          Desde {formatCOP(minPrice)}
                        </span>
                      </div>

                      <Link
                        href={`/b/${shop.slug}`}
                        className="btn-red flex h-8 items-center justify-center gap-1 rounded-xl px-3.5 text-xs font-black uppercase tracking-wider shrink-0 shadow-md shadow-red-500/20"
                      >
                        <span>Agendar</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
              <Store className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-white">No se encontraron barberías con estos filtros</p>
              <button
                onClick={clearFilters}
                className="mt-3 text-xs font-bold text-red-400 underline"
              >
                Restablecer búsqueda
              </button>
            </div>
          )}

          {/* Límite de 10 sedes con botón de ver más si hay más de 10 */}
          {filteredShops.length > shopsLimit && (
            <button
              onClick={() => setShopsLimit((prev) => prev + 10)}
              className="w-full py-3 mt-1 rounded-2xl border border-white/10 bg-zinc-900 text-xs font-black text-white uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Ver más barberías (+{filteredShops.length - shopsLimit})</span>
              <ChevronDown className="h-4 w-4 text-red-500" />
            </button>
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
              onSelectShop={(s) => {
                setActiveShop(s);
                setTimeout(() => {
                  document.getElementById("floating-selected-shop-card")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, 120);
              }}
            />

            {/* Floating Card for Selected Pin */}
            {activeShop && (
              <div
                id="floating-selected-shop-card"
                className="overflow-hidden rounded-3xl border border-red-500/50 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 shadow-2xl animate-fade-in-up"
              >
                <div className="flex items-center gap-3.5">
                  {/* Shop Thumbnail */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-800 shadow-md">
                    <img
                      src={activeShop.coverUrl || "/logo.jpg"}
                      alt={activeShop.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Shop Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{activeShop.rating || 5.0} · {activeShop.services.length} cortes</span>
                    </div>
                    <h4 className="truncate text-sm font-black text-white leading-tight">
                      {activeShop.name}
                    </h4>
                    <p className="truncate text-[11px] text-zinc-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                      <span>{activeShop.address}, {activeShop.city}</span>
                    </p>
                  </div>

                  {/* Direct Action Button */}
                  <Link
                    href={`/b/${activeShop.slug}`}
                    className="btn-red flex h-11 items-center justify-center gap-1.5 rounded-2xl px-4 text-xs font-black uppercase tracking-wider shrink-0 whitespace-nowrap shadow-lg shadow-red-500/20"
                  >
                    <span>Agendar</span>
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
