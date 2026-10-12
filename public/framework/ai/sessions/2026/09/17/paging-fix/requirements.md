# paging-fix — the paging demos pressed against the owner's sentence, fixed in place; and the notes the editor rethink starts from

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (delete a demo that no longer teaches; never add a paragraph to explain one). Clear beats brief by far. Prioritize (the hub first, then the demos a reader reaches from it, then the notes).
**Length budget:** findings are numbered `log` lines with the measurement; `editor-notes.md` is one screen; your landing report is one screen: found / fixed / superseded / left.
**The reader is the overwhelmed newcomer.**

## The owner's words (2026-09-17, 22:40)

> For our paging demos, last time I checked, it wasn't set up properly. Maybe my instructions misled, let's fix the page demos. Look at the playground and panel exts. They were an attempt to make an editor. We have pages CRUD from some of the last work. Maybe we can merge some of these together. The problem is neither the panel nor playground system did a great job manipulating the elements in a simple intuitive way. The number of controls in the toolbar became way too many. Maybe we put everything in the right sidebar, and only have a selection scheme?

Standing rules: "self-evident demos that are impossible to misunderstand. every button, every item, every part — perfectly clear what goes where, what does what, what clicks do" (2026-09-13); a control with no visible consequence reads as broken; demos never persist; the paging realm is "organized around a handful of concrete building blocks with examples" (2026-09-05). And today: N EVEN columns and fixed navigation are the direction; continuous Miller columns are not.

## What exists

`public/imagine/paging/` — `page.js` (the hub), `readme.md`, `doc/`, and the parts: `arrangement`, `build`, `content`, `critique`, `cross`, `inventory`, `library`, `mechanisms`, `navigation`, `room`, `skin`, `stage`, `templates`, `make` (the page CMS, three panes — NOT yours to change), `made/` (the owner's pages — never touch). The editors: `public/framework/ext/Panel/` (with `playground/` inside it, `toolbar.js`, `properties.js`) and `/imagine/paging/make/`. Memory of the last two rounds: `ai/2026-09-13/self-evident-critique*/` and `ai/2026-09-05/` (the paging loop reached 6/6 by eight audit rounds).

## Deliverables

1. **Press every demo under `/imagine/paging/` except `make/`** headless at 400 / 1280 / 1920 / 3440 on your private server (`PORT=8106 node server.js`, background, killed by PID at landing): the hub first — can a stranger say in ten seconds what paging IS and where to click? Then each child: does the page show its one takeaway without a paragraph? does every control do something visible? does anything persist across a reload (it must not)? does the page 404 anything in the console? Number the findings; **fix each inside the fence**, cause not symptom. Where a demo's premise is now wrong by the owner's words today (continuous Miller columns, fluid widths, a crowded toolbar), do not rebuild it: mark it with ONE line at the top — "superseded 2026-09-17 by even columns: [link]" (link `/imagine/design/navigation/`) — and log it as superseded. Delete a demo only when its lesson is already in core's docs and nothing links to it (count the links first); say what you deleted.
2. **The hub** (`/imagine/paging/`): level 1 one screen — the handful of building blocks as picture cards, one line each, the way in; nothing that tells the reader what they are about to see. Count the cards before and after.
3. **`editor-notes.md`** in your task dir, one screen, for the editor rethink the mastermind briefs next: what Panel does well and badly (count its toolbar controls — the number the owner complained about), what the Panel playground adds, what Make's three panes do well (tree · page · settings), and the shape you would build: **one selection scheme** (click a thing on the page → it is selected, one outline, one name) and **one right sidebar** that shows only the selected thing's few properties — which properties, for a page, a block, an element; what of Panel/Playground/Make each part would be built from; what gets deleted. Five to ten sentences, no essay.

## Rules

- Load `code`, `layout`, `css`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/paging-fix/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/imagine/paging/**` EXCEPT `make/**` and `made/**` (read-only), your task dir. Nothing else — not `ext/Panel`, not core, not `/imagine/page.js`.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. `ui-test` has the headless recipe. Under `/imagine/` there is no page grid (a columns host); a demo host wearing `.page` needs `default` or it is `display: none` (css skill).
- Two numbers that must agree: demos found under the hub (dirs with a page.js) and demos you pressed.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock.
- Landing: `outcome` = a headline (pressed N, fixed N, superseded N, deleted N, left N), the list by number, a before/after pair of the hub at 1920, the link to `editor-notes.md`. One screen.
