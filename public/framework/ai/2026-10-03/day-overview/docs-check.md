# Docs check — the day page's "by module" spend

Read only: root readme → `public/framework/readme.md` → `ext/readme.md` →
`ext/AITask/readme.md` → `ai/readme.md` → `ext/AITask/doc/cost.md`. No source
files opened.

## Verdict: mostly clear, one real gap

The chain does answer the four things asked:

- **What `Server/day-spend.mjs` and `module-spend.js` are.** The AITask readme
  names both in one bullet and again in the Files list; `doc/cost.md`'s last
  section spells out the split: the `.mjs` is the writer (reads a day's tasks,
  never recomputes), `module-spend.js` is the drawer (two totals, then a module
  list). Clear.
- **Where `spend.json` lives.** Stated twice, same path both times:
  `public/framework/ai/<date>/spend.json`. Clear, no conflict.
- **Claude $ vs real $.** `doc/cost.md`'s "Two currencies" section explains it
  in one paragraph that a five-minute reader can follow: Claude $ is
  subscription usage at Anthropic's price table; real $ is actual money billed
  through OpenRouter, keyed off a model id containing `/`. Clear, and it says
  *why* a module's own dollar total is deliberately left off (double-counting
  across modules) — the kind of thing a reader would otherwise call a bug.
- **The by-module click-through.** `module-spend.js` draws the module list as
  page-icon-items linking to `/framework/ai/<date>/module/<slug>/`, served by
  `ai/page.js`'s day route, landing on that module's tasks and outcomes for the
  day. Clear as a chain of "who does what."

## The gap

Nowhere in the chain does it say how a module's own name (`core/Page`,
`ux/Dictate`, `Servex`) turns into the `<slug>` in the URL. `doc/cost.md`
names the module strings and the slugged URL in the same sentence but never
states the mapping (lowercase? slash→dash? the last path segment only?
`Servex` has no slash at all, so is it ever nested under something). A reader
who only has the readme chain can't predict or construct that URL by hand —
they'd have to click through to find out. Small, but it's exactly the kind of
thing the doc should say in one clause since it already names both sides of
the mapping.

## Everything else

No broken or mismatched pointers found — both mentions of `spend.json`'s path
agree, the readme's one-line summary and `doc/cost.md`'s full version don't
contradict each other anywhere, and the "module total is intentionally
omitted" design note heads off the obvious follow-up question before it's
asked. Nothing else in this piece looked unclear, missing, or pointed at the
wrong place.
