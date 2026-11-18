import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Check, Sparkles } from 'lucide-react';
import { PLANS } from '../data/plans';
import { Logo } from './Logo';

interface LandingPageProps {
  onStartQuote: () => void;
  onViewPlans: () => void;
}

const FAQS = [
  {
    question: 'Does the AI invent prices or guess customer details?',
    answer:
      'No. CleanQuote AI extracts only the facts explicitly written in the customer message and flags missing details. You control and approve every line item, quantity, unit price, tax, and discount.',
  },
  {
    question: 'What kind of customer messages can I paste?',
    answer:
      'You can paste emails, text messages, website contact form submissions, WhatsApp inquiries, or quick notes from a phone call.',
  },
  {
    question: 'How does PDF quotation export work?',
    answer:
      'PDFs are generated directly in your browser using your saved business logo, contact details, quotation number, itemized pricing, tax, discount, and terms—ready to email or message to your client immediately.',
  },
  {
    question: 'What happens when a customer forgets important property details?',
    answer:
      'CleanQuote AI lists missing details (such as bathroom count, square footage, or requested service date) in a clarification checklist so you know exactly what to ask before locking in the quote.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartQuote, onViewPlans }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroImageError, setHeroImageError] = useState(false);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-medium text-emerald-700 mb-3">
                Built for independent house-cleaning businesses
              </p>

              <h1
                className="font-display font-bold tracking-tight text-slate-900 leading-[1.12] max-w-xl"
                style={{ fontSize: 'clamp(2.25rem, 3.6vw, 3.35rem)', textWrap: 'balance' }}
              >
                Turn Customer Requests Into Professional Quotes in Seconds.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Paste unstructured emails, texts, or inquiry messages. CleanQuote AI extracts job
                details, flags missing property info, lets you enter your own rates, and exports a
                client-ready PDF quotation.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onStartQuote}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-base hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  Create Your First Quote
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 transition-colors whitespace-nowrap shrink-0"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span>Owner-controlled rates</span>
                <span aria-hidden="true">&middot;</span>
                <span>Browser-side PDF export</span>
                <span aria-hidden="true">&middot;</span>
                <span>2 free quotations included</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-xl border border-slate-200 bg-slate-100 overflow-hidden">
                {!heroImageError ? (
                  <img
                    src="/src/assets/images/hero_clean_interior_1794986988270.jpg"
                    alt="Bright sunlit modern home interior after a thorough residential cleaning"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center p-8 text-center bg-slate-100 text-slate-600">
                    <Sparkles className="w-8 h-8 text-emerald-600 mb-3" />
                    <p className="font-display font-semibold text-slate-900">
                      Structured Cleaning Quotations
                    </p>
                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                      Extract customer scope, verify missing rooms, and export branded PDFs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Move from a scattered customer inquiry to an itemized, branded quotation PDF in three
              clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="font-mono text-xs font-semibold text-emerald-700 mb-3">01</p>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Paste Customer Request
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Drop in any email, text message, or web form inquiry. AI extracts contact info,
                service type, bedrooms, bathrooms, add-ons, and missing details.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="font-mono text-xs font-semibold text-emerald-700 mb-3">02</p>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Verify Scope &amp; Enter Rates
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Edit any extracted field, check missing information flags, draft service line items,
                and set your own unit prices, discounts, and tax rate.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="font-mono text-xs font-semibold text-emerald-700 mb-3">03</p>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Download Branded PDF
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Export a clean PDF quotation with your business logo, address, quote number,
                itemized subtotal, final amount, and payment terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Overview — Asymmetric Bento Layout */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Focused Quoting Tools Without the Clutter
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              No bloated calendars, staff trackers, or accounting suites—just reliable job scoping
              and clean PDF quotations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-slate-900">
                  Owner-Controlled Pricing &amp; Accurate Math
                </h3>
                <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  CleanQuote AI never guesses your hourly rate or invents final prices. You draft
                  line items from the extracted scope, enter exact quantities and unit prices, and
                  apply optional fixed or percentage discounts plus sales tax.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                <span>Editable line-item descriptions</span>
                <span>Fixed or % discount support</span>
                <span>Multi-currency formatting</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Missing-Info Detection
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                When a prospect forgets their bathroom count, square footage, or preferred date,
                CleanQuote AI flags each gap in a clarification checklist so nothing surprises your
                team on cleaning day.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Saved Business Branding
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Configure your company name, contact info, logo, currency, quotation validity
                period, and payment terms once—every exported PDF applies them automatically.
              </p>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold text-slate-900">
                Structured Fact Extraction, Zero Fabrication
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                If a customer does not share their name, email, or property size, those fields stay
                blank for you to confirm—never auto-filled with placeholder guesses. Every
                extracted field remains directly editable before you export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Simple Quotation Credit Packs
            </h2>
            <p className="mt-3 text-slate-600">
              Start free with 2 AI extractions. Upgrade only when you need higher monthly quotation
              volume.
            </p>
          </div>

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
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      {plan.name}
                    </h3>
                    {plan.highlighted && (
                      <span className="text-xs font-semibold text-emerald-700">Most Popular</span>
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

                <button
                  type="button"
                  onClick={plan.id === 'free' ? onStartQuote : onViewPlans}
                  className={`mt-6 w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                    plan.highlighted
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {plan.id === 'free' ? 'Start Free' : 'View Plan Details'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-8">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white overflow-hidden">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <Logo size="sm" />
            <p className="mt-2 text-xs text-slate-500">
              AI-assisted service quotation generator for independent house-cleaning businesses.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <button
              type="button"
              onClick={onStartQuote}
              className="hover:text-slate-900 transition-colors"
            >
              Quote Workspace
            </button>
            <button
              type="button"
              onClick={onViewPlans}
              className="hover:text-slate-900 transition-colors"
            >
              Plans &amp; Credits
            </button>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
