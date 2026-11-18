# CleanQuote AI — Phase 0 Repository Audit

**Status:** Initial read-only audit  
**Audited branch:** `main`  
**Audited commit:** `240eb9d46ebe6d0c86f7e429164b46c1009649f1`  
**Product direction:** Australia-first cleaning marketplace; Sydney pilot; one cleaner per booking in MVP.

## 1. Purpose and safety boundary

This document records what was verified in the existing repository before marketplace implementation. The audit is not a database migration plan and does not authorize destructive changes.

The existing AI quotation workflow must be preserved and evolved. No existing application code, database, production environment, credentials, or customer data was modified during this audit.

## 2. Verified current stack

- Frontend: React 19, TypeScript, Vite 8, Tailwind CSS 4.
- Backend: Express 4 with TypeScript executed through `tsx`.
- AI extraction: Google GenAI SDK in `server/gemini.ts`.
- PDF generation: jsPDF and jsPDF AutoTable in the browser.
- Existing server entry: `server.ts`.
- Existing frontend entry/application shell: `src/App.tsx`.
- Current development command: `npm run dev`.
- Current build command: `npm run build`.
- Current TypeScript check: `npm run lint` (runs `tsc --noEmit`).
- No dedicated automated test command is declared in the inspected `package.json`.

## 3. Existing features to preserve

- Landing page and quotation workspace.
- AI extraction of customer name/contact, service address, service type, bedroom/bathroom counts, property size, requested date, add-ons, special instructions, and missing information.
- Editable extracted details.
- Manually controlled line items, quantities, discounts, and tax calculations.
- Browser-generated quotation PDF.
- Business profile/settings and logo.
- Existing demo credit display and plan presentation, clearly treated as a local demonstration rather than production billing.

Key implementation files inspected:

- `src/App.tsx`
- `src/types/quote.ts`
- `src/utils/storage.ts`
- `src/utils/calculations.ts`
- `src/utils/pdfGenerator.ts`
- `src/components/QuoteWorkspace.tsx`
- `src/components/CustomerRequestPanel.tsx`
- `src/components/ExtractedInfoPanel.tsx`
- `src/components/PricingEditorPanel.tsx`
- `src/components/BusinessSettingsView.tsx`
- `src/components/PlansCreditsView.tsx`
- `src/data/plans.ts`
- `server.ts`
- `server/gemini.ts`

## 4. Confirmed implementation gaps

| Capability | Audit finding |
|---|---|
| Customer identity and authentication | No implementation found in inspected application entry points or server routes. |
| Cleaner identity, onboarding and verification | No implementation found in inspected application entry points or server routes. |
| Marketplace database and migrations | No database client, migration directory, or database configuration was found in the inspected files. Must verify full repository and environment before choosing a migration approach. |
| Customer saved addresses | Existing extracted service address is a quotation field; it is not a saved-address/account feature. |
| Service catalogue and authoritative marketplace pricing | Existing quotation pricing is manually edited in the browser. No server-side marketplace pricing engine was found in inspected files. |
| Booking, scheduling and booking history | No implementation found in inspected application entry points or server routes. |
| Cleaner matching and atomic job acceptance | No implementation found. |
| Map/geocoding and location privacy | No implementation found. |
| Marketplace payment, commission, refunds and payouts | No marketplace payment integration found in inspected files. |
| Admin operations and support | No implementation found. |
| Persistent quotation history | The inspected workspace creates a quote in component state and exports a PDF; no server-side quotation persistence was found in inspected files. |
| Automated tests | No test script or test framework is declared in the inspected package manifest. |

These are findings from the inspected code, not a claim that no related service or environment exists outside the repository.

## 5. Existing local-only behaviour and migration concerns

### Browser storage

`src/utils/storage.ts` stores business settings and demo credits in browser `localStorage`.

- Business settings use key `cleanquote_business_settings_v1`.
- Demo credits use key `cleanquote_demo_credits_v1`.
- The initial business profile contains a sample Austin, Texas address and USD currency.
- The demo credit reset is a local demonstration action.

This state cannot become authoritative marketplace account, payment, or credit data. A future migration must preserve useful user-entered business profile information where feasible, but must not trust browser values for balances, roles, booking prices, or payment status.

### Quotation calculations

