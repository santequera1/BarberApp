"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const lightMode = saved === "light" || document.documentElement.classList.contains("light");
    setIsLight(lightMode);
    if (lightMode) {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    }
  }

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-full border border-white/10 bg-zinc-900/60 ${className}`} />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={isLight ? "Modo Oscuro" : "Modo Claro"}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-zinc-900 text-white transition-all duration-200 hover:border-red-500/50 hover:bg-zinc-800 active:scale-95 shadow-md ${className}`}
    >
      {isLight ? (
        <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300" />
      ) : (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
}
