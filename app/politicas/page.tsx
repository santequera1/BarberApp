import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PoliticasPage() {
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
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00e575]">
              Términos de Uso
            </span>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Condiciones del Servicio
            </h1>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-muted-foreground flex flex-col gap-4">
          <p>
            Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section>
            <h2 className="text-base font-bold text-foreground mb-1">1. Aceptación de las Condiciones</h2>
            <p>
              Al utilizar la plataforma <strong>Barber Market</strong> (disponible en <code>barber.wailus.co</code>), aceptas cumplir con los presentes términos y condiciones de servicio.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-1">2. Reservas y Asistencia</h2>
            <p>
              Los clientes se comprometen a presentarse puntualmente en la sede de la barbería seleccionada presentando su <strong>Pase Digital QR</strong> o código PIN de reserva.
            </p>
            <p className="mt-1">
              En caso de no poder asistir, se solicita cancelar o reprogramar la cita con anticipación a través de la plataforma para liberar el horario del profesional.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-1">3. Pagos y Tarifas</h2>
            <p>
              Los precios de los servicios mostrados en la plataforma son informativos y fijados por cada barbería registrada. El pago de los servicios se realiza directamente en la sede mediante los métodos de pago aceptados por cada local (efectivo, transferencia o datáfono).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-1">4. Uso de la Cuenta</h2>
            <p>
              Eres responsable de mantener la confidencialidad de tus credenciales de acceso o cuentas vinculadas (como Google OAuth).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
