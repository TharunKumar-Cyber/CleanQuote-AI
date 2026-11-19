# Phase 1 — Authentication and Identity Design

**Version:** 0.1 · **Date:** 2026-11-19  
**Status:** Proposed technical design for review; no application code or database schema has been changed.

## 1. Scope

Design the identity foundation for the existing React 19 + TypeScript SPA and Express 4 API, using the dedicated Supabase project `CleanQuote-AI-Development` (`zjwqyhwoiekeztwkjuny`, Sydney).

This design covers sign-up, email confirmation, sign-in, sign-out, password recovery, session handling, customer/cleaner role assignment, protected API requests, and the minimal identity data model. It does not implement bookings, cleaner verification, payments, location tracking, or other marketplace modules.

## 2. Existing application constraints

- The frontend is a client-rendered React SPA bootstrapped from `src/main.tsx`; it is not currently an SSR application.
- Express is the same-origin backend and serves both API routes and the SPA.
- Existing API routes do not currently authenticate requests.
- Business settings, demo credits, and some user-entered data currently rely on browser local storage.
- Existing quote workflow must continue to work during identity rollout.
- The project has no public application tables or migrations yet.

## 3. Proposed authentication approach

### Supabase Auth client in the SPA

Use the official `@supabase/supabase-js` client in the browser with the Authorization Code + PKCE flow (the standard recommended flow for SPA clients). The public publishable key and project URL may be used in the browser. Never put a service-role or secret key in frontend code or any `VITE_*` variable.

The browser client manages its own session and refresh lifecycle. Configure the production Site URL and explicit local/production redirect allowlists in the Supabase dashboard. Use email/password initially; social login is not required for the MVP foundation.

**Why not `@supabase/ssr` now?** The current application is a client-rendered SPA, not a Next.js/SvelteKit/TanStack Start server-rendered app. The current Supabase SSR guide uses cookie storage for SSR frameworks and notes the SSR helper package's API can change. Do not add SSR middleware/package complexity unless the application architecture later adopts SSR.

### Express API verification

For protected requests, the SPA sends the Supabase access token as an `Authorization: Bearer <access-token>` header. Express must verify the token cryptographically / against Supabase Auth before trusting its subject. Use the current supported Supabase JWT verification approach (prefer verified claims/JWKS where appropriate; use Auth-server user lookup where fresh authoritative user state is needed). Never decode a JWT and trust its contents without signature, issuer, audience, and expiry validation.

After verification, Express derives the user ID from the verified `sub` claim. It must not accept a user ID, role, cleaner approval state, or admin flag supplied by the browser as authority. Role and account state are loaded from trusted server/database records.

This is a deliberate SPA-friendly first design, not a claim that browser storage is immune to XSS. Harden the app against XSS, use a restrictive Content Security Policy, avoid unsafe HTML injection, keep dependencies reviewed, and never store privileged secrets in the browser. Revisit an HTTP-only cookie/BFF design if the app moves to SSR or security testing demonstrates that the added complexity is justified.

## 4. Identity and role model

### One Auth identity per person

Use one Supabase Auth user identity per person. A person may eventually be both a customer and a cleaner; therefore roles should be represented as a set of role assignments, not a single mutually exclusive role column.

Proposed roles:
- `customer`: may use customer features.
- `cleaner`: may apply for cleaner access; approval is a separate state.
- `admin`: assigned only by a trusted owner-controlled process; never self-service.

A cleaner role does **not** mean the cleaner is approved, verified, online, or eligible to receive jobs. Those are separate states managed by later cleaner onboarding and operations features.

Do not use user-editable Supabase `user_metadata` for authorization. Role assignments must be stored in trusted database records and protected by RLS / server-only authorization. Do not let a normal user insert, update, or delete their own role assignments. Admin assignment must be performed by a controlled owner process, not a public API route.

### Proposed minimal data model (conceptual only)

1. `profiles`
   - `id` UUID primary key and FK to `auth.users(id)`.
   - Display name and optional contact/profile fields only.
   - Created/updated timestamps.
2. `user_roles`
   - UUID primary key.
   - `user_id` FK to `auth.users(id)`.
   - Role constrained to the allowed role set.
   - Created timestamp and optional grantor/audit reference.
   - Unique constraint on (`user_id`, `role`).

Cleaner-specific verification and operational attributes belong in a later `worker_profiles` design, not in the generic profile or role row. Customer-specific attributes should likewise be separated when needed. Avoid creating the full marketplace schema in this phase.

## 5. Authorization boundaries

- Public routes: health check and sign-up/sign-in flows handled by Supabase Auth.
- Authenticated routes: require a valid, unexpired access token and an active account.
- Role-protected routes: check trusted database role assignment on the server.
- Cleaner operational routes: later require cleaner role **and** approved/verified/active state.
- Admin routes: require trusted admin role and server-side audit logging.
- Supabase Data API access is opt-in for newly created tables on current projects. If any table is exposed, explicitly grant only necessary privileges and enable RLS with ownership/role predicates. Authentication alone (`TO authenticated`) is not sufficient authorization.
- For update policies, enforce both `USING` and `WITH CHECK` so ownership cannot be changed.
- Never expose `service_role` or secret keys to the browser. Server-side privileged operations must be narrow and audited.

## 6. Session and account lifecycle

