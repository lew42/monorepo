## toolbar.js

The bar that floats over a panel: `toolbar(item, $panel, $body, T)` draws one
row of icon controls, plus `handle()` (the drag grip in the bar), `place()`
(the alignment write) and `TONES`. Every control is one `item.set()` or one of
`Panel`'s two verbs — there is nothing here that sizes, saves or redraws.

## It imports `View` and nothing else

Not `ext/layout` — [Decisions](/framework/ext/Panel/docs/decisions/) records what
one line of that cost — and nothing of `ext/Panel` either, so `workspace.js`
reads this file one way and the two can never circle. The price is that the
vocabulary arrives as an argument:

```js workspace.js
toolbar(item, $panel, $body, {
	names: offer(item),
	entries: { random: { icon: "casino" }, ...vocab(item) },
	roll: name => roll(item, $body, name),
	repaint: () => paint(item, $body),
});
```

`T` is prepared by the call site, which is why `random` — a verb, not a
template — can be handed in wearing a picture like any entry, and why the layout
roll can call into `generate.js` from a file that imports nothing of `ext/Panel`:

```js toolbar.js
if (T.sow) btn(() => { icon("space_dashboard"); }, T.sow).attr("title", "Roll a layout as panels");
```

`space_dashboard` is the `space` template's own glyph on purpose — the button
means *that, as panels*. `T.sow` is `false` rather than a function when the
workspace runs its own vocabulary, the same predicate that withholds `random`.

## `$body` is the leaf test

A split has no body, so it gets the two divide buttons, the layout roll and
`close`; template, tone, alignment and hug/fill are all inside `verbs()`'s
`if (!$body) return`. `close` needs `item.parent?.items.length > 1` — the last
child of a split cannot be closed, because closing it would leave a split with
nothing in it.

The roll sits deliberately **before** that test: it is a structure verb, so it
belongs with `divide`, and it is the reason a split is no longer a bar with two
buttons on it.

## The fold — every verb in one contiguous run

```js toolbar.js
if (!$body) verbs();
else {
	const $fold = div.c("panel-pop panel-fold", verbs).style("--panel-cols", 4);
	btn(() => { icon("more_horiz"); }, () => { pops.forEach($pop => $pop.rc("on")); $fold.tc("on"); })
		.ac("panel-more").attr("title", "More controls");
}
```

Every control the bar draws lives between the drag handle and `.panel-gap`, so
the whole run can go in one wrapper without reordering anything. `toolbar.css`
gives that wrapper `display: contents` until the panel is too narrow for the row
— no box, so the popover styles are inert and the buttons are the bar's own flex
items at the exact positions they have always had. Below the threshold the
wrapper becomes the popover it already is, `.panel-more` appears, and the row is
handle · ⋯ · close (95.4px, against 225px for the full row shrunk to its floor).

**Only a leaf builds one.** A split's row is three buttons and fits at any width
worth pointing at, so a 200px split keeps its verbs one click away rather than
two.

⚠ **`$fold` is deliberately NOT in `pops`.** `pop()`'s mutual exclusion clears
every *other* pop before toggling — with the fold in that set, clicking Template
inside it would close the thing holding the button. It clears `pops` itself
instead, so opening or closing the fold also puts its inner pickers away.

⚠ **DOM order is trigger-last on purpose, and it does not matter.** `$fold` is
appended before `.panel-more` because `div.c()` appends on creation; wide, the
trigger is `display: none` and contributes no flex gap, and narrow, the fold is
out of flow. Either way the row reads handle first.

The three pickers are built *inside* the fold, so narrow they anchor to it
(opening below the fold rather than below the bar) and wide their containing
block is `.panel-bar` again, because an element with `display: contents` is not a
containing block. No JS re-anchors anything.

⚠ **The fold's `on` outlived the state that made it a popover.** Open it in a
narrow panel, widen past 19em and the fold becomes `display: contents` while
`.panel-more` — the only control that clears `on` — becomes `display: none`. Come
back below the threshold and the popover is open with nobody having clicked it.
Measured: `93px → 275px → 93px`, and the fold returns `display: grid`. It now
closes with the pointer, the discipline `grip.js`'s menu already followed:

