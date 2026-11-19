# CleanQuote AI — Product Requirements Document

**Version:** 1.0 · **Status:** Approved planning baseline · **Date:** 2026-11-19

## 1. Product vision
CleanQuote AI is an Australia-first home-cleaning marketplace connecting customers with independently applying, verified cleaners. It combines transparent service quoting, booking, cleaner matching, job progress, payments, and operational support. The existing AI quotation workflow is to be preserved and integrated where useful; AI may help structure a request but must never determine or silently invent the final payable price.

## 2. Launch scope and principles
- Launch in **Australia only**, beginning in **Sydney, NSW**.
- Expand to Melbourne only after the Sydney operating model is validated; other Australian cities follow evidence-based rollout.
- International expansion is explicitly deferred until the Australian business succeeds.
- MVP booking model is **one cleaner per booking**. Design data structures so teams can be supported later, but do not implement team booking in MVP.
- Build a complete single-cleaner marketplace, not merely a quote form.
- Safety, privacy, transparent pricing, reliable operations, and auditable state transitions are launch requirements.

## 3. Users and roles
**Customer:** creates an account, manages service addresses, requests a service, reviews an estimate, books, pays under the disclosed payment flow, follows progress, manages eligible cancellations, reviews, and contacts support.

**Cleaner:** applies, submits identity/business and eligibility documents as required, selects services and coverage, manages availability, receives eligible offers, accepts or rejects, navigates to the job, updates arrival/start/completion, views earnings and payouts, and raises support issues.

**Administrator/operations:** verifies cleaners, manages users and catalogue/pricing, monitors matching and bookings, handles cancellations/reassignment, disputes/refunds, support, safety escalations, and audit/reporting.

Roles must be enforced server-side. A UI role or client-supplied user ID is never proof of authority.

## 4. MVP customer requirements
1. Registration, login, logout, account recovery, and profile management.
2. Save and manage multiple Australian service addresses.
3. Select an enabled service and provide property details: property type, bedrooms, bathrooms, approximate size where relevant, condition, access constraints, and requested time.
4. Select eligible extras and communicate special requirements.
5. Receive a clear estimate with scope, exclusions, duration range, taxes/fees where applicable, and cancellation/payment terms before confirmation.
6. Confirm a booking and see its status and assigned cleaner when available.
7. See cleaner identity/profile and permitted journey/ETA information after assignment.
8. View booking history and quotation details; cancel subject to the disclosed policy.
9. Receive confirmations, status notifications, receipts, and support/dispute pathways.
10. Submit a review after an eligible completed booking.

## 5. MVP cleaner requirements
1. Apply and create a cleaner profile; submit required verification evidence.
2. Admin review states: pending, approved, rejected, suspended, and expired/reverification as applicable.
3. Configure service skills, eligible property/service limits, service areas, and availability.
4. Go online/offline; receive offers only when eligible.
5. See sufficient job scope, approximate location, time window, and expected earnings before accepting. Do not reveal the customer's full street address or access codes before assignment.
6. Accept/reject offers before expiry; acceptance must be atomic and prevent double assignment.
7. After assignment, access necessary address and access instructions, navigation, and booking updates.
8. Mark en route, arrived, started, and completed only through valid server-checked transitions.
9. View earnings, payout status/history, ratings, and support channels.

## 6. Admin requirements
- Review and manage cleaner applications and verification-document expiry.
- Search customers, cleaners, quotations, bookings, offers, assignments, payments, refunds, and disputes.
- Monitor matching queues, failed offers, cancellations, and reassignment.
- Manage service catalogue, extras, geographic availability, and versioned pricing.
- Configure operational settings and commission with change history.
- Handle refunds/disputes through provider-aware, permission-controlled workflows.
- Maintain append-only audit records for sensitive admin actions.

## 7. Service catalogue and eligibility
Initial catalogue candidates:
- Standard Home Cleaning.
- Deep Home Cleaning.
- Eligible/small-property End-of-Lease Cleaning.
- Airbnb/short-stay turnover cleaning only when operational readiness and scope are validated; it may be deferred beyond initial pilot.

Optional extras may include inside oven, inside fridge, interior windows, inside cupboards, ceiling fans, and balcony cleaning. Each service/extra needs an explicit task scope, exclusions, price rule, estimated time, equipment/skill requirements, and eligibility constraints.

Do not launch specialist/high-risk work as ordinary cleaning: carpet steam cleaning, upholstery/mattress treatment, exterior high-rise windows, roof/gutter work, mould remediation, heavy post-construction cleaning, or specialist pressure washing. Property size, condition, task count, and duration must be constrained to a safe/reasonable single-cleaner workload. A catalogue listing does not guarantee every property is eligible.

## 8. Marketplace and booking rules
- Matching eligibility: cleaner is approved, active/not suspended, online, available for the requested window, qualified for the service, inside service coverage, and free of schedule conflict.
- Offers can be sent in controlled batches with expiry; widen the search radius only under documented rules.
- If no eligible cleaner accepts, explain the outcome and offer reschedule/cancel paths.
- First valid eligible acceptance wins atomically. MVP permits only one active cleaner assignment per booking; competing offers are closed.
- Cleaner cancellation requires a reason and enters reassignment. Notify the customer; if no replacement is found, apply the approved reschedule/cancellation/refund process.
- Booking, payment, and payout states are separate state machines.
- Every important transition is validated on the server and recorded as a timestamped event.

## 9. Location and privacy
Before assignment, cleaners see approximate location only. The assigned cleaner receives the full address and necessary access details only after assignment. Customers see only permitted cleaner location/ETA information during the relevant booking journey. Location collection requires clear notice and consent, must stop when no longer needed, and must not track offline cleaners. Browser/PWA background-location limitations must be disclosed; native apps may be considered later.

## 10. Pricing and payments
All displayed prices are in AUD for the Australian MVP. Pricing is calculated and validated server-side from versioned rules, not trusted from browser calculations or AI output. Store money as integer minor units (e.g. AUD 125.50 = 12550) and snapshot the currency, scope, taxes, fees, and rule version on confirmed bookings. Payment provider, authorization/capture timing, marketplace eligibility, cleaner onboarding, commissions, payouts, refunds, and chargeback handling remain subject to provider and legal validation before selection.

## 11. Non-functional requirements
Security by default; least-privilege access; row-level data ownership; encrypted transport and managed secrets; private verification-document storage; auditable financial/admin operations; idempotent payment and booking endpoints; reliable backups and recovery; accessible responsive UX; monitoring and actionable error handling; Australian privacy and consumer-law review; operational support and incident procedures.

## 12. Success measures
Pilot metrics should include quote-to-book conversion, cleaner application/approval funnel, offer acceptance rate, time to assignment, completion rate, cancellations/no-shows, on-time arrival, customer/cleaner satisfaction, repeat booking, refund/dispute rate, contribution margin, and support response time. Set numeric targets only after pilot baseline and unit-economics research.

## 13. Explicit exclusions
MVP excludes team/multiple-cleaner selection, international launch, native mobile apps unless validated as necessary, specialist cleaning categories above, and unverified automated pricing/dispatch promises.

## 14. Acceptance principle
A feature is not complete merely because its UI exists. It must have server-side authorization, validation, persistence, failure handling, auditability where appropriate, tests, and documented operational behaviour.
