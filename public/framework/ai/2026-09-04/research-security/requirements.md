# research-security — brief (the skeptic)

Read [`../mastermind-platform/research-brief.md`](../mastermind-platform/research-brief.md) first (shared rules, deliverable shape, method). Topic dir: `public/imagine/platform/research/security/`. Task dir: this one.

**The question (your log's seed line):** What is the threat model, and which of the other verdicts break under it?

You are the adversary the other nine minions did not have. They dug alone and converged; you read their verdicts cold and try to break them. Half your entries will be `opinion` and `question` — grade honestly. An `established` here is a documented attack class, a regulator's text, or a vendor's stated guarantee, each with its url.

## Read first — every verdict and the two scout pages

- `public/imagine/platform/research/<topic>/verdict.md` for cloudflare, data, users, payments, realtime, video, ai, community — and each one's `log.jsonl` where a verdict cites an entry you doubt.
- `public/imagine/platform/existing/page.js` (what exists; note: the only working auth code is a dev-only Express session on a hardcoded secret) and `public/imagine/platform/prior/page.js`.
- `public/notes/auth/readme.md` — the design record the users verdict extends.
- `Server/plugins/Auth.js`, `Server/plugins/MCP.js`, `Server/readme.md` (the loopback-only rule and the RCE that was closed on it — `public/framework/ai/` has the record; search `rpc:cmd`).
- The brief §8, §9, §20, §27 (in `../mastermind-platform/requirements.md`).

## Questions — a closed list

1. **The threat model, written down.** Assets (accounts, sessions, the ledger, private messages, moderation logs, the fal.ai key, the Stripe secret, the owner's admin), attackers (spammer, scraper, credential stuffer, a banned user, a hostile moderator, a compromised creator account, a curious insider, a subpoena), and the top ten abuse cases ranked by likelihood × damage. One entry each for the top ten.
2. **Authentication.** The users verdict: OAuth code flow on Workers, an HMAC cookie with `token_epoch`, a KV `banned:` check with a ~60 s window, a dev-only `?as=<handle>` switch. Attack each: the dev switch leaking into production (how is it gated — a build flag, an env var, a hostname check — and what happens if a Worker is deployed with it on); cookie theft and replay; OAuth state/PKCE; magic-link interception; the 60 s window under a coordinated raid.
3. **Authorization and isolation.** `can(user, action, topic)` in the Worker: what an IDOR looks like here (a topic id in a url), moderator privilege escalation, a topic founder deleting another's content, cross-topic data leaks in a DO-per-topic design (one object, one topic — what if a message is routed to the wrong object).
4. **Abuse at creation.** Topic/subtopic spam, typo-squatting, duplicate flooding, Turnstile bypass rates, rate-limit shapes per anonymous id and per ip on Workers (the cost of each), the reputation gate as a defence and its Sybil failure.
5. **Privacy and erasure.** The data verdict keeps personal data in mutable D1 rows and scopes append-only logs to short-lived real-time state; the community verdict derives reputation from an append-only action log — do those two agree? What in the action log is personal data under GDPR, and what does a deletion request do to derived reputation. CDN-cached copies of deleted content.
6. **Anonymous participation.** "Anonymous — Level 5 JavaScript": deanonymization by level × topic × timing; the upgrade-to-account path as a linkage; what the users verdict cut (it ranked anonymity last to keep) and whether that is right.
7. **Recording and consent.** Realtime's default (recording off, all-party consent everywhere): what still gets stored (text chat history is a record), retention, minors, the public-knowledge-record ambition vs the right to be forgotten.
8. **Money.** Payments' Stripe-only, no-balance design: webhook forgery (signature verification with WebCrypto — the exact check), replay, idempotency, refund abuse, tip-based money laundering at scale, creator payout fraud, the platform's PCI scope (SAQ-A only if no card data ever touches our origin — verify Payment Element keeps it that way).
9. **Keys and secrets.** The fal.ai key (already found in a neighbouring project's config), the Stripe secret, the HMAC secret: Worker secrets vs `.dev.vars`, rotation, what a leaked `.claude.json` costs, the loopback rule on the dev server and whether `wrangler dev` reopens anything.
10. **Local-dev parity.** Which production controls the local harness must simulate for a UX test to mean anything (auth, rate limits, roles) and which it must NOT (real keys, real payments).

## Deliverable shape (verdict.md, one screen)

1. The threat model in ten lines (top ten abuse cases, ranked).
2. **A table: verdict · what breaks · severity · the fix** — one row per other topic. "Holds" is a legitimate row.
3. The §33 record for the one security decision that is hard to reverse (probably the session/ban mechanism or the dev-switch gate).
4. The three numbers.

## Challenge

That a one-person platform can run moderation at all. That the KV ban window is acceptable. That "auth may only ever add to a page" survives a page that shows private data. That the loopback-only dev socket stays safe once a Worker exists beside it.
