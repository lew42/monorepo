# browsable-page

Dispatched by the mastermind (`group: layout`), acting on
`public/framework/ai/2026-08-16/mastermind-layout/browsable.md` — the Opus
judge's verdict on the prime objective (organized/visual/browsable).

## The ask, verbatim (relevant excerpt)

> Build a page at `public/framework/audit/browsable/`, declared in
> `public/framework/audit/page.js`'s `children:`. The numbers must be
> computed, not typed — a generated JSON baseline committed beside the page,
> produced by a script you run once and document (match
> `ext/LayoutTool/audit/`'s pattern; don't invent a second one).
>
> The page opens on the answer, above the fold: the frontier in one sentence,
> then the worst offenders. Then the three ranked changes with their costs,
> and what is already good. Mark what has already been fixed today
> (styled-elements gap — closed, not outstanding). No new CSS unless
> genuinely unavoidable.

## Fence

May write ONLY: `public/framework/audit/browsable/**`, one `children:` entry
plus one pointer sentence in `public/framework/audit/page.js`, and this task
dir. Do not touch `ext/**`, `styles/**`, `core/**`, `framework.css`,
`/styles.css`, or `ext/Panel/`.

## Proposal (steps)

1. Read the judge's `browsable.md` in full, and the `ext/LayoutTool/audit/`
   pattern it points at (findings.json + page.js, committed baseline).
2. Re-derive the nav graph from source — a one-off Node script (not
   committed, per RULE#12) parsing every `page.js` under `public/framework`:
   `children:`/`overview:`/`methods:`/`properties:`/`notes:`/`files:`, which
   parent calls render children as cards (`previews()`/`walls()`/`wall()`/
   `catalog()`/`demo.exhibit()`), BFS depth from `/framework/` for both
   "any link" and "visual only".
3. Debug against known checkpoints (styles/layouts 23-wide, ui/ 22-wide,
   start/example orphan, Page/children strays) until the independent count
   corroborates the judge's spot-checks.
4. Commit the JSON baseline at `browsable/findings.json`.
5. Write `browsable/page.js` — opens on the frontier + worst offenders above
   the fold, then the three ranked changes (re-costed against my own
   numbers), then what's already good, with the styled-elements fix marked
   CLOSED.
6. Add `children: "browsable"` + one pointer sentence to `audit/page.js`.
7. Verify: load `/framework/audit/` and click through; screenshot the new
   page at 1280 and 3440.
8. Land: log findings, link check, close out.
