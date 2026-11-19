# CleanQuote AI — Security and Privacy Baseline

**Version:** 1.0 · **Status:** Approved planning baseline · **Date:** 2026-11-19

## 1. Security objectives
Protect customer and cleaner accounts, addresses, identity documents, location data, booking integrity, and financial records. Apply least privilege, privacy by design, secure defaults, defense in depth, and auditable operations. Security requirements apply to APIs, database policies, storage, realtime channels, admin tools, and external integrations.

## 2. Identity and authorization
- Use a supported authentication system with secure recovery, session expiry/revocation, and appropriate MFA for privileged roles.
- Enforce authorization on every server-side operation; never rely on hidden UI controls.
- Derive identity from a verified session/token, not a user ID supplied in request body.
- Do not use user-editable profile metadata as an authorization source.
- Enforce customer ownership, assigned-cleaner access, and admin permissions independently.
- Rate-limit login, recovery, offer, quote, and other abuse-prone endpoints.

## 3. Data access and Supabase
- Enable RLS on every table exposed through Supabase Data API.
- Write ownership-aware policies and test both allowed and denied cases.
- Keep service-role/secret keys exclusively on trusted servers; browser uses only publishable credentials where required.
- Restrict schema exposure deliberately; do not assume a table is private merely because it is newly created.
- Review views for security-invoker behaviour and avoid unsafe SECURITY DEFINER functions.
- All schema changes must be migration-controlled and reviewed.

## 4. Personal data and location
Collect only information necessary to deliver and support a booking. Restrict exact address and access instructions to customer and currently assigned cleaner/authorized support. Hide full address and gate/access codes from pre-assignment offers. Restrict location to a consented, active booking purpose; do not track offline cleaners; stop collection when no longer needed. Define retention, deletion, access/correction, and incident processes after Australian privacy/legal review.

## 5. Verification documents and storage
Store identity/verification documents in private buckets with random object keys. No public buckets or permanent public URLs. Use short-lived authorized access and policies scoped to uploader, assigned reviewer, and approved operational roles. Validate file type/size, scan where feasible, prevent executable content, and record review/expiry. Define deletion and retention rules before production.

## 6. Application and API security
Validate and normalize inputs server-side; use parameterized queries and safe output encoding. Apply CSRF protection where cookie-based sessions require it, secure cookie flags, CORS allowlists, security headers, content security policy, request size limits, and abuse controls. Avoid logging passwords, tokens, API keys, payment secrets, full documents, or unnecessary personal data. Use dependency scanning and promptly assess advisories.

## 7. Booking, matching, and financial integrity
All state transitions are server-authorized and validated. Use transactions/conditional updates for atomic assignment and prevent duplicate active cleaners. Use idempotency for booking creation, payment operations, refunds, and webhooks. Verify payment webhook signatures. Maintain append-only booking/financial/admin event records and reconcile provider state. Never trust client-provided prices, payment status, cleaner verification, or payout state.

## 8. Secrets and environments
Separate development, staging, and production projects/keys. Validate required environment variables at startup. Keep secrets out of source control, logs, browser bundles, and screenshots. Rotate credentials after suspected exposure. Do not copy production personal data into development without approved anonymization. Use least-privilege access for developers and integrations.

## 9. Monitoring, backup, and incident response
Monitor authentication anomalies, authorization failures, matching failures, payment/webhook errors, data-access anomalies, and system health. Maintain tested backups and perform restore drills. Define incident severity, containment, evidence preservation, user/regulator notification assessment, recovery, and post-incident review. Establish an operational contact/escalation process before pilot.

## 10. Privacy and legal review
Obtain qualified Australian advice on privacy obligations, consumer guarantees, cancellation/refund terms, cleaner/worker classification, insurance, tax/GST, identity verification, location consent, and payment-provider obligations. This document is an engineering baseline, not legal advice or a compliance certification.

## 11. Security verification checklist
- Threat model and data-flow review.
- Auth/session and role/ownership negative tests.
- RLS policy tests for every exposed table.
- Private storage access tests.
- Address/location disclosure tests across booking states and reassignment.
- Atomic matching/concurrency tests.
- Payment webhook signature, replay, duplicate, and ordering tests.
- Dependency, static, dynamic, and penetration testing appropriate to launch risk.
- Backup restore and incident-response exercises.
- Audit-log integrity and sensitive-data review.

## 12. Release gate
No production launch with unresolved critical/high security issues, untested privileged access, public verification documents, exposed secrets, missing payment idempotency, unreviewed cancellation/privacy disclosures, or untested restore/incident procedures. Record risk acceptance explicitly for any deferred issue.
