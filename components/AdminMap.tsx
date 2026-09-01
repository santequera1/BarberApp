"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, Phone, Star, Scissors, ExternalLink } from "lucide-react";

export interface ShopPin {
  id: string;
  name: string;
  slug?: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  rating: number;
  status: string;
}

export function AdminMap({ shops }: { shops: ShopPin[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure Leaflet stylesheet is injected in head
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/60">
        <p className="text-xs text-zinc-500 font-bold">Cargando mapa de cobertura...</p>
      </div>
    );
  }

  return <LeafletMapContainer shops={shops} />;
}

function LeafletMapContainer({ shops }: { shops: ShopPin[] }) {
  const [activeShop, setActiveShop] = useState<ShopPin | null>(shops[0] || null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let mapInstance: any = null;
    let resizeTimer: any = null;

    (async () => {
      const L = (await import("leaflet")).default;

      // Fix standard marker icon urls
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("admin-map-container");
      if (!container) return;

      // If container was already initialized by leaflet, clean it up
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

      // OpenStreetMap Free TileLayer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add Custom Markers
      const latLngs: [number, number][] = [];

      shops.forEach((shop) => {
        const isActive = shop.status === "ACTIVA";
        const lat = Number(shop.latitude) || defaultLat;
        const lng = Number(shop.longitude) || defaultLng;
        latLngs.push([lat, lng]);

        const customHtml = `
          <div style="
            background: ${isActive ? "#EF4444" : "#52525B"};
            color: #FFFFFF;
            width: 36px;
            height: 36px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 16px;
            box-shadow: 0 4px 18px rgba(0,0,0,0.6);
            border: 2px solid #FFFFFF;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            💈
          </div>
        `;

        const icon = L.divIcon({
          className: "custom-pin",
          html: customHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);

        marker.on("click", () => {
          setActiveShop(shop);
          map.setView([lat, lng], 14, { animate: true });
        });
      });

      // Fit bounds if multiple shops
      if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }

      // Invalidate size on timers to fix partial tile loading bug
      [100, 300, 700, 1200].forEach((delay) => {
        setTimeout(() => {
          if (mapInstance) {
            mapInstance.invalidateSize();
          }
        }, delay);
      });
    })();

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [shops]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div id="admin-map-container" className="h-full w-full" />
      </div>

      {activeShop && (
        <div className="app-card p-4 flex items-center justify-between gap-3 border border-white/10 bg-zinc-900/90 shadow-xl animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white font-black shadow-lg shadow-red-500/30">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-white">{activeShop.name}</h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    activeShop.status === "ACTIVA"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {activeShop.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                <span>{activeShop.address}, {activeShop.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeShop.slug && (
              <a
                href={`/b/${activeShop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1 rounded-xl border border-white/10 bg-zinc-800 px-3 text-xs font-bold text-white hover:bg-zinc-700"
              >
                <span>Ver Web</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <span className="flex items-center gap-1 rounded-xl bg-amber-400/10 px-2.5 py-1.5 text-xs font-bold text-amber-400 border border-amber-400/20">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{activeShop.rating}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
