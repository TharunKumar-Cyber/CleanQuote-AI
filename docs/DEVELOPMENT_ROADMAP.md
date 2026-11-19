# CleanQuote AI — Development Roadmap

**Version:** 1.0 · **Status:** Approved planning baseline · **Date:** 2026-11-19

## Delivery approach
Use gated phases. Each phase begins with a short design and risk review, then implementation, tests, documentation, and a demonstrable acceptance checklist. Keep changes on feature branches and merge to main only after review. Do not treat estimates as commitments until technical discovery and provider/legal checks are complete.

## Phase 0 — Product and technical foundation
- Preserve the approved product, architecture, database, lifecycle, payment, and security documents.
- Audit existing React/Vite/Express quotation app, APIs, dependencies, environment variables, build, and deployment assumptions.
- Confirm dedicated Supabase development project, region, access, backup posture, and Data API exposure choices.
- Identify migration strategy from existing quotation workflow; no destructive rewrite.
- Exit: reviewed baseline, risks/unknowns recorded, development environment reproducible. Current work: audit docs exist; seven baseline docs are being added; no marketplace schema or app feature work has begun.

## Phase 1 — Foundation and identity
- Establish environment separation, configuration validation, logging, error handling, and secure authentication.
- Define customer, cleaner, and admin roles with server-side authorization and account lifecycle.
- Add tests for authentication, session expiry, ownership, and privilege boundaries.
- Exit: secure account flows and role checks demonstrated.

## Phase 2 — Customer profile, address, and service catalogue
- Customer profile and saved addresses; Australian address handling.
- Catalogue, service tasks/extras, eligibility rules, and clear exclusions.
- Address privacy and validation.
- Exit: customer can maintain profile/address and browse enabled services.

## Phase 3 — Quotation and pricing engine
- Preserve existing AI extraction as an optional scope-assistance tool.
- Build server-authoritative, versioned AUD pricing and quote snapshots.
- Handle missing information, manual correction, estimate validity, and transparent inclusions/exclusions.
- Exit: repeatable price calculations and tests; AI cannot set final price.

## Phase 4 — Cleaner onboarding and verification
- Applications, documents, verification workflow, service skills, coverage, and availability.
- Private storage, access policies, expiry/reverification, admin review.
- Exit: only approved eligible cleaners can receive offers.

## Phase 5 — Booking and matching
- Booking creation, offer generation/expiry, eligibility checks, atomic first-acceptance, one active cleaner assignment.
- Handle no response, no eligible cleaner, offer races, and schedule conflicts.
- Exit: concurrency tests prove no double assignment.

## Phase 6 — Maps and location
- Evaluate map provider capabilities and Australian coverage/cost.
- Address autocomplete/geocoding, approximate pre-assignment location, precise post-assignment access, consented journey tracking.
- Exit: privacy-aware location flow with documented browser limitations.

## Phase 7 — Payments, commission, and payouts
- Select provider only after Australian marketplace/connected-account eligibility and commercial/legal review.
- Implement idempotent payment intents/transactions, webhooks, reconciliation, commission, refunds, and payout visibility.
- Exit: sandbox end-to-end flows and failure/replay tests pass.

## Phase 8 — Booking lifecycle, cancellations, reassignment
- Enforce booking/payment state separation and allowed transitions.
- Customer/cleaner cancellation, replacement search, reschedule, refunds, and evidence/events.
- Exit: lifecycle scenarios tested, policy approved before production enforcement.

## Phase 9 — Notifications
- Email and web push initially; templates, preferences, delivery status, retries, and fallback.
- Exit: critical booking/payment notifications are observable and safe to retry.

## Phase 10 — Admin and support operations
- Admin dashboard, verification queue, booking/matching monitoring, disputes, refunds, support, audit.
- Exit: least-privilege operational workflows and audit evidence.

## Phase 11 — Security, quality, and performance
- Threat model, access-control review, RLS review, dependency/security scanning, penetration testing, load and accessibility testing.
- Backups/restore drill, incident response, retention/deletion processes, monitoring.
- Exit: no unresolved critical/high launch blockers; documented sign-off.

## Phase 12 — Sydney pilot readiness
- Operational capacity, service boundaries, cleaner supply, customer support, pricing/unit economics, insurance and legal review, safety procedures, pilot cohort, rollback/incident plan.
- Exit: explicit go/no-go based on measurable readiness, not code completion alone.

## Phase 13 — Australian city expansion (future)
- Melbourne after Sydney validation; then other cities based on demand, supply, unit economics, and operations. Revalidate city-specific supply, pricing, coverage, and compliance.

## Phase 14 — Team bookings (future, not MVP)
- Customer chooses team size; capacity, synchronized arrival, team leader, split earnings, coordination, and revised pricing/time estimation. Requires a separate product and operational design approval.

## Phase 15 — International expansion (future, not MVP)
- Only after Australian success. Reassess currency, taxes, payment provider, worker classification, consumer/privacy law, insurance, and local operations country by country.

## Phase governance
No phase is declared complete without a recorded demo, tests, security review appropriate to risk, updated docs, and explicit acceptance. Scope changes require documenting impact on cost, schedule, security, operations, and existing customers.
