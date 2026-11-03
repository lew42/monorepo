## toolbar.css

The bar's paint and — the load-bearing half — **when it appears**. Structure,
plus the one thing a floating bar cannot leave to the theme: a scrim, so it
reads over whatever the panel happens to be showing. Every colour is a token.

## The reveal contract is one selector

```css toolbar.css
.panel:hover:not(:has(.panel:hover)) > .panel-bar,
.panel:focus-within:not(:has(.panel:focus-within)) > .panel-bar {
	opacity: 1; pointer-events: auto;
}
```

Hovering a leaf hovers every ancestor of it, so without the `:not(:has(…))` four
bars light in the same corner. An ancestor stands down for the panel under the
pointer and is reached through the divider it alone owns.

⚠ **`pointer-events` must move with the opacity.** A bar at `opacity: 0` still
hit-tests, and in a nest the invisible ancestor sits directly over the panel you
are pointing at — every click lands on nothing, silently.

⚠ The `(hover: none)` rule tests something different on purpose:
`.panel:not(:has(.panel))` — a **leaf**, not the innermost hovered. A touch
screen has no way to point at an ancestor, so a stack of covered bars would be
noise with no way to reach the one you want.

## Out of flow, and under the grip's neighbour

`position: absolute; z-index: 3`. A panel's content is the same size bar or no
bar, so a nest of panels costs no strips — and 3 sits **above** `.panel-grip`'s
2, so a bar stays clickable where the two cross.

`.panel-gap { flex: 1 1 0 }` pushes `close` to the far end and is the first
thing to give when the panel is too narrow, which is how the row holds its
width without wrapping.

## `--panel-bar-h` — the height is declared, so the reserve cannot drift

```css toolbar.css
.panel-workspace { --panel-bar-h: 1.8rem; }
.panel-bar { block-size: var(--panel-bar-h); … }
```

The bar is an overlay, so anything that must not sit under it has to know how
tall it is. One token answers both ends: the bar is **sized** by it, and
`panel.css` pads a `.panel-controls` payload's body by it. Declaring an extent
rather than measuring one is the same call the sizing rules make two files over.

⚠ **`rem`, never `em`** — the bar reads at `0.8em` of a panel whose font size its
content sets, so an `em` token would be one height at the bar and a different one
at the payload. `grip.css` sizes its grab strip in `rem` for the same reason.
Measured cost of declaring it: 28.39px → 28.8px, buttons unmoved horizontally.

## The bar is ALWAYS folded (2026-08-19)

```css toolbar.css
.panel > .panel-bar .panel-more { display: flex; }
.panel-pop.panel-fold { display: none; }
.panel-pop.panel-fold.on { display: grid; }
.panel-pop { max-inline-size: 100%; }
```

Three `@container` blocks used to decide this by measuring the bar: unfold past
26em, reflow the browse shelf under 12em, hide everything under 84px. All three
went with every container query in the module, and folding unconditionally
replaces them — handle, `more_horiz`, the even-split quick verb and `close` are
always visible, and the whole run of verbs is in the popover it already was.

That is less code AND less to be wrong: a bar that folds at one width and unfolds
at another has to be right twice, and the unfolded shape carried its own bug (a
stale `on` reopened the run on the way back, which is why `pointerleave` closes
it). A bar that always fits needs no threshold at all.
[decisions](/framework/ext/Panel/doc/decisions/).

`max-inline-size: 100%` is the other half: a picker is `position: absolute` in a
bar it can easily out-measure, and `%` reads `.panel-bar` — the popover's
containing block, and the same box `100cqi` read.

## ⚠ `.panel-bar .icon` is clamped to `1em` because ligatures fail as words

Material Icons is a ligature font: a name it does not carry renders as the whole
**word**, and one 150px `deployed_code` sized every column of the popover grid
below it. A real glyph is one em wide, so the clamp costs a correct icon
nothing and confines a bad entry to looking wrong.

## ⚠ Three classes on the button rule, on purpose

`.theme-lew42 :is(button, .btn)` is 0-2-0 and pads to `0.7em/1.4em` — right for
READ GUIDE, four times too wide for a 1em icon. `.panel > .panel-bar .panel-btn`
reclaims the **box** only; the small-caps voice stays the theme's.
`.panel-handle`'s `cursor: grab` sits *after* it — same specificity, so source
order is the whole reason it wins.

## `.panel-pop` is the shared popover

Absolutely positioned, so its slot in the bar costs nothing and DOM order is
free; `display: none` → `grid` on `.on`; the column count is the
`--panel-cols` token, because nine alignments, four tones and a wall of
templates want different shapes out of one block. `grip.css` reuses this block
and overrides only *where* it opens.

## Improvements

1. **`.panel-bar { font-size: 0.8em }` is the only type-scale override in the
   module and nothing says why.** It is also the scale the `19em` fold threshold
   is measured in, so it reads as arbitrary and is not. One line. *(simple,
   useful)*
2. **`.panel-pop` is styled here, re-anchored in `grip.css`, and now folded
   here too** — a component with two owners and no file of its own. Three
   consumers was the stated signal to split it out. *(medium, useful)*
3. **The fold threshold is one number for a row whose length varies.** A leaf's
   row is eight buttons; `ext/editor`'s is seven (no layout roll) and folds ~25px
   earlier than it needs to. A per-content threshold is not expressible in CSS,
   and the cost is one extra click on a rare verb. *(medium, speculative)*
4. **Below ~148px the template picker no longer fitted even capped** — six columns
   at their `min-width` floor is 144px. Auto-filling the columns fixes it and would
   have destroyed the alignment picker, which is a 3×3 or it is not a picture of
   the nine placements. The two are told apart by a class rather than a number now
   (`panel-browse`, above), which is what this entry asked for. *(medium — done)*
5. **`12em` is a second hand-measured threshold beside `19em`.** Both are the
   width of a specific row of specific buttons, and both drift the day a button is
   added — the fold's is one button-count out for `ext/editor` already. Nothing in
   CSS measures a row for you; the alternative is a `ResizeObserver`, which buys a
   number with a subscription. *(medium, speculative)*
