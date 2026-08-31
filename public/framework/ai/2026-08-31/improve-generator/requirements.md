# improve-generator — the ask, verbatim

> TASK — improve the page generator: look, brainstorm, build.
>
> LOOK first (drive it live): `/framework/core/Page/generator/` (5 behavior words, spec-string
> controls, rolls wall, MODEL 3 — readme + doc/decisions.md through wave 5) and
> `/imagine/vary/colstyles/` (the 3 looks — Finder/Cards/Ink — a generator output could WEAR).
> BRAINSTORM 8-12 ranked improvements as log lines. BUILD the top 2-3 S/M — candidates to
> weigh: a **named-spec gallery** (curate 6-10 good specs as a `specs.js` data list rendered as
> a wall — "the library of reusable pages" made browsable; each opens live via `#s=`), a **look
> switcher** (the colstyles looks as a generator control — one select stamping finder/cards/ink
> classes on the generated tree; verify the looks' CSS reaches generated columns or note what
> blocks it), **page.store() persistence** for the last-visited spec/seed (core's new
> `this.store()` — arrive back where you left), or your own better idea from the look. Each
> addition = a control or data, never a new page.js per state.
>
> FENCE — `core/Page/generator/**` (+ read-only on colstyles' css; if a look needs one selector
> generalized, that ONE rule may move to colstyles' own css with a comment — nothing else
> outside).
>
> VERIFY: same-seed-twice on 6 seeds before AND after (paste both), every built feature
> headless-proven (gallery specs all render; look switcher screenshots ×3 looks; store
> round-trip survives reload), zero console errors, 400/1920/3440. Keepers + `links`.
> Report: built (one line + proof each), the roadmap left, MODEL status, cuts.

Hard rules carried in: never kill or restart the `:80` dev server (a private one on 8097, torn
down after); never drive owner tabs; never stash; never commit. Screenshots to the scratchpad,
keepers here. ⚠ SEEDED GENERATOR LAW: any edit must prove same-seed-twice reproducibility; a
deliberate draw change bumps `MODEL` and is documented, never silent.

## What the fence allowed, and what was touched

Everything landed inside `public/framework/core/Page/generator/`: `specs.js` (new),
`page.js`, `controls.js`, `generator.css`, `readme.md`, `doc/decisions.md`.
`colstyles.css` was **read only** — no rule was moved out of it, and none needed to be: the
measurement showed half of it could not have reached a generated column anyway.
`gen.js` and `rules.js` were not edited, so `MODEL` stayed 3.
