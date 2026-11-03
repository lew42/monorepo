# The well: why it is not a plain `.pad.wash` region

The well is the grey band that carries a module's name and its tab strip. It is the region kind's "title strip", and it keeps its own class, `.doc-well`, in `Doc.css` (card merge 11, 2026-10-19; the run is `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/card-merge-docwell/plan.md`).

## Why not `.pad.wash`

Measured on `ext/Doc/` at 1920 with the swap injected, then on seven more pages:

- **Axis.** The title, the tab labels and the first line of every page below share one left edge, `--gutter-x`. `.pad` uses `--pad`, so the title sat 36px further left (54px to 18px).
- **Ground.** `--well` is a translucent shadow that is darker in both colour modes; `.wash` is an opaque light grey. The well and the tab bar beside it paint the same fill on purpose: any other fill draws a seam.
- **Height.** The well grew 77px to 81px while the tab bar stayed at 77.

So the plan's "after" is a redesign, not a box style. If the owner wants the title on the `--pad` axis, change `--gutter-x` and the tab strip's inset together in `Doc.css`, not the class.

## Proposed, not made: one title-strip view

Five pages draw the same markup by hand (`div.doc-well > h1.doc-title.h2`): `ai/page.js`, `ai/tasks/page.js`, `ai2/page.js`, `ux/Browse/page.js`, `ux/Inbox/page.js`; `ux/Inbox/Inbox.css` restates the band's tab rules because "this page is no Doc". The one-of-everything fix is a `static strip(title)` on `Doc` (the body of `well()`, with `well()` calling it), and the five pages calling it instead of the markup. That edits `Doc.js` logic and five callers, so it waits for its own task.
