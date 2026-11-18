import type { PricingState } from '../types/quote';

export interface QuoteTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  finalTotal: number;
}

export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  const safeQty = Math.max(0, Number.isFinite(quantity) ? quantity : 0);
  const safePrice = Math.max(0, Number.isFinite(unitPrice) ? unitPrice : 0);
  return roundCurrency(safeQty * safePrice);
}

export function calculateQuoteTotals(pricing: PricingState): QuoteTotals {
  const subtotal = roundCurrency(
    pricing.lineItems.reduce(
      (sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice),
      0
    )
  );

  const rawDiscount = Math.max(
    0,
    Number.isFinite(pricing.discountValue) ? pricing.discountValue : 0
  );
  const discountAmount =
    pricing.discountType === 'percent'
      ? roundCurrency(Math.min(subtotal, subtotal * (Math.min(100, rawDiscount) / 100)))
      : roundCurrency(Math.min(subtotal, rawDiscount));

  const taxableAmount = roundCurrency(Math.max(0, subtotal - discountAmount));
  const safeTaxRate = Math.max(
    0,
    Math.min(100, Number.isFinite(pricing.taxRatePercent) ? pricing.taxRatePercent : 0)
  );
  const taxAmount = roundCurrency(taxableAmount * (safeTaxRate / 100));
  const finalTotal = roundCurrency(taxableAmount + taxAmount);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    finalTotal,
  };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CAD: 'CA$',
  AUD: 'A$',
  GBP: '£',
  EUR: '€',
  INR: '₹',
};

export function formatMoney(amount: number, currency: string): string {
  const safeAmount = roundCurrency(amount);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${symbol}${safeAmount.toFixed(2)}`;
  }
}
