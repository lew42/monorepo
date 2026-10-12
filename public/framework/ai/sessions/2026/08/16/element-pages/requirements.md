# element-pages

Dispatched by the mastermind (group: layout), acting on
`public/framework/ai/2026-08-16/mastermind-layout/browsable.md`, top-ranked
change: "Turn the orphan `demo()` blocks into `demo.page()` children."

## The ask, verbatim (relevant excerpt)

> ~30 styled elements exist only as `demo()` blocks inside 5–7 childless
> `/styles/elements/*/` pages. They are named explicitly in the objective and
> they have **no url at all**. Turn the orphan `demo()` blocks into
> `demo.page()` children. Each `demo(fn, note)` becomes
> `demo.page("name", fn, { note })` in `children:`. The block already exists
> and already does all four things wanted: a url, a live half-size card on the
> parent's wall, an `Overrides:` line read off the source, and a Variants wall.
>
> Do the `styles/elements/*` half only. Hold the `styles/layers/util/` half —
> out of scope entirely.

## Scope / file-ownership fence

May write ONLY: files under `public/framework/styles/elements/**`, and this
task dir. Do not touch `public/framework/styles/layers/**`,
`public/framework/ext/**`, `framework.css`, `/styles.css`, or
`public/framework/ext/Panel/`.

## Proposal (steps)

1. Read `demo.page()`'s implementation (`ext/demo/exhibit.js`) and an existing
   caller (`styles/elements/forms/page.js`) — confirm the premise before
   editing.
2. Inventory every `demo()` call across `styles/elements/*/page.js` — name,
   count, note.
3. Name all new child pages (RULE#3), listed before editing.
4. Convert `text/`, `lists/`, `code/`, `media/`, `misc/`, `table/` — each
   `demo()` becomes a `demo.page()` child; `initialize(){ this.catalog(); }`
   (the pattern `forms/page.js` and `demo.page()`'s own jsdoc already use);
   fold demo-specific trailing prose into the moved note; drop headings that
   introduced only one demo; keep genuinely independent page-level prose.
5. `node --check` every edited file.
6. Screenshot every parent (before/after) and 5 sample children at 1280.
7. Land: log findings, link check, close out.
