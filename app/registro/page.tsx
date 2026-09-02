import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";

export default async function RegistroPage() {
  const session = await getSession();
  if (session) redirect(session.role === "BARBERO" ? "/barbero" : "/");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8 text-white">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a la App</span>
      </Link>

      <div className="app-card relative mt-10 p-6 sm:p-8 border border-white/15 shadow-2xl bg-zinc-950">
        <div className="mb-6 text-center">
          {/* Logo transparente sin fondo que sobresale de la tarjeta */}
          <div className="mx-auto -mt-20 mb-3 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="BarberApp Logo"
              className="h-28 w-auto object-contain drop-shadow-[0_0_2.5px_rgba(255,255,255,0.95)] drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] drop-shadow-[0_12px_24px_rgba(59,130,246,0.45)]"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black text-blue-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pases QR y Agendamiento en 1 Clic</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Crear Cuenta
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Regístrate gratis para agendar en las mejores barberías.
          </p>
        </div>

        <AuthForm mode="register" />

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/ingreso"
            className="font-extrabold text-red-400 hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </main>
  );
}
