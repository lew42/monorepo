# decisions-system — every decision as a claim tree with approve or improve, produced by the skills, closing the loop back to the rule

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one verb, one tab, one template; reuse the seams that exist). Clear beats brief by far. Prioritize (the verb and the tab first, the template second, the skills' lines third, the first tree last).
**Length budget:** the Decisions tab is one screen for a dozen decisions; a decision card is a question, the options as cards, the chosen one marked, one reason, two buttons. Your landing report is one screen.
**The reader is the overwhelmed newcomer.** Shown, not told; detail one click down.

## The owner's words (2026-09-17, 22:40)

> Didn't we do something regarding decisions? Like how to break a decision into claims? [...] we sort of want a feedback system, where each decision is documented, and if it's wrong, we can try to figure out why, and fix the system. This would require an "approve or improve" system. The AI skills systems should produce this decision documentation as a structured page tree.

> We need a decision UI. Like, a nested list of cards that clearly looks like it represents options or alternatives? Maybe they just need bg of their own?

And the layout skill now says (the owner, today): options and alternatives get a box each, their own background, so the set reads as a choice; siblings that are roughly equal get nothing.

## What exists — reuse, do not rebuild

- `ext/Research` — claims with credence, a skeptic pass, verdicts, rendered live from append-only jsonl (`research` skill). `/imagine/importance/` — a typed graph + pairwise judgments, written by `rpc:append`. `/imagine/platform/decisions/` — decision records. Every module's `doc/decisions.md`. Today: `/layouts/browse/` writes Approve / Improve verdicts to a jsonl through `rpc:append` (`public/layouts/browse/verdicts.js` — the seam to copy); the `ask` verb in `ext/JSONL` merged by id and rendered by `ext/AITask/asks.js` (the shape and the tab to copy); the "why" folds on `/layouts/browse/` items and `/layouts/practice/` pages (nine answers each).
- Read `ext/JSONL/doc/task-jsonl.md`, `ext/AITask/doc/asks.md`, `ext/AITask/asks.js`, `public/layouts/browse/verdicts.js` first.

## Deliverables (each ticked against the sentences above at harvest)

1. **The `decision` verb** in `TaskJSONL`, merged by `id`:
   `{"decision": {"id", "at", "about": "<the question, one line>", "options": [{"id", "say": "<one line>", "why": "<one line>"}], "chose": "<option id>", "because": "<one sentence>", "rule": "<skill>#<section>", "status": "open|approved|improve", "note": "<the owner's improve note>"}}` — a decision is a claim tree: the question, the options considered, the one chosen, the reason, and the rule that produced it. Document it beside `ask` in `ext/JSONL/doc/task-jsonl.md` and `ext/AITask/doc/manifest.md`.
2. **The Decisions tab** on a task page (`ext/AITask`): after Asks, before Report, present only when a task carries decisions. Level 1: one row per decision — the question, the chosen option's line, a status mark. Click → the option cards in place: **every option a card with its own ground** (the decision UI; the chosen one marked, the others plain), the reason under them, the rule as a link to the skill section, and **Approve / Improve** (Improve takes a one-line note). A press appends a `verdict` line to THAT task's own `task.jsonl` through `rpc:append` (the browser's seam; the task log is the record — never a second file), which merges into the decision's `status`/`note` and updates live over the socket; buttons hidden off the dev server.
3. **Closing the loop.** An Improve whose decision names a `rule` is a defect in that rule: a CLI `decisions.mjs file` (in `ext/AITask/` beside the others, or wherever the existing CLIs live — look at `importance.mjs`) turns every unfiled improve verdict into one dated line in that skill's `improvements.md` ("<date> · <rule> · the owner said: <note> · decision <task>/<id>") and marks it filed — the mastermind runs it at harvest; say so in the doc. The browser cannot append to `.claude/`, which is why it is a CLI.
4. **`ui/decision`** — the template (markup + css, `ui-decision-*` prefix, `new-css-class`): a nested list of option cards with their own ground, the chosen one marked; used by the tab and available to any page (`/framework/ui/` gets it as a child like the twenty others — read `ui/readme.md` for the shape).
5. **The skills produce it.** One line each in `.claude/skills/code/SKILL.md` (its decisions section) and `.claude/skills/layout/SKILL.md` (after the five questions): *every choice between alternatives you make is a `decision` line in your task.jsonl — the question, the options, the one chosen, why, the rule — so the owner can approve or improve it.* Additive, nothing else changes.
6. **The first tree.** Write this run's decisions as `decision` lines from the mastermind's log (`ai/2026-09-17/mastermind-layout-browser/task.jsonl` — read its `log` lines): the spacing ladder (5 rungs vs 2 vs 3, chose 5, rule layout#spacing), where the browser lives (`/layouts/browse/` vs `/imagine/review/`), the Reader at 3440 (centre vs span), the nav tuning (ceiling / floor / 34cqi — status open), applying the core seam, even columns as a core mode. Put them in a file `run-decisions.jsonl` in your task dir — the mastermind appends them to its own log (its fence). Your own task's decisions (the verb's shape, where the tab sits, why a CLI) go in YOUR task.jsonl as the live demo.

## Rules

- Load `code`, `layout`, `css`, `new-css-class`, `new-page`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/decisions-system/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/framework/ext/JSONL/**`, `public/framework/ext/AITask/**`, `public/framework/ui/decision/**` (new) + the one children word and one line in `public/framework/ui/page.js` / `readme.md`, one additive line each in `.claude/skills/code/SKILL.md` and `.claude/skills/layout/SKILL.md`, your task dir. Nothing else — never the run task's task.jsonl (read it; the mastermind writes it), never `/layouts/browse/`.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. The owner's server (port 80) is NOT running; start your own: `PORT=8105 node server.js` from the repo root, in the background; kill it by PID when you land. `ui-test` has the headless recipe; press Approve and Improve for real on YOUR task's decision, watch the tab update without a reload, then leave the verdict in (it is your task's record).
- Two numbers that must agree: decisions in a task.jsonl and rows on its Decisions tab.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock; never Out-File for jsonl.
- Landing: `outcome` = a headline, the links (your task page's Decisions tab, `ui/decision`, the doc), one screenshot of the tab with an option set open at 1280, the path of `run-decisions.jsonl`, what was left and why. One screen.
