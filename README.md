# CleanQuote AI

CleanQuote AI currently contains an AI-assisted cleaning quotation workspace. The longer-term direction is an Australia-first home-cleaning marketplace, starting in Sydney with one cleaner per booking. Customer/cleaner accounts, verification, bookings, matching, maps, payments, payouts, and operations are planned and are **not implemented yet**.

## Current application
- React 19 + TypeScript + Vite frontend.
- Express + TypeScript backend.
- Gemini-powered cleaning-request extraction.
- Editable quotation details, manual line-item pricing, and browser-generated PDFs.
- Business settings and demo credits currently use browser-local storage.
- No live marketplace payments, cleaner onboarding, booking/matching engine, or marketplace database schema is deployed.

## Requirements
- Node.js 24 (verified environment: Node.js 24.12.0).
- npm.
- Gemini API key for AI extraction. The workspace can be explored without a configured key, but extraction will return a configuration message.

Use npm and the committed `package-lock.json`. The repository contains a stale `bun.lock`; do not use Bun until it is reconciled.

## Local setup (Windows PowerShell)
1. Open PowerShell in the repository directory.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Create your local environment file:
   ```powershell
   Copy-Item .env.example .env
   ```
4. Open `.env` in VS Code and replace the placeholder `GEMINI_API_KEY`. Keep `.env` private; it is ignored by Git. Never paste the key into chat or commit it.
5. Start:
   ```powershell
   npm run dev
   ```
6. Open http://localhost:3000.

## Verification
```powershell
npm run lint
npm run build
```
- `npm run dev`: Express server with Vite development middleware.
- `npm start`: Node server entry point; production mode serves `dist/` when `NODE_ENV=production`.
- `npm run build`: builds frontend into `dist/`.
- `npm run preview`: Vite preview server.
- `npm run lint`: TypeScript check (`tsc --noEmit`).

Production-mode `npm start` and `/api/health` still need a dedicated smoke test. No dedicated automated test script currently exists.

## Authentication foundation

The Phase 1 branch includes an initial Supabase email/password Auth screen and an Express `GET /api/auth/me` verification endpoint. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env` using the dedicated CleanQuote development project's URL and publishable key. Never use a service-role/secret key in browser environment variables. The identity SQL migration is staged under `supabase/migrations/` but has **not** been applied. Review `docs/PHASE_1_IMPLEMENTATION_STATUS.md` before applying it.

After changing `package.json`, run `npm install` to regenerate `package-lock.json`; do not use `npm ci` until the lockfile has been updated.

## API
- `GET /api/health`: server health and Gemini configuration state.
- `POST /api/extract-quote`: accepts a cleaning-request message and returns extracted fields.

## Environment variables
- `VITE_SUPABASE_URL`: CleanQuote development Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key (safe for browser use). Never use a service-role/secret key in the browser.
- The Express API uses these same values to verify access tokens with Supabase Auth.

After adding or changing Vite environment variables, restart the development server.
- `GEMINI_API_KEY`: required for Gemini extraction.
- `PORT`: optional; defaults to 3000.
- `NODE_ENV=production`: serves built frontend from `dist/`.
- `DISABLE_HMR`: disables Vite HMR when set to `true`.

Never commit `.env`, API keys, database passwords, Supabase service-role/secret keys, payment secrets, or production data.

## Documentation
See [`docs/`](docs/) for product requirements, roadmap, architecture, conceptual database design, booking lifecycle, payment/pricing, security/privacy, audits, Phase 0 review, and Phase 1 implementation plan.

## Scope guardrails
- Australia first, Sydney first.
- One cleaner per booking in MVP.
- Team bookings and international expansion are future phases.
- Preserve the existing quotation workflow.
- AI extraction structures requests; future server-side pricing remains authoritative.
- Schema/marketplace features are not complete until migrations, authorization/RLS, tests, and operational behaviour are verified.
