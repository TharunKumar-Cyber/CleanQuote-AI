# CleanQuote AI — Phase 0 Review and Exit Report

**Date:** 2026-11-19 · **Branch:** `phase-0/repository-audit`  
**Status:** Foundation review complete; pre-implementation gates remain tracked.

## Result
Phase 0 established the product baseline, audited the quotation app, verified the dedicated Sydney Supabase development project, and prepared the Phase 1 plan. No marketplace feature code, application schema, migration, Storage bucket, or live payment integration was created.

## Locked decisions
- Australia-only launch, Sydney first; expand to Melbourne and other cities only after validation.
- One cleaner per booking in MVP.
- Team bookings and international expansion are future-only.
- Preserve the existing AI quotation workflow.
- AI extraction is not price authority; future pricing is server-authoritative.
- Use only `CleanQuote-AI-Development` for CleanQuote development; never LabProof.

## Repository findings
- React 19, TypeScript, Vite 8, Tailwind CSS 4, Express 4.
- Gemini extraction, browser-side quote editing/calculation, and PDF export.
- Business settings and demo credits use browser-local storage; they are not authoritative account/payment records.
- Marketplace auth, cleaner verification, booking/matching, maps, marketplace payments/payouts, and persistent marketplace schema are not implemented in inspected app code.
- No dedicated automated test script or GitHub Actions workflow directory was found in the inspected repository.
- README is now project-specific and distinguishes existing features from planned marketplace capabilities.

## Owner-run verification reported in this session

| Check | Result |
|---|---|
| `npm install` | Completed; 210 packages audited |
| `npm run lint` | Passed; runs `tsc --noEmit` |
| `npm run build` | Passed; 1,876 modules transformed |
| `npm audit --omit=dev` | 0 vulnerabilities reported |
| Full `npm audit` | 5 high-severity findings remain in development/build dependency chain |
| Git working tree after lockfile commit/push | Clean and synchronized with audit branch |

The full audit findings involve the Vite/build-tool chain including `picomatch`, `fdir`, and `tinyglobby`. The suggested forced remediation would downgrade Vite across a breaking version line; it was correctly not applied. A clean production-only audit does not mean the development toolchain is vulnerability-free.

Non-blocking build warnings: `vite.config.ts` uses `__dirname` and emits a native config-loader compatibility warning; the main browser bundle is about 724.72 KB minified (226.56 KB gzip), above Vite's 500 KB warning threshold.

## Repository hygiene
- npm and `package-lock.json` are the verified workflow.
- `bun.lock` is stale: its root name is `react-example`, dependency classification/versions differ from `package.json`, and Vite tooling remains under dependencies. Do not use Bun until regenerated or retired.
- `.env.example` still contains AI Studio/Replit-specific comments; clean these before public onboarding.
- No dedicated automated test suite currently exists.

## Supabase result
Project `CleanQuote-AI-Development`, ref `zjwqyhwoiekeztwkjuny`, region Sydney (`ap-southeast-2`), PostgreSQL 17.12, status `ACTIVE_HEALTHY`; organization plan Free.

Read-only checks confirmed 0 public base tables, 0 public RLS policies, 0 project migration-history entries, and 0 Storage buckets. PostGIS is available but not installed. Security/performance/health advisor calls returned no lints; this is not a certification of future schema security. No marketplace application data exists.

Dashboard-only Auth provider, redirect, SMTP, Data API exposure/grants, SSL/network, Storage, and Realtime settings remain unverified.

## Backup and recovery
The organization is on Supabase Free. Current Supabase guidance says automatic daily downloadable backups are provided on Pro, Team, and Enterprise; Free projects should regularly export using the Supabase CLI and maintain off-site copies. Database backups do not include Storage object bytes.

References: [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups) · [Supabase CLI Backup and Restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

Before non-disposable user data is introduced: export roles/schema/data, encrypt and store copies off-site, separately export Storage objects, and complete a restore drill against an isolated target. Do not store connection strings/passwords in Git or chat. Current application schema and Storage buckets are empty.

## Cross-document consistency
All seven baseline documents consistently preserve Sydney/Australia launch, AUD marketplace prices, one cleaner per MVP booking, server-authoritative pricing, separate booking/assignment/payment/payout state machines, address privacy before assignment, atomic cleaner acceptance, private verification documents, ownership-aware RLS, and deferred provider choices.

Detailed schema decisions remain for the design gate: multi-role account policy, authoritative availability source, address snapshot/reference approach, state enums/transitions, active-assignment database invariant, location/document retention, city configuration, and provider-specific financial ledger.

## Phase 0 exit status
**Completed:** product baseline consolidation, repository/code-path audit, branch isolation, owner-reported npm install/type-check/build baseline, initial Supabase project verification, cross-document consistency review, project README, and Phase 1 planning.

**Gates before relevant implementation or launch:**
1. Production-mode `npm start` and `/api/health` smoke test.
2. Resolve full npm audit findings without a forced breaking downgrade.
3. Reconcile stale Bun lockfile and stale `.env.example` comments.
4. Verify dashboard-only Supabase settings.
5. Complete export/restore drill before non-disposable data.
6. Select providers during their roadmap phases after Australian eligibility/cost/legal checks.
7. Obtain Australian legal, insurance, and tax advice before public pilot.

Phase 0 does not itself authorize application or schema changes. Phase 1 starts with the implementation plan and detailed auth/schema design.
