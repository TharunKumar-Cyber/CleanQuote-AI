import React, { useState } from 'react';
import { AlertCircle, Plus, X, ArrowDownToLine } from 'lucide-react';
import type { ExtractedJobDetails } from '../types/quote';

interface ExtractedInfoPanelProps {
  data: ExtractedJobDetails;
  onChange: (updated: ExtractedJobDetails) => void;
  onGenerateLineItemsFromScope: () => void;
}

export const ExtractedInfoPanel: React.FC<ExtractedInfoPanelProps> = ({
  data,
  onChange,
  onGenerateLineItemsFromScope,
}) => {
  const [newAddon, setNewAddon] = useState('');

  const updateField = <K extends keyof ExtractedJobDetails>(
    key: K,
    value: ExtractedJobDetails[K]
  ) => {
    onChange({ ...data, [key]: value });
  };

  const handleAddAddon = () => {
    const trimmed = newAddon.trim();
    if (!trimmed) return;
    if (!data.additionalServices.includes(trimmed)) {
      updateField('additionalServices', [...data.additionalServices, trimmed]);
    }
    setNewAddon('');
  };

  const handleRemoveAddon = (addon: string) => {
    updateField(
      'additionalServices',
      data.additionalServices.filter((item) => item !== addon)
    );
  };

  const handleDismissMissing = (itemToRemove: string) => {
    updateField(
      'missingInformation',
      data.missingInformation.filter((item) => item !== itemToRemove)
    );
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            2. Extracted Information (Editable)
          </h2>
          <p className="text-sm text-slate-500">
            Review or update customer and property details before pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerateLineItemsFromScope}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          Draft Line Items from Scope
        </button>
      </div>

      {/* Missing Info Banner */}
      {data.missingInformation.length > 0 && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            Missing Information to Clarify With Customer
          </div>
          <ul className="space-y-1.5">
            {data.missingInformation.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between gap-2 text-sm text-amber-800"
              >
                <span>&bull; {item}</span>
                <button
                  type="button"
                  onClick={() => handleDismissMissing(item)}
                  className="text-xs text-amber-800 hover:text-amber-950 underline shrink-0"
                >
                  Mark resolved
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="field-customer-name"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Customer Name
          </label>
          <input
            id="field-customer-name"
            type="text"
            value={data.customerName}
            onChange={(e) => updateField('customerName', e.target.value)}
            placeholder="Not provided"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="field-customer-email"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Customer Email
          </label>
          <input
            id="field-customer-email"
            type="email"
            value={data.customerEmail}
            onChange={(e) => updateField('customerEmail', e.target.value)}
            placeholder="Not provided"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="field-service-type"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Service Type
          </label>
          <input
            id="field-service-type"
            type="text"
            value={data.serviceType}
            onChange={(e) => updateField('serviceType', e.target.value)}
            placeholder="e.g., Deep Cleaning, Standard Cleaning, Move-Out"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="field-requested-date"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Requested Date / Timeframe
          </label>
          <input
            id="field-requested-date"
            type="text"
            value={data.requestedDate}
            onChange={(e) => updateField('requestedDate', e.target.value)}
            placeholder="Not specified"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="field-bedrooms"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Bedrooms
            </label>
            <input
              id="field-bedrooms"
              type="text"
              value={data.bedrooms}
              onChange={(e) => updateField('bedrooms', e.target.value)}
              placeholder="e.g., 3"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
          <div>
            <label
              htmlFor="field-bathrooms"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Bathrooms
            </label>
            <input
              id="field-bathrooms"
              type="text"
              value={data.bathrooms}
              onChange={(e) => updateField('bathrooms', e.target.value)}
              placeholder="e.g., 2.5"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="field-property-size"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Property Size
          </label>
          <input
            id="field-property-size"
            type="text"
            value={data.propertySize}
            onChange={(e) => updateField('propertySize', e.target.value)}
            placeholder="e.g., 2,100 sq ft"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>
      </div>

      {/* Additional Services */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Additional Services / Add-ons
        </label>
        <div className="flex flex-wrap gap-2 mb-2.5">
          {data.additionalServices.length === 0 ? (
            <span className="text-xs text-slate-400">No add-on services listed yet.</span>
          ) : (
            data.additionalServices.map((addon) => (
              <span
                key={addon}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium"
              >
                {addon}
                <button
                  type="button"
                  onClick={() => handleRemoveAddon(addon)}
                  className="text-slate-500 hover:text-slate-900"
                  aria-label={`Remove ${addon}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newAddon}
            onChange={(e) => setNewAddon(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAddon();
              }
            }}
            placeholder="Add extra service (e.g., Inside Oven, Window Tracks)"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddAddon}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Special Instructions */}
      <div className="mt-4">
        <label
          htmlFor="field-special-instructions"
          className="block text-xs font-medium text-slate-700 mb-1"
        >
          Special Instructions
        </label>
        <textarea
          id="field-special-instructions"
          rows={3}
          value={data.specialInstructions}
          onChange={(e) => updateField('specialInstructions', e.target.value)}
          placeholder="Pets, eco-friendly requests, parking, access instructions..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>
    </section>
  );
};
