"use client";

import Link from "next/link";
import { Scissors, Shield, Store } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./LogoutButton";

export function HeaderNav({
  userName,
  role = "CLIENTE",
  subtitle,
}: {
  userName?: string;
  role?: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link
          href="/inicio"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00e575] text-black shadow-lg shadow-[#00e575]/20 transition-transform active:scale-95"
        >
          <Scissors className="h-5 w-5 stroke-[2.5]" />
        </Link>
        <div>
          {userName ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                {subtitle ?? "Hola,"}
              </p>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                {userName.split(" ")[0]}
              </h1>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00e575]">
                BARBER MARKET
              </span>
              <h1 className="text-lg font-bold text-foreground">
                {role === "BARBERO"
                  ? "Panel Barbero"
                  : role === "ADMIN"
                  ? "Super Admin"
                  : "La Barbería"}
              </h1>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex h-10 items-center gap-1.5 rounded-full border border-[#00e575]/40 bg-[#00e575]/10 px-3 text-xs font-bold text-[#00e575]"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin</span>
          </Link>
        )}
        <ThemeToggle />
        <LogoutButton showText={false} />
      </div>
    </header>
  );
}
