# Two component tokens, and everything else is `color-mix`

This file used to hardcode `color: #fff` plus **six** `rgba(255,255,255,…)` values —
correct on a dark panel, invisible on a light one. The lew42 comp has a white
sidebar, which is what forced the fix.

```css
background: var(--sidebar-bg,  var(--bg));
color:      var(--sidebar-ink, #fff);

.sidebar-link.active { background: color-mix(in srgb, var(--sidebar-ink, #fff) 7%, transparent); }
```

**Verdict: promote exactly two tokens, derive the rest.** Ladder rung 2, and the
promotion is justified because a theme *actually needed* to differ — not speculation.
Deriving the group title, the icons, the hover and the active tint from one ink means
a theme **cannot set them inconsistently**, which is how that class of bug happens.
The comp's two treatments — white and near-black — are the same component two token
values apart. There is no second design.

## Why the active fill isn't `--wash`

The comp's active row is `#f2f2f2`, which is exactly `--wash` under theme-lew42.
Using it directly would have been one word shorter and **wrong**: `--wash` tracks the
*document's* brightness, and `--sidebar-bg: #1f1f1f` on a light page is a supported
combination this component ships. A light fill would have landed on a dark panel.

`color-mix(… var(--sidebar-ink) 7%, transparent)` over white resolves to `#f2f2f2` —
the comp's value, arrived at by derivation rather than declared.

**The general principle: when a literal and a derivation agree, take the
derivation.** They only agree in the case you happened to be looking at.

The same argument runs for the footer's hairline (`color-mix` off the ink, not
`--line`) and for the icon colour (not the global `--subtle`). Anything reading a
document-wide token is wrong the moment the panel's brightness stops matching the
document's.

`border-right: 1px solid var(--line)` is the deliberate exception: it reads as a
hairline when the panel is light and the page beside it is lighter still, and
disappears into a dark panel — where contrast already does the job. One declaration,
right in both.

## Only `.active` is selected

`.active` = this exact url, `.in-path` = an ancestor of it; both come from
`Router.mark_links()`.

This file used to treat the two the same, and that was right while a sidebar was
flat: the section's own entry was the only thing that could say *"you are in here"*.
A **grouped** sidebar has a heading for that, so the section entry lighting up
alongside the real one left two rows looking chosen and neither looking more chosen —
`/framework/core/View/` selected both "Overview" and "View".

`.in-path` is deliberately left with nothing here. `/styles.css` gives it a semibold
label, which reads as *"on the way to"* rather than *"here"*, and that is the whole
distinction worth drawing.

The chevron follows the fill for the same reason — **the two halves of one highlight
must agree about which row is chosen**, and they have now been wrong in both
directions: first the chevron was missing from a lit row, then it would have been
present on an unlit one.

The `border-left: 3px var(--prim)` that used to sit on the active row is gone: the
comp doesn't draw one, and it was the only thing in this file that moved the label by
a pixel between states.
