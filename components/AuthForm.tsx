"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(err);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body =
      mode === "login"
        ? {
            email: form.get("email"),
            password: form.get("password"),
          }
        : {
            name: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone") || "",
            password: form.get("password"),
          };

    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "No se pudo continuar. Verifica tus datos.");
        return;
      }

      router.push(data.role === "CLIENTE" ? "/" : "/barbero");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Error de conexión. Intenta de nuevo.");
    }
  }

  const inputWrapper =
    "relative flex items-center rounded-2xl border border-white/10 bg-zinc-900 transition-colors focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20";
  const iconClass = "h-4 w-4 text-zinc-500 ml-4 pointer-events-none";
  const inputClass =
    "h-12 w-full bg-transparent px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none";

  return (
    <div className="flex flex-col gap-4">
      {/* Botón de Google OAuth */}
      <a
        href="/api/auth/google"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-zinc-900 text-xs font-extrabold text-white transition-all hover:bg-zinc-800 hover:border-zinc-700 active:scale-95 shadow-md"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
          />
        </svg>
        <span>Continuar con Google</span>
      </a>

      <div className="relative my-2 flex items-center justify-center">
        <div className="w-full border-t border-white/10" />
        <span className="absolute bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">
          O con tu correo
        </span>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5 block" htmlFor="name">
                Nombre Completo
              </label>
              <div className={inputWrapper}>
                <User className={iconClass} />
                <input
                  id="name"
                  name="name"
                  required
                  minLength={2}
                  placeholder="Tu nombre y apellido"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5 block" htmlFor="phone">
                Celular / WhatsApp (opcional)
              </label>
              <div className={inputWrapper}>
                <Phone className={iconClass} />
                <input
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  pattern="\d{7,15}"
                  placeholder="3001234567"
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5 block" htmlFor="email">
            Correo Electrónico
          </label>
          <div className={inputWrapper}>
            <Mail className={iconClass} />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="ejemplo@gmail.com"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5 block" htmlFor="password">
            Contraseña
          </label>
          <div className={inputWrapper}>
            <Lock className={iconClass} />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={mode === "register" ? 8 : 1}
              placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mr-3 p-1 text-zinc-500 hover:text-white"
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-950/20 p-3.5 text-xs font-semibold text-red-400 animate-fade-in-up"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-red mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg transition-transform active:scale-95 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Procesando...</span>
            </>
          ) : mode === "login" ? (
            <>
              <span>Ingresar a mi cuenta</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </>
          ) : (
            <>
              <span>Crear Cuenta</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
