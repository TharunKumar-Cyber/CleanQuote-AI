# CleanQuote AI — System Architecture

**Version:** 1.0 · **Status:** Approved planning baseline · **Date:** 2026-11-19

## 1. Architecture goals
Deliver an Australia-first, single-cleaner marketplace while preserving the existing quotation capability. Prefer a modular monolith over premature microservices. Enforce trust boundaries on the server, isolate payment and location concerns, and keep the design extensible for later team bookings without implementing them now.

## 2. Current starting point
The repository currently contains a React 19 + TypeScript + Vite frontend and an Express + TypeScript backend, with Gemini-based extraction, client-side quotation calculations/PDF generation, and browser-local business settings/demo credits. It does not yet provide the marketplace's authentication, booking/matching, persistent marketplace database, payment, cleaner verification, or admin operations. Existing app behaviour must be inspected and preserved deliberately during migration.

## 3. Proposed logical components
**Web client:** customer, cleaner, and admin experiences; responsive web/PWA initially. Treat all browser values as untrusted. Do not put privileged keys or provider secrets in client bundles.

**API/application server:** authentication/session handling, authorization, customer/address, catalogue, quotation/pricing, cleaner onboarding, availability, matching, booking lifecycle, payment orchestration, notifications, support/admin, and audit modules. Modules may share one deployment initially but should have explicit boundaries.

**PostgreSQL/Supabase:** authoritative transactional data, constraints, indexes, migrations, and RLS where client access is exposed. Use PostGIS for geographic queries after verifying extension availability and enabling it deliberately. Keep privileged operations behind trusted server code.

**Realtime:** WebSocket/Supabase Realtime or another evaluated mechanism for offer/status/location updates. Authorization must be checked for every subscription and message. Do not broadcast sensitive address or document data.

**External providers:** map/geocoding/routing provider, marketplace-capable payment provider, email/web-push delivery, and private object storage. No provider is selected by this document.

## 4. High-level request flow
1. Customer submits service scope, address reference, and preferred time.
2. Server validates user ownership, service eligibility, and required fields.
3. Pricing module calculates an estimate using active versioned rules; AI extraction may suggest structured fields but never determines the price.
4. Customer confirms; server snapshots scope and price and creates booking/payment workflow records.
5. Matching selects eligible approved cleaners and creates expiring offers.
6. First valid acceptance commits atomically; competing offers close.
7. Assigned cleaner receives the full address and necessary access details; customer receives assignment information.
8. Booking events and permitted live location updates are delivered to authorized participants.
9. Completion triggers payment settlement/payout workflow according to provider state and approved business rules.

## 5. Matching and concurrency
Eligibility requires approved and active cleaner, online status, matching service skill, service-area coverage, availability for the slot, and no conflicting assignment. Offers have expiry and attempt history. Acceptance must use a database transaction or conditional update that verifies offer validity, cleaner eligibility, availability, and absence of another active assignment. Enforce one active assignment in the database, not only in UI logic. Close competing offers after a winner is committed.

## 6. Location privacy
Use approximate location for pre-assignment discovery. Reveal exact service address and access instructions only to the assigned cleaner. Customer access to cleaner location is limited to the active relevant booking and disclosed purpose. Collect location only with clear consent and stop when the purpose ends. Never track offline cleaners. Assess PWA background tracking limitations and do not promise continuous tracking where browser/OS behaviour cannot support it.

## 7. Security boundaries
- Authentication establishes identity; server authorization establishes permission.
- Never trust client-supplied role, price, payment status, cleaner approval, assignment, or ownership.
- Use least privilege, server-side validation, parameterized queries, secure session/token handling, rate limits, and audit logs.
- Supabase service-role/secret keys remain server-side only.
- Enable RLS on exposed tables and test positive and negative ownership cases.
- Verification files use private buckets and short-lived authorized access.
- Payment webhooks require signature verification and idempotency.
- Sensitive actions and state changes are logged without unnecessarily copying secrets or personal data.

## 8. Deployment and environments
Maintain separate local/development, staging, and production configuration and projects. Use environment-variable validation and secret management. Production data must not be copied into development without approved anonymization. Establish backups, restore tests, monitoring, error tracking, and deployment rollback before pilot.

## 9. Proposed technology direction (not final vendor commitments)
- Frontend: existing React + TypeScript + Vite.
- Backend: existing Express + TypeScript, modularized.
- Database: Supabase-managed PostgreSQL; PostGIS candidate for spatial queries.
- Realtime: evaluate Supabase Realtime vs application WebSockets against authorization and delivery requirements.
- Maps: compare Google Maps Platform and alternatives for Australian coverage, address quality, routing, pricing, and terms.
- Payments: Stripe Connect is a candidate only; verify Australian platform eligibility, connected-account onboarding, payouts, refunds, fees, and regulatory obligations before decision.
- Notifications: email and web push initially.
- Storage: private object storage for verification documents.
- Observability: structured logs, metrics, traces/error reporting, and audit records.

## 10. Migration strategy
Do not discard the quotation product. Inventory existing data shapes, API contracts, localStorage usage, PDF outputs, and Gemini extraction behaviour. Decide what data needs account-backed persistence and how existing users' local data is handled. Introduce marketplace modules incrementally; avoid destructive schema changes and maintain compatibility until migration is tested.

## 11. Open decisions
Provider selection, auth/session strategy details, realtime choice, map costs, payment authorization/capture timing, hosting/deployment, email provider, retention schedule, and final service pricing remain open pending research and proof-of-concept. This document is a logical architecture baseline, not a deployment topology or final vendor contract.
