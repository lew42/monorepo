# research-payments — brief

Read [`../mastermind-platform/research-brief.md`](../mastermind-platform/research-brief.md) first (shared rules, deliverable shape, method). Topic dir: `public/imagine/platform/research/payments/`. Task dir: this one.

**The question (your log's seed line):** Can a USD 10/month membership fund cent-scale tipping and payouts without becoming a payment processor?

## Start from

The brief §23, §24, §25, §29 (in `../mastermind-platform/requirements.md`). Nothing is built; there is no prior payments work in this repo.

## Questions — a closed list

1. **Membership at $10/month.** Stripe Billing with the Payment Element or embedded Checkout plus the Customer Portal — a custom-looking UX with the sensitive parts hosted (PCI SAQ-A). Alternatives: Paddle, Lemon Squeezy, Polar (merchant of record — global tax handled, higher fee). Fees at 1k and 10k subscribers. Workers compatibility: stripe-node on Workers (fetch client), webhooks, signature verification with WebCrypto, idempotency keys.
2. **Tipping economics.** The card-fee floor (2.9% + $0.30 US; verify) makes a $0.01 charge impossible. Models: (a) prepaid balance — fund $10, spend in cents · (b) monthly allocation from the membership ("$X of your $10 is yours to give") · (c) aggregate tips into one periodic charge (Flattr, Medium's pool) · (d) per-tip charges only above $1. Evaluate each on fees, fraud, refunds, accounting, UX and legality.
3. **Stored value and the law.** US money-transmitter licensing, FinCEN prepaid access, closed-loop exemptions, non-refundable platform credit vs refundable balances, escheatment/unclaimed property; EU e-money rules. What the brief's "$10 → tipping balance" idea triggers, and what a Stripe Connect design avoids because Stripe holds the funds and we never do.
4. **Creator payouts.** Stripe Connect Express (KYC, 1099-K/1042-S handled), per-payout fees, minimum payouts, cross-border; destination charges vs separate charges + transfers; the platform fee. Who is the merchant of record for a tip.
5. **The ledger.** Double-entry, integer cents, append-only, idempotency keys, reversal entries, reconciliation against Stripe balance transactions; where it lives (D1) and why not a DO or KV.
6. **Failure UX.** Refunds, chargebacks, disputes, fraud (Radar, velocity limits, tip caps per day, friendly fraud on tips), tax (Stripe Tax vs a merchant of record), receipts; decline codes → the exact message a user sees; SCA/3DS.
7. **Marketplace.** Premium modules: pricing, revenue share (say 80/20 and defend it), licensing (who owns what), refund policy, moderation of paid content, app-store parallels; what must exist before it (identity, ownership, content model).
8. **The free/premium boundary** — three candidate lines, one sentence of rationale each.

## Challenge

Real-dollar tipping at cent scale. "Some of the $10 becomes balance." Building any of this into the MVP at all. Whether a merchant of record beats Stripe for a one-person company.

## Numbers to bring back (url + date)

Stripe fee on a $10 subscription; Stripe's minimum charge amount; Connect Express payout fee and monthly account fee; Paddle / Lemon Squeezy / Polar percentage; the 1099-K reporting threshold for the current tax year; chargeback fee.
