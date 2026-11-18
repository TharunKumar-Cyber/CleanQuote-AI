import React, { useState } from 'react';
import { FileDown, AlertCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import type {
  BusinessSettings,
  CreditState,
  ExtractedJobDetails,
  LineItem,
  PricingState,
} from '../types/quote';
import { calculateQuoteTotals, formatMoney } from '../utils/calculations';
import { generateQuotationPdf } from '../utils/pdfGenerator';
import { CustomerRequestPanel } from './CustomerRequestPanel';
import { ExtractedInfoPanel } from './ExtractedInfoPanel';
import { PricingEditorPanel } from './PricingEditorPanel';

interface QuoteWorkspaceProps {
  businessSettings: BusinessSettings;
  credits: CreditState;
  onConsumeCredit: () => void;
  onGoToPlans: () => void;
  onGoToSettings: () => void;
}

const EMPTY_EXTRACTED: ExtractedJobDetails = {
  isValidCleaningRequest: true,
  validationMessage: '',
  customerName: '',
  customerEmail: '',
  serviceAddress: '',
  serviceType: '',
  bedrooms: '',
  bathrooms: '',
  propertySize: '',
  additionalServices: [],
  requestedDate: '',
  specialInstructions: '',
  missingInformation: [],
};

const INITIAL_PRICING: PricingState = {
  lineItems: [
    {
      id: 'initial-1',
      description: 'Residential Cleaning Service',
      quantity: 1,
      unitPrice: 0,
    },
  ],
  discountType: 'fixed',
  discountValue: 0,
  taxRatePercent: 0,
};

function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `CQ-${year}-${suffix}`;
}

