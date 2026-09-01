"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, CalendarPlus, Ticket, Store, Shield } from "lucide-react";

export function BottomNav({ role = "CLIENTE" }: { role?: string }) {
  const pathname = usePathname();

  const items = [
    { href: "/inicio", label: "Explorar", icon: Globe },
    { href: "/agendar", label: "Agendar", icon: CalendarPlus, highlight: true },
    { href: "/citas", label: "Mis Citas", icon: Ticket },
    ...(role === "ADMIN"
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : [{ href: "/crear-barberia", label: "Mi Sede", icon: Store }]),
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="glass fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-around rounded-full p-2 shadow-2xl transition-all duration-300 border border-border"
    >
      {items.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/inicio" && pathname.startsWith(item.href));
        const Icon = item.icon;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex h-13 w-13 items-center justify-center rounded-full btn-world shadow-lg transition-transform duration-200 active:scale-95 ${
                active ? "ring-4 ring-[#00e575]/40" : ""
              }`}
              title={item.label}
            >
              <Icon className="h-6 w-6 stroke-[2.5] text-black" />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
              active
                ? "text-[#00e575] font-black scale-105"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
