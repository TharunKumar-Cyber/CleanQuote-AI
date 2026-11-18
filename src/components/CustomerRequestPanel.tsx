import React from 'react';
import { Sparkles, AlertTriangle, Loader2, Eraser, CheckCircle2 } from 'lucide-react';
import { SAMPLE_REQUESTS } from '../data/sampleRequests';

interface CustomerRequestPanelProps {
  message: string;
  onChangeMessage: (value: string) => void;
  onExtract: () => void;
  onClear: () => void;
  isLoading: boolean;
  error: string | null;
  isSetupError: boolean;
  remainingCredits: number;
  hasExtracted: boolean;
  validationWarning: string | null;
}

export const CustomerRequestPanel: React.FC<CustomerRequestPanelProps> = ({
  message,
  onChangeMessage,
  onExtract,
  onClear,
  isLoading,
  error,
  isSetupError,
  remainingCredits,
  hasExtracted,
  validationWarning,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            1. Customer Request
          </h2>
          <p className="text-sm text-slate-500">
            Paste an email, SMS, or contact-form message from your customer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Sample:</span>
          {SAMPLE_REQUESTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isLoading}
              onClick={() => onChangeMessage(sample.message)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="customer-request-textarea" className="sr-only">
        Customer message
      </label>
      <textarea
        id="customer-request-textarea"
        rows={6}
        value={message}
        onChange={(e) => onChangeMessage(e.target.value)}
        placeholder="Example: Hi! Looking for a deep clean for our 3 bedroom, 2 bath home (~2,000 sq ft) next Friday. Please include inside the oven..."
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
      />

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
          <span>{message.trim().length} / 6,000 characters</span>
          {hasExtracted && !error && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              AI extraction complete
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {message.trim().length > 0 && (
            <button
              type="button"
              onClick={onClear}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
            >
              <Eraser className="w-4 h-4" />
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onExtract}
            disabled={isLoading || remainingCredits <= 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting Details...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Job Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helpful Error / Secrets Setup Banner */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {isSetupError ? 'Gemini API Key Setup Required' : 'Extraction Issue'}
              </p>
              <p className="mt-1 text-red-800">{error}</p>
              {isSetupError && (
                <ol className="mt-2 list-decimal list-inside space-y-1 text-xs text-red-800">
                  <li>
                    Open your environment Secrets panel (<strong>Settings &gt; Secrets</strong> or{' '}
                    <strong>Replit Tools &gt; Secrets</strong>).
                  </li>
                  <li>
                    Add a secret named{' '}
                    <code className="font-mono bg-red-100 px-1 rounded">GEMINI_API_KEY</code> with
                    your Gemini API key.
                  </li>
                  <li>Restart the server and click &ldquo;Extract Job Details&rdquo; again.</li>
                </ol>
              )}
            </div>
          </div>
        </div>
      )}

      {validationWarning && !error && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Parser note: </span>
            {validationWarning}
          </div>
        </div>
      )}
    </section>
  );
};