export const QuoteWorkspace: React.FC<QuoteWorkspaceProps> = ({
  businessSettings,
  credits,
  onConsumeCredit,
  onGoToPlans,
  onGoToSettings,
}) => {
  const [customerMessage, setCustomerMessage] = useState('');
  const [extracted, setExtracted] = useState<ExtractedJobDetails>(EMPTY_EXTRACTED);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [pricing, setPricing] = useState<PricingState>(INITIAL_PRICING);
  const [quotationNumber, setQuotationNumber] = useState<string>(() => generateQuoteNumber());
  const [issueDate, setIssueDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSetupError, setIsSetupError] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const totals = calculateQuoteTotals(pricing);

  const handleExtract = async () => {
    setError(null);
    setIsSetupError(false);
    setPdfFeedback(null);

    if (credits.remainingCredits <= 0) {
      setError(
        'You have 0 demo extraction credits remaining. Open Plans & Credits to reset your free demo quota.'
      );
      return;
    }

    const trimmed = customerMessage.trim();
    if (!trimmed) {
      setError('Please paste a customer message before clicking Extract Job Details.');
      return;
    }

    if (trimmed.length < 10) {
      setError(
        'Please provide a slightly longer customer message so the AI can extract job details.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/extract-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const payload = (await response.json()) as {
        code?: string;
        error?: string;
        data?: ExtractedJobDetails;
      };

      if (!response.ok || !payload.data) {
        setIsSetupError(payload.code === 'GEMINI_NOT_CONFIGURED');
        setError(payload.error || 'Failed to extract job details.');
        return;
      }

      setExtracted(payload.data);
      setHasExtracted(true);
      onConsumeCredit();
    } catch {
      setError('Could not reach the backend API. Ensure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftLineItemsFromScope = () => {
    const drafted: LineItem[] = [];
    const roomSummary = [
      extracted.bedrooms ? `${extracted.bedrooms} Bed` : '',
      extracted.bathrooms ? `${extracted.bathrooms} Bath` : '',
    ]
      .filter(Boolean)
      .join(' / ');

    const baseDescParts = [
      extracted.serviceType || 'Residential Cleaning Service',
      roomSummary ? `(${roomSummary})` : '',
      extracted.propertySize ? `— ${extracted.propertySize}` : '',
    ].filter(Boolean);

    drafted.push({
      id: `draft-base-${Date.now()}`,
      description: baseDescParts.join(' '),
      quantity: 1,
      unitPrice: 0,
    });

    extracted.additionalServices.forEach((addon, idx) => {
      drafted.push({
        id: `draft-addon-${Date.now()}-${idx}`,
        description: `Add-on: ${addon}`,
        quantity: 1,
        unitPrice: 0,
      });
    });

    setPricing((prev) => ({
      ...prev,
      lineItems: drafted,
    }));
    setPdfFeedback(null);
  };

  const handleResetWorkspace = () => {
    setCustomerMessage('');
    setExtracted(EMPTY_EXTRACTED);
    setHasExtracted(false);
    setPricing(INITIAL_PRICING);
    setQuotationNumber(generateQuoteNumber());
    setIssueDate(new Date().toISOString().slice(0, 10));
    setError(null);
    setIsSetupError(false);
    setPdfFeedback(null);
  };

  const handleDownloadPdf = () => {
    setPdfFeedback(null);

    if (!quotationNumber.trim()) {
      setPdfFeedback({
        type: 'error',
        message: 'Quotation number is required before exporting PDF.',
      });
      return;
    }

    if (pricing.lineItems.length === 0) {
      setPdfFeedback({
        type: 'error',
        message: 'Add at least one service line item before generating a PDF.',
      });
      return;
    }

    const hasEmptyDescription = pricing.lineItems.some((item) => !item.description.trim());
    if (hasEmptyDescription) {
      setPdfFeedback({
        type: 'error',
        message: 'Every line item must have a service description.',
      });
      return;
    }

    try {
      generateQuotationPdf({
        quotationNumber: quotationNumber.trim(),
        issueDate,
        business: businessSettings,
        extracted,
        pricing,
      });
      setPdfFeedback({
        type: 'success',
        message: `Downloaded ${quotationNumber.trim()}.pdf`,
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfFeedback({
        type: 'error',
        message: 'Could not generate PDF in this browser. Please check your line items and logo.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Quotation Workspace</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-600 tabular-nums">
            <span>
              Remaining credits:{' '}
              <strong
                className={
                  credits.remainingCredits > 0 ? 'text-emerald-700' : 'text-amber-700'
                }
              >
                {credits.remainingCredits}
              </strong>
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{credits.planName}</span>
            <span aria-hidden="true">&middot;</span>
            <button
              type="button"
              onClick={onGoToPlans}
              className="text-emerald-700 hover:underline font-medium"
            >
              Manage credits
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetWorkspace}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            New Quote
          </button>
        </div>
      </div>

      {/* Zero Credits Notice */}
      {credits.remainingCredits <= 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2.5 text-sm text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No AI extraction credits remaining</p>
              <p className="text-amber-800">
                You can still edit fields, build pricing, and export PDFs manually, or reset your
                2 free demo credits.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToPlans}
            className="px-4 py-2 rounded-lg bg-amber-900 text-white text-xs font-semibold hover:bg-amber-800 shrink-0 whitespace-nowrap"
          >
            Open Plans &amp; Credits
          </button>
        </div>
      )}

      {/* Main 2-column responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <CustomerRequestPanel
            message={customerMessage}
            onChangeMessage={setCustomerMessage}
            onExtract={handleExtract}
            onClear={() => {
              setCustomerMessage('');
              setError(null);
            }}
            isLoading={isLoading}
            error={error}
            isSetupError={isSetupError}
            remainingCredits={credits.remainingCredits}
            hasExtracted={hasExtracted}
            validationWarning={
              hasExtracted && (!extracted.isValidCleaningRequest || extracted.validationMessage)
                ? extracted.validationMessage ||
                  'This message may not be a standard cleaning request. Please review extracted fields.'
                : null
            }
          />

          <ExtractedInfoPanel
            data={extracted}
            onChange={setExtracted}
            onGenerateLineItemsFromScope={handleDraftLineItemsFromScope}
          />

          <PricingEditorPanel
            pricing={pricing}
            currency={businessSettings.currency}
            onChange={setPricing}
          />
        </div>

        {/* Right Sticky Summary & PDF Export Card */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-slate-900 mb-4">
              PDF Quotation Summary
            </h2>

            <div className="space-y-3 mb-5">
              <div>
                <label
                  htmlFor="quote-number-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Quotation Number
                </label>
                <input
                  id="quote-number-input"
                  type="text"
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="issue-date-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Issue Date
                </label>
                <input
                  id="issue-date-input"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Business & Customer Snapshot */}
            <div className="rounded-lg bg-[#F8FAFC] border border-slate-200 p-4 space-y-3 text-xs text-slate-600 mb-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">From:</span>
                <button
                  type="button"
                  onClick={onGoToSettings}
                  className="text-emerald-700 hover:underline font-medium"
                >
                  Edit business info
                </button>
              </div>
              <div className="text-slate-800 font-medium">{businessSettings.businessName}</div>

              <div className="border-t border-slate-200 pt-2.5">
                <div className="font-semibold text-slate-900 mb-0.5">To:</div>
                <div className="text-slate-800">
                  {extracted.customerName || 'Valued Customer'}
                </div>
                <div>{extracted.customerEmail || 'No email provided'}</div>
                <div className="mt-1">
                  <span className="font-medium text-slate-700">Service Address: </span>
                  {extracted.serviceAddress || 'Not provided'}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2.5 space-y-1.5 tabular-nums">
                <div className="flex justify-between">
                  <span>Line Items</span>
                  <span className="font-medium text-slate-900">{pricing.lineItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    {formatMoney(totals.subtotal, businessSettings.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                  <span>Total Quote</span>
                  <span className="text-emerald-700">
                    {formatMoney(totals.finalTotal, businessSettings.currency)}
                  </span>
                </div>
              </div>
            </div>

            {pdfFeedback && (
              <div
                className={`mb-4 rounded-lg p-3 text-xs flex items-start gap-2 border ${
                  pdfFeedback.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {pdfFeedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{pdfFeedback.message}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Download PDF Quotation
            </button>

            <p className="mt-3 text-xs text-slate-500 text-center tabular-nums">
              Validity: {businessSettings.validityDays} days &middot; Currency:{' '}
              {businessSettings.currency}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
