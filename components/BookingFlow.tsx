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
  category?: string;
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
  { title: "Servicios", subtitle: "Elige tus servicios" },
  { title: "Barbero", subtitle: "Selecciona tu profesional" },
  { title: "Horario", subtitle: "Elige fecha y hora" },
  { title: "Confirmar", subtitle: "Revisa los detalles" },
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
              step === 0 ? router.push("/inicio") : setStep(step - 1)
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-secondary active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00e575]">
              {currentShop?.name || "La Barbería"}
            </span>
            <h1 className="text-base font-extrabold text-foreground">
              {STEPS[step].title} ({step + 1}/4)
            </h1>
          </div>

          <div className="h-11 w-11 opacity-0" />
        </div>

        {/* Worldcoin Progress bar */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx <= step ? "bg-[#00e575]" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {STEPS[step].subtitle}
        </p>
      </div>

      {/* Sede Selector Banner if multiple shops exist */}
      {barbershops.length > 1 && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card/60 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-[#00e575]" />
            <span className="font-bold text-foreground truncate max-w-[200px]">
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
            className="rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-[#00e575]"
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
                      ? "bg-[#00e575] text-black font-extrabold shadow-md shadow-[#00e575]/20"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
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
                  className={`group relative flex items-start justify-between rounded-3xl border p-4 text-left transition-all duration-200 ${
                    active
                      ? "border-[#00e575] bg-[#00e575]/10 shadow-lg shadow-[#00e575]/5 ring-1 ring-[#00e575]"
                      : "border-border bg-card hover:border-zinc-500"
                  }`}
                >
                  <div className="pr-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {service.name}
                      </h3>
                      {active && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00e575] text-[10px] text-black font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {service.description || "Servicio profesional con acabado impecable."}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                      <Clock className="h-3.5 w-3.5 text-[#00e575]" />
                      <span>{formatDuration(service.durationMinutes)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <span className="font-mono text-sm font-black text-foreground">
                      {formatCOP(service.price)}
                    </span>
                    <div
                      className={`mt-auto flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                        active
                          ? "border-[#00e575] bg-[#00e575] text-black font-black"
                          : "border-border bg-secondary text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
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
                ? "border-[#00e575] bg-[#00e575]/10 shadow-lg shadow-[#00e575]/5 ring-1 ring-[#00e575]"
                : "border-border bg-card hover:border-zinc-500"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00e575]/15 text-[#00e575]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">
                  Cualquier barbero disponible
                </p>
                <span className="rounded-full bg-[#00e575]/20 px-2 py-0.5 text-[10px] font-black text-[#00e575] uppercase">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Te asignamos automáticamente al barbero con mayor disponibilidad.
              </p>
            </div>
            {selectedBarber === "any" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00e575] text-black font-bold text-xs">
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
                    ? "border-[#00e575] bg-[#00e575]/10 shadow-lg shadow-[#00e575]/5 ring-1 ring-[#00e575]"
                    : "border-border bg-card hover:border-zinc-500"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 font-black text-white text-base">
                  {barber.displayName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {barber.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {barber.specialties.split(",").join(" · ")}
                  </p>
                  <span className="mt-1 inline-block text-[11px] font-bold text-[#00e575]">
                    {barber.bio || "Master Barbero"}
                  </span>
                </div>
                {active && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00e575] text-black font-bold text-xs">
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
            <label className="text-xs font-black uppercase tracking-wider text-[#00e575] mb-2.5 block">
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
                        ? "border-[#00e575] bg-[#00e575] text-black shadow-lg shadow-[#00e575]/25 font-black"
                        : "border-border bg-card text-foreground hover:border-zinc-500"
                    }`}
                  >
                    <span className={`text-[11px] font-bold uppercase ${active ? "text-black/80" : "text-muted-foreground"}`}>
                      {DAY_NAMES[info.dow]}
                    </span>
                    <span className="font-mono text-xl font-black">
                      {info.dayNum}
                    </span>
                    <span className={`text-[10px] font-bold ${active ? "text-black/70" : "text-muted-foreground"}`}>
                      {info.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-[#00e575] mb-2.5 block">
              2. Selecciona la Hora
            </label>

            {slotsLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#00e575]" />
                <p className="text-xs text-muted-foreground">
                  Buscando horarios libres en {currentShop?.name}...
                </p>
              </div>
            )}

            {!slotsLoading && slots && slots.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-bold text-foreground">
                  No hay horarios libres para esta fecha
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Por favor selecciona otro día en el selector de arriba.
                </p>
              </div>
            )}

            {!slotsLoading && slots && slots.length > 0 && (
              <div className="flex flex-col gap-5">
                {morningSlots.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-2.5">
                      <Sun className="h-4 w-4 text-[#00e575]" />
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
                                ? "border-[#00e575] bg-[#00e575] text-black font-black shadow-md shadow-[#00e575]/25"
                                : "border-border bg-card text-foreground hover:border-zinc-500"
                            }`}
                          >
                            <span className="font-mono text-sm font-black">
                              {formatTime12Str(slot.time)}
                            </span>
                            {selectedBarber === "any" && (
                              <span className={`text-[10px] truncate max-w-full ${active ? "text-black/80 font-bold" : "text-muted-foreground"}`}>
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
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-2.5">
                      <Sunset className="h-4 w-4 text-[#00e575]" />
                      <span>Tarde / Noche (12:00 PM - 7:00 PM)</span>
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
                                ? "border-[#00e575] bg-[#00e575] text-black font-black shadow-md shadow-[#00e575]/25"
                                : "border-border bg-card text-foreground hover:border-zinc-500"
                            }`}
                          >
                            <span className="font-mono text-sm font-black">
                              {formatTime12Str(slot.time)}
                            </span>
                            {selectedBarber === "any" && (
                              <span className={`text-[10px] truncate max-w-full ${active ? "text-black/80 font-bold" : "text-muted-foreground"}`}>
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
          <div className="world-card p-6 shadow-xl border border-[#00e575]/30">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#00e575]">
                {currentShop?.name || "La Barbería"}
              </span>
              <span className="text-[11px] text-muted-foreground">{currentShop?.city || "Cartagena"}</span>
            </div>

            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-start">
                <dt className="text-muted-foreground">Servicio(s):</dt>
                <dd className="text-right font-black text-foreground max-w-[60%]">
                  {summaryLabel}
                </dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground">Barbero:</dt>
                <dd className="font-black text-foreground">
                  {selectedSlot.barberName}
                </dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground">Fecha:</dt>
                <dd className="font-bold text-foreground">
                  {formatDateLong(date)}
                </dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground">Hora:</dt>
                <dd className="font-mono font-black text-[#00e575] text-base">
                  {formatTime12Str(selectedSlot.time)}
                </dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground">Duración:</dt>
                <dd className="font-medium text-muted-foreground">
                  {formatDuration(totalDuration)}
                </dd>
              </div>

              <div className="mt-2 flex justify-between items-center border-t border-border pt-3">
                <dt className="font-black text-foreground text-base">Total a pagar:</dt>
                <dd className="font-mono text-2xl font-black text-foreground">
                  {formatCOP(totalPrice)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-2xl bg-secondary/60 p-3.5 text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#00e575] shrink-0" />
              <span>Pago en sede al finalizar tu servicio (efectivo o transferencia).</span>
            </div>
          </div>

          {/* Guest Checkout Fields (si no ha iniciado sesión) */}
          {!currentUser && (
            <div className="world-card p-5 border border-[#00e575]/30 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#00e575]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Datos para tu Pase Digital QR
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                    Tu Nombre y Apellido *
                  </label>
                  <div className="relative flex items-center rounded-xl border border-input bg-card">
                    <User className="h-4 w-4 text-muted-foreground ml-3" />
                    <input
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ej: Carlos Gómez"
                      className="h-11 w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                    WhatsApp / Celular *
                  </label>
                  <div className="relative flex items-center rounded-xl border border-input bg-card">
                    <Phone className="h-4 w-4 text-muted-foreground ml-3" />
                    <input
                      required
                      inputMode="numeric"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="3001234567"
                      className="h-11 w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                    Correo Electrónico *
                  </label>
                  <div className="relative flex items-center rounded-xl border border-input bg-card">
                    <Mail className="h-4 w-4 text-muted-foreground ml-3" />
                    <input
                      required
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="carlos@correo.com"
                      className="h-11 w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="notes"
              className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block"
            >
              Notas o preferencias (opcional)
            </label>
            <textarea
              id="notes"
              maxLength={300}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Fade medio, perfilado a navaja..."
              className="w-full rounded-2xl border border-input bg-card p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-[#00e575] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-medium text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="glass fixed inset-x-0 bottom-0 z-40 border-t">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-muted-foreground">
              {chosen.length > 0
                ? `${chosen.length} ${chosen.length === 1 ? "servicio" : "servicios"} · ${formatDuration(totalDuration)}`
                : "Elige al menos 1 servicio"}
            </p>
            <p className="font-mono text-xl font-black text-foreground">
              {formatCOP(totalPrice)}
            </p>
          </div>

          <button
            disabled={!canContinue || submitting}
            onClick={() => (step === 3 ? void confirmBooking() : setStep(step + 1))}
            className="btn-world flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-7 text-xs font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
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
