import React, { useState } from 'react';
import { Upload, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { BusinessSettings } from '../types/quote';

interface BusinessSettingsViewProps {
  settings: BusinessSettings;
  onSave: (next: BusinessSettings) => void;
}

const CURRENCIES = ['USD', 'CAD', 'AUD', 'GBP', 'EUR', 'INR'];

export const BusinessSettingsView: React.FC<BusinessSettingsViewProps> = ({
  settings,
  onSave,
}) => {
  const [form, setForm] = useState<BusinessSettings>(settings);
  const [savedMessage, setSavedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid PNG, JPEG, or WebP image file.');
      return;
    }

    if (file.size > 1024 * 1024) {
      setErrorMessage('Logo image must be smaller than 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, logoDataUrl: reader.result as string }));
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) {
      setErrorMessage('Business name is required.');
      return;
    }
    if (form.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail.trim())) {
      setErrorMessage('Please enter a valid business email address.');
      return;
    }
    if (!form.validityDays || form.validityDays < 1) {
      setErrorMessage('Quotation validity period must be at least 1 day.');
      return;
    }

    setErrorMessage(null);
    onSave({
      ...form,
      businessName: form.businessName.trim(),
      businessEmail: form.businessEmail.trim(),
      phoneNumber: form.phoneNumber.trim(),
      businessAddress: form.businessAddress.trim(),
      paymentTerms: form.paymentTerms.trim(),
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Business Settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          These details appear on every quotation PDF you export. Saved locally in your browser.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
      >
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {savedMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Business settings saved.</span>
          </div>
        )}

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-2">Business Logo</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {form.logoDataUrl ? (
              <img
                src={form.logoDataUrl}
                alt="Uploaded business logo"
                className="h-16 w-16 rounded-lg object-contain border border-slate-200 bg-slate-50 p-1"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                No logo
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="sr-only"
                />
              </label>

              {form.logoDataUrl && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, logoDataUrl: '' }))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">PNG, JPEG, or WebP recommended, max 1 MB.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="biz-name"
              className="block text-sm font-medium text-slate-800 mb-1"
            >
              Business Name *
            </label>
            <input
              id="biz-name"
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="biz-email"
              className="block text-sm font-medium text-slate-800 mb-1"
            >
              Business Email
            </label>
            <input
              id="biz-email"
              type="email"
              value={form.businessEmail}
              onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="biz-phone"
              className="block text-sm font-medium text-slate-800 mb-1"
            >
              Phone Number
            </label>
            <input
              id="biz-phone"
              type="text"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="biz-currency"
                className="block text-sm font-medium text-slate-800 mb-1"
              >
                Currency
              </label>
              <select
                id="biz-currency"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-emerald-600 focus:outline-none"
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="biz-validity"
                className="block text-sm font-medium text-slate-800 mb-1"
              >
                Validity (Days)
              </label>
              <input
                id="biz-validity"
                type="number"
                min="1"
                max="365"
                value={form.validityDays}
                onChange={(e) =>
                  setForm({
                    ...form,
                    validityDays: Math.max(1, Number(e.target.value) || 14),
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="biz-address"
            className="block text-sm font-medium text-slate-800 mb-1"
          >
            Business Address
          </label>
          <input
            id="biz-address"
            type="text"
            value={form.businessAddress}
            onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="biz-terms"
            className="block text-sm font-medium text-slate-800 mb-1"
          >
            Payment Terms
          </label>
          <textarea
            id="biz-terms"
            rows={3}
            value={form.paymentTerms}
            onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Save Business Settings
          </button>
        </div>
      </form>
    </div>
  );
};