1. Sign-up creates an Auth identity; email confirmation is required before normal use.
2. On confirmation, the user signs in and the app establishes its session.
3. On refresh/reload, the client restores the session and refreshes credentials through the supported SDK flow.
4. Sign-out clears the client session. Sensitive server operations must validate the supplied token and account state; do not assume deleting a user instantly invalidates already-issued JWTs.
5. Password recovery uses Supabase's supported recovery flow and allowlisted redirect URLs.
6. Expired/invalid sessions return a consistent 401 response; the UI clears stale state and asks the user to sign in again.
7. Disabled/suspended accounts are rejected by server-side checks even if a previously issued token has not yet expired.

## 7. Existing quotation data migration

Do not silently attach browser-local business settings or quotes to an account. The current local storage contains business settings and demo-credit state, not an authenticated account. When account persistence is introduced:
- preserve existing local data;
- provide an explicit import/migration path where appropriate;
- never migrate demo credits as paid entitlements;
- do not treat localStorage credit counters as authoritative;
- do not change quotation behaviour until regression tests cover the existing workflow.

## 8. Required tests

- Sign-up, confirmation, sign-in, sign-out, password recovery, expired link, invalid password, and duplicate account.
- Token missing, malformed, expired, wrong issuer/audience, and revoked/disabled user handling.
- Customer A cannot read or update Customer B's profile.
- Cleaner cannot change own approval state or access another cleaner's private data.
- A customer cannot grant themselves cleaner/admin roles.
- Cleaner role alone does not grant approved-worker privileges.
- Admin access is denied unless a trusted admin assignment exists.
- Anonymous access is denied to private data.
- Existing quotation extraction, manual pricing, settings, and PDF export remain functional.
- RLS policies and API authorization are tested with multiple independent test identities.

## 9. Supabase configuration gates

Before implementation, verify in the dashboard:
- Email provider enabled and email confirmation policy.
- Site URL and exact local/production redirect allowlist.
- SMTP configuration and deliverability expectations (default SMTP limits may not be appropriate for production).
- Auth rate limits and password/security settings.
- Data API exposure settings and default grants.
- SSL/network restrictions and project access permissions.

No Auth provider, SMTP, redirect, Data API, or network settings were changed as part of this design.

## 10. Open decisions before migration

- Confirm email/password as the initial sign-in method and whether phone authentication is out of scope.
- Confirm whether profile creation should be handled by a database trigger or an idempotent server-side post-sign-up operation. If using a trigger, it must be minimal, robust, and tested because a trigger failure can block sign-up.
- Finalize profile fields and role grant/revocation audit requirements.
- Decide how the owner will bootstrap the first admin safely.
- Decide whether profile reads/writes use the Data API with RLS or Express-only access.
- Confirm the token verification library/API against the current Supabase signing-key configuration before implementation.

## 11. Supabase version/change notes reviewed

The Supabase changelog was checked on 2026-11-19. Relevant current changes:
- New public tables are no longer automatically exposed through the Data API; access must be explicitly configured. This reinforces explicit grants and RLS rather than relying on defaults.
- Supabase CLI v3 is local-first and confirms hosted changes; CLI v2 workflows and scripts should not be assumed compatible with v3. Check the installed CLI version and each command's `--help` before use.
- Supabase SSR docs recommend cookie-based sessions for SSR frameworks; this current SPA does not need SSR helpers merely to use Supabase Auth.

References:
- [Supabase Auth with React](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Supabase JWT guide](https://supabase.com/docs/guides/auth/jwts)
- [Supabase server-side Auth and SSR](https://supabase.com/docs/guides/auth/server-side)
- [Supabase SSR client setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase breaking changes changelog](https://supabase.com/changelog?types=breaking-change)

## 12. Explicit non-actions

This document does not create or alter tables, policies, functions, triggers, Auth providers, redirect URLs, SMTP settings, API grants, Storage buckets, application code, or production configuration. The next implementation gate is a reviewed minimal migration and a secure Auth integration plan, followed by explicit approval before applying DDL.


## 13. Clarification from current documentation review

The Auth client should explicitly configure the chosen `flowType: 'pkce'` rather than assuming the SDK default. The general Supabase OAuth 2.1 PKCE guide concerns third-party OAuth clients, so the implementation must follow the Supabase Auth JavaScript client guide for email/password and recovery rather than copy the third-party OAuth-server endpoints.

For Express verification, select and test the current Supabase-supported verification path against this project's signing-key mode. Do not assume an older shared JWT secret exists or embed one in the app. The JWT guide documents the issuer, expiry, subject, and signing-key model. If using local JWT/JWKS verification, validate signature, allowed algorithm, issuer, expiry, and key ID; if using an Auth user lookup, handle network/provider failure explicitly and cache only within a deliberately reviewed security policy.

**CLI v3 warning:** Supabase CLI v3 became the default release in November 2026. Database commands such as `db push`, `db pull`, `db dump`, `migration list`, and `gen types` target the local stack by default; hosted changes require explicit `--remote` and interactive confirmation (or `--yes` in unattended workflows). Do not run remembered v2 commands blindly. Check `supabase --version` and the installed command's `--help` before any CLI action. See [CLI v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3) and [Nov 4, 2026 breaking-change entry](https://supabase.com/changelog?types=breaking-change).
