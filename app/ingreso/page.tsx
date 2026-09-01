import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";

export default async function IngresoPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "ADMIN") redirect("/admin");
    if (session.role === "BARBERO" || session.role === "DUEÑO") redirect("/barbero");
    redirect("/");
  }

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
              className="h-28 w-auto object-contain drop-shadow-[0_12px_24px_rgba(239,68,68,0.4)]"
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
            BarberApp
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
            Iniciar Sesión
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Ingresa a tu cuenta para agendar o gestionar tu barbería.
          </p>
        </div>

        <AuthForm mode="login" />

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-zinc-400">
          ¿No tienes una cuenta aún?{" "}
          <Link
            href="/registro"
            className="font-extrabold text-blue-400 hover:underline"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </main>
  );
}
