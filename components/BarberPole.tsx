export function BarberPole({
  variant = "loader",
  className = "",
}: {
  variant?: "loader" | "edge" | "rule";
  className?: string;
}) {
  if (variant === "edge") {
    return (
      <div
        aria-hidden="true"
        className={`w-1.5 h-full rounded-l-full bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 ${className}`}
      />
    );
  }

  if (variant === "rule") {
    return (
      <div
        aria-hidden="true"
        className={`h-0.5 w-full rounded-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`h-1.5 w-16 overflow-hidden rounded-full bg-secondary ${className}`}
    >
      <div className="h-full w-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 animate-pulse" />
    </div>
  );
}

