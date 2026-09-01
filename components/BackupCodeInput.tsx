"use client";

import { useRef } from "react";

// 6 casillas monoespaciadas, avance automático y pegado desde portapapeles.
export function BackupCodeInput({
  onComplete,
  disabled,
}: {
  onComplete: (code: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function currentCode(): string {
    return refs.current.map((r) => r?.value ?? "").join("");
  }

  function handleChange(i: number, value: string) {
    const clean = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    const input = refs.current[i];
    if (!input) return;

    if (clean.length > 1) {
      // Pegado: repartir entre las casillas
      for (let j = 0; j < clean.length && i + j < 6; j++) {
        const target = refs.current[i + j];
        if (target) target.value = clean[j];
      }
      const last = Math.min(i + clean.length, 5);
      refs.current[last]?.focus();
    } else {
      input.value = clean;
      if (clean && i < 5) refs.current[i + 1]?.focus();
    }

    const code = currentCode();
    if (code.length === 6) onComplete(code);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !refs.current[i]?.value && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div
      className="flex justify-center gap-2.5"
      role="group"
      aria-label="Código de respaldo de 6 caracteres"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          disabled={disabled}
          maxLength={6}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          aria-label={`Carácter ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="font-mono h-14 w-12 rounded-2xl border-2 border-border bg-card text-center text-xl font-black uppercase text-foreground shadow-sm transition-all focus:border-amber-500 focus:bg-amber-500/10 focus:outline-none focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
