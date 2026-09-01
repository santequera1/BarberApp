import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ArrowLeft } from "lucide-react";
import { Scanner } from "@/components/Scanner";

export default async function EscanearPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "CLIENTE") redirect("/inicio");

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-12 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/barbero"
          aria-label="Volver a la agenda"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs font-black uppercase tracking-widest text-[#00e575]">
          Escanear Pase QR
        </span>
        <div className="h-10 w-10 opacity-0" />
      </header>

      <Scanner />
    </main>
  );
}
