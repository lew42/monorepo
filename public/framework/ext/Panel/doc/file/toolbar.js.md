## toolbar.js

The bar that floats over a panel — and since 2026-08-19, **only what a hand
does**. `toolbar(item, $panel, $body, T)` draws one row of icon controls, plus
`handle()` (the drag grip) and `place()` (the alignment write). Sixty lines.

| drag handle | split into columns | split into rows | `tune` | the call site's tool | close |

Nothing on it opens a popover. Nothing on it is a word.

## What left, and where it went

The bar carried **15 controls**: four on the strip and eleven behind
`more_horiz`, most of which opened a picker of their own — template (29
entries), tone, display, the flex or grid words, two size pickers, a live
duplicate, the root's `mode`, a split's `group`. 365 of those popovers were cut
off at 1280 (343 at 400).

Every one of them is a row in the **rail** now (`properties.js`), and the whole
machinery went with them: `pop()`, `pick()`, `word_pops()`, `size_pop()`,
`pictorial()`, the fold, `.panel-quick`, `.panel-browse`, `.panel-more` and
`WORDS`'s `bar:` flag. The verdict, with the measurements:
[decisions.md](/framework/ext/Panel/doc/decisions/).

## `tune` — the one control that is not a gesture

```js toolbar.js
const words = item => btn(() => { icon("tune"); }, async () => {
	const { dock } = await import("./tools.js");
	await dock();

	const root = item.root();
	document.dispatchEvent(new CustomEvent("panel-focus", { detail: (root.focus && root.find(root.focus)) || item }));
}).attr("title", "Words — this panel's controls, in the rail");
```

It exists because **the rail is not open on every page.** `dock()` runs on the
module page and the playground; a panel in `ext/editor`, or any one-off
`panel()`, would otherwise have no door to its own vocabulary now the bar carries
none.

⚠ **`tools.js` arrives lazily.** It imports `place` from this file, so a static
import here would close the ring. The dynamic one is fine at runtime — by the
time a bar is clicked, `toolbar.js` has long since evaluated.

⚠ **Nothing is built after the `await`.** `dock()` and the event both draw inside
`empty()` callbacks of their own, which re-establish the captor.

⚠ **It announces whatever is FOCUSED, not `item`.** The same click already
reached `focus()` (workspace.js's `view()`), and with `group: on` that may have
landed on an ancestor. Reading `root.focus` back is how the ring and the rail
cannot disagree — the alternative was a rail showing a leaf while the orange ring
sat on its section, which is the smell the sweep set out to remove.

## `T` is still prepared by the call site

`toolbar.js` imports `View` and `glyphs.js`'s `PLACE`, and nothing of `ext/Panel`
— so `workspace.js` reads this file one way and the two can never circle. Of the
vocabulary `workspace.js` hands in, **only `T.tool` is read** now:

```js workspace.js
tool: $body && t.zoom ? () => zoom_scrub(item, $body) : undefined,
```

The magnifier, which draws on the body rather than in the row. `T.names`,
`T.entries`, `T.roll`, `T.sow` and `T.copy` are the rail's business or the
drag's; `$panel` and `$body` are still taken because `workspace.js` passes them.

## `close` needs a sibling

```js toolbar.js
if (item.parent?.items.length > 1) btn(() => { icon("close"); }, () => item.close());
```

The last child of a split cannot be closed — closing it would leave a split with
nothing in it.

## The handle is the grip, never the bar

`handle()` returns an element the call site hands to `PanelDrag` as `handle:`. A
handle owning the whole bar would start a drag on every button's `pointerdown`,
and its `preventDefault` would eat the click.

## `.panel-pop` is still here, for one caller

`toolbar.css` keeps the popover block because **a seam's hug/fill menu**
(`seam.js`, placed by `grip.css`) still uses it. Its `max-inline-size: 100%` cap
went with the bar it was written for: that `%` read `.panel-bar`, and a seam's
menu hangs off a zero-width divider.

## Improvements

1. **The live duplicate lost its only button.** Alt-dropping a panel still makes
   one and the module page documents it, but there is no click path. The rail's
   `sow` row is where a verb like it would go. *(simple, useful)*
2. **`tune` is a fifth idiom for "show me this thing".** A click on the panel
   does it, `dock()` does it at load, `panel-focus` does it, and now a button.
   One of them should be the door. *(medium, speculative)*
3. **The bar has no keyboard.** Every control is a `button`, so tab and Enter
   work, but the bar is `opacity: 0` until hover — a keyboard user reaches
   controls they cannot see. `:focus-within` already reveals it; whether the
   order is right has not been looked at. *(simple, useful)*
