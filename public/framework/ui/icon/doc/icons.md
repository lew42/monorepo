# The rules: when to frame an icon, and which class for what

The owner's own words: "I don't think necessarily every icon needs a frame... so just look
into that and figure out... show examples of either way."

## Is Material Icons fixed width?

**Yes.** Material Icons is a ligature font — `icon("star")` prints the literal word "star" and
the font swaps a glyph in for it — and every glyph in it is drawn inside the same 24×24 advance
box, however much of that box the ink actually fills. So two icons sitting side by side, with no
frame at all, already share the same width and already line up horizontally. That fact rules
out the single biggest reason someone reaches for a frame ("so the icons line up") — they
already do.

## So when does a frame earn its place?

Three real reasons, and a frame should exist only when one of them is true for the icon in
question:

1. **A click target.** A glyph alone renders at whatever `font-size` it inherited — often
   smaller than the roughly 2em (32px at a 16px base) that a pointer or a thumb wants to aim at.
   The frame is the square box that gives the click/tap area its real size, and it is also
   where a background and a hover live, because a bare `<span>` has nowhere for either to sit
   without changing the glyph itself.
2. **Vertical centring against something taller.** The icon's own `line-height: 1` (in
   `.icon`, framework.css) keeps it from growing whatever line box it sits in, but it does
   nothing to CENTRE the glyph inside a taller box around it — a button, a list row. That
   centring is `place-items: center` on the frame, not a property of the icon.
3. **A consistent box in a grid of them.** A rail or toolbar where every slot has to measure
   the same width — so a glyph that visually looks lighter or heavier still sits in a column
   that lines up with its neighbours' boxes, not just their glyphs.

An icon riding inline with a sentence ("★ Starred") needs **none** of these — it is not a click
target, it is not centred against anything taller than itself, and it is not one slot in a grid.
That case keeps using plain `.icon`, unframed, exactly as before this task.

## The one token: `--icon-frame`

`--icon-frame: 1.6em` is declared once, in `framework.css`, right beside `.icon`'s own
`font-size: 1.25em` — both rules read the same ancestor's font-size, which is what makes
`.ui-icon-frame` and `.ui-icon-btn` scale together with the glyph when a container's font-size
changes (the page's "three sizes" demo proves this live: 14px, 18px, 28px containers, same
markup, everything scales). 1.6em leaves visible room for a background and padding around the
1.25em glyph without the frame crowding it.

`ui/item`'s own tree-row frame (`.item-icon`, `.item-caret`) is a **tighter** 1.3em — a row read
many-in-a-column wants the icon closer to the name beside it than a standalone button does. That
was a deliberate, already-shipped choice (2026-09-29), not an inconsistency: two different
contexts, two different numbers, both derived from the same underlying idea. A later pass could
point `.item-icon` at `--icon-frame` too with an override, but that edit is outside this task's
fence (`public/framework/ui/item/` was not touched).

## Which class for what

| Need | Class |
|---|---|
| An icon riding inline with text | `.icon` (unchanged, no frame) |
| An icon alone, needing a visible frame | `.ui-icon-frame` |
| A clickable icon, no background until hover | `.ui-icon-btn` |
| A clickable icon that should already read as its own surface | `.ui-icon-btn.ui-icon-btn-bg` |
| An on/off icon button | `.ui-icon-btn` + `aria-pressed="true"/"false"`, toggled on click |
| A row of icon buttons, some flush, some backed | `.ui-icon-rail` around any mix of the above |
| An icon beside a name in a list | `ui.item({ icon, name, … })` — a different module, not this one |

## What this task did not touch

- `ui/item`'s own `.item-icon`/`.item-caret` frame (1.3em) — reused as-is in this page's list
  demo, not rebuilt.
- `ui.js` — the one-line import that would make `ui.icon` importable like `ui.item` is the next
  pass's job (the mastermind's migration message), not this fence.
- Every other site-wide icon-layout one-off the audit found — this task built the one system;
  migrating the worst offenders to it is the follow-up step named in the parent brief.