`src/utils/calculations.ts` calculates line totals, discounts, tax and totals in the browser using JavaScript numbers. Keep this functionality for the quotation editor, but marketplace booking prices must be recalculated and validated by the server using integer minor currency units and a versioned pricing snapshot.

### AI extraction

`server.ts` currently exposes:
- `GET /api/health`
- `POST /api/extract-quote`

The extraction route validates message length and calls the Gemini extraction module. The extraction prompt explicitly says not to invent customer facts or prices. Preserve that boundary. AI output must remain untrusted input that users review; it must not authorize a booking, determine final price, or bypass service eligibility rules.

### Server and environment

- Express JSON request size is limited to 1 MB.
- The Gemini API key is read from server environment variables.
- `.gitignore` excludes `.env*` while allowing `.env.example`.
- The README still contains the original AI Studio starter instructions and should be replaced with project-specific setup documentation during foundation work.
- The Vite configuration contains custom asset-copy logic and environment-dependent HMR behaviour. Do not remove it without verifying its purpose and build output.

## 6. Australia-first configuration changes required

Before public launch, the application needs a consistent Australian launch configuration:

- Launch country: Australia (`AU`).
- Initial launch city: Sydney, NSW.
- Customer-facing currency: AUD.
- Australian phone/address formatting and local timezone handling.
- Australian service catalogue, availability rules, and pricing configuration.
- Do not leave sample US defaults in customer-facing onboarding or quotation templates.

This does not mean replacing all existing multi-currency quotation support unless product decisions later require it. Marketplace booking currency must be explicit and server-controlled for the Sydney launch.

## 7. Architecture direction for implementation

Subject to provider and deployment decisions:

- Keep the existing React/Vite frontend and Express/TypeScript backend initially.
- Use a modular monolith for the MVP, not microservices.
- Introduce a persistent PostgreSQL data layer and PostGIS for nearby-cleaner eligibility queries.
- Keep booking, assignment, offers, payments, pricing, notifications, identity, and audit logic in explicit backend modules.
- Make job acceptance atomic so only one eligible cleaner can win a booking.
- Separate booking lifecycle state from payment state.
- Store monetary values as integer minor units and preserve immutable price snapshots.
- Keep verification documents private and customer street addresses hidden from cleaners until assignment.
- Preserve existing quotation extraction and PDF export as distinct reusable product capabilities.

PostGIS supports geographic data and GiST spatial indexing; the implementation should use appropriate spatial predicates and indexes rather than scanning every cleaner location. See the official PostGIS spatial-index guidance: https://postgis.net/documentation/faq/spatial-indexes/

## 8. Decisions and access needed before dependent implementation

No additional account connection is required to complete this repository audit.

Before implementing and testing the persistent database layer, the owner must choose and connect the selected PostgreSQL hosting project or provide a local development database. Do not paste database passwords, service-role keys, payment secrets, or Gemini keys into chat or GitHub.

Before enabling real marketplace transactions, separately select and connect an eligible payment provider account after validating Australian marketplace onboarding, cleaner payouts, fees, refunds and compliance.

A maps provider account/key is needed only when the maps/geocoding phase is reached. Use restricted keys and separate development/production credentials.

## 9. Phase 0 exit checklist

- [x] Product documentation approved by owner.
- [x] Existing GitHub repository and default branch identified.
- [x] Initial code paths and current stack inspected.
- [x] Existing quotation workflow and local-only state identified.
- [x] Initial gaps and migration risks documented.
- [ ] Owner selects PostgreSQL hosting/development environment.
- [ ] Full local environment and build/test baseline verified.
- [ ] Database backup and restoration approach documented before any schema changes.
- [ ] Provider decisions recorded before integration.
- [ ] Phase 1 implementation plan is mapped to the actual repository.

## 10. Non-negotiable implementation rules

1. No destructive schema or data changes without a verified backup and reviewed migration.
2. No direct commits to `main` for implementation work; use a feature branch and reviewable pull requests.
3. Preserve the existing quotation and PDF workflow.
4. Never commit secrets or ask the owner to paste secrets into chat.
5. Do not enable live payments or public bookings until security, legal, operational, and end-to-end checks pass.
6. Complete one roadmap phase at a time with build/test evidence and a commit.
