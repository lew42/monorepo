# AI 2 into AI, the date layout, and the slug bug — inventory and proposal (2026-10-08)

Answers [ai2-and-date-layout-2026-10-08.md](ai2-and-date-layout-2026-10-08.md). Inventory is computed; the proposal moves nothing yet. Branch list: [branches.md](branches.md) (script: `branches.mjs`).

## 1. What is true now
- **One data store, two UIs.** `ai2/` has no date tree. `/framework/ai2/2026/10/08/<card>/` is `ai2/page.js` `route()` answering the card id through `AIRail.route()` / `card_page()`; the card's files live in `ai/sessions/2026/10/08/cards/<card>/` (written by `Servex/cards/Cards.js`, which also imports `ai2/fold.js` and `ai2/needs-rule.js`). So cards are not duplicated; the two URLs are two views of one folder.
- **How far the merge got:** the data merge is done (everything is in `ai/`). The UI merge is not: `ai2/` still owns the Inbox, Log, Needs-you, Overview, rail, card page, compose, chat and live card (about 35 files, readme 387 lines), and `ai/page.js` shares the rail through `AIRail.handles()`. `ai2.css` is retired down to v1-only screens ("until AI 2 is retired").
- **What uses `ai2/`:** `Servex/cards/Cards.js` (fold, needs-rule), `Servex/Servex.js` (the live card route, card storage), `Server/Ai2Overview.mjs`, the AI board links, and many dated task docs as links.

## 2. Proposal A: port ai2 into ai, no rewrites
`git mv` the shared pieces (`fold.js`, `needs-rule.js`, `card.js`, `rail.js`, `live.js`, `inbox.js`) from `ai2/` to `ai/cards/` as classes named after their files; leave a one-line re-export stub at every old path so the ~Servex imports and old links keep working. Remove a stub only after a grep shows no importer. Order: `fold.js` and `needs-rule.js` first (Servex imports them, so a Servex restart checks it), UI later. Not started: it touches Servex imports (ask first) and the files other agents are editing.

## 3. Proposal B: the date layout, hybrid
Today: `ai/` has 46 hyphen dirs (`2026-10-08/`, 8,398 tracked files; the year tree has 687) and a year tree (`ai/sessions/2026/10/08/cards/`, already used by every card). That already is the hybrid. The cheapest safe step is **declare the rule, move nothing**: new tasks and cards go in the year tree; hyphen dirs stay where they are and age out. Moving them would break at least the links in 3,089 files that mention `ai/20YY-MM-DD` (about 142k occurrences, counted by grep, mostly inside the dated dirs themselves). A static production site cannot redirect, so the only link-safe moves are copies or stubs; neither is worth it. Alternative if the owner insists: one script that `git mv`s a hyphen dir and rewrites those links in one commit, run on a branch with the four-width crawl as the check.

## 4. The slug bug
`Servex/cards/Cards.js` `slugify()` cuts at 40 characters, mid-word (`...never-fini`). Fix, a two-line change for the Servex owner: cut at the last `-` before 40 when one exists past character 20. It only changes names of new cards; existing folders and ids never change. Not applied here: `Servex/` needs a restart and is another agent's area.

## 5. Zombie branches
141 `worktree/*` branches, 11 are `ai2-*`. Half are merged, half carry commits `michael/dev` lacks; see [branches.md](branches.md). Nothing deleted. Next step if wanted: tag every merged one (`archive/<name>`), then delete the branch name only.
