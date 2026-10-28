<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Plan review  is this the right shape  and the right order " (words: plan, review, right, shape, order)

## Tasks (8, best first)
- 2026-10-25 [Build the session switcher in the dictate widget (also the mobile she…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/) — Round 2 landed: owner live-testing found the dropdown reflowed the header (huge in-flow list pushed the title/chips/v2-chip down, "vertically centered" on desktop). Rebuilt session_switcher() on ux/Popover.menu() (top-layer popover, built-in height cap + scro…
- 2026-10-13 [Repo size: measured, screenshots ignored, a three-phase plan](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/repo-size-plan/) — Screenshots are 84% of git history (397 of 474 MB); the session logs are not the problem. [The plan](/framework/ai/doc/repo-size.md) measure by script: node Server/repo-size.mjs. .git 762 MB, GitHub 305 MB, next push ~160 MB, deploy 19,619 of 20,000 files wha…
- 2026-09-28 [AI harness: research, verdicts and a build plan](/framework/ai/sessions/2026/09/28/11e3ca4d-25f2-443f-bd31-a9f638890021/harness-research/) — Don't build a harness first: run the Claude Agent SDK through OpenRouter with a non-Claude model, as a real Servex agent, and try opencode beside it. ![](/framework/ai/2026-09-28/harness-research/shots/harness-live-1920.png) research through the Research syst… · paths 1/1 exist
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…
- 2026-09-18 [report-order](/framework/ai/sessions/2026/09/18/report-order/) — The Asks tab is now a ranked hierarchy, top to bottom: bands ranked by outcome, cards ranked inside them, and a fold for the tangents. A rank line with list: "topics" now orders the five bands themselves (grip on the heading, same drag as a card), so the bigg… · paths 0/3 exist, gone: framework/ext/AITask/doc/ranking/ framework/ext/AITask/doc/asks/ framework/ext/JSONL/doc/task-jsonl/
- 2026-08-31 [improve-feeds-vary](/framework/ai/sessions/2026/08/31/improve-feeds-vary/) — Two builds, both proven headless; the verdict audit came back clean. ![](shot.png) ### 1. feeds/live is actually live now It was a one-shot fetch() on a page named "Live." The rpc:append write-path candidate from the brief does not transplant here — this page…
- 2026-09-05 [ux-decks](/framework/ai/sessions/2026/09/05/ux-decks/) — Kept the tile wall, swapped its picture for a real still, and closed a real dead-space bug — 3-column card tried for real and reverted with numbers. Nine ratio-diagram cards became nine real screenshots of the actual slide (Deck.preview(), public/imagine/deck…
- 2026-09-05 [ux-game](/framework/ai/sessions/2026/09/05/ux-game/) — Rebuilt /imagine/game/'s arrival card as a 3-column layout and kept it, measured. Field notes (the landing screen) went from a stacked list to left/centre/right: who-to-click, the run's own live chain+scene as a boxed "stage", and a per-realm fill-bar readout…

## Docs and readmes
- [catalog — two arrangements of previews() patched onto Page,…](/framework/ext/catalog/readme.md) — ## Use js initialize(){ this.catalog(); } // rail — the page's own content() becomes the first card const BANDS = { Surfaces: "card toolbar…
- [Card plan — how 75 kinds of box shrink to 36](/framework/ux/Content/plan/readme.md) — The plan for step 1 of the card consolidation, drawn live. It names eight target kinds (card, frame, region, preview, pill, row, fold, popo…
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [Previews — how a thumbnail can be the page](/framework/styles/layouts/doc/previews.md) — Split out of readme.md. Scope: what goes *inside* a card. Two kinds of thumb sit in the same card shape now — a live page.frame() painted d…
- [Masonry — a ragged wall with no gaps at the column bottoms,…](/framework/styles/layouts/masonry/readme.md) — ## Index - [packed](./packed/) — the same wall, reading left to right (no readme yet) ## Use js div.c("masonry", () => site.notes(24)).styl…
- [Rules — the layout dos and don'ts, one page each, with live…](/framework/styles/rules/readme.md) — ## Use Each rule is a url — cite it in a review instead of quoting it: /framework/styles/rules/nesting/. Reading order: Cascade → Proportio…
- [Ranking — owner items first, and the order the owner put th…](/framework/ai/AITask/doc/ranking.md) — Three things share one idea. Some items are waiting on the owner, and those go above everything else. Every list here can be put in an orde…

## Owner asks
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-10-03 Servex: Playwright Chrome logged + reaped; one warm shared browser with check_page (task-mastermind-playwright-reap, building)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)

## Commits
- 9d5d3c98e AI 2 Inbox: read/unread, archive, auto-resolve, search, Needs-you chip, Now wording

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Plan review: is this the right shape, and the right order?

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Plan review: is this the right shape, and the right order?"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
