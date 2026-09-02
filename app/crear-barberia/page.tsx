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
  Navigation,
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

const PRESET_BARBER_PORTRAITS = [
  {
    label: "Barbero Urbano VIP",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=60",
  },
  {
    label: "Master Barber",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60",
  },
  {
    label: "Fade Specialist",
    url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=60",
  },
  {
    label: "Estilo & Navaja",
    url: "https://images.unsplash.com/photo-1517832606589-7629c3395907?w=800&auto=format&fit=crop&q=60",
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

  // Tipo de Perfil: Sede Física vs Barbero Independiente a Domicilio
  const [isFreelance, setIsFreelance] = useState(false);
  const [homeServiceFee, setHomeServiceFee] = useState<number | "">(10000);
  const [coverageArea, setCoverageArea] = useState("Bocagrande, Manga, Marbella, Crespo, Centro");

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
    if (!name.trim() || (!isFreelance && !address.trim()) || !city.trim()) {
      setError("Por favor completa los datos obligatorios.");
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

    const validBarbers = isFreelance ? [] : barbers.filter((b) => b.email.trim().length > 3);

    try {
      const res = await fetch("/api/barbershops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: isFreelance ? "Servicio a Domicilio" : address.trim(),
          city: city.trim(),
          phone: phone.trim(),
          description: description.trim(),
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim(),
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          logoUrl: logoUrl.trim() || "/logo.jpg",
          coverUrl: coverUrl.trim(),
          isFreelance,
          homeServiceFee: Number(homeServiceFee) || 0,
          coverageArea: isFreelance ? coverageArea.trim() : "Sede Física",
          services,
          barberEmails: validBarbers,
          openTime,
          closeTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar.");
        setLoading(false);
        return;
      }

      router.push(`/b/${data.barbershop.slug}`);
    } catch {
      setError("Error de conexión al guardar.");
      setLoading(false);
    }
  }

  const STEPS_TITLES = [
    { title: isFreelance ? "Perfil & Fotos" : "Sede & Fotos", icon: isFreelance ? Sparkles : Store },
    { title: "Cortes & Precios", icon: Scissors },
    { title: isFreelance ? "Modalidad" : "Invitar Barberos", icon: Users },
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
            {isFreelance ? "Registrar Barbero Independiente" : "Registrar Barbería"} ({step + 1}/4)
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

      {/* PASO 1: SEDE / PERFIL Y FOTOS */}
      {step === 0 && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          {/* Segmented Selector: Sede Física vs A Domicilio */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/90 rounded-2xl border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setIsFreelance(false);
                setCoverUrl(PRESET_SHOP_PHOTOS[0].url);
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                !isFreelance
                  ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Sede Física</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFreelance(true);
                setCoverUrl(PRESET_BARBER_PORTRAITS[0].url);
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                isFreelance
                  ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>A Domicilio (Freelance)</span>
            </button>
          </div>

          <div className="app-card p-6 border border-white/10 shadow-xl">
            <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
              {isFreelance ? <Sparkles className="h-5 w-5 text-amber-400" /> : <Store className="h-5 w-5 text-red-500" />}
              <span>{isFreelance ? "Información del Barbero a Domicilio" : "Información de la Sede"}</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              {isFreelance
                ? "Configura tu perfil personal para recibir solicitudes de cortes a domicilio."
                : "Estos datos aparecerán en tu ficha pública y en el mapa para tus clientes."}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  {isFreelance ? "Tu Nombre Artístico o Marca *" : "Nombre de la Barbería *"}
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isFreelance ? "Ej: Mateo 'El Profe' — Barbero VIP" : "Ej: King Barber Studio"}
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

              {isFreelance ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                      Tarifa Base de Domicilio ($ COP) *
                    </label>
                    <input
                      required
                      type="number"
                      value={homeServiceFee}
                      onChange={(e) => setHomeServiceFee(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="10000"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Se sumará al corte al momento de agendar.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                      Zonas de Cobertura *
                    </label>
                    <input
                      required
                      value={coverageArea}
                      onChange={(e) => setCoverageArea(e.target.value)}
                      placeholder="Ej: Bocagrande, Manga, Crespo, Centro"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    Dirección Exacta del Local *
                  </label>
                  <input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Calle 32 # 4-45, Barrio Centro"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Datos del Dueño / Barbero */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                  <UserPlus className="h-4 w-4 text-blue-400" />
                  <span>Datos de Acceso y Gestión</span>
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

              {/* Foto de Portada / Foto de Perfil */}
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                <label className="text-xs font-bold text-zinc-200 mb-2 block flex items-center justify-between">
                  <span>{isFreelance ? "Tu Foto de Perfil Profesional" : "Foto de Portada / Fachada"}</span>
                  {uploadingCover && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Subiendo foto...
                    </span>
                  )}
                </label>

                <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 mb-3">
                  <img
                    src={coverUrl}
                    alt="Foto Perfil"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                      {isFreelance ? "Foto de perfil del barbero" : "Foto de la sede"}
                    </span>
                  </div>
                </div>

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

                {/* Preset sample photos */}
                <div className="mt-2 border-t border-white/10 pt-2.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    O elige una foto de muestra:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {(isFreelance ? PRESET_BARBER_PORTRAITS : PRESET_SHOP_PHOTOS).map((p, idx) => {
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
                  Descripción o Bio (opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isFreelance
                      ? "Servicio de barbería VIP a domicilio en Cartagena. Equipos esterilizados y puntualidad..."
                      : "Especialistas en fades clásicos, perfilado a navaja y ambiente exclusivo..."
                  }
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-3.5 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    setError(isFreelance ? "Ingresa tu nombre artístico o de marca." : "Ingresa el nombre de la barbería.");
                    return;
                  }
                  if (!isFreelance && !address.trim()) {
                    setError("Ingresa la dirección de la sede.");
                    return;
                  }
                  setError(null);
                  setStep(1);
                }}
                className="btn-red flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-xs font-black uppercase tracking-wider"
              >
                <span>Continuar a Cortes & Precios</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 2: CORTES Y SERVICIOS */}
      {step === 1 && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="app-card p-6 border border-white/10 shadow-xl">
            <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <Scissors className="h-5 w-5 text-red-500" />
              <span>Catálogo de Cortes & Servicios</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Agrega los cortes que ofreces con sus precios en pesos colombianos.
            </p>

            {/* Lista de servicios agregados */}
            <div className="flex flex-col gap-3 mb-6">
              {services.map((srv, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 p-3"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-800 border border-white/10">
                    <img
                      src={srv.imageUrl || PRESET_CUT_PHOTOS[0].url}
                      alt={srv.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">
                      {srv.name}
                    </h3>
                    <p className="text-xs font-mono font-black text-red-400">
                      {formatCOP(srv.price)}{" "}
                      <span className="text-zinc-500 font-normal">
                        · {srv.durationMinutes} min
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Formulario para agregar nuevo servicio */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-red-500" />
                <span>Agregar Nuevo Corte o Servicio</span>
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <input
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Nombre del servicio (Ej: Fade + Barba VIP)"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) =>
                      setNewServicePrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="Precio COP ($)"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value={20}>20 min</option>
                    <option value={30}>30 min</option>
                    <option value={40}>40 min</option>
                    <option value={50}>50 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={addService}
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>Añadir a la lista</span>
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 px-5 text-xs font-bold text-zinc-300"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-red flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-xs font-black uppercase tracking-wider"
              >
                <span>Continuar</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 3: EQUIPO DE BARBEROS / MODALIDAD */}
      {step === 2 && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="app-card p-6 border border-white/10 shadow-xl">
            <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <Users className="h-5 w-5 text-red-500" />
              <span>{isFreelance ? "Modalidad de Atención" : "Equipo de Barberos"}</span>
            </h2>

            {isFreelance ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 flex flex-col gap-3 my-4">
                <div className="flex items-center gap-2 text-sm font-black text-amber-400">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <span>Perfil Exclusivo de Barbero Independiente</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Al registrarte como barbero independiente para servicio a domicilio, tú serás el único profesional asignado a tus citas. No es necesario invitar ni registrar a otros barberos.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-white bg-black/40 p-3 rounded-xl">
                  <span>🛵 Tarifa base domicilio configurada:</span>
                  <span className="font-mono text-amber-400 font-black">{formatCOP(Number(homeServiceFee) || 0)}</span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-400 mb-4">
                  Ingresa los correos de tus barberos para que reciban una invitación y puedan gestionar sus horarios y escanear pases QR.
                </p>

                <div className="flex flex-col gap-3 mb-4">
                  {barbers.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={b.name}
                        onChange={(e) => updateBarberRow(idx, "name", e.target.value)}
                        placeholder="Nombre (Ej: Carlos Fade)"
                        className="h-11 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                      />
                      <input
                        type="email"
                        value={b.email}
                        onChange={(e) => updateBarberRow(idx, "email", e.target.value)}
                        placeholder="correo@barbero.com"
                        className="h-11 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                      />
                      {barbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBarberRow(idx)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addBarberRow}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-4 text-xs font-bold text-zinc-300 hover:bg-zinc-800 mb-6"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar otro barbero</span>
                </button>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 px-5 text-xs font-bold text-zinc-300"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-red flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-xs font-black uppercase tracking-wider"
              >
                <span>Continuar a Horarios</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 4: HORARIOS Y FINALIZAR */}
      {step === 3 && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="app-card p-6 border border-white/10 shadow-xl">
            <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <span>Horarios de Atención</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Define tu rango de horario estándar de atención para agendar citas.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  Hora de Apertura
                </label>
                <select
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="07:00">7:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  Hora de Cierre
                </label>
                <select
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                  <option value="22:00">10:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 px-5 text-xs font-bold text-zinc-300"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="btn-red flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-xs font-black uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Publicar en el Marketplace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
