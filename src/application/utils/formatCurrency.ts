/**
 * Formats a numeric amount into a localized currency string.
 * Example: formatCurrency(1250.5) → "$1,250.50"
 */
export function formatCurrency(
  amount: number,
  locale: string = "en-US",
  currency: string = "USD"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
