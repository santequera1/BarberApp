// Máquina de estados de la cita. Las transiciones prohibidas lanzan
// DomainError, nunca fallan en silencio.

export const APPOINTMENT_STATUSES = [
  "PENDIENTE",
  "CONFIRMADA",
  "EN_CURSO",
  "COMPLETADA",
  "CANCELADA",
  "NO_ASISTIO",
  "EXPIRADA",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Estados que ocupan la agenda del barbero. */
export const ACTIVE_STATUSES: AppointmentStatus[] = [
  "PENDIENTE",
  "CONFIRMADA",
  "EN_CURSO",
];

const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDIENTE: ["CONFIRMADA", "CANCELADA", "EXPIRADA"],
  CONFIRMADA: ["EN_CURSO", "CANCELADA", "NO_ASISTIO"],
  EN_CURSO: ["COMPLETADA"],
  COMPLETADA: [],
  CANCELADA: [],
  NO_ASISTIO: [],
  EXPIRADA: [],
};

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export function assertTransition(
  from: AppointmentStatus,
  to: AppointmentStatus
): void {
  if (!TRANSITIONS[from]?.includes(to)) {
    throw new DomainError(`Transición inválida: ${from} → ${to}`);
  }
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  EN_CURSO: "En curso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
  EXPIRADA: "Expirada",
};
