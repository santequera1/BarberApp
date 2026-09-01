"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors, Calendar, Ticket, UserCheck, Shield } from "lucide-react";

export function BottomNav({ role }: { role?: string }) {
  const pathname = usePathname();

  const isExplore = pathname === "/" || pathname === "/inicio";
  const isBook = pathname.startsWith("/agendar");
  const isTickets = pathname.startsWith("/citas");
  const isBarber = pathname.startsWith("/barbero");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-colors ${
            isExplore
              ? "text-white font-extrabold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              isExplore ? "bg-red-500 text-white shadow-md shadow-red-500/30" : "bg-transparent"
            }`}
          >
            <Scissors className="h-4 w-4" />
          </div>
          <span className="text-[10px] tracking-tight">Explorar</span>
        </Link>

        <Link
          href="/agendar"
          className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-colors ${
            isBook
              ? "text-white font-extrabold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              isBook ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "bg-transparent"
            }`}
          >
            <Calendar className="h-4 w-4" />
          </div>
          <span className="text-[10px] tracking-tight">Agendar</span>
        </Link>

        <Link
          href="/citas"
          className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-colors ${
            isTickets
              ? "text-white font-extrabold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              isTickets ? "bg-white text-black shadow-md shadow-white/30" : "bg-transparent"
            }`}
          >
            <Ticket className="h-4 w-4" />
          </div>
          <span className="text-[10px] tracking-tight">Mis Pases</span>
        </Link>

        <Link
          href="/barbero"
          className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-colors ${
            isBarber
              ? "text-white font-extrabold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              isBarber ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "bg-transparent"
            }`}
          >
            <UserCheck className="h-4 w-4" />
          </div>
          <span className="text-[10px] tracking-tight">Soy Barbero</span>
        </Link>

        {role === "ADMIN" && (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-colors ${
              isAdmin
                ? "text-white font-extrabold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                isAdmin ? "bg-blue-600 text-white" : "bg-transparent"
              }`}
            >
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-[10px] tracking-tight">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
