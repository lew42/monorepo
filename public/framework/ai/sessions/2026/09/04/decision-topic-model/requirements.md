# decision-topic-model — judge brief (Opus)

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; everything there is mandatory. Skills: `new-task` (this dir, group `platform`), `code`, `layout`, `new-page` before any page, `documentation`, `finish-task`.

**You are the judge, not a digger.** Nine research minions and two scouts have reported. Your job: the two decisions that shape everything else, written as §33 records, and the smallest useful vertical slice — plus the demo that makes the topic model concrete.

## Read — all of it, cold

- The owner's brief: `public/framework/ai/2026-09-04/mastermind-platform/requirements.md` (§2–§7, §14–§19, §30–§35 especially).
- `public/imagine/platform/existing/page.js` (what exists; the `is: "topic"` recommendation and its evidence) and `public/imagine/platform/prior/page.js`.
- Every verdict: `public/imagine/platform/research/<topic>/verdict.md` for cloudflare, data, users, payments, realtime, video, ai, community (and security if it has landed). Open a `log.jsonl` only where a verdict cites an entry you doubt.
- `public/framework/core/Page/readme.md`, `doc/roles.md`, `doc/columns.md`, `doc/declaring.md`, `doc/method/store.md`; `public/imagine/page.js` (a columns world); `public/imagine/game/` and `public/imagine/team/` (progress from `is: "topic"` + `store()`).

## Deliverables

1. **`public/imagine/platform/decisions/topic-model.md`** — ONE screen. The §33 record for *what a topic is in code*: Decision · Problem · Options considered (`Topic extends Page` · `is: "topic"` role + config words · a separate Topic data model beside pages · a topic as a directory convention with no code) · Recommended · Why · Advantages · Disadvantages · Security · Cost · Scalability · Complexity · Migration/reversibility · Deliberately NOT doing yet. Then the capability words a topic may declare (which features are opt-in — community, levels, spaces, intro — and how a page says so without every page paying), and how a subtopic differs from a page.
2. **`public/imagine/platform/mvp/page.js`** — the vertical slice, as a page: an ordered list of steps, each with *what it proves*, *what it costs* (from the verdicts' numbers), *what it depends on*, and the line where the site stops being static. Challenge the brief's §31 order with the verdicts in hand (data says static+git alone first; video says embed only; payments says Stripe Billing only, no balance; realtime says text-only DO per channel; users says DIY OAuth + HMAC cookie + KV ban; community says levels 1–5 rubric, one gated privilege). Say where they conflict and rule.
3. **`public/imagine/platform/topic/`** — the DEMO: one topic ("JavaScript") as a tree of pages on the existing model — `is: "topic"`, subtopics as columns, a 10-minute-intro page (a stub with its structure, not content), a community space stub, a progression stub reading `store()` — using only words the framework already has. No new CSS, no new class names, no new core. The point is to show the abstraction holds on real pages; a reader opens it and sees a topic. The mastermind wires `decisions`, `mvp` and `topic` into the hub — do not edit `public/imagine/platform/page.js`. `decisions/` needs a `page.js` of its own that lists the records (`.md` files beside it are pages once it exists).

## Method

Every claim you make cites a verdict or a file. Where verdicts conflict, rule and say why in one line; where you overrule the owner's brief, say so explicitly under "deliberately NOT doing yet". Verify the demo renders at 1280 and 3440 on a private server (rules file), zero console errors, and that every link on the mvp page resolves. Budget ~300k tokens. Report in ≤ 15 lines: the two decisions in a line each, the slice's first three steps, the demo url, tokens, what you left open.
