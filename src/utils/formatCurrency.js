export function formatCurrency(value) {
  if (typeof value === "string") {
    return value;
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
