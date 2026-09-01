import { randomInt, randomBytes } from "crypto";

// Base32 sin caracteres ambiguos (sin 0, O, 1, I) — se lee en voz alta.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Código de respaldo de 6 caracteres, ej. "7K4M9X". */
export function generateBackupCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}

/** Código corto legible de la cita, ej. "C-7K4M". */
export function generateAppointmentCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `C-${code}`;
}

/** Token de check-in de un solo uso (128 bits aleatorios, se guarda único). */
export function generateCheckinToken(): string {
  return randomBytes(16).toString("hex");
}
