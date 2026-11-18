import React, { useState } from 'react';
import { Check, Info, Lock, RotateCcw, X } from 'lucide-react';
import { PLANS } from '../data/plans';
import type { CreditState, PlanDefinition } from '../types/quote';

interface PlansCreditsViewProps {
  credits: CreditState;
  onResetFreeDemo: () => void;
}

export const PlansCreditsView: React.FC<PlansCreditsViewProps> = ({
  credits,
  onResetFreeDemo,
}) => {
  const [selectedPaidPlan, setSelectedPaidPlan] = useState<PlanDefinition | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Current Balance Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-emerald-700 mb-1">
            Local MVP Demo Credit System
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900">Plans &amp; Credits</h1>
          <div className="text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
            <span>
              Plan: <strong className="text-slate-900">{credits.planName}</strong>
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>
              Extractions used: <strong className="text-slate-900">{credits.totalUsed}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 tabular-nums">
            <div className="text-xs font-medium text-emerald-800">Remaining Credits</div>
            <div className="font-display text-2xl font-bold text-emerald-700">
              {credits.remainingCredits}
            </div>
          </div>

          <button
            type="button"
            onClick={onResetFreeDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset 2 Free Demo Credits
          </button>
        </div>
      </div>

      {/* Honest Payment Separation Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-8 flex items-start gap-3 text-sm text-slate-700">
        <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-900">MVP Credit &amp; Payment Separation</p>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            This MVP includes a working local demo credit counter (2 Free extractions stored in your
            browser). Paid packs below represent proposed pricing and are separated from payment
            processing—paid credits are never granted without verified server-side payment
            confirmation.
          </p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-6 flex flex-col justify-between bg-white ${
              plan.highlighted
                ? 'border-emerald-600 ring-1 ring-emerald-600'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-slate-900">{plan.name}</h2>
                {plan.id === 'free' && (
                  <span className="text-xs font-semibold text-emerald-700">Active Demo</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{plan.audience}</p>

              <div className="mt-4 flex items-baseline gap-1.5 tabular-nums">
                <span className="font-display text-3xl font-bold text-slate-900">
                  {plan.priceLabel}
                </span>
                <span className="text-sm text-slate-500">/ {plan.credits} quotations</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>

              <ul className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.id === 'free' ? (
              <div className="mt-6 w-full py-2.5 px-4 rounded-lg text-center text-sm font-semibold bg-slate-100 text-slate-600">
                Included in Demo
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedPaidPlan(plan)}
                className="mt-6 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" />
                Select {plan.name} ({plan.priceLabel})
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Transparent Payment Verification Modal */}
      {selectedPaidPlan && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
        >
          <div className="max-w-md w-full rounded-xl bg-white border border-slate-200 p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="payment-modal-title"
                  className="font-display text-lg font-semibold text-slate-900"
                >
                  Payment Verification Required
                </h3>
                <p className="text-sm text-slate-500 mt-0.5 tabular-nums">
                  Selected: {selectedPaidPlan.name} ({selectedPaidPlan.priceLabel} for{' '}
                  {selectedPaidPlan.credits} quotations)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPaidPlan(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-600 space-y-2.5 leading-relaxed">
              <p>
                Live payment checkout is not connected in this MVP. CleanQuote AI never marks a
                plan as paid or grants paid credits without verified server-side payment
                confirmation.
              </p>
              <p className="text-xs text-slate-500">
                To accept live purchases, connect a payment provider (such as Stripe Checkout) with
                server-side webhook signature verification and database-backed user accounts.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPaidPlan(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
