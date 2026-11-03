# Color: the tokens and traps, in full

Moved from `.claude/skills/css/SKILL.md` and `.claude/skills/css/caveats.md`. The short version is on [the readme](/framework/design/color/).

## Tokens, never literals

Colours are tokens (`--surface`, `--wash`, `--ink`, the lighten and darken steps), never literal colours in a component. A component that needs a new shade reaches for a token, or proposes one — never a hex value.

## `--wash` IS the page ground

`.app { background: var(--wash) }` is the page itself, so a box built with `background: var(--wash)` measures identically to the page behind it — invisible, no error. A token only means something RELATIVE TO THE GROUND IT LANDS ON; a box that must read as a box takes `--surface` plus a real border (what `.surface` does), and the check is to read back both the box's AND its parent's computed `backgroundColor` (decisions-system, 2026-09-17).

## `--muted` is a percentage, not a colour

framework.css defines only `.muted { color: color-mix(in srgb, currentColor var(--muted, 75%), transparent) }`, so `color: var(--muted)` is silently invalid and the text renders at full strength; ask for the CLASS, not the variable. `--text` does not exist at all (2026-09-04).

## Dark mode is a mode, not a second theme

Light and dark are two readings of the same tokens, written with `light-dark(a, b)`. `light-dark()` resolves where the value is USED, reading that element's `color-scheme`, not where the custom property was declared — one `--x: light-dark(a, b)` on a wrapper gives two different answers in two children, and a box that must be dark in both modes fixes every token inside it with one `color-scheme: dark` on that box (verified 2026-08-30: the same variable read two different rgba values at once, on two children of the same parent).

## Contrast ratios

Body text needs 4.5:1 against its ground; large text and UI shapes need 3:1. Below that, nothing. You cannot see 4.2 from 4.6 by eye — measure it, never eyeball it. The accent colour (the theme's strong hue) is the pair most likely to fail: its saturation decides whether it can carry text at all. The full version of this rule, and how two grounds read when one sits beside or inside the other, was written as part of the layout skill and still lives there: [design/layout/doc/rules.md#color-meets-color](/framework/design/layout/doc/rules.md).

## `.h4` and heading classes are styled, not just sized

`.h4` and the other heading utility classes are uppercase and letter-spaced in this theme — a path or a code name run through a heading class prints in capitals with tracking, which reads as shouting, not as a heading. Use `.small.muted` or a `code` element for a path or a name (layout-study, 2026-09-06).
