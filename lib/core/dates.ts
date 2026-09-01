// Utilidades de fecha para America/Bogota (UTC-5, sin horario de verano).
// Regla del proyecto: todo se guarda en UTC; toda comparación de negocio
// se hace en la zona horaria de la barbería.

export const BOGOTA_OFFSET_HOURS = 5; // UTC-5

/** Convierte fecha local de Bogotá ("YYYY-MM-DD" + "HH:mm") a Date UTC. */
export function bogotaToUtc(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh + BOGOTA_OFFSET_HOURS, mm));
}

/** Componentes locales de Bogotá de un Date UTC. */
export function utcToBogota(date: Date): {
  dateStr: string;
  timeStr: string;
  dayOfWeek: number;
  hours: number;
  minutes: number;
} {
  const shifted = new Date(date.getTime() - BOGOTA_OFFSET_HOURS * 3600_000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  const hh = shifted.getUTCHours();
  const mm = shifted.getUTCMinutes();
  return {
    dateStr: `${y}-${m}-${d}`,
    timeStr: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
    dayOfWeek: shifted.getUTCDay(),
    hours: hh,
    minutes: mm,
  };
}

/** "YYYY-MM-DD" de hoy en Bogotá. */
export function todayBogota(now: Date = new Date()): string {
  return utcToBogota(now).dateStr;
}

/** Día de la semana (0=domingo) de una fecha local "YYYY-MM-DD". */
export function dayOfWeekBogota(dateStr: string): number {
  return bogotaToUtc(dateStr, "12:00").getUTCDay();
}

/** Suma días a una fecha "YYYY-MM-DD". */
export function addDays(dateStr: string, days: number): string {
  const d = bogotaToUtc(dateStr, "12:00");
  d.setUTCDate(d.getUTCDate() + days);
  return utcToBogota(d).dateStr;
}

/** Minutos desde medianoche de un "HH:mm". */
export function minutesOf(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_NAMES_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MONTH_NAMES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** "Sáb 2 ago" a partir de un Date UTC. */
export function formatDateShort(date: Date): string {
  const b = utcToBogota(date);
  const [y, m, d] = b.dateStr.split("-").map(Number);
  void y;
  return `${DAY_NAMES[b.dayOfWeek]} ${d} ${MONTH_NAMES[m - 1]}`;
}

/** "Sábado 2 de agosto" a partir de "YYYY-MM-DD". */
export function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  void y;
  const dow = dayOfWeekBogota(dateStr);
  return `${DAY_NAMES_FULL[dow]} ${d} de ${monthFull(m - 1)}`;
}

function monthFull(i: number): string {
  return [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ][i];
}

/** Formato 12 h colombiano: "10:30 a.m." */
export function formatTime12(date: Date): string {
  const b = utcToBogota(date);
  const suffix = b.hours < 12 ? "a.m." : "p.m.";
  let h = b.hours % 12;
  if (h === 0) h = 12;
  return `${h}:${String(b.minutes).padStart(2, "0")} ${suffix}`;
}

/** Formato 12 h desde "HH:mm". */
export function formatTime12Str(timeStr: string): string {
  const [h24, m] = timeStr.split(":").map(Number);
  const suffix = h24 < 12 ? "a.m." : "p.m.";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "45 min" o "1 h 45 min". */
export function formatDuration(minutes: number): string {
  if (minutes <= 90) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
