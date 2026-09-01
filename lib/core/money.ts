/** Precios siempre en pesos con punto de miles: "$17.000". COP entero. */
export function formatCOP(amount: number): string {
  return "$" + amount.toLocaleString("es-CO").replace(/,/g, ".");
}
