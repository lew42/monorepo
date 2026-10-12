# Overlap study — brief

Verbatim from the owner (2026-09-18), relayed by the mastermind:

> study the overlap between the framework code and the imagine stuff. If there's similar work
> across lots of areas, identify opportunities to simplify, to reduce the code, to link things
> together, to take one implementation and merge it into another and use that new implementation
> for all the locations. We need simplification in the CSS department, the layout department, the
> navigation department. We need a few core navigation systems working; the left sidebar nav with
> filters or toggles or trees.

## Deliverable

`overlap.md` in this dir: one screen at the top (concept count, total duplicated lines, top five
merges, the navigation sentence), then a table below — one row per CONCEPT that has more than one
implementation on the site:

- concept
- every implementation (file, lines of JS + lines of CSS)
- the one to keep, and why
- what merges into it
- complexity: S / M / L
- what breaks: link count and import count by `rg`, with the file(s) it was counted against

Concepts to start from (find more while reading):

- **drag** — `ext/Draggable`, `ext/Panel/PanelDrag.js`, `ux/Tree` drag, Make's drag, `/imagine/team/` chips
- **rails and sidebars** — `core/Sidebar`, `/imagine/page.js`'s rail, `ext/tabs`' vertical rail,
  `/layouts/shell/Shell.js`, `/imagine/paging/rail.js`, the AI board's rail
- **stages and workspaces** — `ext/demo`'s stage, `/imagine/paging/stage.js`,
  `ext/Panel/Workspace`, `ext/DesignTool`'s frame
- **persistence** — `page.store()`, `ext/Saver`, Make's `Store`/`FileStore`,
  `ext/Panel/persist.js`, `ext/Item`
- **cards and previews** — `Page.preview_card`, `catalog()`, `/layouts/browse/` cards,
  `ext/AITask` cards, `ux/`'s `/imagine/gallery/`
- **toolbars and control rows** — `/imagine/paging/toolbar.js`, `ui/toolbar`, the paging bar
- **trees and lists** — `ux/Tree`, `ui/tree`, `core/Sidebar`'s list, `/imagine/design/lists/` if landed
- **CSS** — count of module `.css` files; raw spacing numbers per file from
  `ai/2026-09-17/spacing-census/census.json`; per-realm prefixes in `styles/css-scopes.txt`
- **navigation** — crumb strips, column paging, tabs, the omnibox, `ext/toc`

Two numbers that must agree in the report: implementations listed per concept, and files
actually read for it.

Then the top five merges as `decision` lines in `task.jsonl` (verb:
`{"decision": {"id", "about", "options": [{"id","say","why"}], "chose", "because", "rule",
"status": "open"}}`) — each with the paths (keep A and merge B into it; keep B; a new C), their
caveats, and a one-line estimate of code removed.

`overlap.md` ends with three sentences: the one navigation system to make the site's core (the
tree sidebar with filters and toggles is the owner's lean), what tabs and crumb strips become
under it, and what `/imagine/` becomes.

## Scope / fences

- Read-only over the whole repo. The only dir this task may write to is
  `public/framework/ai/2026-09-18/overlap-study/` (this dir) — `task.jsonl`, `requirements.md`,
  `overlap.md`, and any scratch counts kept here.
- Per the minion fence: skip the usage.json refresh and the `../day.jsonl` append that `new-task`
  normally asks for (both live outside this task dir) — log the skip instead.
- Counting method: `wc -l` for lines, `rg -c` for link/import counts. Keep the raw commands or
  their output alongside the numbers so a reader can re-run them.
- Stay available after landing — the mastermind sends follow-up questions to this minion by name.

## Final report

One screen: concept count, total lines across duplicated implementations, top five merges with
S/M/L and a removed-lines estimate each, the navigation sentence, the link to `overlap.md`.
