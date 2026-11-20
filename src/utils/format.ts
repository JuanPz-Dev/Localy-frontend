export function formatDate(value: string | null) {
  if (!value) return "No disponible";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(date);
}

export function formatTime(value: string | null) {
  return value ? value.slice(0, 5) : "No disponible";
}

export function formatCurrency(value: number | null) {
  if (value === null) return "No disponible";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
