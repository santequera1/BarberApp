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
    price: number;
    durationMinutes: number;
    category: string;
  }>;
  barbers: Array<{
    id: string;
    displayName: string;
    status: string;
  }>;
}

const CATEGORY_OPTIONS = [
  { id: "all", label: "Todos los Cortes" },
  { id: "corte", label: "Fade / Corte" },
  { id: "barba", label: "Barba & Afeitado" },
  { id: "combo", label: "Combo VIP" },
];

const PRICE_TIERS = [
  { id: "all", label: "Cualquier precio", max: 999999 },
  { id: "25k", label: "Hasta $25.000", max: 25000 },
  { id: "35k", label: "Hasta $35.000", max: 35000 },
  { id: "50k", label: "Hasta $50.000", max: 50000 },
];

export function MarketplaceExplorer({
  initialShops,
}: {
  initialShops: ExplorerShopItem[];
}) {
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [activeShop, setActiveShop] = useState<ExplorerShopItem | null>(null);

  // Extract unique cities/zones
  const cities = useMemo(() => {
    const set = new Set<string>();
    initialShops.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set);
  }, [initialShops]);

  // Filtered shops
  const filteredShops = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const maxPrice = PRICE_TIERS.find((p) => p.id === selectedPriceTier)?.max || 999999;

    return initialShops.filter((shop) => {
      // 1. Text Search (name, address, city, service names)
      if (query) {
        const matchName = shop.name.toLowerCase().includes(query);
        const matchAddress = shop.address.toLowerCase().includes(query);
        const matchCity = shop.city.toLowerCase().includes(query);
        const matchService = shop.services.some((s) => s.name.toLowerCase().includes(query));
        if (!matchName && !matchAddress && !matchCity && !matchService) return false;
      }

      // 2. City filter
      if (selectedCity !== "all" && shop.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 3. Category filter
      if (selectedCategory !== "all") {
        const hasCategory = shop.services.some(
          (s) => s.category.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasCategory) return false;
      }

      // 4. Price filter
      if (selectedPriceTier !== "all") {
        const minShopPrice = Math.min(...shop.services.map((s) => s.price), 999999);
        if (minShopPrice > maxPrice) return false;
      }

      return true;
    });
  }, [initialShops, searchQuery, selectedCategory, selectedPriceTier, selectedCity]);

  // Lowest price in a shop helper
  function getStartingPrice(shop: ExplorerShopItem) {
    if (!shop.services || shop.services.length === 0) return 25000;
    return Math.min(...shop.services.map((s) => s.price));
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPriceTier("all");
    setSelectedCity("all");
  }

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedPriceTier !== "all" || selectedCity !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="h-4 w-4 text-zinc-400 absolute left-4 pointer-events-none" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar barbería, corte (Fade, Barba), barrio..."
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

      {/* Filter Chips Bar */}
      <div className="flex flex-col gap-2.5">
        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_OPTIONS.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-zinc-900/90 text-zinc-400 border border-white/10 hover:text-white"
                }`}
              >
                <Scissors className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Filters: Price Tier & Cities & View Mode */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {/* Price Selector */}
            <select
              value={selectedPriceTier}
              onChange={(e) => setSelectedPriceTier(e.target.value)}
              className="h-9 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-zinc-300 focus:border-red-500 focus:outline-none"
            >
              {PRICE_TIERS.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.label}
                </option>
              ))}
            </select>

            {/* City Selector */}
            {cities.length > 1 && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-9 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-zinc-300 focus:border-red-500 focus:outline-none"
              >
                <option value="all">Todas las zonas</option>
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
                Limpiar
              </button>
            )}
          </div>

          {/* Toggle Map / Cards Mode */}
          <div className="flex items-center rounded-xl bg-zinc-900 p-1 border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Ver en Lista de Tarjetas"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Ver en Mapa Interactivo"
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
        <span>
          <strong className="text-white">{filteredShops.length}</strong> {filteredShops.length === 1 ? "barbería encontrada" : "barberías encontradas"}
        </span>
        <span className="text-[11px] text-zinc-500 font-mono">
          Pase QR Express
        </span>
      </div>

      {/* VIEW MODE 1: INTERACTIVE MAP WITH PIN CLICKS */}
      {viewMode === "map" && (
        <div className="flex flex-col gap-3">
          <ClientInteractiveMap
            shops={filteredShops}
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
                      Desde {formatCOP(getStartingPrice(activeShop))}
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

      {/* VIEW MODE 2: RICH CARDS LIST */}
      {viewMode === "cards" && (
        <div className="flex flex-col gap-4">
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => {
              const startPrice = getStartingPrice(shop);
              return (
                <div
                  key={shop.id}
                  className="app-card overflow-hidden border border-white/10 p-0 shadow-2xl transition-all hover:border-red-500/40"
                >
                  {/* Banner & Logo */}
                  <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={shop.coverUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60"}
                      alt={shop.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Rating badge */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs font-black text-amber-400 backdrop-blur-md border border-white/10">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{shop.rating || 5.0}</span>
                    </div>

                    {/* Price from badge */}
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-red-600/90 px-3 py-1 text-[11px] font-black text-white shadow-lg backdrop-blur-md">
                        Desde {formatCOP(startPrice)}
                      </span>
                    </div>

                    {/* Name & Address */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black text-white font-black text-xs">
                        {shop.logoUrl ? (
                          <img src={shop.logoUrl} alt="Logo" className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          shop.name[0]
                        )}
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

                  {/* Services snippet & Action */}
                  <div className="p-4 flex flex-col gap-3">
                    {/* Top Services Chips */}
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
                      <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        <span>{shop.barbers.length} {shop.barbers.length === 1 ? "barbero" : "barberos"} disponibles</span>
                      </span>

                      <Link
                        href={`/b/${shop.slug}`}
                        className="btn-red flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-xs font-black uppercase tracking-wider"
                      >
                        <span>Ver & Agendar</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
              <Scissors className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-white">No se encontraron barberías</p>
              <p className="text-xs text-zinc-500 mt-1">
                Intenta ajustar los filtros de precio, tipo de corte o búsqueda.
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
    let timer: any = null;

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
      <div className="flex h-[380px] w-full items-center justify-center rounded-3xl border border-white/10 bg-zinc-950">
        <p className="text-xs text-zinc-500 font-bold">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      <div id="client-map-container" className="h-full w-full" />
    </div>
  );
}
