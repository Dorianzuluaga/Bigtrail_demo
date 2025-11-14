
export function formatEuro(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";

  const number = Number(value);
  if (isNaN(number)) return "";

  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}
