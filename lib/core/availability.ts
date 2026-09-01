// Motor de disponibilidad — función pura, sin Prisma ni React.
// Todas las fechas de entrada/salida en UTC; la lógica de horario se
// resuelve en hora local de Bogotá.

import { bogotaToUtc, minutesOf } from "./dates";

export interface BusyInterval {
  startsAt: Date;
  endsAt: Date;
}

export interface AvailabilityInput {
  /** Fecha local de Bogotá "YYYY-MM-DD" */
  date: string;
  /** Duración total de los servicios seleccionados, en minutos */
  durationMinutes: number;
  /** Tiempo de preparación/limpieza entre citas */
  bufferMinutes: number;
  /** Horario de la barbería ese día; null si está cerrada */
  shopHours: { openTime: string; closeTime: string } | null;
  /** Ventanas de trabajo del barbero ese día ("HH:mm") */
  barberWindows: { startTime: string; endTime: string }[];
  /** Citas activas y bloqueos del barbero (UTC) */
  busy: BusyInterval[];
  /** Momento actual (UTC) */
  now: Date;
  /** Antelación mínima para reservar, en minutos */
  minNoticeMinutes: number;
  /** Granularidad de los slots, en minutos */
  stepMinutes?: number;
}

export interface Slot {
  start: Date;
  end: Date;
}

/**
 * Calcula los slots libres de un barbero para una fecha.
 * Reglas cubiertas (sección 8 de la especificación): 2, 3, 5 y 6.
 * La regla 1 (no solape) se refuerza además al crear la cita.
 */
export function computeSlots(input: AvailabilityInput): Slot[] {
  const {
    date,
    durationMinutes,
    bufferMinutes,
    shopHours,
    barberWindows,
    busy,
    now,
    minNoticeMinutes,
    stepMinutes = 15,
  } = input;

  if (!shopHours || barberWindows.length === 0 || durationMinutes <= 0) {
    return [];
  }

  const shopOpen = minutesOf(shopHours.openTime);
  const shopClose = minutesOf(shopHours.closeTime);
  const earliestStart = new Date(now.getTime() + minNoticeMinutes * 60_000);

  // Intervalos ocupados expandidos con el buffer posterior
  const busyExpanded = busy.map((b) => ({
    start: b.startsAt.getTime(),
    end: b.endsAt.getTime() + bufferMinutes * 60_000,
  }));

  const slots: Slot[] = [];

  for (const win of barberWindows) {
    // Intersección horario barbería ∩ horario barbero
    const winStart = Math.max(minutesOf(win.startTime), shopOpen);
    const winEnd = Math.min(minutesOf(win.endTime), shopClose);

    for (
      let t = Math.ceil(winStart / stepMinutes) * stepMinutes;
      t + durationMinutes <= winEnd;
      t += stepMinutes
    ) {
      const hh = String(Math.floor(t / 60)).padStart(2, "0");
      const mm = String(t % 60).padStart(2, "0");
      const start = bogotaToUtc(date, `${hh}:${mm}`);
      const end = new Date(start.getTime() + durationMinutes * 60_000);

      if (start < earliestStart) continue;

      // El slot ocupa [start, end + buffer) frente a los intervalos ocupados
      const slotEndWithBuffer = end.getTime() + bufferMinutes * 60_000;
      const overlaps = busyExpanded.some(
        (b) => start.getTime() < b.end && slotEndWithBuffer > b.start
      );
      if (overlaps) continue;

      slots.push({ start, end });
    }
  }

  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots;
}

/** Verifica si un intervalo choca con alguno ocupado (con buffer). */
export function hasConflict(
  start: Date,
  end: Date,
  busy: BusyInterval[],
  bufferMinutes: number
): boolean {
  const s = start.getTime();
  const e = end.getTime() + bufferMinutes * 60_000;
  return busy.some(
    (b) =>
      s < b.endsAt.getTime() + bufferMinutes * 60_000 && e > b.startsAt.getTime()
  );
}
