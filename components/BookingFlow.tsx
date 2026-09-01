"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/core/money";
import {
  formatDuration,
  formatTime12Str,
  formatDateLong,
} from "@/lib/core/dates";
import {
  ArrowLeft,
  Check,
  Clock,
  User,
  Scissors,
  Sparkles,
  Calendar as CalendarIcon,
  Sun,
  Sunset,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Store,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export interface BarbershopOption {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
}

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  originalPrice?: number | null;
  isOffer?: boolean;
  offerBadge?: string | null;
  category?: string;
  imageUrl?: string;
  barbershopId?: string | null;
}

export interface BarberOption {
  id: string;
  displayName: string;
  specialties: string;
  bio?: string;
  barbershopId?: string | null;
}

interface Slot {
  time: string;
  barberId: string;
  barberName: string;
}

const STEPS = [
  { title: "Servicios", subtitle: "Elige tus servicios y cortes" },
  { title: "Barbero", subtitle: "Selecciona a tu profesional" },
  { title: "Horario", subtitle: "Elige fecha y hora" },
  { title: "Confirmar", subtitle: "Revisa los datos de tu reserva" },
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

function todayBogotaClient(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });
}

function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12));
  return dt.toISOString().slice(0, 10);
}

function dayInfoStr(dateStr: string): { dow: number; dayNum: number; month: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return {
    dow: dt.getUTCDay(),
    dayNum: d,
    month: MONTH_NAMES[m - 1],
  };
}

