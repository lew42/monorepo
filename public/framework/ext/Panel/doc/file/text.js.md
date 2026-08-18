## text.js

The editing surface: selecting a run of prose (`p`, `h1`–`h6`, `li`,
`blockquote`), the hover/selected marks, `T` to type on it directly, the
level/weight/tracking/align controls `text_fields()` draws in the rail, and
the in-place `h2 · 58ch × 3` gauge. What survives a redraw — `data.text`, the
`MutationObserver` replay, `text_apply()`/`text_commit()` — is
[`persist.js`](./persist.js.md), one file below this one: this file calls
into it, never the other way.

## `text_layers()` — the disposer is `persist.js`'s, this file just adds to it

```js text.js
export function text_layers($body, item){
	const root = $body.el;
	const dispose = text_observe($body, item);

	root.addEventListener("mouseover", e => mark(inside(root, e.target.closest(SELECTOR))));
	root.addEventListener("click", e => { … select(…); });

	return dispose;
}
```

`text_observe()` (in `persist.js`) does the part that needs disposing — the
`MutationObserver` and the `owners` registration — and hands back a dispose
function. This file's own hover/click listeners bind straight to `root` and
need no explicit teardown: they die with the DOM node `paint()` throws away,
the same as any other listener bound inside `view()`. `text_layers()` marks
what's pointable with **one** delegated listener per body — a body can hold
hundreds of text nodes, and a listener per one of them does not scale.

## `gauge()` — one fixed element for the whole document

```js text.js
let $gauge, ruler;
function gauge(el){
	$gauge ??= document.body.appendChild(Object.assign(document.createElement("div"), { className: "panel-text-gauge" }));
	…
}
```

What the selected run **is** and how long its line runs — the two facts you
cannot get by looking at it. `fixed`, and one per document, appended to
`body` and reused: a badge appended *inside* the panel it measures would
change the width it is reporting, and `paint()`'s next `empty()` would
discard it along with everything else the template drew.

⚠ **A measure only means something once the text WRAPS.** Judged on every
run, the gauge would flag every short label and heading on the page —
`SHIPPED` is 11ch and correct — and a warning that fires on correct work is
one you learn to ignore. `text.css`'s `.wide`/`.narrow` classes only ever
apply past one line.

## `edit()` — type on the thing itself

`contenteditable="plaintext-only"`, never a rail input: the measure, weight
and line length **are** the point of editing copy in a layout tool, and text
retyped somewhere else is text you can't watch break. The whole run is
pre-selected on entry so the first keystroke replaces placeholder copy
rather than landing wherever the click put the caret.

⚠ **Escape ends it; Enter does not.** A heading may legitimately wrap, and a
tool that swallows the return key can never write two lines of anything.

⚠ **The class comes off *before* `persist.js`'s `record()` writes.**
`record()`'s `set()` triggers a `change`, which repaints every mirror — a
body still wearing `.panel-text-edit` at that moment would be captured by
the very repaint its own edit caused.

## `wrap()` — the "put this in a box" move

```js text.js
export function wrap(el, tag = "div"){
	const made = box(el, tag);
	record(el, { box: tag });
	select(el);
	return made;
}
```

The wrapper takes the layer's place in the flow and adopts it, so nothing
moves. Selection stays on the **run**: the box is derived from the run's
record and has no address of its own to save styling against. `box()` is
`persist.js`'s — `wrap()` and the replay's `dress()` share the exact same
function so a user action and a reload can never build different DOM for
the same saved key.

## `type_here()` — `T` never does nothing

```js text.js
if (selected?.el?.isConnected) return start(selected.el);
const $body = document.querySelector(".panel:hover:not(:has(.panel:hover)) .panel-body");
if (!$body || !tracked($body)) return null;
return start($body.querySelector(SELECTOR) ?? fresh($body));
```

⚠ **On *any* panel** — a scene or a clock matches nothing in `SELECTOR`, and
`T` doing nothing there is `T` being broken three times out of four rather
than scoped. `tracked()` and `fresh()` are `persist.js`'s: `tracked()`
answers only for bodies `text_observe()` bound, which is the one place a
workspace running with `tools.text` off is invisible to `T`; `fresh()`
writes the new run down first and builds it through the same machinery the
replay uses, so what's on screen immediately is what a reload gives back.

⚠ **The module-scope `keydown` listener checks `typing()` and real focus
first.** Without the first check, the very next keystroke of whatever you
just typed (inevitably another `t`, sooner or later) would restart the
session; without the second, typing a `t` into the properties rail jumps to
a panel instead of landing in the field.

## `text_fields()` — one table, drawn here, replayed in `persist.js`

```js text.js
for (const name in FIELDS){
	const field = FIELDS[name];
	row(field.names, field.icons, field.of($el), pick => {
		field.set($el, pick);
		record($el.el, { [name]: pick });
		announce($el);
	});
}
```

`FIELDS` is imported whole from `persist.js` — the same table `dress()`
replays there. Adding a typographic control anywhere else would give the
tool a knob that does not survive a redraw, so there is deliberately nowhere
else to add one.

## Improvements

See [`persist.js`](./persist.js.md)'s Improvements — both open items
(`FIELDS`' two readers, `scope()`'s `"draw"`-branch collision) are about the
storage layer, not this one.
