# CleanQuote AI — Database Schema Design

**Version:** 1.0 · **Status:** Approved conceptual baseline; not executable SQL · **Date:** 2026-11-19

## 1. Principles
PostgreSQL is the system of record. Schema changes must be versioned migrations, reviewed, tested, and applied to the dedicated development project first. This document is conceptual: **no tables, extensions, policies, or migrations are created by adding this file**.

Use UUID primary keys, foreign keys, unique constraints, check constraints, created/updated timestamps, and explicit deletion/retention rules. Store money as integer minor units (AUD 125.50 = 12550), never floating point. Store timestamps in UTC and render in the relevant Australian timezone. Snapshot quote/pricing/currency details on booking so historical records do not change when catalogue prices change.

## 2. Identity and profiles
- `users`: identity/account, normalized unique email/phone where applicable, status, timestamps; authentication provider identity mapping must be explicit.
- `customer_profiles`: one-to-one user profile and customer preferences.
- `worker_profiles`: one-to-one user profile, public profile fields, verification state, operational status, payout-provider reference (never raw bank credentials).
- `user_sessions`: only if session architecture requires application-managed session records; otherwise use provider-managed auth sessions.
- Roles/permissions must be controlled by trusted server-side records/claims, not user-editable metadata.

Confirm whether a single account may act as both customer and cleaner before finalizing profile cardinality and role constraints.

## 3. Cleaner verification, services, and coverage
- `worker_documents`: private object key, document type, review status, expiry, reviewer, timestamps; never public URL.
- `worker_services`: cleaner-to-service qualification/eligibility.
- `worker_service_areas`: service coverage, using geography or normalized area identifiers.
- `worker_availability`: recurring/dated availability and exceptions.
- `worker_locations`: time-stamped, purpose-limited location updates with retention policy.
Avoid duplicating authoritative availability state in both `worker_profiles.availability_status` and `worker_availability`; choose one source of truth during detailed schema design.

## 4. Customer addresses and catalogue
- `addresses`: structured Australian address, coordinates where justified, access instructions with restricted access.
- `customer_saved_addresses`: customer ownership, label, default flag; alternatively use direct ownership if separate table adds no value.
- `service_catalog`: service name, description, enabled state, eligibility constraints, version.
- `service_tasks`: included task definitions and exclusions.
- `service_extras`: optional tasks, price/time/eligibility metadata.
- `city_configs`: city launch status, timezone, service boundaries, operational configuration.
- `country_configs`: defer unless multi-country configuration is genuinely required; MVP is Australia-only.

## 5. Quotation and pricing
- `quotations`: customer, service address reference/snapshot, requested scope, status, currency, price breakdown, expiry, pricing-rule version.
- `quotation_items`: service and extras with quantity, unit amount, line total, and descriptive snapshot.
- `pricing_rules`: versioned server-side calculation inputs and effective dates.
- Store tax/fee components separately and snapshot the final breakdown.
AI-extracted data is editable input only. The server validates all scope and recalculates all amounts.

## 6. Booking and matching
- `bookings`: public reference, customer, quote snapshot, scheduled window, service address snapshot/reference, booking status, cancellation metadata.
- `booking_assignments`: booking, cleaner, assignment state, assigned/released timestamps. Enforce exactly one active assignment per booking for MVP using a suitable partial unique index or transactional invariant.
- `booking_offers`: booking, cleaner, offer state, sent/expiry/responded timestamps, attempt order.
- `booking_events`: append-only event history with actor, event type, timestamp, and minimal structured metadata.
Do not combine payment status with booking status. Avoid ambiguous booking statuses such as `PAYMENT_SETTLED` or `RESOLVED`; those belong to payment/dispute domains respectively.

## 7. Financial records
- `payments`: booking, provider reference, amount/currency snapshot, payment state.
- `payment_transactions`: authorization, capture, refund, reversal, and webhook/idempotency records.
- `commission_records`: platform fee basis, amount, rule/version.
- `payouts`: cleaner, provider reference, amount, payout state.
- `refunds`: payment, amount, reason, provider reference, state.
Financial events must be reconcilable and idempotent. Do not store card PAN/CVV or raw bank account credentials. Final table details depend on selected provider and payment flow.

## 8. Operations and trust
- `notifications`: recipient, channel, template, delivery state, retries.
- `reviews`: eligible booking, author, recipient, rating, moderation state.
- `disputes`: booking/payment references, reason, evidence pointers, state, resolution.
- `support_tickets`: requester, category, priority, state, assignment.
- `admin_audit_logs`: actor, action, target, timestamp, safe before/after metadata.

## 9. Relationships and constraints to formalize
One user may have one customer profile and/or one cleaner profile depending on approved account policy. A booking belongs to one customer and one immutable quote snapshot. A booking may have multiple historical assignment attempts but only one active cleaner assignment in MVP. Offers must be unique for the relevant booking/cleaner/attempt. A completed booking may have at most the permitted review(s). Payment transactions must be idempotent by provider event/operation key.

## 10. Indexing
Index foreign keys and common filters: user IDs, booking public reference, customer/cleaner IDs, statuses, scheduled windows, offer expiry, payment provider references, and event chronology. For geo lookups, enable PostGIS deliberately and add appropriate GiST indexes on geography/geometry columns after query patterns are validated. Add partial indexes for active assignments/offers where useful.

## 11. Supabase security requirements
Enable RLS on every table exposed through the Data API. Policies must use real ownership/role predicates and be tested for both allowed and denied access. Sensitive writes (matching, pricing, payment, verification, admin operations) should be performed through trusted server-side paths. Never expose service-role/secret keys. Private storage policies must scope document access to authorized owner/reviewer. Views must be reviewed for invoker security and RLS behaviour.

## 12. Open schema decisions
Finalize account/profile cardinality; address snapshot vs normalized references; authoritative availability model; booking and payment state enums; active-assignment constraint; location retention/precision; document retention; provider-specific payment ledger; city config needs; and exact RLS predicates. Validate legal retention/deletion obligations before migration.

**Implementation gate:** no SQL should be generated/applied from this conceptual document until the detailed schema is reconciled with the actual app, Supabase project settings, and reviewed migration plan.
