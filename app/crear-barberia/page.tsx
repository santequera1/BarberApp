"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Scissors,
  Users,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  Camera,
  Image as ImageIcon,
  DollarSign,
  Mail,
  UserPlus,
} from "lucide-react";
import { formatCOP } from "@/lib/core/money";

interface ServiceItem {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  imageUrl: string;
}

interface BarberInvitationItem {
  name: string;
  email: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    name: "Corte Clásico / Fade",
    description: "Degradado personalizado a máquina y tijera con acabado a navaja.",
    price: 25000,
    durationMinutes: 40,
    category: "corte",
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Perfilado & Ritual de Barba",
    description: "Afeitado tradicional con toalla caliente, aceites esenciales y navaja.",
    price: 18000,
    durationMinutes: 30,
    category: "barba",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Combo VIP (Corte + Barba)",
    description: "Servicio completo de corte premium, barba y mascarilla facial.",
    price: 38000,
    durationMinutes: 60,
    category: "combo",
    imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=60",
  },
];

export default function CrearBarberiaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Paso 1: Datos de la Sede
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Cartagena");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60");
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");

  // Paso 2: Cortes y Servicios
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState<number | "">("");
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServiceCategory, setNewServiceCategory] = useState("corte");
  const [newServiceImage, setNewServiceImage] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  // Paso 3: Equipo de Barberos
  const [barbers, setBarbers] = useState<BarberInvitationItem[]>([
    { name: "", email: "" },
  ]);

  // Paso 4: Horarios
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("20:00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addService() {
    if (!newServiceName.trim() || !newServicePrice || Number(newServicePrice) <= 0) {
      setError("Ingresa el nombre y precio del servicio.");
      return;
    }
    setError(null);
    setServices((prev) => [
      ...prev,
      {
        name: newServiceName.trim(),
        description: newServiceDesc.trim(),
        price: Number(newServicePrice),
        durationMinutes: Number(newServiceDuration),
        category: newServiceCategory,
        imageUrl: newServiceImage.trim(),
      },
    ]);
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceDesc("");
    setNewServiceImage("");
  }

  function removeService(index: number) {
    if (services.length <= 1) {
      setError("La barbería debe tener al menos 1 servicio.");
      return;
    }
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function addBarberRow() {
    setBarbers((prev) => [...prev, { name: "", email: "" }]);
  }

  function updateBarberRow(index: number, field: keyof BarberInvitationItem, value: string) {
    setBarbers((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  }

  function removeBarberRow(index: number) {
    setBarbers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!name.trim() || !address.trim() || !city.trim()) {
      setError("Por favor completa los datos obligatorios de la sede.");
      setStep(0);
      return;
    }

    if (services.length === 0) {
      setError("Debes registrar al menos un corte o servicio.");
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    const validBarbers = barbers.filter((b) => b.email.trim().length > 3);

    try {
      const res = await fetch("/api/barbershops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          phone: phone.trim(),
          description: description.trim(),
          logoUrl: logoUrl.trim() || "/logo.jpg",
          coverUrl: coverUrl.trim(),
          services,
          barberEmails: validBarbers,
          openTime,
          closeTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar la barbería.");
        setLoading(false);
        return;
      }

      router.push(`/b/${data.barbershop.slug}`);
    } catch {
      setError("Error de conexión al guardar la barbería.");
      setLoading(false);
    }
  }

  const STEPS_TITLES = [
    { title: "Sede & Fotos", icon: Store },
    { title: "Cortes & Precios", icon: Scissors },
    { title: "Invitar Barberos", icon: Users },
    { title: "Horarios & Fin", icon: Clock },
  ];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-xl px-4 py-6 pb-32 text-foreground">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-foreground transition-all hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
            Marketplace de Barberías
          </span>
          <h1 className="text-base font-black text-white">
            Registrar Barbería ({step + 1}/4)
          </h1>
        </div>

        <div className="h-10 w-10 opacity-0" />
      </div>

      {/* Progress Tabs */}
      <div className="mb-6 grid grid-cols-4 gap-2">
        {STEPS_TITLES.map((st, i) => {
          const Icon = st.icon;
          const active = i === step;
          const done = i < step;
          return (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition-all ${
                active
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20 font-bold"
                  : done
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "bg-zinc-900/60 text-zinc-500 border border-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] truncate max-w-full font-extrabold">
                {st.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PASO 1: SEDE Y FOTOS */}
      {step === 0 && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="app-card p-6">
            <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <Store className="h-5 w-5 text-red-500" />
              <span>Información de la Sede</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Estos datos aparecerán en tu ficha pública y en el mapa para tus clientes.
            </p>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                  Nombre de la Barbería *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: King Barber Studio"
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                    Ciudad *
                  </label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cartagena, Bogotá..."
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                    WhatsApp / Celular *
                  </label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="3001234567"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                  Dirección Exacta *
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Calle 32 # 4-45, Barrio Centro"
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                  Foto de Portada de la Barbería (URL de imagen)
                </label>
                <div className="flex gap-2">
                  <input
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-11 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3.5 text-xs text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                {coverUrl && (
                  <div className="mt-2 h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                    <img
                      src={coverUrl}
                      alt="Preview Portada"
                      className="h-full w-full object-cover"
                      onError={() => {}}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                  Descripción o Eslogan (opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Especialistas en fades clásicos, perfilado a navaja y ambiente exclusivo..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-xs text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (!name.trim() || !address.trim()) {
                setError("Por favor completa el nombre y la dirección.");
                return;
              }
              setError(null);
              setStep(1);
            }}
            className="btn-red flex h-12 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider"
          >
            <span>Continuar a Cortes & Precios</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* PASO 2: CORTES Y SERVICIOS CON FOTOS */}
      {step === 1 && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Scissors className="h-5 w-5 text-red-500" />
                <span>Cortes & Servicios</span>
              </h2>
              <span className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-[10px] font-black text-blue-400">
                {services.length} registrados
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Agrega los cortes que ofrece tu barbería con sus fotos de referencia y precios.
            </p>

            {/* List of current services */}
            <div className="flex flex-col gap-2.5 mb-6">
              {services.map((srv, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-800 border border-white/10">
                      {srv.imageUrl ? (
                        <img
                          src={srv.imageUrl}
                          alt={srv.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-500">
                          <Scissors className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{srv.name}</h4>
                      <p className="text-[10px] text-zinc-400">{srv.durationMinutes} min · {srv.category}</p>
                      <span className="font-mono text-xs font-black text-red-400">
                        {formatCOP(srv.price)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeService(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Service Form */}
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 mb-2 block">
                + Agregar Nuevo Corte / Servicio
              </span>

              <div className="flex flex-col gap-2.5">
                <input
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Nombre del servicio (Ej: Fade Alto + Diseño)"
                  className="h-10 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Precio en COP ($)"
                    className="h-10 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                  />

                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-white/10 bg-zinc-900 px-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={20}>20 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={40}>40 minutos</option>
                    <option value={50}>50 minutos</option>
                    <option value={60}>60 minutos (1h)</option>
                  </select>
                </div>

                <input
                  value={newServiceImage}
                  onChange={(e) => setNewServiceImage(e.target.value)}
                  placeholder="URL Foto del corte (opcional)"
                  className="h-10 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={addService}
                  className="btn-blue flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-black uppercase tracking-wider mt-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir a la lista</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStep(0)}
              className="btn-dark flex h-12 items-center justify-center rounded-full text-xs font-bold"
            >
              Atrás
            </button>
            <button
              onClick={() => {
                if (services.length === 0) {
                  setError("Agrega al menos un servicio.");
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="btn-red flex h-12 items-center justify-center gap-1.5 rounded-full text-xs font-black uppercase tracking-wider"
            >
              <span>Invitar Barberos</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: INVITAR BARBEROS (EQUIPO) */}
      {step === 2 && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="app-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h2 className="text-base font-black text-white">
                Invitar Equipo de Barberos
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Agrega los correos de los barberos que trabajarán en esta barbería. Podrán ingresar directamente con su botón de **Google** y gestionar sus propias citas.
            </p>

            <div className="flex flex-col gap-3">
              {barbers.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 p-3"
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      value={b.name}
                      onChange={(e) => updateBarberRow(idx, "name", e.target.value)}
                      placeholder="Nombre del Barbero (Ej: Mateo Gómez)"
                      className="h-9 w-full rounded-lg border border-white/10 bg-black px-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="relative flex items-center">
                      <Mail className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5" />
                      <input
                        type="email"
                        value={b.email}
                        onChange={(e) => updateBarberRow(idx, "email", e.target.value)}
                        placeholder="correo@gmail.com"
                        className="h-9 w-full rounded-lg border border-white/10 bg-black pl-8 pr-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {barbers.length > 1 && (
                    <button
                      onClick={() => removeBarberRow(idx)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addBarberRow}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-zinc-900/50 text-xs font-bold text-blue-400 hover:bg-blue-500/10 hover:border-blue-500"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Invitar a otro Barbero</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStep(1)}
              className="btn-dark flex h-12 items-center justify-center rounded-full text-xs font-bold"
            >
              Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              className="btn-red flex h-12 items-center justify-center gap-1.5 rounded-full text-xs font-black uppercase tracking-wider"
            >
              <span>Horarios & Confirmar</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASO 4: HORARIOS Y FINALIZAR */}
      {step === 3 && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="app-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-red-500" />
              <h2 className="text-base font-black text-white">
                Horarios de Atención & Resumen
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                  Hora de Apertura
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm font-bold text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                  Hora de Cierre
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm font-bold text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Final Summary Card */}
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block mb-2">
                Resumen de tu Barbería
              </span>
              <p className="font-extrabold text-white text-base">{name || "Sin nombre"}</p>
              <p className="text-zinc-400 mt-0.5">{address}, {city}</p>
              <p className="text-zinc-400">{phone}</p>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
                <span className="text-zinc-400">Servicios registrados:</span>
                <span className="font-bold text-white">{services.length} cortes</span>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="text-zinc-400">Barberos invitados:</span>
                <span className="font-bold text-blue-400">
                  {barbers.filter((b) => b.email.trim()).length} barberos
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStep(2)}
              className="btn-dark flex h-12 items-center justify-center rounded-full text-xs font-bold"
            >
              Atrás
            </button>
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="btn-red flex h-12 items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Publicar Barbería</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
