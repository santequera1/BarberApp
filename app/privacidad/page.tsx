import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PrivacidadPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <ThemeToggle />
      </div>

      <div className="world-card p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00e575]/15 text-[#00e575]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00e575]">
              Transparencia y Seguridad
            </span>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Política de Privacidad
            </h1>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-muted-foreground flex flex-col gap-4">
          <p>
            Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section>
            <h2 className="text-base font-bold text-foreground mb-1">1. Información que recopilamos</h2>
            <p>
              En <strong>Barber Market</strong> recopilamos únicamente los datos esenciales para procesar y confirmar tus citas de barbería:
            </p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li><strong>Datos de contacto:</strong> Nombre completo, número de WhatsApp/teléfono y correo electrónico.</li>
              <li><strong>Información de reserva:</strong> Servicios seleccionados, sede elegida, barbero y fecha/hora.</li>
              <li><strong>Autenticación con Google:</strong> Si decides iniciar sesión con Google OAuth, recopilamos tu nombre, correo electrónico y foto de perfil pública para crear tu sesión segura.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-1">2. Uso de la información</h2>
            <p>
              Tus datos son utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li>Generar tu Pase Digital QR y código de respaldo de 6 dígitos.</li>
              <li>Permitir al barbero identificarte y contactarte en caso de imprevistos sobre tu cita.</li>
              <li>Mantener el historial de citas y estadísticas de servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-1">3. Protección y confidencialidad</h2>
            <p>
              No vendemos ni compartimos tu información personal con terceros. Todos los accesos están protegidos mediante cifrado y tokens seguros con almacenamiento restringido.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-1">4. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de soporte en <strong>barber.wailus.co</strong>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
