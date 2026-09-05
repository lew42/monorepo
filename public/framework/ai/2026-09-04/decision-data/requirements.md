# decision-data — judge brief (Opus)

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; everything there is mandatory. Skills: `new-task` (this dir, group `platform`), `documentation`, `finish-task`. No pages to build — one record and one proposal.

**You are the judge, not a digger.** The question is the brief's §12–§13: *where does state live, on what Cloudflare shape, and how do we develop it locally.* Three verdicts answer parts of it and two of them disagree.

## Read — all of it, cold

- The owner's brief: `public/framework/ai/2026-09-04/mastermind-platform/requirements.md` §10, §12, §13, §20, §30.
- `public/imagine/platform/research/cloudflare/verdict.md` (one DO per topic; the 500–1,000 req/s per-object ceiling; the cost table; `run_worker_first`), `research/data/verdict.md` (static+git alone first; D1 mutable rows for personal data; event log scoped to real-time; git is not a write path), `research/realtime/verdict.md` (one DO per CHANNEL; hibernation; the one-line client change), `research/users/verdict.md` §33 (sessions and the KV ban check), and `research/security/verdict.md` if it has landed. Open each `log.jsonl` where a number decides something.
- The house's existing thinking, which the verdicts extend: `public/imagine/cms/thinking.md`, `public/imagine/stream/doc/durable-objects.md`, `public/notes/auth/readme.md` §1, §4, §7.
- `public/imagine/platform/existing/page.js` (the write paths that exist today are loopback-only) and `public/imagine/platform/prior/page.js` (no Worker `main` has ever shipped).

## Deliverables

1. **`public/imagine/platform/decisions/data.md`** — ONE screen. The §33 record for *where state lives*: Decision · Problem · Options considered (the data verdict's A–E) · Recommended · Why · Advantages · Disadvantages · Security · Cost (at 100 / 10k / 1M users, from the cloudflare table) · Scalability · Complexity · Migration/reversibility · Deliberately NOT doing yet. Inside it, **rule on the conflict**: a Durable Object per topic (cloudflare) or per channel (realtime)? Name the object key, the hot-object failure and its mitigation, and what a "channel" is when a topic has one. Then the data classes table (curated · UGC · events · derived · identity · money → home, write path, delete path) as the data verdict drew it, corrected where you disagree.
2. **`public/imagine/platform/decisions/local-dev.md`** — ONE screen, a buildable proposal for the local multi-user harness the brief's §10 wants: `wrangler dev` beside `node server.js` (the cloudflare verdict flagged coexistence as unverified — design it so the next minion can test it: ports, a dev-only `/api/*` proxy in `Server/`, or the Worker serving assets itself in dev), seeded fake users (from the users verdict's `?as=<handle>` recipe), roles, the anonymous path, a DO chat room with two Playwright contexts. Name the files it would create, and the one command that starts it. Note explicitly: the repo forbids new npm dependencies without asking — `wrangler` via `npx` is fine; say whether anything else would be needed.

## Method

Every claim cites a verdict or a file; every number carries its url. Where you overrule a verdict, say which and why in one line. `decisions/` will have a `page.js` written by the topic-model judge — if it does not exist yet when you land, say so; do not write it. Budget ~250k tokens. Report in ≤ 15 lines: the ruling on the DO shape, the recommended architecture in two lines, the local-dev start command, tokens, what you left open.
