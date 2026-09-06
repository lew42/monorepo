# What landed (size-apply, 2026-09-06)

This is now `framework.css`. The candidate below replaced the three ramp declarations, the
`--spacing` token, the `:where(*)` derivation and the three level classes in `framework.css`'s
`@layer theme` — the control grammar's own `.size-small`/`.size-regular`/`.size-large` (added the
same day, for a control's own height) now carry the spacing job too: one class, both jobs.

## The block

```css
:root { --size: 1 }                       /* the knob — per box, never a function of width */
:where(*) {
    --pad:  calc(clamp(1em, 2.6% - 1.1em,   4em)   * var(--size));
    --gap:  calc(clamp(1em, 1.5cqi - 0.3em, 2.6em) * var(--size));
    --flow: calc(clamp(2em, 1.4cqi + 0.8em, 3em)   * var(--size));
}
.size-small { --size: 0.75 }  .size-regular { --size: 1 }  .size-large { --size: 1.5 }
```

`:where(*)` and not `:root`, for the reason framework.css already gives: a custom property
holding a `var()` is substituted where it is declared, so a value computed once on the root
would never see a subtree's own `--size`.

## What each token became

| was | is now | call sites |
|---|---|---|
| `--pad-ramp` | `--pad` | 127 |
| `--gap-ramp` | `--gap` | 650 |
| `--flow-ramp` | `--flow` | 52 |
| `--pad-default` · `--gap-default` · `--flow-default` | `--pad` · `--gap` · `--flow` (folded in — the same name, not a second one) | 38 · 64 · 1 |
| `--spacing` | `--size` | 6 |
| `.spacing-tight` · `.spacing-regular` · `.spacing-airy` | `.size-small` · `.size-regular` · `.size-large` (deleted, not aliased — these three had no live call sites to move) | — |
| `--page-column-pad-x` · `-y`, column prose `--flow` | kept as their own clamps (the study measured them within 2.6% of `--pad`, but pad-y is not a constant fraction of pad-x); only their `--spacing` multiplier renamed to `--size` | 3 |
| the `body` font-size clamp | **unchanged** — the one thing that ramps type with width | 1 |

**945 renames applied**, grepped clean before and after: `grep -rn "pad-ramp\|gap-ramp\|flow-ramp\|spacing-tight\|spacing-airy\|--spacing\b" public/` returns nothing outside this study's own history page and the day's task logs, which are records of what the names used to be, not live code. Two self-reference bugs hid inside the mechanical rename and were fixed by hand, not by grep: `:where(.flow, blockquote) { --flow: var(--flow-default) }` and `.page-previews { --gap: var(--gap-default) }` both became `--x: var(--x)` — a property defined in terms of itself, which CSS treats as invalid — because the two-tier ramp→default naming collapsed into one name. Both were deleted; `:where(*)` already gives every element its own `--pad`/`--gap`/`--flow` directly, so nothing needed to re-derive them. A third site (`/imagine/layouts/layouts.css`'s `.layouts-tight`/`.layouts-airy`) wanted `0.5×`/`2×` of the ambient default while overriding it on the same element — also a self-reference after the merge — and now writes its own copy of the raw clamp instead of reading `--pad`.

## Two behaviour changes hiding in the rename

Neither is cosmetic.

**1. The level word now reaches component gaps.** Before, `.spacing-tight`/`.spacing-airy` multiplied `--pad-default`/`--gap-default`/`--flow-default` only. The 2026-09-05 component conversion wrote 650 gaps as `calc(var(--gap-ramp) * N)` — the *un-levelled* token — so a level word never touched them. Measured on 5 pages at 3440, the old `spacing-tight` left the median gap at 25.3px, exactly where regular left it; now that `--gap` is the one levelled value, `.size-small` moves the same median to 19.0px. **This is a fix, not a regression, but it changes real pixels on every page that wears a level class** — none did in framework.css itself (the three were unused shelf-ware), so the pixels that moved are wherever a page adopts `.size-small`/`.size-large` from here on.

**2. `vw` became `cqi` in the gap and rhythm clamps.** A container query unit falls back to the small viewport when there is no container, so on a plain page the two are identical. Where a container already exists — a columns host, a page frame, a row with a rail, a demo stage — the gap now sizes to that box instead of to the window. Site-wide median gap at 3440: 22.1px → 20.8px. That costs nothing because those containers are already declared; padding stays a percentage on purpose (`core/Page/Page.css` records why every box must not become a container: it would trap `position: fixed` descendants — `ext/demo`'s stage, `ext/drawer`, `ext/Panel`'s overlay, `ext/Draggable`).

## The two calls the owner made

- **The ladder is 0.75 / 1 / 1.5**, not this study's own 0.75 / 1 / 1.25 — wide enough that `.size-large` reads as a real step next to regular, closer in spirit to the 2026-09-05 spacing decision's 0.6 / 1 / 1.6 without going that far, since the same three classes now also size a control's height (measured on `/framework/ui/controls/`: 27.06 / 36.09 / **54.14**px at 1280).
- **Sweep, not aliases.** 945 edits and three names, not three alias lines and zero edits — done, above.
