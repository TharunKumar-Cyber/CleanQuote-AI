# CleanQuote AI — Supabase Environment Audit

**Audit type:** Read-only Phase 0 inspection  
**Project:** `CleanQuote-AI-Development`  
**Project ref:** `zjwqyhwoiekeztwkjuny`  
**Organization:** `cyber-lens-fusion`  
**Region:** Sydney, Australia (`ap-southeast-2`)  
**PostgreSQL:** 17.12.0.000  
**Observed status:** `ACTIVE_HEALTHY`  
**Audit date:** 2026-11-18

## 1. Scope and safety

This inspection used read-only project metadata, table, extension, migration, and advisor queries. No SQL writes, migrations, extension installations, table creation, or application configuration changes were performed. The paused LabProof project was not accessed or changed.

## 2. Verified environment

| Check | Result |
|---|---|
| Project health | ACTIVE_HEALTHY |
| Region | Sydney, Australia |
| PostgreSQL major version | 17 |
| Public schema tables | 0 |
| Migration history entries | 0 |
| Security advisor findings | 0 returned |
| Performance advisor findings | 0 returned |
| PostGIS extension | Available in extension catalogue; not installed |
| Supabase project isolation | Dedicated CleanQuote AI development project |

The empty table and migration results confirm that this project currently has no application schema deployed.

## 3. Important interpretation

The advisor results are not evidence that a future schema is secure or performant. There are no application tables or policies to assess yet. RLS, ownership rules, grants, and query performance must be reviewed and tested after schema design and implementation.

PostGIS is available but not installed. Installation should happen only when the approved location schema and migration plan are ready.

## 4. Current Supabase platform guidance to account for

- New public tables are not automatically exposed through the Data API by default. Table exposure and grants must be intentionally designed.
- RLS must be enabled for every exposed application table.
- Policies must enforce actual ownership and role/booking relationships; merely requiring the `authenticated` role is not sufficient.
- Do not use user-editable Auth user metadata for authorization decisions.
- Never expose service-role or secret API keys in browser code.
- Storage for cleaner verification documents must use private buckets and narrow object policies.
- Views require deliberate RLS handling; where appropriate use `security_invoker = true`.
- Supabase CLI v3 changes hosted/local command defaults. Any future CLI workflow must explicitly target the intended environment and be checked against the current CLI documentation.

## 5. Recommended implementation implications

1. Keep this project development-only. Do not connect production users or real payments to it.
2. Design schema and RLS together; do not create tables first and add security later.
3. Decide whether application access uses the Supabase Data API, backend-only database access, or a deliberate combination.
4. Use a publishable key only in a browser client when RLS and grants are correct. Keep privileged credentials server-side.
5. Install PostGIS only as part of a reviewed migration that includes geographic column types, indexes, and test queries.
6. Keep customer full addresses and cleaner verification documents private; enforce access at the database/storage boundary, not only in the UI.
7. Verify atomic cleaner assignment and booking/payment state separation at the backend/database level.

## 6. Not yet verified

- Local development environment, local build and test baseline.
- Supabase Auth provider settings, email/phone configuration, redirect URLs, and SMTP.
- Data API exposure settings and role grants.
- Storage bucket configuration and policies.
- Realtime configuration and authorization.
- Backup/restore configuration and an actual restoration test.
- Billing/usage behaviour under the organization's Free plan.
- Maps and payment provider eligibility.

These are intentionally deferred until the corresponding implementation phase. No secrets or database credentials should be pasted into chat or committed to GitHub.

## 7. Phase 0 status

- [x] Dedicated Sydney development project verified healthy.
- [x] Empty database and migration history verified.
- [x] Extension availability inspected.
- [x] Security and performance advisor endpoints checked.
- [x] Current Data API exposure change identified.
- [ ] Local application build/test baseline verified.
- [ ] Auth, storage, realtime, backup, and restore settings reviewed.
- [ ] Seven approved product documents reconciled against the implementation design.
- [ ] Phase 1 implementation plan prepared and reviewed.

**Conclusion:** The Supabase development environment is ready for schema planning, but it is intentionally still empty. No database or application changes are authorized or performed by this audit.
