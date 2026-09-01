"use client";

import { useState, useRef } from "react";
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
  Upload,
  Image as ImageIcon,
  DollarSign,
  Mail,
  UserPlus,
  Check,
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

const PRESET_SHOP_PHOTOS = [
  {
    label: "Modern Dark Studio",
    url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60",
  },
  {
    label: "Vintage Leather & Chrome",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=60",
  },
  {
    label: "Urban Neon Loft",
    url: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&auto=format&fit=crop&q=60",
  },
  {
    label: "Classic Barbershop",
    url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=60",
  },
];

const PRESET_CUT_PHOTOS = [
  {
    label: "Fade Alto / Degradado",
    url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60",
  },
  {
    label: "Ritual & Barba a Navaja",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60",
  },
  {
    label: "Combo VIP Corte + Barba",
    url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=60",
  },
  {
    label: "Taper Fade Clásico",
    url: "https://images.unsplash.com/photo-1517832606589-7629c3395907?w=500&auto=format&fit=crop&q=60",
  },
  {
    label: "Diseño & Perfilado",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
  },
];

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    name: "Corte Clásico / Fade",
    description: "Degradado personalizado a máquina y tijera con acabado a navaja.",
    price: 25000,
    durationMinutes: 40,
    category: "corte",
    imageUrl: PRESET_CUT_PHOTOS[0].url,
  },
  {
    name: "Perfilado & Ritual de Barba",
    description: "Afeitado tradicional con toalla caliente, aceites esenciales y navaja.",
    price: 18000,
    durationMinutes: 30,
    category: "barba",
    imageUrl: PRESET_CUT_PHOTOS[1].url,
  },
  {
    name: "Combo VIP (Corte + Barba)",
    description: "Servicio completo de corte premium, barba y mascarilla facial.",
    price: 38000,
    durationMinutes: 60,
    category: "combo",
    imageUrl: PRESET_CUT_PHOTOS[2].url,
  },
];