```js toolbar.js
$panel.on("pointerleave", () => { $fold.rc("on"); pops.forEach($pop => $pop.rc("on")); });
```

The bar is hover-revealed, so chrome you can no longer see is no longer open —
and every way a panel gets re-narrowed by hand (dragging a seam, the demo stage's
resizer) takes the pointer off the panel first. A window resize with the pointer
parked inside the panel is the one gap, and the next pointer exit closes it.

## The hug/fill button writes DOM, every other control doesn't

`item.set("mode", …)` saves but never redraws (only `add`/`remove` do), so the
button toggles `.hug` on `$panel` and `on` on itself by hand. ⚠ That makes it
the one control whose visual state can drift from `data`: the grip's own
hug/fill menu sets the same key, and neither knows about the other's button.

## One popover open at a time, filled on the way open

`pop()` pushes into `pops` and clears every sibling before toggling itself.
There is no outside-click or Escape handler — leaving the panel closes the whole
bar's chrome (above), which is what usually puts a picker away. The grid's column
count rides `--panel-cols`: `pictorial(T)` asks whether the vocabulary ships
icons at all, six wide if it does and two if it reads as names, which is
`ext/editor`'s regions.

## One class says which columns are a shelf

```js toolbar.js
const pics = pictorial(T);
pop(glyph(T.entries[template], template), "Template", pics ? 6 : 2, () =>
	pick(T.names, T.roll, item.get("template"), T.entries)).ac(pics && "panel-browse");
```

Six columns of pictures stop fitting around 148px, and the honest fix is fewer
columns — but `--panel-cols` is the same token the **alignment** picker rides, and
a 3×3 that auto-fills is no longer a picture of nine placements. The kinds are told
apart at the one place that knows which is which: a picture grid is a shelf and
wears `panel-browse`; the spatial 3×3 wears nothing and keeps its shape at every
width. `toolbar.css` reflows only the marked one, under a container query.

`pics` gates the mark as well as the column count, because `ext/editor`'s
name-vocabulary picker is two columns of *words* — it fits everywhere already, and
auto-fitting it would size tracks against a floor its labels are wider than. No
template ever declares any of this: the class is a reading of the vocabulary, like
the `6 : 2` beside it.

⚠ **`fill` runs at open, not at build.** Every `on` a picker draws is a read of
this panel's `data`, and the inspector writes that `data` from a panel this bar
cannot see — so a reopened Tone picker went on marking `surface` after the
inspector had set `prim`. `if (!$pop.hc("on")) $pop.empty(fill);` in the trigger,
and the Template picker reads `item.get("template")` rather than the name closed
over when `verbs()` ran. A reopen is the only moment the state can be re-read
without a full reactive resync, which stays out of scope: the **button labels**
still show the glyph they were built with, so the T button's picture can lag an
inspector edit until the next structural redraw.

⚠ **The handle is the grip, never the bar.** `handle()` returns an element the
call site hands to `PanelDrag` as `handle:`; a handle owning the bar would start
a drag on every button's `pointerdown` and its `preventDefault` would eat the
click.

## Improvements

1. **`pick()` and `grip.js`'s `menu()` are the same twelve lines** — build a set
   of buttons, clear `on` from all, set it on the clicked one. Two copies is not
   yet a pattern, but they are now in two files and will drift. *(simple,
   useful)*
2. **`TONES` is exported from the toolbar and imported by `workspace.js`'s
   `scatter()`** — the tone vocabulary lives in the file that happens to show
   the chips. `templates.js` is where the rest of the vocabulary is. *(medium,
   useful)*
3. **The fold trigger is `more_horiz`, so a narrow panel stops saying what it
   holds.** The template button *is* the current template's picture — the one
   thing on the bar that identifies the panel — and it goes into the fold with
   everything else, because keeping it out costs 26px a 150px panel does not
   have. Wearing the template's glyph on the trigger instead would buy the
   identity back and spend the "there is more here" signal. *(simple,
   speculative)*
4. **The fold had no Escape and no outside-click**, exactly like `pop()` — and
   the fold's stale `on` then reopened it unasked after a widen and a re-narrow
   (above). One `pointerleave` on `$panel` now serves both, which was the shape
   this entry proposed. Escape is still unhandled, for both. *(simple — done)*
