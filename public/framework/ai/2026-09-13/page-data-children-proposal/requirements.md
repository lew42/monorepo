# page-data-children-proposal — the two core seams Make and cms/json both had to hand-build

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Group: `core`. This is a PROPOSAL, not a change: you edit nothing under `public/framework/core/` except one new doc page and one link to it. CLAUDE.md "Ask before — major surgery" is why.

## The three laws, and your length budget

1. **Less is more.** One doc page, one screen at 1280: the two seams, the diff for each, what each deletes elsewhere. The owner reads it in two minutes and says yes or no.
2. **Clear beats brief.** Start with the problem in plain sentences a newcomer follows: today a page whose children live in data (a `page.json` tree) has to override two core methods itself and cannot redraw when the data changes. Then the two seams. Then the diff.
3. **Prioritize.** The diff is the deliverable; the argument is the minimum that makes the diff make sense.

## The owner's opening question tonight, verbatim

> where are we with core/Page "CRUD" ux? can we create new sub pages (either by appending data to a page.jsonl? or... creating a real sub /path/page.js?) via ui + socket?

Tonight's answer was built as a realm (`/imagine/paging/make/`): a page tree kept as `page.json` files, created / renamed / reordered / deleted from the browser over the dev socket, drawn live. It works, but every piece of it that touches core is a workaround for two seams core lacks.

## Read, in this order

1. `public/imagine/cms/json/readme.md` lines 45–60 — the two seams named on 2026-08-31: **`Page.redraw()`** (rebuild a page's view in place from new data) and **a declared data source** (`children: source`, a promise of configs, so the two overrides become one word).
2. `public/framework/core/Page/Page.class.js` — `child()` (~line 175), `load_all_children()`, `Page.load()` / `Page.file()` / `Page.from()` (~lines 198–280, read the ⚠ blocks: why `from()` is NOT in the probe chain, the `levels <= this.loaded` guard, `new this(…)` not `new Page(…)`), `render()` / `render_content()` / `content_at()` (~lines 400–440), `store()`.
3. `public/imagine/paging/make/page.js` — `ready()`, `child()`, `load_all_children()` (~lines 190–225, the copied guard and its comment), `apply()` / `regrow()` / `redraw()` (~lines 225–270): the hand-built version of both seams.
4. `public/imagine/cms/json/page.js` — the same two overrides, written independently on 2026-08-31 (and the guard bug both files carried until 2026-09-05).
5. `public/imagine/importance/page.js` — a third data-backed page tonight; note how it draws its ranked children and whether it would use either seam.
6. `public/framework/core/Page/doc/declaring.md` (the CMS question, the `/directory.json` and `page.json` options and the verdict) and `doc/decisions.md` "## Proposed" (line ~509) — the house shape for a proposal, and the rule at line ~261 that a new name on `Page` is proposed, not landed.

## Deliverable — one doc page

`public/framework/core/Page/doc/data-children.md` (a `.md` beside the others becomes a page at `/framework/core/Page/doc/data-children/` — `Page.file()`; nothing to register except the link below):

1. **The problem, in five sentences** a newcomer follows, with the two callers that prove it (Make, cms/json) linked.
2. **Seam 1 — `children` as a data source.** The exact shape you propose (a url string ending in `/` → `Page.from(url)`; a function returning a promise of configs; or both — pick, and say why in one sentence), and the diff to `Page.class.js` that makes `child()` / `load_all_children()` handle it once, carrying the existing guard. Show what `make/page.js` and `cms/json/page.js` DELETE if it lands (line counts, not prose).
3. **Seam 2 — `redraw()`.** What "in place" means against `render()`'s view cache and `.active-page` marking; the diff; what `Make.redraw()` and `json.js`'s `redraw()` become. ⚠ Read `doc/decisions.md`'s `render()` verdicts first — three silent things an override owes; the proposal must not break them.
4. **What it does not do**, in three lines: no crawling (a page exists once its parent names it — unchanged), no third fetch on every would-be-404 child (the ⚠ in `from()` — say how the proposal keeps it), no server change.
5. **Cost and risk**, as numbers: lines added to core, lines deleted from the two callers, the pages that would exercise the new path (name them), and the one test that proves it (a cold deep url into a data tree, e.g. `/imagine/paging/make/notes/today/`, loads without "Chaining cycle detected").

Then ONE line added to `public/framework/core/Page/readme.md`'s "More" list linking the new doc as **proposed**, and ONE entry under `doc/decisions.md` "## Proposed" pointing at it (two lines, dated). Nothing else in core moves.

**Do not implement the diff.** Write it as fenced code in the doc, checked by reading, not by running — but every line number and method name you cite must be real on 2026-09-13; grep before you cite. If, reading the code, you conclude one seam is wrong or unnecessary, say so in the doc with the reason; a refuted seam is a finding.

## Fences

- Own: `public/framework/core/Page/doc/data-children.md` (new), the one "More" line in `public/framework/core/Page/readme.md`, the one "Proposed" entry in `public/framework/core/Page/doc/decisions.md`, and `public/framework/ai/2026-09-13/page-data-children-proposal/**`. Nothing else. No edits under `public/imagine/**` (a critic is walking those screens right now).
- Verify the doc renders: load `/framework/core/Page/doc/data-children/` once on a PRIVATE server (`PORT=8099 node server.js` from the repo root, another 809x if taken), zero console errors, one 1280 png into your task dir; kill the server by pid. Never the port-80 server, never the owner's tabs, never `git stash`, never commit.

Open your task with `new-task` (group `core`, steps: read · seam 1 · seam 2 · cost + the link · render check); `documentation` for the doc's shape; `skill-improvement` for anything that misled you; land with `finish-task`.

## Landing report (to the mastermind)

One screen: the doc url, the two seams in one sentence each, the three numbers (core lines added, caller lines deleted, pages exercising it), and whether either seam was refuted.
