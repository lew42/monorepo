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
rather than measuring one is the same call `--panel-hug` makes two files over.

⚠ **`rem`, never `em`** — the bar reads at `0.8em` of a panel whose font size its
content sets, so an `em` token would be one height at the bar and a different one
at the payload. `grip.css` sizes its grab strip in `rem` for the same reason.
Measured cost of declaring it: 28.39px → 28.8px, buttons unmoved horizontally.

## The container is the bar itself, and that is the only safe box here

```css toolbar.css
.panel-bar { container: panel-bar / inline-size; … }
```

⚠ **A query container is measured as if it were empty**, which is the trap that
collapsed `hug` and the reason `--panel-hug` exists. The bar dodges it by
construction: `inset-inline: 0` sizes it from the panel, so containment has no
content size to lose. Do not move this to `.panel` — a hugging panel *is* sized
by its contents, and it would measure 0.

Naming the container matters: `templates.css` queries an **unnamed** container
and expects `.panel-body`. Nothing in the bar queries unnamed, and `.panel-bar`
is never an ancestor of a body, so the two never meet — but the name is what
makes that true by declaration instead of by luck.

## The fold: one contiguous run, `display: contents` until it is not

```css toolbar.css
.panel-pop.panel-fold { display: contents; }

@container panel-bar (max-width: 19em) {
	.panel > .panel-bar .panel-more { display: flex; }
	.panel-pop.panel-fold { display: none; }
	.panel-pop.panel-fold.on { display: grid; }
	.panel-pop { max-inline-size: 100cqi; }

	@container panel-bar (max-width: 12em) {
		.panel-pop.panel-browse { grid-template-columns: repeat(auto-fit, minmax(1.7em, 1fr)); }
	}
}
```

`toolbar.js` wraps every verb in one `.panel-pop.panel-fold`. Above the
threshold that wrapper has **no box at all**, so every `.panel-pop` declaration
is inert and its buttons are the bar's own flex items in source order — measured
identical, x for x, against the un-folded bar. Below it, the wrapper is the
popover it already was and `.panel-more` stands in for the run.

⚠ `.panel-pop.panel-fold` and `.panel-pop.on` are **both 0-2-0**, so source order
is the whole reason the fold wins at wide widths. It comes after, like
`.panel-handle`'s cursor.

⚠ `em` in the condition is the **bar's** em (12.4px at the site's default), which
is the scale the row is measured in — so the threshold tracks the row rather than
the document. `19em` ≈ 236px against a fully-shrunk 8-button row of 225px.

`max-inline-size: 100cqi` is the other half: a picker is `position: absolute`
inside a panel that `overflow: hidden`s, so without a cap the 6-column template
grid opens straight past the edge. Capped, its `1fr` tracks fall back to each
button's own `min-width`. Measured: 174.7px wide at 248px and up, 144px at 181px,
still inside the panel at 146px — and at 140px the *box* obeyed the cap while its
six columns did not, the last one crossing the panel edge by 1px, by 21px at 120px.

## Only a shelf reflows — the 3×3 is a picture

Six columns at that floor is 6 × `1.7em` + gaps + padding = **144px** of popover
in a bar that has `100cqi` and no more, so below ~148px the cap can only clip. The
grid may hold fewer columns instead — but the same `--panel-cols` token draws the
**alignment** picker, and a 3×3 that auto-fills is no longer a picture of nine
placements. So the fork is a class, not a number: `toolbar.js` marks the
browse-by-picture grid `panel-browse`, and only that grid reflows.

⚠ **The inner query is nested inside the outer one on purpose.** `auto-fit`
counts columns against a **definite max size** — which is `max-inline-size: 100cqi`,
declared one rule up. Lift it out of that block and the count collapses to a single
column, because an auto-sized grid with no definite max gets one repetition.

Measured, template picker, before → after: **unchanged** at 1600 and 300px
(174.7px, 6 columns, 5 rows) and at 236px and 181px (144px, 6 columns); at 146px
6 → 5 columns (121.1px), at 140px 6 → 5 (all 29 entries inside the panel, where 4
hung over before), at 120px 6 → 4 (110.6px, 8 rows). `rail` — an entry in the
column that used to hang past the edge — clicks and paints at both 140px and 120px.
The alignment picker is 84.9px and exactly 3 × 3 at 1600, 200 and 140px, the tone
picker 2 wide and 116.6px, and the fold still swaps at 181px.

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
