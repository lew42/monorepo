# `files.css`

The frame and the two payloads — what a tree row looks like, and how the source
and the prose sit inside a panel body. One theme layer, no queries: since the
regions became [ext/Panel](/framework/ext/Panel/) leaves, every question this
file used to answer with a breakpoint is answered by a grip.

## `.files` is a frame around a token

```css
.files {
	--panel-height: min(70vh, 30em);
	border: 1px solid var(--line);
	border-radius: var(--radius);
	overflow: hidden;
	background: var(--surface);
}
```

`.panel-workspace` is `height: var(--panel-height, 34em)` and every region
inside it is `flex: 1 1 0`, so the browser needs a box with a real height to
scroll in and this is it. A host wanting a taller browser **retunes the token
and nothing else** — `ext/Doc`'s `.doc-files > .files` does exactly that for
the Files tab, which is the whole tab rather than a figure inside a page.

`overflow: hidden` clips to the radius. It also clips a bar's popover at the
outermost edge, which is the same trade `.editor` makes and the same one
`.panel` itself makes one level down.

## `inline-size: 100%` on all three payloads

A panel body is a grid that **centres what it is handed** (`justify-items: safe
var(--panel-x)`), so a payload shrink-wraps unless it says otherwise. The three
region roots claim the full column and let the panel's own `align` — seeded
`tl` — do the positioning. This is the one line `ext/editor`'s `.editor-region`
carries too, for the identical reason.

## What went, and what replaced it

| gone | replaced by |
|---|---|
| `container-type: inline-size` on `.files` | the panel body's own containment |
| `@container (max-width: 56em)` stacking `about` under the source | a grip the reader drags |
| `@media (max-width: 40em)` stacking the tree above the pane | the axis seeded at roll time (`panels.js`) |
| `.file-tree { --basis: clamp(9em, 26%, 15em) }` and its `.basis` util | `grow: 1.5` on the tree's pane |
| `max-height: 26em` on the source and the prose | `--panel-height` on the frame |
| four `min-width: 0` resets | `panel.css`'s `min-width: 0` on every level |

That is roughly 40 lines of layout, and none of it was wrong — it was all
answering questions a panel answers by construction. The border between the
tree and the source is gone too: the seam is `grip.css`'s `box-shadow` now, so
two panels sit at a measured 0px and one declaration draws both axes.

## The source block is flush and has no end

```css
.file-source > .code-block,
.file-source > pre { margin: 0; border: none; border-radius: 0; font-size: 0.85em; }
```

The panel body is the scroller, so the block inside it neither draws its own
frame nor caps its own height — the `max-height: 26em` this rule used to carry
was the flex arrangement's only way of giving the pane an end.

## Improvements

1. **`--panel-height: min(70vh, 30em)` is a guess with one override already.**
   `ext/Doc` immediately wanted `min(74vh, 42em)`, which is a signal that the
   default is tuned for the *smaller* caller. Nothing is wrong today — both
   values were checked at 1440 and 390 — but two callers and two heights is how
   a third arrives at a third. *(simple, speculative)*
2. **`.file-blank` styles a payload that only exists because `Panel.defaults`
   says `"blank"`.** One declaration for a region nobody chooses on purpose. It
   earns its place while the alternative is a silent void; delete it the day
   ext/Panel lets a vocabulary name its own default. *(simple, speculative)*
3. **Nothing here says which classes `panels.js` emits and which `files.js`
   does.** The `css:` comments in both JS files carry it; a reader arriving at
   this sheet first has to open two files to find out. *(simple, useful)*
