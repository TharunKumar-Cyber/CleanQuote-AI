# CleanQuote AI — Booking Lifecycle and Matching

**Version:** 1.0 · **Status:** Approved planning baseline · **Date:** 2026-11-19

## 1. State model
Booking, assignment, offer, payment, and payout are separate state machines. A booking status describes service fulfilment; payment status describes money movement; assignment status describes cleaner allocation. Do not overload booking status with payment or dispute outcomes.

Proposed booking states (final enum names to be reviewed): draft/quoted, awaiting confirmation, confirmed, matching, assigned, cleaner en route, arrived, in progress, completed, cancelled, and requiring support/review. A dispute should have its own state; payment settlement belongs to payment state.

## 2. Customer booking journey
1. Customer selects service, address, property details, extras, and time window.
2. Server validates eligibility and creates a quote using current versioned pricing rules.
3. Customer reviews inclusions, exclusions, estimate, duration, payment terms, and cancellation terms.
4. Customer confirms; server creates booking and associated payment workflow as required.
5. Matching begins and customer sees a truthful searching state.
6. On assignment, customer receives cleaner profile and permitted ETA/location details.
7. Cleaner updates en-route, arrived, started, and completed states.
8. Customer receives completion/receipt and may review or raise a dispute.

## 3. Offer lifecycle
An offer is created for one eligible cleaner with sent and expiry timestamps. Cleaner may accept, reject, or allow expiry. The server rechecks eligibility and booking state at acceptance. First valid acceptance wins through a transaction/conditional update. Once committed, all other active offers close. Duplicate requests and retries must be idempotent.

If nobody accepts, matching may widen radius or use another documented batch. After configured attempts/time, inform the customer and offer reschedule/cancel rather than leaving the booking indefinitely in a searching state.

## 4. Cleaner eligibility
Cleaner must be verified/approved, active and not suspended, online, qualified for the requested service, inside active coverage, available for the complete requested window, and free of conflicting active work. Recheck critical conditions at offer creation and acceptance. Manual admin override must be permission-controlled and audited.

## 5. Assignment and address disclosure
Before assignment, offer payload contains only approximate location and necessary job scope. It must not contain full street address, unit details, gate codes, or sensitive access notes. After the assignment is committed, only the assigned cleaner receives the exact address and required access details. Reassignment revokes prior cleaner access promptly.

## 6. Cleaner cancellation and reassignment
Cleaner cancellation requires a reason and records an event. Release the active assignment, notify the customer, and begin replacement matching if time permits. If no replacement is available, offer reschedule or cancellation and apply the correct payment/refund state. Avoid silently changing booking time or price.

## 7. Customer cancellation
The policy must distinguish at least: before matching, after assignment but before cleaner travel, during travel, cleaner arrived, cleaning started, and after completion. Show applicable terms before booking confirmation. Exact free-cancellation windows, fees, travel compensation, partial charges, and refund timing are **not finalized** and require Australian consumer-law review, operational research, and provider-flow validation. Do not hardcode fees before approval.

## 8. Payment interaction
Payment authorization/capture timing is provider-dependent and not decided here. Payment failures, delayed webhooks, duplicate webhooks, partial refunds, chargebacks, and payout failures must not corrupt booking state. Use idempotency keys and immutable transaction/event records. Booking completion does not by itself prove payment settlement.

## 9. Events and notifications
Record meaningful transitions with actor, prior/new state, timestamp, and safe metadata. Notify relevant participants for confirmation, offer/assignment, en-route/arrival, cancellation/reassignment, completion, payment/refund, and support outcomes. Delivery retries must not repeat financial or booking actions.

## 10. Edge cases and recovery
Test cleaner goes offline after offer; offer expires during acceptance; two cleaners accept simultaneously; customer double-submits; cleaner becomes suspended; schedule conflict appears; no cleaner accepts; customer/cleaner loses connectivity; location permission denied; payment authorization fails; webhook is duplicated/out of order; cancellation races with start; reassignment fails; and admin intervenes. Define timeout and manual-support paths.

## 11. MVP invariant
At most one active cleaner assignment exists for a booking. Multiple historical offers/assignments may be retained for traceability. Future team booking is a separate approved capability and must not weaken the single-cleaner invariant in MVP.