export default function CrearBarberiaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Paso 1: Datos de la Sede y Dueño
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Cartagena");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [coverUrl, setCoverUrl] = useState(PRESET_SHOP_PHOTOS[0].url);
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Paso 2: Cortes y Servicios
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState<number | "">("");
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServiceCategory, setNewServiceCategory] = useState("corte");
  const [newServiceImage, setNewServiceImage] = useState(PRESET_CUT_PHOTOS[0].url);
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [uploadingServiceImg, setUploadingServiceImg] = useState(false);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);

  // Paso 3: Equipo de Barberos
  const [barbers, setBarbers] = useState<BarberInvitationItem[]>([
    { name: "", email: "" },
  ]);

  // Paso 4: Horarios
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("20:00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void,
    setLoadingState: (loading: boolean) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tamaño (máximo 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen es demasiado pesada. Elige una menor a 8MB.");
      return;
    }

    setLoadingState(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        // Si falló la subida local, usar FileReader como fallback Base64
        const reader = new FileReader();
        reader.onload = () => {
          onSuccess(reader.result as string);
          setLoadingState(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      onSuccess(data.url);
    } catch {
      // Fallback base64
      const reader = new FileReader();
      reader.onload = () => {
        onSuccess(reader.result as string);
        setLoadingState(false);
      };
      reader.readAsDataURL(file);
    } finally {
      setLoadingState(false);
    }
  }

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
        imageUrl: newServiceImage.trim() || PRESET_CUT_PHOTOS[0].url,
      },
    ]);
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceDesc("");
    setNewServiceImage(PRESET_CUT_PHOTOS[0].url);
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
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim(),
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
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
    <main className="mx-auto min-h-dvh w-full max-w-xl px-4 py-6 pb-32 text-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-white transition-all hover:bg-zinc-800"
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
          <div className="app-card p-6 border border-white/10 shadow-xl">
            <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <Store className="h-5 w-5 text-red-500" />
              <span>Información de la Sede</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Estos datos aparecerán en tu ficha pública y en el mapa para tus clientes.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  Nombre de la Barbería *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: King Barber Studio"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    Ciudad *
                  </label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cartagena, Bogotá..."
                    className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    WhatsApp / Celular *
                  </label>
                  <input
                    required
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="3001234567"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  Dirección Exacta *
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Calle 32 # 4-45, Barrio Centro"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Datos del Dueño (para administrar sin Google previo) */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                  <UserPlus className="h-4 w-4 text-blue-400" />
                  <span>Datos del Administrador / Dueño</span>
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                      Tu Nombre
                    </label>
                    <input
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ej: Mateo Gómez"
                      className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                      Tu Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="mateo@gmail.com"
                      className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-zinc-400">
                  Podrás iniciar sesión con este correo o con tu botón de Google cuando quieras para ver tus citas y métricas.
                </p>
              </div>

              {/* Redes Sociales Opcionales */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    Instagram (opcional)
                  </label>
                  <input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@mibarberia"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    TikTok (opcional)
                  </label>
                  <input
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="@mibarberia"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Foto de la Barbería con subida directa y presets */}
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                <label className="text-xs font-bold text-zinc-200 mb-2 block flex items-center justify-between">
                  <span>Foto de Portada / Fachada</span>
                  {uploadingCover && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Subiendo foto...
                    </span>
                  )}
                </label>

                {/* Vista previa de foto actual */}
                <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 mb-3">
                  <img
                    src={coverUrl}
                    alt="Portada Barbería"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                      Vista previa de portada
                    </span>
                  </div>
                </div>

                {/* Botón de subida directa desde cámara/galería */}
                <input
                  type="file"
                  ref={coverFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageUpload(e, (url) => setCoverUrl(url), setUploadingCover)
                  }
                />

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    disabled={uploadingCover}
                    onClick={() => coverFileInputRef.current?.click()}
                    className="btn-red flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Subir de mi dispositivo</span>
                  </button>
                </div>

                {/* Selector de fotos de muestra */}
                <div className="mt-2 border-t border-white/10 pt-2.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    O elige una foto de muestra:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_SHOP_PHOTOS.map((p, idx) => {
                      const selected = coverUrl === p.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCoverUrl(p.url)}
                          className={`relative h-14 overflow-hidden rounded-lg border transition-all ${
                            selected
                              ? "border-red-500 ring-2 ring-red-500 scale-105"
                              : "border-white/10 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={p.url}
                            alt={p.label}
                            className="h-full w-full object-cover"
                          />
                          {selected && (
                            <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white font-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  Descripción o Eslogan (opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Especialistas en fades clásicos, perfilado a navaja y ambiente exclusivo..."
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-3.5 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
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
          <div className="app-card p-6 border border-white/10 shadow-xl">
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
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 mb-3 block">
                + Agregar Nuevo Corte / Servicio
              </span>

              <div className="flex flex-col gap-3">
                <input
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Nombre del servicio (Ej: Fade Alto + Barba)"
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 text-base text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Precio en COP ($)"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 text-base text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                  />

                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={20}>20 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={40}>40 minutos</option>
                    <option value={50}>50 minutos</option>
                    <option value={60}>60 minutos (1h)</option>
                  </select>
                </div>

                {/* Subir foto para este servicio o elegir preset */}
                <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-zinc-300">
                      Foto del Corte / Estilo
                    </span>
                    {uploadingServiceImg && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Subiendo...
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={serviceFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(
                        e,
                        (url) => setNewServiceImage(url),
                        setUploadingServiceImg
                      )
                    }
                  />

                  <div className="flex gap-2 items-center mb-2">
                    <button
                      type="button"
                      disabled={uploadingServiceImg}
                      onClick={() => serviceFileInputRef.current?.click()}
                      className="btn-dark flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Subir foto de corte</span>
                    </button>

                    {newServiceImage && (
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
                        <img
                          src={newServiceImage}
                          alt="Preview Corte"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Preset cuts */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {PRESET_CUT_PHOTOS.map((cp, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setNewServiceImage(cp.url)}
                        className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg border transition-all ${
                          newServiceImage === cp.url
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-white/10 opacity-50 hover:opacity-100"
                        }`}
                        title={cp.label}
                      >
                        <img
                          src={cp.url}
                          alt={cp.label}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addService}
                  className="btn-blue flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-black uppercase tracking-wider mt-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir Servicio a la lista</span>
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
          <div className="app-card p-6 border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h2 className="text-base font-black text-white">
                Invitar Equipo de Barberos
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Agrega los correos de los barberos que trabajarán en esta barbería. Recibirán un correo formal desde <strong>barber@wailus.co</strong> y podrán ingresar directamente con su botón de <strong>Google</strong>.
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
                      className="h-10 w-full rounded-xl border border-white/10 bg-black px-3 text-base text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="relative flex items-center">
                      <Mail className="h-4 w-4 text-zinc-500 absolute left-3" />
                      <input
                        type="email"
                        value={b.email}
                        onChange={(e) => updateBarberRow(idx, "email", e.target.value)}
                        placeholder="correo@gmail.com"
                        className="h-10 w-full rounded-xl border border-white/10 bg-black pl-9 pr-3 text-base text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {barbers.length > 1 && (
                    <button
                      onClick={() => removeBarberRow(idx)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addBarberRow}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-zinc-900/50 text-xs font-bold text-blue-400 hover:bg-blue-500/10 hover:border-blue-500"
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
          <div className="app-card p-6 border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-red-500" />
              <h2 className="text-base font-black text-white">
                Horarios de Atención & Resumen
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  Hora de Apertura
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base font-bold text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  Hora de Cierre
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base font-bold text-white focus:border-red-500 focus:outline-none"
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
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                <span className="text-zinc-400">Servicios registrados:</span>
                <span className="font-bold text-white">{services.length} cortes</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-zinc-400">Barberos invitados:</span>
                <span className="font-bold text-blue-400">
                  {barbers.filter((b) => b.email.trim()).length} barberos (notificación vía barber@wailus.co)
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
