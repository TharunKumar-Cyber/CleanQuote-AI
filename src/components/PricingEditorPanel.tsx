import React from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import type { DiscountType, LineItem, PricingState } from '../types/quote';
import { calculateLineTotal, calculateQuoteTotals, formatMoney } from '../utils/calculations';

interface PricingEditorPanelProps {
  pricing: PricingState;
  currency: string;
  onChange: (updated: PricingState) => void;
}

export const PricingEditorPanel: React.FC<PricingEditorPanelProps> = ({
  pricing,
  currency,
  onChange,
}) => {
  const totals = calculateQuoteTotals(pricing);

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    onChange({
      ...pricing,
      lineItems: [...pricing.lineItems, newItem],
    });
  };

  const handleUpdateItem = (
    id: string,
    field: keyof Omit<LineItem, 'id'>,
    value: string | number
  ) => {
    onChange({
      ...pricing,
      lineItems: pricing.lineItems.map((item) => {
        if (item.id !== id) return item;
        if (field === 'description') {
          return { ...item, description: String(value) };
        }
        const numeric = Math.max(0, Number(value) || 0);
        return { ...item, [field]: numeric };
      }),
    });
  };

  const handleRemoveItem = (id: string) => {
    onChange({
      ...pricing,
      lineItems: pricing.lineItems.filter((item) => item.id !== id),
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            3. Pricing Editor
          </h2>
          <p className="text-sm text-slate-500">
            Enter your own service rates. AI never invents or sets final prices.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddLineItem}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Line Item
        </button>
      </div>

      {pricing.lineItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm text-slate-600 mb-3">
            No service line items added yet. Add a line item or click &ldquo;Draft Line Items from
            Scope&rdquo; above.
          </p>
          <button
            type="button"
            onClick={handleAddLineItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add First Service Item
          </button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 bg-slate-50 border-b border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
            <div className="col-span-6">Service Description</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Unit Price ({currency})</div>
            <div className="col-span-2 text-right">Line Total</div>
          </div>

          <div className="divide-y divide-slate-200">
            {pricing.lineItems.map((item) => {
              const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-3.5 bg-white hover:bg-slate-50/60 transition-colors"
                >
                  <div className="sm:col-span-6">
                    <label className="sm:hidden block text-xs font-medium text-slate-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="e.g., 3-Bedroom Deep Cleaning"
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:contents gap-2">
                    <div className="sm:col-span-2">
                      <label className="sm:hidden block text-xs font-medium text-slate-500 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-right text-slate-900 tabular-nums focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="sm:hidden block text-xs font-medium text-slate-500 mb-1">
                        Unit Price ({currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-right text-slate-900 tabular-nums focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                    <span className="sm:hidden text-xs font-medium text-slate-500">Total:</span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {formatMoney(lineTotal, currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Remove line item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Tax & Discount + Totals */}
      <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="discount-value"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Discount (Optional)
              </label>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white">
                <select
                  value={pricing.discountType}
                  onChange={(e) =>
                    onChange({ ...pricing, discountType: e.target.value as DiscountType })
                  }
                  className="bg-slate-50 border-r border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none"
                  aria-label="Discount type"
                >
                  <option value="fixed">{currency}</option>
                  <option value="percent">%</option>
                </select>
                <input
                  id="discount-value"
                  type="number"
                  min="0"
                  step="0.01"
                  max={pricing.discountType === 'percent' ? 100 : undefined}
                  value={pricing.discountValue}
                  onChange={(e) =>
                    onChange({
                      ...pricing,
                      discountValue: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full px-3 py-2 text-sm text-slate-900 tabular-nums focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tax-rate" className="block text-xs font-medium text-slate-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={pricing.taxRatePercent}
                onChange={(e) =>
                  onChange({
                    ...pricing,
                    taxRatePercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 tabular-nums focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {pricing.lineItems.some((item) => item.unitPrice === 0) && (
            <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                One or more items currently have a {formatMoney(0, currency)} unit price. Enter your
                rates before exporting the PDF.
              </span>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-[#F8FAFC] border border-slate-200 p-4 space-y-2.5 text-sm tabular-nums">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">
              {formatMoney(totals.subtotal, currency)}
            </span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>
                Discount
                {pricing.discountType === 'percent' ? ` (${pricing.discountValue}%)` : ''}
              </span>
              <span className="font-medium text-red-600">
                -{formatMoney(totals.discountAmount, currency)}
              </span>
            </div>
          )}
          {pricing.taxRatePercent > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax ({pricing.taxRatePercent}%)</span>
              <span className="font-medium text-slate-900">
                {formatMoney(totals.taxAmount, currency)}
              </span>
            </div>
          )}
          <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
            <span className="font-semibold text-slate-900">Final Total</span>
            <span className="font-display text-xl font-bold text-emerald-700">
              {formatMoney(totals.finalTotal, currency)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
