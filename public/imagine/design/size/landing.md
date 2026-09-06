# What lands if this is approved

Nothing here is applied. `framework.css` is untouched, and this page's copy of the candidate is
scoped to its own demo box. This is the diff to make when slice 1 of the graduation has its
byte-identical proof.

## The block

It replaces the three ramp declarations, the `--spacing` token, the `:where(*)` derivation and
the three level classes in `framework.css`'s `@layer theme` — seven declarations become four,
and six token names become three.

```css
:root { --size: 1 }                       /* the knob — per box, never a function of width */
:where(*) {
    --pad:  calc(clamp(1em, 2.6% - 1.1em,   4em)   * var(--size));
    --gap:  calc(clamp(1em, 1.5cqi - 0.3em, 2.6em) * var(--size));
    --flow: calc(clamp(2em, 1.4cqi + 0.8em, 3em)   * var(--size));
}
.size-small { --size: 0.75 }  .size-regular { --size: 1 }  .size-large { --size: 1.25 }
```

`:where(*)` and not `:root`, for the reason framework.css already gives: a custom property
holding a `var()` is substituted where it is declared, so a value computed once on the root
would never see a subtree's own `--size`.

## What each token becomes

| today | becomes | call sites |
|---|---|---|
| `--pad-ramp` | an alias of `--pad`, then deleted | 127 |
| `--gap-ramp` | an alias of `--gap`, then deleted | 650 |
| `--flow-ramp` | an alias of `--flow`, then deleted | 52 |
| `--pad-default` · `--gap-default` · `--flow-default` | `--pad` · `--gap` · `--flow` | 38 · 64 · 1 |
| `--spacing` | `--size` | 6 |
| `.spacing-tight` · `.spacing-regular` · `.spacing-airy` | `.size-small` · `.size-regular` · `.size-large` | 7 |
| `--page-column-pad-x` · `-y`, column prose `--flow` | kept, but written from `--pad` / `--flow` | 18 |
| the `body` font-size clamp | **unchanged** — the one thing that ramps type with width | 1 |

**945 renames**, counted by grep (829 ramp names + 103 default names + 6 `--spacing` reads + 7 level classes), plus the 18 column-token sites rewritten. They are almost all one mechanical rename
(`var(--gap-ramp` → `var(--gap`), so the edit is a sweep, not a redesign — but it is a big sweep,
and it is the whole cost of the collapse. Keeping the old names as permanent aliases costs three
extra lines and zero edits; it also leaves six names where three would do, which is the thing the
owner asked to be rid of.

## Two behaviour changes hiding in the rename

Neither is cosmetic, and both should be measured again after the sweep.

**1. The level word starts reaching component gaps.** Today `.spacing-tight` and
`.spacing-airy` multiply `--pad-default` / `--gap-default` / `--flow-default` only. The 2026-09-05
component conversion wrote 650 gaps as `calc(var(--gap-ramp) * N)` — the *un-levelled* token — so
a level word does not touch them. Measured on 5 pages at 3440, today's `spacing-tight` leaves the
median gap at 25.3px, exactly where regular leaves it; under the candidate, where `--gap` is the
levelled value, `size-small` moves the same median to 19.0px. **This is a fix, not a regression,
but it changes real pixels on every page that wears a level word.**

**2. `vw` becomes `cqi` in the gap and rhythm ramps.** A container query unit falls back to the
small viewport when there is no container, so on a plain page the two are identical. Where a
container already exists — a columns host, a page frame, a row with a rail, a demo stage — the
gap now sizes to that box instead of to the window. Site-wide median gap at 3440: 22.1px → 20.8px.
That is the container-awareness the ask was after, and it costs nothing because those containers
are already declared. Padding stays a percentage: `%` resolves against every box's containing
block with no container needed, and making every box a container is the failure mode
`core/Page/Page.css` already records — `container-type: inline-size` makes an element a
containing block for `position: fixed` descendants, which would trap `ext/demo`'s full-screen
stage, `ext/drawer`, `ext/Panel`'s overlay and `ext/Draggable` on every page.

## Two things the owner should decide

- **The ladder.** The candidate uses 0.75 / 1 / 1.25, a 1 : 1.33 : 1.67 step. The 2026-09-05
  spacing decision deliberately chose 0.6 / 1 / 1.6, a 1 : 1.67 : 2.67 step, because a narrower
  ladder had already been called "hardly noticeable". On the new ladder the rhythm at 3440 reads
  36.5 / 46.2 / 57.7px across small / regular / large, measured on 5 pages. The
  new one is calmer and the old one is more visible; that is a taste call, not a measurement.
  Measured on 5 pages at 3440, `small` gives 36.5px of rhythm on the new ladder where today's
  `spacing-tight` gives 27.7px.
- **Aliases or the sweep.** Three permanent alias lines and zero edits, or 945 edits and three
  names. Both work; only one of them actually makes the standard small.
