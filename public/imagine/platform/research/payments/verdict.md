# Payments — membership, tipping, payouts verdict

**MVP recommendation.** Ship the $10/month membership on Stripe Billing (Payment Element + Customer Portal, hosted PCI SAQ-A pieces) — costs about $0.66/subscriber/month, ~6.6% (*Computed: a $10/month subscriber costs...*). Ship **no** tipping balance and **no** stored value at all on day one: a $0.50 hard floor makes real 1-cent charges impossible, and a spendable balance sent between users reads as money transmission, not a closed-loop gift card (§33 below). Defer tipping to a Stripe Connect per-tip charge above $1 (model d) or a Flattr/Medium-style pooled payout (model c) — both clear the fee floor and never require the platform to hold a balance.

## §33 — The tipping-balance decision (the expensive-to-reverse one)

| | |
|---|---|
| **Decision** | Whether any part of the $10 membership becomes a spendable, sendable tipping balance |
| **Problem** | The brief's own idea — "part of the $10 becomes a spendable tipping balance" — needs a held, user-to-user-transferable balance. That is the fact pattern money-transmitter law and FinCEN's prepaid-access rule regulate; a $0.50 real-charge floor also rules out any per-cent real charge outright |
| **Options** | (a) prepaid balance, fund $10 spend in cents · (b) monthly allocation, "$X of your $10 is yours to give," never cashable · (c) aggregate tips into one periodic real charge (Flattr/Medium) · (d) per-tip real charges only above $1 |
| **Recommended** | Ship neither (a) nor (c)/(d) yet. If tipping ships in the MVP at all, use (b): a non-refundable, non-transferable allocation, never sent as cash, only ever unlocking creator payout via the platform's own Connect transfer |
| **Why** | (b) is pure bookkeeping against money already collected once — no new charge, no held balance moving between users. (a) is a held balance = stored value. (c)/(d) need a real per-transaction Stripe Connect charge, clean legally but real engineering (batching or a $1 tip floor) |
| **Advantages** | (b): zero new PCI/MSB surface, ships fast, matches "tipping should feel like a like" |
| **Disadvantages** | (b): not "real dollars changing hands" the way the brief's Reputation vision wants; still needs a legal read on whether *any* balance-like construct crosses into stored value even non-cashable |
| **Security** | Stripe Connect (models c/d) keeps the platform out of custody of funds — Stripe holds them under its own e-money/MSB license; a held balance (model a) puts custody, and the licensing question, on the platform |
| **Cost** | (a)/(b): no per-tip Stripe fee, since no new charge. (c): one batched charge/period pays the fee once. (d): every tip pays the $0.50-floor + 2.9%+$0.30 fee individually — cheapest per-dollar only above a few dollars |
| **Scalability** | (b) and (d) both parallelize trivially (independent charges); (c) needs a batch-reconciliation job per period |
| **Complexity** | (b) lowest (one ledger column); (c) highest (batch charge, then per-creator payout split, then per-period refund handling) |
| **Migration/reversibility** | (b) → (d) is additive (add real charges later, keep the allocation as a multiplier); (a) → anything-else means unwinding a live customer balance, the hard direction |
| **Deliberately NOT doing yet** | Any model where the platform holds a cash-out-able balance; per-tip charges below $1; any tipping at all before the open legal question below is closed |

## The three numbers that matter

- **Stripe's real-money floor:** $0.50 minimum charge, enforced "so the Stripe fee doesn't exceed your charge" — [docs.stripe.com/currencies](https://docs.stripe.com/currencies), fetched 2026-09-04. This is *why* cent-tipping needs a balance or a pool, not a per-tip charge.
- **Stripe Connect Express:** $2/active-account/month + 0.25% + $0.25/payout — [stripe.com/connect/pricing](https://stripe.com/connect/pricing), fetched 2026-09-04. The payout-side cost of any creator-payment feature.
- **1099-K threshold, 2025+:** $20,000 AND 200+ transactions (OBBBA restored the pre-ARPA line) — [irs.gov/businesses/understanding-your-form-1099-k](https://www.irs.gov/businesses/understanding-your-form-1099-k), fetched 2026-09-04. Most creators on this platform will never trigger a 1099-K.

## If the MVP must shrink further, cut in this order

1. Tipping entirely — membership alone, no "like with money" feature, until model (b) or (d) is legally reviewed.
2. Connect/creator payouts — no marketplace, no creator earnings, membership-only revenue.
3. Stripe Tax / multi-currency — US-only pricing, manual sales-tax registration deferred.
4. Customer Portal self-serve cancel/upgrade — support-handled billing changes until volume justifies it.

Open legal item this dig could not close: *Does a non-cashable balance that only multiplies a real, simultaneous Stripe charge escape stored-value rules?* — needs paid counsel, not more search. See the log's closing question.
