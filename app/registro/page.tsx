import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Scissors, ArrowLeft, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";

export default async function RegistroPage() {
  const session = await getSession();
  if (session) redirect(session.role === "BARBERO" ? "/barbero" : "/inicio");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al inicio</span>
      </Link>

      <div className="world-card p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#00e575] text-black shadow-xl shadow-[#00e575]/25">
            <Scissors className="h-7 w-7 stroke-[2.5]" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00e575]/10 px-3 py-1 text-[11px] font-black text-[#00e575] mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>En menos de 1 minuto</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Crear tu Cuenta
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Únete para agendar en cualquier barbería y recibir tus pases digitales con QR.
          </p>
        </div>

        <AuthForm mode="register" />

        <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/ingreso"
            className="font-extrabold text-[#00e575] hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </main>
  );
}
