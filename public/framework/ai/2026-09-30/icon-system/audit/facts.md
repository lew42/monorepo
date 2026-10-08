# Icon facts — measured, not guessed

Every claim below was checked by running code, not by reading the CSS and assuming. The
script is [`measure-icons.mjs`](#how-this-was-measured) at the bottom of this page.

## 1. Material Icons ARE fixed-width — every glyph is a perfect square

**Check:** loaded the real site (`/framework/ui/item/`, which already pulls in the real
Material Icons `.woff2` the same way every page does — `core/App/Font.js`), then rendered
10 different icon names (`description`, `folder`, `arrow_forward`, `more_vert`, `close`,
`check`, `mic`, `settings`, `search`, `menu`) at `font-size: 24px; line-height: 1`, and
read `getBoundingClientRect()` on each.

**Result:** all 10 came back **exactly 24×24px** — width equal to height equal to the
font size, no variation between a wide glyph (`arrow_forward`) and a narrow one
(`close`). This is by design: Material Icons ships every glyph on a fixed 24×24 grid, so
**the font itself is monospaced for icons** the way a monospace font is for letters.

**What this means:** you never need to fix an icon's width by hand (a `width: 1em` some
callers add, e.g. `dropdown.css:82`, `Panel/toolbar.css:123`, `item.js`'s `.item-icon`,
is not wrong, just unnecessary for width alone — see the FRAME section below for why you
still might want it).

## 2. The icon's own box is exactly the font size; `line-height` changes the LINE, not the glyph

**Check:** same render, compared `line-height: 1` against `line-height: normal` on the
same 10 glyphs.

**Result:** the icon's own `getBoundingClientRect()` height did not change between the
two — still 24px either way. `line-height` on an inline element doesn't resize *that
element's* box; it resizes the invisible "line box" the browser builds around every
inline run on that line (glyph + surrounding text together). `framework.css`'s
`.icon { line-height: 1; }` (`framework.css:562`) exists to stop the icon from *quietly
inflating that shared line box* to whatever the icon font's own line metrics are — not to
resize the icon itself, which was already exactly 1em.

## 3. An icon does NOT sit centred against adjacent text by default — it needs a nudge or a frame

**Check:** built a row of plain text, a Material Icon (`line-height: 1`), and more plain
text, all at the same font size, and compared the icon's box against the row's own line
box.

**Result:** the icon (24px tall) sits flush with the TOP of the row's line box (28px
tall, from the text's own `line-height: normal`, ≈1.15). Its bottom lands about 4px
*above* the row's bottom edge — i.e., a plain icon reads as sitting slightly high and
looking disconnected from the baseline the letters sit on.

**This is exactly the bug the owner described** ("the vertical alignment is often a
problem"), and it is why real call sites hand-patch it — the one found in this audit is
`imagine/paging/paging.css:1020`:
`.paging-expand-head .icon { vertical-align: -0.15em; }` — a hand-tuned nudge, marked
`/* control */`, that exists only because the default position is wrong. It is a
symptom, not a fix others can reuse: the next caller has to rediscover the same offset.

## 4. When an icon needs a FRAME, and when it doesn't

A **frame** is a fixed square box (in `em`, so it scales with the container's font size)
that the icon is centred inside, both ways — `display: grid; place-items: center;` (or
flex) on a box sized `width/height: 1.3em` or similar, NOT on the icon itself.

**Needs a frame:**
- **A button that is only an icon** (no visible label) — a frame gives it a real click
  target bigger than the glyph's own ink, and centres the glyph inside that target both
  ways. `ui/item/item.js`'s `.item-caret, .item-icon` already does exactly this —
  `width: 1.3em; aspect-ratio: 1; display: grid; place-items: center; line-height: 1;`
  — and it's the cleanest example on the site today. Copy this, don't reinvent it.
- **A row of icon+label items that must line up in a column** (a file tree, a menu) —
  the frame is what makes every icon's right edge (where the label starts) land on the
  same x no matter how wide that particular glyph visually looks, and it reserves the
  same width for a caret/fold triangle so leaves and branches still line up
  (`item.js`'s own comment explains this: "a leaf next to a folder... lines its icon up
  with its sibling's").
- **A toggle / lit button** (the owner's "on = lit, off = dim" idea) — the lit background
  needs a fixed box to fill; you can't apply a background to a bare inline glyph and get
  a clean edge.

**Doesn't need a frame:**
- **An icon inline with text it's labelling** (a link, a menu row's own label, a
  breadcrumb) — here the fix is the small vertical-align nudge (fact 3), not a frame; a
  frame would add unwanted extra width before the label. Most of the one-offs in this
  audit (`.page-crumbs .icon`, `.page-related-link .icon`, `.omnibox-card .icon`, etc.)
  are this case and just set `font-size`, correctly.

**Frame size, in em:** `1.3em` square is what `item.js` already uses and reads well; the
Panel toolbar's icon-only button frame (`Panel/toolbar.css:103`) uses `1.7em`, sized for
a bigger click target. Recommend **picking one of these as the site default** (probably
`1.3em` for an inline icon-item, a bigger one like `1.6`–`1.7em` for a standalone icon
BUTTON that needs a generous tap target) rather than the current spread of ad hoc
numbers. Because both are `em`, raising the container's `font-size` scales the icon, the
frame, and any padding around it together — which is the exact "cascade through" the
owner asked for.

## How this was measured

[`measure-icons.mjs`](measure-icons.mjs) — a headless Playwright script (never drives
the owner's own browser tabs; launches its own hidden Chromium) that loads the real site,
injects the 10 test glyphs, and reads `getBoundingClientRect()` / `getComputedStyle()`
on each. Raw output is inline in the sections above; nothing here is estimated.

