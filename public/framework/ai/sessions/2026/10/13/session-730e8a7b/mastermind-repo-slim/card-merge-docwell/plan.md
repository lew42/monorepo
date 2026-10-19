# Card merge 11, the doc well: measured, and it stays its own class

The doc well is the grey band at the top of every module page: the module's name, with the tab strip beside it. The plan says to turn it into a plain region (`.pad` and `.wash`). Measured on the live pages, that swap changes the page in more than the box style, so it is not made. Log: [task.jsonl](task.jsonl). Plan: [/framework/ux/Content/plan/](/framework/ux/Content/plan/).

## Reach: who draws a well

- **Every module page with a Docs tab** (`ext/Doc/Doc.js`, `well()`), 84 `page.js` files construct a `Doc` (grep `new Doc(`). Each gets the same one rule in `ext/Doc/Doc.css` (inside its `theme` layer).
- **Five hand-built copies** of the same markup (`div.doc-well > h1.doc-title`): `ai/page.js` (the inbox band, restyled in `ux/Inbox/Inbox.css`), `ai/tasks/page.js`, `ai2/page.js`, `ux/Browse/page.js`, `ux/Inbox/page.js`.
- **`.doc-section`** (the other half of the plan's grep) is not the well: it is the page wrapper of a tab pane (`Doc.js` sections, `core/Page`, `ext/Panel`). It belongs to merge 12, tab-panes. Of the 20 listed files, 12 only mention the class in prose or comments.

Sample shot (8 pages, 1920 and 390): `core/View/` (core module), `ext/Doc/` (ext module), `ux/Dictate/` (6 tabs), `core/Page/` (long doc), `ai/` (the inbox band), `ai/tasks/`, `ux/Browse/` (hand-built), and every one at 390 for the phone.

## What the well's rules are today

One rule block in `ext/Doc/Doc.css`: padding `1.5em 0.8em 0.5em var(--gutter-x)`, ground `--well` (a 6% black shadow, darker in dark mode, never a palette colour), plus a phone rule at 600px. The title, the tab labels and the first line of every page below sit on one vertical axis, `--gutter-x`. The inbox band overrides the gutter and the ground.

## The swap, measured (1920, `ext/Doc/`)

| | now | as `.pad.wash` |
|---|---|---|
| title from the left | 54px | 18px (the page's `--pad`) |
| well height | 77px | 81px (the tab bar stays 77: a seam) |
| ground | translucent shadow | opaque light grey, a different colour from the tab bar beside it |

Every sample page shows the same three changes (probe: `shots/probe.mjs`, numbers in `shots/before/measure.json` and `shots/region/measure.json`). The picture shows the band splitting in two colours.

## Decision

The well keeps its own class, `.doc-well`, as the region's "title strip" form: it pads by the page's gutter axis instead of `--pad`, and its ground is a shadow. Home stays `ext/Doc/Doc.css`. Alternative: swap to `.pad.wash` and accept the redesign; rejected on the stop rule (title off the axis by 36px, a two-colour seam). A real one-of-everything fix is a shared title-strip view for the five hand-built copies: that is a `Doc.js` edit, so it is a decision line with the exact edit, not made here.
