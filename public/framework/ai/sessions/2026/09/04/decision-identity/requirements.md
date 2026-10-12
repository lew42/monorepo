# decision-identity — judge brief (Opus)

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; everything there is mandatory. Skills: `new-task` (this dir, group `platform`), `documentation`, `finish-task`. One record; no pages to build.

**You are the judge, not a digger.** The users verdict proposed an identity, session and authorization model; the security skeptic then attacked it and every other verdict. Rule.

## Read — all of it, cold

- The owner's brief: `public/framework/ai/2026-09-04/mastermind-platform/requirements.md` §8, §9, §10, §27, §28.
- `public/imagine/platform/research/users/verdict.md` and its `log.jsonl`; `research/security/verdict.md` and its `log.jsonl` (the breaks table and the threat model); `research/community/verdict.md` (reputation-gated privileges — the hook authorization must leave); `research/payments/verdict.md` (what a creator account needs from identity).
- `public/imagine/platform/decisions/data.md` (where identity rows live; the one KV ban key) and `decisions/local-dev.md` (the dev-only login and its gate).
- `public/notes/auth/readme.md` — the design record all of this extends; `public/imagine/platform/existing/page.js` (the dev-only Express session on a hardcoded secret that exists today).

## Deliverable

**`public/imagine/platform/decisions/identity.md`** — ONE screen (a decision record may breathe to ~100 lines; not more). The §33 record for *who a user is and what they may do*: Decision · Problem · Options considered · Recommended · Why · Advantages · Disadvantages · Security · Cost · Scalability · Complexity · Migration/reversibility · Deliberately NOT doing yet. Inside it, rule explicitly on each of these, one line each, citing the verdict or security entry that decides it:

1. Providers for the MVP (the users verdict said GitHub + Google + magic link; security may have moved it).
2. The session mechanism and how a ban lands — stateless HMAC + `token_epoch` + the KV `banned:` key, or a D1 sessions table — with the number that decides it (ban latency vs reads per request).
3. The dev-only login switch: exactly how it is gated so it can never run in production (var + hostname, per local-dev.md — is that enough?).
4. Authorization: the signature of `can(user, action, target)` in the Worker and its first six rules (owner, admin, topic founder, moderator, member, anonymous), and the hook for reputation gates.
5. Anonymous participation: in or out of the MVP, and the shape if in (the k-anonymity theory in the users log says level × topic re-identifies).
6. `profile_id` vs `user_id` from day one, or not.
7. Data minimization: the columns the users table holds and the ones it must never hold; deletion and export.

## Method

Every claim cites a verdict, a log entry (by title) or a file. Where you overrule the users verdict, say which line and why. `decisions/page.js` exists (the topic-model judge wrote it) — add `identity` wherever it lists records if it lists them by name; if it enumerates `.md` files itself, touch nothing. Budget ~200k tokens. Report in ≤ 15 lines: the seven rulings in a line each, tokens, what you left open.
