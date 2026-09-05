# hub-report — polish brief

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; everything there is mandatory. Skills: `new-task` (this dir, group `platform`), `code`, `layout`, `documentation`, `finish-task`.

**The ask:** the owner lands on `/imagine/platform/` at 3440. Make that page the two-minute report of the whole program, and fix the three things the owner saw in his own tab today.

## Read first

- `public/imagine/platform/page.js` (the hub), every child's `page.js` for its `description:` (existing, prior, research, decisions, mvp, topic, omnibox, local if it exists).
- The run task's log for what landed, in flight, parked and spend: `public/framework/ai/2026-09-04/mastermind-platform/task.jsonl` — every `agent` line with an `outcome`, every `log` line. Numbers come from there, never from memory.
- `public/imagine/platform/mvp/page.js` — the "Where the verdicts disagree" table.
- `public/imagine/page.js` (the columns host; the hub is a `large` column in it; `mvp/` is its `default` child, so the row is rail + hub + MVP on arrival).

## What lands (closed list)

1. **Card descriptions that fit.** A preview card clamps its description to two lines (~55 characters at the card's width in a `large` column). Rewrite every child's `description:` to say the one thing in ≤ 55 characters — a description is the card's subtitle everywhere it is previewed, so it must read whole. Edit only the `description:` line of each child page. Nothing else in those files.
2. **The MVP conflicts table — SUPERSEDED: the `table-equal` minion owns that table now; skip this item.** (was:) In `mvp/page.js`, the "Where the verdicts disagree" table gives the first column most of the width and squeezes "ruled" to a strip. Fix it with the words the framework has: shorten the conflict cells to one clause each (the ruling carries the argument), or split the ruling's first bold phrase into its own column. No CSS. Verify at 1280 and 3440 that both columns read.
3. **"Where this stands" on the hub** — a section under the vision paragraph, before the cards, in `public/imagine/platform/page.js`: four short lists, each item one line with a link — *Landed* (nine verdicts with their entry counts, four decision records, the MVP slice, the topic demo, the omnibox, the two scouts), *In flight or next* (from the task log's latest `assign.now`), *Parked for the owner* (the questions every verdict left open that only the owner can close — the stored-value legal question, the DO shape's hot-topic cap, user-created subtopics, Apple 4.8, the per-user AI spend cap), *Spend* (minion count, tokens summed from the `agent` lines, the session window from the latest usage log line). Dates and numbers from the log, and say "as of <time>". Keep it under 30 lines of page; the cards below it stay.
4. **The hub's own description and title** unchanged; `index: true` and `children:` unchanged.
5. **One line in `public/imagine/platform/decisions/local-dev.md`**, under its "What the next minion tests first" section: built 2026-09-04 (`/imagine/platform/local/`), all three assumptions verified in a real browser, and the one correction — wrangler 4.129 ignores `run_worker_first` at the top level of the config; it must nest under `assets`. Nothing else in that file.

## Verify

Private server (rules file), headless, 1280 and 3440: the hub, the MVP page, and the `/imagine/platform/` card wall — every card's description shows whole (no ellipsis; check `scrollHeight <= clientHeight` on each `.page-preview` description, or read the text back and compare). Zero console errors. Screenshots at 3440 in your task links.

## Fences

Write only: `public/imagine/platform/page.js`, the one line in `decisions/local-dev.md`, the `description:` line in each direct child's `page.js`, `public/imagine/platform/mvp/page.js` (the table only), this task dir. No CSS, no class names, nothing under `research/<topic>/` (those are the minions' logs), nothing in `ext/`. Budget ~150k tokens.