export function BookingFlow({
  barbershops = [],
  selectedShopId,
  services,
  barbers,
  initialBarberId,
  initialServiceId,
  currentUser = null,
}: {
  barbershops?: BarbershopOption[];
  selectedShopId?: string;
  services: ServiceOption[];
  barbers: BarberOption[];
  initialBarberId?: string;
  initialServiceId?: string;
  currentUser?: { name: string; userId: string } | null;
}) {
  const router = useRouter();
  const [currentShopId, setCurrentShopId] = useState<string>(
    selectedShopId || (barbershops[0]?.id ?? "")
  );
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>(() =>
    initialServiceId && services.some((s) => s.id === initialServiceId)
      ? [initialServiceId]
      : []
  );
  const [selectedBarber, setSelectedBarber] = useState<string>(() =>
    initialBarberId && barbers.some((b) => b.id === initialBarberId)
      ? initialBarberId
      : "any"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [date, setDate] = useState<string>(() => todayBogotaClient());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState("");

  // Guest state (si no está logueado)
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentShop = useMemo(() => {
    return barbershops.find((s) => s.id === currentShopId) || barbershops[0];
  }, [barbershops, currentShopId]);

  const days = useMemo(() => {
    const today = todayBogotaClient();
    return Array.from({ length: 14 }, (_, i) => addDaysStr(today, i));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["todos", ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === "todos") return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const chosen = services.filter((s) => selectedServices.includes(s.id));
  const totalPrice = chosen.reduce((a, s) => a + s.price, 0);
  const totalDuration = chosen.reduce((a, s) => a + s.durationMinutes, 0);
  const summaryLabel = chosen.map((s) => s.name).join(" + ");

  const loadSlots = useCallback(async () => {
    if (selectedServices.length === 0) return;
    setSlotsLoading(true);
    setSlots(null);
    setSelectedSlot(null);
    try {
      const params = new URLSearchParams({
        date,
        serviceIds: selectedServices.join(","),
        barberId: selectedBarber,
        ...(currentShopId ? { barbershopId: currentShopId } : {}),
      });
      const res = await fetch(`/api/availability?${params}`);
      const data = await res.json();
      setSlots(res.ok ? data.slots : []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [date, selectedServices, selectedBarber, currentShopId]);

  useEffect(() => {
    if (step === 2) void loadSlots();
  }, [step, loadSlots]);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function confirmBooking() {
    if (!selectedSlot) return;

    if (!currentUser) {
      if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) {
        setError("Por favor completa tu nombre, WhatsApp y correo para enviarte el Pase QR.");
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: selectedSlot.barberId,
          barbershopId: currentShopId,
          serviceIds: selectedServices,
          date,
          time: selectedSlot.time,
          clientNotes: notes,
          ...(!currentUser
            ? {
                guestName: guestName.trim(),
                guestPhone: guestPhone.trim(),
                guestEmail: guestEmail.trim(),
              }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitting(false);
        setError(data.error ?? "No se pudo agendar la cita. Intenta con otro horario.");
        if (res.status === 409) {
          setStep(2);
          void loadSlots();
        }
        return;
      }
      router.push(`/citas/${data.id}?nueva=1`);
    } catch {
      setSubmitting(false);
      setError("Error de conexión. Intenta de nuevo.");
    }
  }

  const canContinue =
    (step === 0 && selectedServices.length > 0) ||
    step === 1 ||
    (step === 2 && selectedSlot !== null) ||
    step === 3;

  const morningSlots = (slots ?? []).filter(
    (s) => Number(s.time.slice(0, 2)) < 12
  );
  const afternoonSlots = (slots ?? []).filter(
    (s) => Number(s.time.slice(0, 2)) >= 12
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-5 pb-32">
      {/* Header & Step Tracker */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            aria-label="Volver"
            onClick={() =>
              step === 0 ? router.push("/") : setStep(step - 1)
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-white transition-all hover:bg-zinc-800 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              {currentShop?.name || "BarberApp"}
            </span>
            <h1 className="text-base font-black text-white">
              {STEPS[step].title} ({step + 1}/4)
            </h1>
          </div>

          <div className="h-10 w-10 opacity-0" />
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx <= step ? "bg-red-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        <p className="mt-2.5 text-center text-xs text-zinc-400">
          {STEPS[step].subtitle}
        </p>
      </div>

      {/* Sede Selector Banner if multiple shops exist */}
      {barbershops.length > 1 && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/80 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-red-500" />
            <span className="font-bold text-white truncate max-w-[180px]">
              {currentShop?.name}
            </span>
          </div>
          <select
            value={currentShopId}
            onChange={(e) => {
              const newShopId = e.target.value;
              setCurrentShopId(newShopId);
              router.push(`/agendar?barbershopId=${newShopId}`);
            }}
            className="rounded-xl border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {barbershops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 1: Services Selection */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          {categories.length > 2 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
                    selectedCategory === cat
                      ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                      : "border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filteredServices.map((service) => {
              const active = selectedServices.includes(service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  aria-pressed={active}
                  className={`group relative flex items-center justify-between gap-3 rounded-3xl border p-3.5 text-left transition-all duration-200 ${
                    active
                      ? "border-red-500 bg-red-950/20 shadow-lg shadow-red-500/10 ring-1 ring-red-500"
                      : "border-white/10 bg-zinc-900/90 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Service Cut Image Thumbnail */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-zinc-800 border border-white/10">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-500">
                          <Scissors className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {service.isOffer && service.offerBadge && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/30 mb-0.5">
                          🔥 {service.offerBadge}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-white leading-tight line-clamp-2 break-words">
                          {service.name}
                        </h3>
                        {active && (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-black">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-zinc-400 line-clamp-1">
                        {service.description || "Servicio profesional con acabado impecable."}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                        <Clock className="h-3 w-3 text-red-500" />
                        <span>{formatDuration(service.durationMinutes)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-1">
                    <div className="flex flex-col items-end">
                      {service.originalPrice && service.originalPrice > service.price && (
                        <span className="text-[10px] text-zinc-500 line-through font-mono">
                          {formatCOP(service.originalPrice)}
                        </span>
                      )}
                      <span className="font-mono text-xs font-black text-white whitespace-nowrap">
                        {formatCOP(service.price)}
                      </span>
                    </div>

                    <div
                      className={`mt-auto flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        active
                          ? "border-red-500 bg-red-500 text-white font-black"
                          : "border-white/20 bg-zinc-800 text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Barber Selection */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setSelectedBarber("any")}
            aria-pressed={selectedBarber === "any"}
            className={`flex items-center gap-4 rounded-3xl border p-4 text-left transition-all duration-200 ${
              selectedBarber === "any"
                ? "border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                : "border-white/10 bg-zinc-900 hover:border-zinc-700"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">
                  Cualquier barbero disponible
                </p>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-black text-blue-400 uppercase">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Te asignamos automáticamente al barbero con mayor disponibilidad.
              </p>
            </div>
            {selectedBarber === "any" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
                ✓
              </div>
            )}
          </button>

          {barbers.map((barber) => {
            const active = selectedBarber === barber.id;
            return (
              <button
                key={barber.id}
                onClick={() => setSelectedBarber(barber.id)}
                aria-pressed={active}
                className={`flex items-center gap-4 rounded-3xl border p-4 text-left transition-all duration-200 ${
                  active
                    ? "border-red-500 bg-red-950/20 shadow-lg shadow-red-500/10 ring-1 ring-red-500"
                    : "border-white/10 bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 border border-white/10 font-black text-white text-base">
                  {barber.displayName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    {barber.displayName}
                  </p>
                  <p className="text-xs text-zinc-400 capitalize">
                    {barber.specialties.split(",").join(" · ")}
                  </p>
                  <span className="mt-1 inline-block text-[11px] font-bold text-blue-400">
                    {barber.bio || "Master Barbero"}
                  </span>
                </div>
                {active && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white font-bold text-xs">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Step 3: Date and Time Selection */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-red-500 mb-2.5 block">
              1. Selecciona el Día
            </label>
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-2">
              {days.map((d) => {
                const info = dayInfoStr(d);
                const active = date === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDate(d)}
                    className={`flex min-w-[66px] flex-col items-center gap-1 rounded-2xl border p-3 transition-all duration-200 ${
                      active
                        ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/30 font-black"
                        : "border-white/10 bg-zinc-900 text-white hover:border-zinc-700"
                    }`}
                  >
                    <span className={`text-[11px] font-bold uppercase ${active ? "text-white" : "text-zinc-400"}`}>
                      {DAY_NAMES[info.dow]}
                    </span>
                    <span className="font-mono text-xl font-black">
                      {info.dayNum}
                    </span>
                    <span className={`text-[10px] font-bold ${active ? "text-white/80" : "text-zinc-400"}`}>
                      {info.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-blue-400 mb-2.5 block">
              2. Selecciona la Hora
            </label>

            {slotsLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                <p className="text-xs text-zinc-400">
                  Buscando horarios libres en {currentShop?.name}...
                </p>
              </div>
            )}

            {!slotsLoading && slots && slots.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/15 bg-zinc-900/50 p-8 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-sm font-bold text-white">
                  No hay horarios libres para esta fecha
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Por favor selecciona otro día en el selector de arriba.
                </p>
              </div>
            )}

            {!slotsLoading && slots && slots.length > 0 && (
              <div className="flex flex-col gap-5">
                {morningSlots.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 mb-2.5">
                      <Sun className="h-4 w-4 text-amber-400" />
                      <span>Mañana (9:00 AM - 12:00 PM)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {morningSlots.map((slot) => {
                        const active = selectedSlot?.time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex flex-col items-center justify-center rounded-2xl border py-3 px-2 transition-all duration-200 ${
                              active
                                ? "border-red-500 bg-red-600 text-white font-black shadow-md shadow-red-500/30"
                                : "border-white/10 bg-zinc-900 text-white hover:border-zinc-700"
                            }`}
                          >
                            <span className="font-mono text-sm font-black">
                              {formatTime12Str(slot.time)}
                            </span>
                            {selectedBarber === "any" && (
                              <span className={`text-[10px] truncate max-w-full ${active ? "text-white font-bold" : "text-zinc-400"}`}>
                                {slot.barberName}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 mb-2.5">
                      <Sunset className="h-4 w-4 text-blue-400" />
                      <span>Tarde / Noche (12:00 PM - 8:00 PM)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {afternoonSlots.map((slot) => {
                        const active = selectedSlot?.time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex flex-col items-center justify-center rounded-2xl border py-3 px-2 transition-all duration-200 ${
                              active
                                ? "border-blue-500 bg-blue-600 text-white font-black shadow-md shadow-blue-500/30"
                                : "border-white/10 bg-zinc-900 text-white hover:border-zinc-700"
                            }`}
                          >
                            <span className="font-mono text-sm font-black">
                              {formatTime12Str(slot.time)}
                            </span>
                            {selectedBarber === "any" && (
                              <span className={`text-[10px] truncate max-w-full ${active ? "text-white font-bold" : "text-zinc-400"}`}>
                                {slot.barberName}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Confirmation Summary & Guest Fields */}
      {step === 3 && selectedSlot && (
        <div className="flex flex-col gap-4">
          <div className="app-card p-6 border border-white/15 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-red-500">
                {currentShop?.name || "BarberApp"}
              </span>
              <span className="text-[11px] text-zinc-400">{currentShop?.city || "Cartagena"}</span>
            </div>

            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-start">
                <dt className="text-zinc-400">Servicio(s):</dt>
                <dd className="text-right font-black text-white max-w-[60%]">
                  {summaryLabel}
                </dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="text-zinc-400">Barbero:</dt>
                <dd className="font-black text-white">
                  {selectedSlot.barberName}
                </dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="text-zinc-400">Fecha:</dt>
                <dd className="font-bold text-white">
                  {formatDateLong(date)}
                </dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="text-zinc-400">Hora:</dt>
                <dd className="font-mono font-black text-blue-400 text-base">
                  {formatTime12Str(selectedSlot.time)}
                </dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="text-zinc-400">Duración:</dt>
                <dd className="font-medium text-zinc-400">
                  {formatDuration(totalDuration)}
                </dd>
              </div>

              <div className="mt-2 flex justify-between items-center border-t border-white/10 pt-3">
                <dt className="font-black text-white text-base">Total a pagar:</dt>
                <dd className="font-mono text-2xl font-black text-white">
                  {formatCOP(totalPrice)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-2xl bg-zinc-900/90 p-3.5 text-xs text-zinc-300 flex items-center gap-2 border border-white/5">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Pago en la sede al finalizar tu servicio (efectivo o transferencia).</span>
            </div>
          </div>

          {/* Guest Checkout Fields (si no ha iniciado sesión) */}
          {!currentUser && (
            <div className="app-card p-5 border border-blue-500/30 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Datos para tu Pase Digital QR
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">
                    Tu Nombre y Apellido *
                  </label>
                  <div className="relative flex items-center rounded-xl border border-white/10 bg-zinc-900">
                    <User className="h-4 w-4 text-zinc-500 ml-3" />
                    <input
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ej: Carlos Gómez"
                      className="h-11 w-full bg-transparent px-3 text-base text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">
                    WhatsApp / Celular *
                  </label>
                  <div className="relative flex items-center rounded-xl border border-white/10 bg-zinc-900">
                    <Phone className="h-4 w-4 text-zinc-500 ml-3" />
                    <input
                      required
                      inputMode="numeric"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="3001234567"
                      className="h-11 w-full bg-transparent px-3 text-base text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">
                    Correo Electrónico *
                  </label>
                  <div className="relative flex items-center rounded-xl border border-white/10 bg-zinc-900">
                    <Mail className="h-4 w-4 text-zinc-500 ml-3" />
                    <input
                      required
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="carlos@gmail.com"
                      className="h-11 w-full bg-transparent px-3 text-base text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="notes"
              className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2 block"
            >
              Notas o preferencias (opcional)
            </label>
            <textarea
              id="notes"
              maxLength={300}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Fade medio comprimido, perfilado suave de cejas..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-3.5 text-base text-white placeholder:text-zinc-600 transition-colors focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-xs font-medium text-red-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-zinc-400">
              {chosen.length > 0
                ? `${chosen.length} ${chosen.length === 1 ? "servicio" : "servicios"} · ${formatDuration(totalDuration)}`
                : "Elige al menos 1 corte"}
            </p>
            <p className="font-mono text-xl font-black text-white">
              {formatCOP(totalPrice)}
            </p>
          </div>

          <button
            disabled={!canContinue || submitting}
            onClick={() => (step === 3 ? void confirmBooking() : setStep(step + 1))}
            className="btn-red flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-7 text-xs font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Agendando...</span>
              </>
            ) : step === 3 ? (
              <>
                <Check className="h-4 w-4" />
                <span>Confirmar Cita</span>
              </>
            ) : (
              <>
                <span>Continuar</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
