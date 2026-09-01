"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  if (!mounted) {
    return (
      <div className={`h-10 w-10 rounded-full border border-border bg-card/50 ${className}`} />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-accent/40 active:scale-95 ${className}`}
    >
      {dark ? (
        <Sun className="h-[18px] w-[18px] text-amber-400 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="h-[18px] w-[18px] text-slate-700 transition-transform duration-300" />
      )}
    </button>
  );
}

