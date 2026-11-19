# CleanQuote AI — Payment and Pricing Design

**Version:** 1.0 · **Status:** Approved planning baseline · **Date:** 2026-11-19

## 1. Goals
Provide transparent AUD estimates and reliable marketplace money flows for an Australia-only MVP. Pricing is deterministic and server-authoritative. Payment provider and precise authorization/capture timing remain open pending Australian marketplace eligibility, fee, legal, and operational validation.

## 2. Quote calculation
Inputs may include service type, property type/size, bedrooms/bathrooms, condition, included tasks, extras, access constraints, location/city, and requested duration/window. Server validates supported combinations and calculates base service, extras, adjustments, taxes/fees, discounts if authorized, and total. Return a clear itemized breakdown and estimate/duration range.

AI may extract suggested structured details from customer text. Customer can correct those details. AI must not invent missing values, choose hidden prices, or be the source of truth for the payable amount. Missing critical details should trigger clarification or a clearly qualified estimate.

## 3. Pricing configuration
Use versioned pricing rules with effective dates and audit history. Scope includes city/service availability, property eligibility, base prices, task/extra pricing, duration estimates, minimums/limits, and tax/fee treatment. Admin changes must not rewrite existing confirmed booking snapshots. Prevent unauthorized client-side price manipulation by recalculating on the server at quote and confirmation.

## 4. Money and currency
MVP currency is AUD. Store amounts as integer minor units (for example AUD 125.50 as 12550) and currency code. Never use floating-point values as the financial source of truth. Persist quote/booking snapshots of line items, tax, fees, discounts, total, currency, pricing-rule version, and relevant terms. Format currency only at presentation layer.

## 5. Marketplace payment provider evaluation
Stripe Connect is a candidate, not a selected provider. Validate:
- Australian platform account and business eligibility.
- Cleaner connected-account onboarding and verification requirements.
- Supported payment methods and customer authentication.
- Platform fees/commission and connected-account fees.
- Authorization/capture options and timing.
- Refunds, partial refunds, disputes, chargebacks, and negative balances.
- Cleaner payout schedule, failed payouts, reconciliation, and tax reporting responsibilities.
- Provider terms, local regulatory obligations, and support model.
Do not collect or store raw card details or bank credentials. Use provider-hosted/approved flows.

## 6. Proposed financial records
Separate payment intent/attempt, authorization, capture, refund, provider webhook, commission, and payout records. Keep immutable transaction references and idempotency keys. Verify webhook signatures; safely handle duplicate and out-of-order events. Reconcile internal ledger records with provider reports. Booking state, payment state, and payout state remain independent.

## 7. Commission and cleaner earnings
Define platform commission and cleaner earnings in a transparent pricing schedule before pilot. Show cleaner expected earnings before acceptance, subject to disclosed adjustments. Record calculation basis, rule version, gross amount, platform fee, taxes/other deductions where applicable, and net payable. Final percentages and tax treatment are not approved in this baseline.

## 8. Refund and cancellation handling
Refund amount and eligibility depend on approved cancellation policy, service progress, payment state, provider capability, and applicable law. Refund requests are idempotent and tracked through pending/succeeded/failed states. Never mark a refund complete based only on a client action. Cancellation fee windows and cleaner travel compensation require legal and operational approval before launch.

## 9. Security and compliance
Use least-privilege provider credentials, server-side secret storage, webhook signature verification, idempotency, audit logging, access controls, and reconciliation. Minimize retained payment data. Obtain professional advice on Australian consumer law, tax/GST, worker classification, payment-services obligations, and relevant platform/provider terms.

## 10. Launch gate and unresolved decisions
Before live payments: choose provider after documented evaluation; validate account eligibility; approve commission and tax treatment; approve cancellation/refund policy; implement sandbox and webhook tests; complete reconciliation and failure drills; document customer/cleaner disclosures and support processes. Until then, do not imply that live marketplace payments or payouts are available.
