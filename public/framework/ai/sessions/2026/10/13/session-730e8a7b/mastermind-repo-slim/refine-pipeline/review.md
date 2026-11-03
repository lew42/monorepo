verdict: fix
1. [fix] The Coverage tab can never show a verdict: `RefinedCard.outcomes()` (public/framework/ext/Refine/RefinedCard.js:643-653) reads `o.source`, `o.status` and `o.feature` at the top level, but every line in `ai/doc/asks-outcomes.jsonl` is wrapped (`{"ask":{…source…}}`, `{"feature":{name,status}}`). On top of that, `source` is an 8-character prefix (`"87bec773:11150"`), which the full-UUID regex never matches. So every ask reads "unreviewed" and every session scores 0%. Fix: unwrap `o.ask` / `o.feature`, match on `session.slice(0,8)`, and use `feature.name` in place of `o.feature`.
2. [fix] Ask 4 (run on the last 7 days of owner prompts) is not in the diff. `queue/runs.jsonl` holds only the 20 review calls (10 prompts × v1/v2), and `asks.jsonl` holds their 333 asks (177 + 156). Nothing says where the run stopped. Since the `cwd` fix brings a call to ~$0.002, a 7-day run fits the $30 easily.
3. [fix] Ask 3 asks for proof on three sessions from 10-12 and 10-13, with screenshots, and the page change needs the four-width shots. The task dir has no `shots/`, and commit 0c4ea4b14 drops a "screenshots gone" line. The Coverage tab is unproven, and finding 1 means it would show 0% anyway.
4. [fix] Ask 5 names `ext/Refine/doc/refine.md`, which does not exist. The rule went into `doc/refine-queue.md` instead, which is fine, but `Server/RefineQueue.mjs:32` and `:219` still point at "doc/refine.md". Point them at `doc/refine-queue.md`.
5. [note] Ask 2 is met: `haiku-review.md` scores 10 products v1 0.90 → v2 0.96, gives the 0.7 confidence, and v2 is the default brief. One product (#5 at 0.8) and the mean of v1 are under the ≥0.9 bar, and the review says so.
6. [note] Ask 1 costs, from `queue/runs.jsonl`: $0.07–$0.45 a call and a max of 30,785 tokens (under 100k). All 20 calls ran before the `cwd: os.tmpdir()` fix, so no real post-fix cost per prompt is logged yet. The ~$0.002 figure comes from a "say hi" experiment.
7. [note] `Servex/ext/refine/RefineCall.js` and `ai/sessions/readme.md` are outside the fence. Both edits are tiny and justified: the opt-in `cwd`, and one index line. The doc rightly flags that Echo should take the same `cwd` change.
8. [note] `queue/asks.jsonl` commits up to 200 characters per ask. These are Haiku paraphrases, not transcript text, so it stays inside the "one-line cites" rule, but it is the closest the diff comes to it.
9. [note] The readme link `ext/Refine/readme.md:795` uses the `/md/doc/refine-queue/` route instead of the plain file path (`doc/refine-queue.md`) that CLAUDE.md asks for. Sibling lines do the same.
10. [note] Simpler: `RefineQueue.existing()` (Server/RefineQueue.mjs:143-151) imports the browser `AISession` class into node just to locate a page.jsonl. Reading `queue/runs.jsonl` (`session`, `line`, `brief`, `ok`) would answer "already refined?" from the queue's own log.

Widths given: none (no `shots/` in the task dir), so only Requirements and Words are answered below.

## Requirements
- 1 "RefineQueue: one Haiku per prompt, N at once, node starts the next" — yes — Server/RefineQueue.mjs:194-206, slot pool, `--parallel` default 2
- 1 "Brief under 3k tokens plus the prompt" — yes — RefinedCard.BRIEF v2 is about 1k tokens; `cwd` outside the repo drops the 8k of auto-memory
- 1 "Page deltas as a `refined` card, rows with cites + /ai-logs link" — yes — RefinedCard.item(), page_add via page_tools; cites per ask, `raw` link per card
- 1 "Dry run with estimate; --limit" — yes — RefineQueue.mjs:256-265
- 1 "Log real cost per prompt and tokens per minion, report the max" — yes — runs.jsonl, `--report`; max 30,785
- 2 "Opus review of 10, change the brief, rerun, both scores" — yes — haiku-review.md, v1 0.90 / v2 0.96
- 3 "Coverage tab: asks, status from asks-outcomes, click-through, score" — no — the tab is built, but statuses never match (finding 1)
- 3 "Prove it on three sessions with screenshots" — no — no shots (finding 3)
- 4 "Run on the last 7 days, say where it stopped" — no — only the 20 review calls ran (finding 2)
- 5 "Promotion rule in documentation skill + doc; --repeats" — yes — SKILL.md one paragraph, refine-queue.md, `--repeats`; stale doc/refine.md pointer (finding 4)
- 6 "Report on the card" — not checked — no card text in the diff

## Words
- content: plain sentences — yes — refine-queue.md opens with what it is and why, then "Run it"
- content: one takeaway per section — yes — sections are short and named for their topic
- content: names are links — partly — the readme uses the route instead of the file path (finding 9)
