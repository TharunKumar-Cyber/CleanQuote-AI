# CleanQuote AI — Phase 1 Implementation Plan

**Version:** 1.0 · **Date:** 2026-11-19  
**Scope:** Foundation and identity only. This is a plan, not authorization to change application code or create schema.

## Outcome
Establish a secure, testable identity foundation for customers, cleaners, and administrators using the dedicated Sydney Supabase project. Phase 1 excludes bookings, matching, payments, maps, cleaner document workflows, and production launch.

## Preconditions
1. Work on a feature branch based on the audit branch; never implement directly on `main`.
2. Use only `CleanQuote-AI-Development` for CleanQuote development; never LabProof.
3. Verify Auth providers, redirect allowlist, email confirmation, SMTP, rate limits, Data API exposure/grants, SSL/network, and project access in the dashboard.
4. Resolve development dependency audit findings without `npm audit fix --force`.
5. Reconcile `bun.lock`; use npm/`package-lock.json` until then.
6. Verify Supabase CLI version/commands with `--help`; check Docker availability before choosing local Supabase workflow.
7. Establish and test Free-plan manual backup/restore before non-disposable data is introduced.

## Decisions before coding

### Authentication/session pattern
Compare Supabase Auth SPA PKCE/session handling with a backend-managed secure HTTP-only cookie/session approach. Select one after evaluating XSS, CSRF, refresh, logout/revocation, CORS, and complexity. Do not mix token-storage patterns without a deliberate design.

### Identity and roles
- Supabase Auth establishes identity.
- Trusted database records define customer, cleaner, and admin permissions.
- Never use user-editable `user_metadata` for authorization.
- Decide whether one person can hold customer and cleaner roles under one auth identity.
- Admin assignment must be owner-controlled and never self-service.

### Data access
Choose whether marketplace data is accessed only through Express or whether selected low-risk operations use Supabase Data API under RLS. Pricing, matching, verification, admin, and financial actions remain server-authoritative.

## Work packages

### A. Environment and application hardening
Pin/document supported Node/npm versions; validate environment variables at startup; replace stale `.env.example` comments; keep secrets out of Git/logs/browser bundles; add structured error handling/request correlation; regression-test existing quote extraction and PDF workflows.

### B. Automated tests and CI
Add dedicated unit/API/component test scripts and GitHub Actions checks for install, type-check, tests, and production build. Keep npm lockfile synchronized. Add a dependency review process for the outstanding high-severity build-tool advisory. Include negative authorization tests.

### C. Supabase workflow
Initialize/configure Supabase CLI only after checking CLI/Docker availability. Commit non-secret config and timestamped migrations; exclude local state/credentials. Prefer local DB for iterative work if available; otherwise target only the dedicated development project after migration review. Apply reviewed migrations one at a time and verify with catalog queries and advisors.

### D. Identity schema design
Prepare an ERD and minimal migration for a profile linked to `auth.users`, trusted role assignments for customer/cleaner/admin, optional customer/cleaner profile extensions, status, timestamps, constraints, indexes, and deletion behaviour. Do not create every marketplace table in Phase 1.

### E. RLS and authorization
Enable RLS on every exposed application table. Define explicit grants and ownership-aware policies. Test cross-customer read/update denial, cleaner privilege boundaries, admin self-assignment denial, anonymous access denial, and signed-in ownership. Review views/functions for RLS bypass; prefer invoker security.

### F. Auth UX and protected API
Implement sign-up, confirmation, sign-in, sign-out, recovery, and session-expiry UX. The landing page and account/sign-in screen remain public; Quote Workspace, Business Settings, and Plans & Credits require a verified signed-in session. Preserve the intended destination through sign-in. Protected Express routes validate real identity and role; quote extraction must reject direct unauthenticated requests as well as the UI being gated. Handle duplicate accounts, expired links, rate limits, invalid sessions, and provider outages. Preserve existing local quote data.

### G. Verification and handoff
Run type-check, tests, build, and Supabase security advisor. Verify role boundaries with multiple test accounts, logout/refresh/recovery/revocation, document setup and rollback/recovery, commit on feature branch, and prepare a PR. Do not merge to `main` without release review.

## Acceptance criteria
- Customer can register, confirm, sign in, recover access, and sign out.
- Public landing/account screens remain accessible; protected workspace/settings/plans views and quote extraction require a verified session.
- Cleaner identity can exist without self-approval or bypassing future verification.
- Admin privileges cannot be self-assigned.
- Protected API derives identity from a verified session/token.
- RLS denies cross-user access in automated tests.
- Existing quotation/extraction/PDF features pass regression checks.
- Migrations are reproducible; backup/restore is tested before persistent user data.
- CI runs install, type-check, tests, and build.
- No secrets are committed or exposed to browser bundles.
- No critical/high runtime vulnerability is accepted without a documented risk decision.

## Out of scope
No booking tables, matching, worker availability, location tracking, payments, commissions, payouts, refunds, document uploads, maps, notifications, or production launch.

## Stop conditions
Stop before applying a migration if the target project cannot be positively identified, backup/export is not ready, schema/RLS design is unclear, a secret is exposed, or the migration could affect LabProof or another non-CleanQuote project.
