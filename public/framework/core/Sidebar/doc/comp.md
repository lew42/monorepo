# Porting the July 2026 comp

Frame `110:436`, 307×1316, drawn at 1440 where 1em = 16px.

| | comp | here |
|---|---|---|
| panel width | 307 | `--sidebar: 19em` |
| row | 307×56, x=0 | full width, no margin, no radius |
| row padding | 16 / 16 / 16 / 42 | `1em 1em 1em var(--gutter)` |
| label | 18px | `.sidebar-label { font-size: 1.125em }` |
| active fill | `#f2f2f2` | 7% of the ink (`./tokens.md`) |
| active icon | `#ff8f60` | `var(--prim)` |

Two deltas, both deliberate: **no left accent bar** (the comp doesn't draw one), and
**icons stay at `1.25em` of the base** (20px, not the comp's 24) — asked for directly,
because the label going to 18px shouldn't drag the icon up with it.

## The 18px lives on the label, not on the row

Put it on `.sidebar-link` and every box value below it is suddenly an em of 18 —
`16px` becomes `0.89em`, `42px` becomes `2.33em`, and the file reads as arbitrary
numbers. A span costs one element and keeps the box measured against the base while
the type does what the comp asks. Two sizes in one row is the normal case.

## `--gutter` is `em`, and that nearly defeated the whole point

The gutter is one number — 42px for the brand, the group titles and the links —
declared locally as `.sidebar { --gutter: 2.6em }` with the comment *"one number, so
nothing in this column can misalign."* It was wrong when it was written.

**A custom property carries a TOKEN, not a resolved length.** For an unregistered
property the substituted value is the literal string `2.6em`, and `em` resolves
against the element that *uses* it. `.sidebar-group-title` carried `.h4`
(`font-size: 0.875em`), so its `2.6em` measured **36.5px** while every link measured
**41.8px**. The single knob quietly had two values.

**Options.** (a) `@property --gutter { syntax: "<length>" }`, which computes once at
declaration and inherits an absolute length. (b) Switch to `rem`. (c) Stop sizing
text on the padded box.

**Verdict: (c)** — the same fix the 18px label already needed, for the same reason.
`.h4` moves to an inner span, the padded div stays at the base size, and `2.6em` means
one thing everywhere. (b) would also work, and would additionally stop the gutter
tracking `framework.css`'s body clamp, since `rem` is the root's 16px and the clamp is
on `body`. (a) is correct, and is real machinery for one value.

**The rule that generalises: size the text, pad the box, never the same element.**
Both em bugs in this file were the same bug.

`line-height` is pinned on the row for a related reason: it decides the row height
together with the label, and a theme is entitled to a loose one for body copy —
lew42's `1.8` turned the 56px row into 64px. Rhythm inside a fixed-height control is
the control's business.
