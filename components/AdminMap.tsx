"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Star, Scissors } from "lucide-react";

export interface ShopPin {
  id: string;
  name: string;
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
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center rounded-3xl border border-border bg-card/60">
        <p className="text-xs text-muted-foreground">Cargando mapa OpenStreetMap...</p>
      </div>
    );
  }

  return <LeafletMapContainer shops={shops} />;
}

function LeafletMapContainer({ shops }: { shops: ShopPin[] }) {
  const [activeShop, setActiveShop] = useState<ShopPin | null>(shops[0] || null);

  useEffect(() => {
    let mapInstance: any = null;

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
      if (!container || (container as any)._leaflet_id) return;

      const centerLat = shops[0]?.latitude || 10.4236;
      const centerLng = shops[0]?.longitude || -75.5503;

      const map = L.map("admin-map-container", {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false,
      });
      mapInstance = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // OpenStreetMap Free TileLayer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add Custom Markers
      shops.forEach((shop) => {
        const isActive = shop.status === "ACTIVA";
        const customHtml = `
          <div style="
            background: ${isActive ? "#00e575" : "#71717a"};
            color: #000;
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 14px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            border: 2px solid #fff;
          ">
            💈
          </div>
        `;

        const icon = L.divIcon({
          className: "custom-pin",
          html: customHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([shop.latitude, shop.longitude], { icon }).addTo(map);

        marker.on("click", () => {
          setActiveShop(shop);
        });
      });
    })();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [shops]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[380px] w-full overflow-hidden rounded-3xl border border-border shadow-xl">
        <div id="admin-map-container" className="h-full w-full" />
      </div>

      {activeShop && (
        <div className="world-card p-4 flex items-center justify-between gap-3 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00e575] text-black font-black">
              <Scissors className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">{activeShop.name}</h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                    activeShop.status === "ACTIVA"
                      ? "bg-[#00e575]/20 text-[#00e575]"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {activeShop.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-[#00e575]" />
                <span>{activeShop.address}, {activeShop.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{activeShop.rating}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
