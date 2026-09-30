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

## Migrated (this task's second pass, after the audit)

- **The inline-alignment bug** (facts.md §3: an icon sits ~4px high against the text beside
  it) is now fixed ONCE, in `.icon` itself (`framework.css`, `vertical-align: -0.15em`) —
  the exact value one real caller, `imagine/paging/paging.css:1020`, had already hand-tuned.
  That caller's own nudge is deleted; it now inherits the shared default. `vertical-align`
  only ever moves an inline box against surrounding text, so every frame/button that
  centres its icon with `place-items`/`align-items` (this module's own, `ui/item`'s,
  Panel's) was never touched by the old per-caller nudges and is not touched by this
  change either.
- **`ext/Panel`'s duplicate stylesheet** (audit one-off #2: `toolbar.css` and
  `controls.css` carried a byte-for-byte identical `.panel-btn`/`.panel-bar`/`.panel-pop`
  block, so a fix to one never reached the other) is deduplicated: `controls.css` is now
  the one real copy (it is what `workspace.js`, the module's front door, loads);
  `toolbar.css` is an empty stylesheet with a comment pointing at it. `.panel-btn` itself
  was **not** rewired onto `.ui-icon-btn` — it already has the same flush/hover/lit-toggle
  shape (built 2026-08-16, before this module existed), but also its own opacity-fade bar
  reveal and `:has()` square detection that `.ui-icon-btn` has no reason to know about, and
  it has real callers across the rail, a seam's menu, the drag grip and the inspector. A
  full class swap risked exactly the "v1 behaviour unchanged" rule this task was given, for
  a cosmetic win (one shared class name) this task's budget did not cover. `controls.css`
  now says so, next to the rule.

## Not migrated yet

- **`core/App/mode.css`'s `.mode-btn`** — the floating mode-switch pill. Looked at it:
  `position: fixed`, its own `border-radius: 999px` (a full circle, not `.ui-icon-btn`'s
  `var(--radius)`), a drop shadow, and a background that is always on (never flush) with a
  colour-only hover (not a fill change). That is four real differences from
  `.ui-icon-btn.ui-icon-btn-bg`, not a rename — listed here rather than forced.
- **`core/Search/Search.css`'s Omnibox** (`.omnibox-bar > .icon`, `.omnibox-card .icon`) —
  its own pill padding, not checked against the vertical-align fix yet.
- **`imagine/scenes/scenes.css`'s `.scene-bar`** — hides its icon glyph entirely
  (`font-size: 0`) and fakes a `/` divider with CSS `content`. The audit's own read: this is
  probably a "use `icon("chevron_right")` like everywhere else" fix, not a frame/button
  question at all — worth a direct look before touching it.
- **The hero-icon size variants** (`ext/AITask/nested.css`, `ux/Content/content.css`'s
  `.w1`/`.w2`/`.w3`) — three near-identical big-display-size blocks that could share one
  `--icon-hero` token. Low risk, cosmetic only; not touched.
- `ui/item`'s own `.item-icon`/`.item-caret` frame (1.3em) — reused as-is in this page's list
  demo, not rebuilt onto the shared `--icon-frame` token; a real edit, just outside this
  task's fence (`public/framework/ui/item/` was not in it).
- `ui.js` — the one-line import that would make `ui.icon` importable like `ui.item` is a
  follow-up, not this fence.
