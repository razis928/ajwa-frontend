const pkrFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const pkrFormatterPrecise = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Standard PKR display for prices and totals (whole rupees). */
export function formatPKR(amount: number): string {
  return pkrFormatter.format(amount);
}

/** PKR with decimal places (invoices, reports). */
export function formatPKRPrecise(amount: number): string {
  return pkrFormatterPrecise.format(amount);
}

/** Compact chart axis label, e.g. "Rs 42k". */
export function formatPKRCompact(amount: number): string {
  if (amount >= 1_000_000) return `Rs ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Rs ${Math.round(amount / 1_000)}k`;
  return formatPKR(amount);
}

export const CURRENCY_LABEL = 'PKR';
