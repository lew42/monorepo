Budget: $20

# The card pipeline: no major work without a card the owner can read

**The owner's words (2026-10-02):** "I never saw anything on my dashboard about [the Inbox restructure / new classes / major work]… the items above 90 seem arbitrary… when I click through, there's not a lot of helpful information… often they're associated with a task that may or may not be linked… there wasn't anything on the card."

**The fact behind it (computed):** `ai/2026/10/02/` holds one card today. The four major asks of the day — `page-extends-item`, `panel2-sessions`, `ai-system-docs`, `framework-home` (all in `ai/2026-10-02/`) — have task dirs, briefs and ask lines in `ai/asks.jsonl`, and **no card**. Fix the pipeline, not the four cards; then the four cards fall out of it.

Laws that rule this task: 6 (one of everything — the card tool, the rail, the ledger already exist; extend them), 7 (compute, don't recall — every link, score reason and `paths` field is written by node from real state). Cards are what the owner reads (CLAUDE.md "Cards"); the content skill says how a card reads at a glance.

## Items, in order

1. **Ask → card → task, by node.** In `Servex/asks/Asks.js` (the asks ledger, `ai/asks.jsonl`), when an ask line is appended for *major work* — its words name a new class or system, or core surgery; make this a plain `is_major(ask)` with a short word list and the brief's `Budget:` line ≥ $20 as a second signal — and no `card` is set, create the card through the one card maker (`Servex/cards/Cards.js`, the same code `create_card` uses) in today's folder, then write the card id back onto the ask (a new `{"ask":{"id","card"}}` status-style line, never an edit of an old line). The card's first line links the brief (`words`) and the task dir. Prove it in `Servex/asks/asks.test.mjs`: a major ask with no card gets one; a minor one does not; an ask that already has a card gets nothing.
2. **The iceberg tip.** The card's first section, written by the card maker from the ask + task.jsonl: **asked** (one line, the ask's title), **status** (from the task log: proposed / building / landed), **next step** (the task's latest `log` line, or "landed"), and three links — brief, task dir, the page it built (task.jsonl's `highlight.url` when there is one). Deeper sections follow. **Never an empty card:** `create_card` refuses when it gets neither a `summary` nor a `task` dir to compute one from, with a one-line reason. The rail (`ai2/rail.js`, `AIRail`) renders this section first on the card page.
3. **Priority bands, written down and shown.** Find where the 0–100 score is computed (start from `public/framework/ai/overview.js` and `ai2/rail.js`; the Inbox floor is 90). Write one line per band in that module's readme — e.g. `90+ needs the owner today · 70–89 lands without them, worth a look · 40–69 routine · <40 housekeeping` — pick the words from how scores are actually assigned, not from this example. Show the **reason** next to the number on every row (the rule that fired, in five words). Then audit every card currently at 90+: a script lists them with score and reason; re-score the ones whose reason no longer holds (a landed task is not "needs the owner today") and archive the stale ones — archive = a status line on the card, never a deletion.
4. **Audit 20 recent cards** with a script: empty body, or no task link. Fix the **cause** (the writer that produced them — a tool path that skipped the tip, a mastermind pattern that creates cards by hand) and only then the cards, by node. Record the count before and after on your card.
5. **Each module shows its own asks, with no copy.** (The owner: "each module should have data about the requests made of it, without duplicating data." Decided: `asks.jsonl` stays the ONE ledger.) Add a `paths` field to an ask's landing-time status line — the module dirs it touched, e.g. `["core/Page","core/Item"]` — computed by node from the task's `files.jsonl` when the task lands (hook it where `Asks.js` already watches `close_task`, `wrap_close_task`). A module's page then gets its asks as a **filtered view of the ledger** — reuse `AIRail` filtered by path; one component, no second list — reachable from the module's page (a small "Asks" section or tab; follow the `page` skill). Record the alternative in `Servex/asks/readme.md`: *a summary file per module under `<module>/ai/`* — rejected because it duplicates ledger data and goes stale. Prove `paths` in the asks test with a fixture `files.jsonl`.

## Then

Run the pipeline over today's four asks so each has a real card with the iceberg tip (that is the proof of items 1–2: the cards exist because the code made them, not because you typed them). Screenshot the day page headless at 1200 and put it on your card.

## Fence

You own: `Servex/asks/` (Asks.js, asks.test.mjs, readme.md), `Servex/cards/Cards.js` (+ its test), the `create_card` tool's wiring in `Servex/agents/External.js`, `public/framework/ai/overview.js`, `public/framework/ai/ai2/rail.js` (+ the readme where the bands go), the module-asks section wherever the `page` skill says a module's sections live, and this task dir. Never edit `asks.jsonl` by hand (append through `Asks.js`/`append.mjs` only), never edit CLAUDE.md, never delete a card. Pages changed → `review.mjs` with the four widths before `merge.mjs`.

## Land

Worktree; `merge.mjs`; report on your card in one screen: the four new cards (links), before/after counts from items 3 and 4, the band legend, and what needs the Servex restart (Asks.js runs inside Servex — the mastermind restarts; don't).
