# Phase 1 — Identity Foundation Implementation Status

**Last verified:** 2026-11-27  
**Branch:** `phase-1/identity-foundation-design`  
**Overall status:** Foundation implemented; verification is green; remaining acceptance gates are documented below. Phase 1 is not yet complete.

## Current verification

- Local Git working tree was clean before verification; branch was up to date with origin.
- Local `npm test`: 8/8 authentication middleware tests passed.
- Local `npm run lint` (`tsc --noEmit`): passed.
- Local `npm run build`: passed (Vite transformed 1,922 modules; build completed in 1.10s).
- GitHub Actions workflow **Phase 1 foundation checks** passed for commit `6eaca88a7c77045ef83c05c050277be9b8c256fc`. The verify job's install, tests, type-check, and build steps all succeeded.
- Non-blocking build warnings remain: Vite config uses `__dirname` with the native config-loader warning; the main minified JS chunk is approximately 951 KB, above Vite's 500 KB advisory threshold. No code-splitting or config refactor has been made.

## Implemented in the branch

- Supabase JavaScript client configured for PKCE, session persistence, automatic refresh, and URL callback detection.
- Account screen supports email/password sign-up, sign-in, sign-out, password recovery, and password update.
- Express bearer-token middleware verifies identity through Supabase Auth `getUser(accessToken)`; it does not trust a decoded token or client-supplied user ID.
- Protected smoke-test endpoint `GET /api/auth/me`.
- Health endpoint reports whether Supabase auth environment variables are configured without returning key material.
- Identity migration creates `profiles` and `user_roles`, enables RLS, restricts client grants, and creates a profile plus basic customer role for Auth users.
- Role assignment is not writable by the signed-in user. Cleaner and admin roles require a separate trusted administrative process.
- Existing quotation extraction remains unauthenticated and its access requirements have not been changed.
- GitHub Actions checks install dependencies, run tests, type-check, and build.

## Supabase project and migration verification

**Target project:** `CleanQuote-AI-Development`  
**Project ref:** `zjwqyhwoiekeztwkjuny`  
**Project URL:** `https://zjwqyhwoiekeztwkjuny.supabase.co`

The Supabase migration history and database catalog confirm that this migration is applied:

`supabase/migrations/20261122114530_identity_foundation.sql`

The applied migration version is `20261122114530`. This is the actual filename/version; the earlier status entry naming `20261119000100_identity_foundation.sql` was stale and incorrect.

Catalog inspection on 2026-11-27 confirmed:

- `public.profiles` and `public.user_roles` exist.
- RLS is enabled on both tables; `FORCE ROW LEVEL SECURITY` is not enabled.
- `profiles` is keyed to `auth.users(id)` with cascade delete; `user_roles.user_id` also references Auth users with cascade delete.
- `profiles` has own-row SELECT and UPDATE policies. UPDATE includes both `USING` and `WITH CHECK` ownership predicates.
- `user_roles` has an own-row SELECT policy and no client INSERT, UPDATE, or DELETE policy.
- Authenticated table grants are limited to SELECT on both tables and UPDATE of `full_name` / `phone` on `profiles`; no `anon` table grants were returned.
- Signup trigger `on_auth_user_created_cleanquote` invokes `handle_new_auth_user()`, which creates only a profile and the basic `customer` role. The function is SECURITY DEFINER with an empty search path and schema-qualified table references; execution is revoked from PUBLIC, anon, and authenticated.
- `profiles_set_updated_at` maintains the profile update timestamp.
- Two Auth users, two profiles, and two role rows were present at the time of the aggregate count. The migration also contains a backfill for existing Auth users.

## Auth and authorization verification limits

- The user has manually confirmed that sign-in, sign-out, session persistence after page refresh, and new-account registration/sign-in work in the development app.
- A live password-recovery email flow has not been verified; a previous attempt was blocked by the Supabase email rate limit. Do not treat recovery as complete until it can be tested successfully.
- Earlier database checks using simulated JWT claims showed own-profile/role visibility and cross-user isolation, including a cross-customer update affecting zero rows and an attempted ownership change being blocked. These were simulated database-role/JWT-claim checks, not a full end-to-end test using separate real user access tokens.
- The Express middleware has automated negative and positive unit coverage (8 tests), but full multi-account API/RLS integration coverage remains outstanding.

## Supabase advisor findings (2026-11-27)

- **Security warning:** Leaked-password protection is disabled. Enable and verify it in Supabase Auth password security settings before production. This is recorded as an outstanding security gate; no setting was changed during this review.
- **Performance info:** `public.user_roles.granted_by` has a foreign key without a covering index. This is an optimization advisory, not a current functional failure. Evaluate whether to add an index in a reviewed migration; do not make an ad-hoc schema change.

## Remaining Phase 1 work

- Verify Supabase Auth email confirmation, redirect allowlist, SMTP/delivery, rate limits, and relevant Data API settings in the dashboard.
- Complete a documented backup/export and restore procedure before relying on persistent user data; confirm the exact backup method available for the current plan.
- Verify live password recovery after the rate limit clears.
- Add real multi-user integration tests using separate customer identities and real access tokens; verify cross-user API and RLS denial.
- Decide and implement role-aware protected frontend route gating and a trusted cleaner/admin role-assignment/bootstrap procedure, or explicitly document any deliberately deferred portion in the approved Phase 1 scope.
- Review local lockfile/package-manager consistency and ensure CI uses the intended reproducible install strategy.
- Review the outstanding Supabase security/performance advisor findings and record decisions.
- Complete final regression tests for quotation extraction, Pricing Editor, and PDF export.
- Finish setup, rollback/recovery, and handoff documentation; then review the branch before any merge.

## Security and scope notes

- User-editable Auth `raw_user_meta_data` is used only for a display name, never for authorization.
- New Auth users receive only the basic `customer` role.
- The Express protected endpoint asks Supabase Auth to verify each access token. Measure production load before considering a different verification/caching strategy.
- The Phase 1 boundary remains identity and foundation only. Bookings, matching, availability, location tracking, payments, commissions, payouts, cleaner documents, maps, notifications, and production launch remain out of scope.
