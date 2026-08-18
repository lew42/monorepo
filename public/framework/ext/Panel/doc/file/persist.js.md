## persist.js

`panel.data.text`, the storage underneath `text.js`'s editing surface. A
template's `draw($body, item)` owns `$body`'s markup outright, and
`workspace.js`'s `paint()` empties and rebuilds it on every tone, template or
mirror change — this file is built backwards from that one fact: an address
scheme that survives a rebuild, a write path that never loses an in-progress
edit, and a replay that puts everything back once the new DOM exists. One
direction only: `text.js` calls in here; nothing here imports `text.js`.

## The address: `scope + "/" + path`, never a DOM reference

```js persist.js
const scope = item => !item.data.template && item.draw ? "draw"
	: item.get("template") + (item.get("seed") ? "~" + item.get("seed") : "");

function path_of(root, el){
	const steps = [];
	for (let node = el; node !== root; ){
		const up = node.parentElement;
		if (!up) return null;
		if (up.classList.contains("panel-text-box")){ node = up; continue; }
		steps.unshift([...up.children].indexOf(node));
		node = up;
	}
	return steps.length ? steps.join(".") : null;
}
```

`scope` is *which drawing* a run belongs to — the template's name, plus its
seed where it has one, because a re-rolled `space` is a different page and an
edit that survived the roll would land on whatever now happens to sit at that
path. `path` is the run's child-index chain from the body down, walking
*through* a `.panel-text-box` wrapper rather than stopping at it — a wrapped
run keeps the address it had before it was wrapped.

⚠ **`scope` reads `item.get`, not `item.data`.** A mirror carries neither a
`template` nor a `text` of its own — both delegate to its master — so reading
`data` directly here would silently scope every mirror's edits as `undefined`.

## Write: replace the map, never mutate it

```js persist.js
export function record(el, patch){
	const saved = owner.item.get("text") ?? {};
	const now = { ...saved[key], tag: el.tagName, ...patch };
	if (JSON.stringify(now) === JSON.stringify(saved[key])) return key;
	owner.item.set("text", { ...saved, [key]: now });
	return key;
}
```

⚠ **A mutated object always equals itself.** `Item.set` skips a write when
the new value strictly equals the old one — for a plain object that is only
ever true after a *replacement*, so `record()` always builds a new object
rather than patching `saved[key]` in place, or no edit would ever actually
save. `.panel-text-box` wrappers are refused: a box has no address of its
own, only the run inside it does, and `text.js`'s `wrap()` records against
that run.

## Replay: `text_apply()`, called after every `paint()`

```js workspace.js
$body.empty(() => draw($body, item));
text_apply($body, item);
```

Synchronous templates never flash their own unedited copy — the replay runs
in the same tick. A **lazy** template (a section band, `space`,
`properties`) appends its markup a tick later, which is what `text_observe()`
exists for: a `MutationObserver`, bound once per body, wakes on the body's
next `childList` change and calls `text_apply()` again. ⚠ **`childList`
without `subtree`** — only a *top-level* landing counts, so something ticking
inside its own nested div (the clock template) never wakes this observer for
no reason.

A saved key whose element is missing (a run the user typed, not the
template) is **added and stamped**, and stamping is what makes the replay
**idempotent** — without it, a second `text_apply()` call (the observer
firing after a direct call already ran) would find no matching element and
append the same run twice.

## `text_observe()` — the half of `text_layers()` that owns disposal

```js persist.js
export function text_observe($body, item){
	const root = $body.el;
	const seen = new MutationObserver(() => text_apply($body, item));
	owners.set(root, { item, seen });
	seen.observe(root, { childList: true });
	return () => { seen.disconnect(); owners.delete(root); };
}
```

`text.js`'s `text_layers($body, item)` is the whole public entry — it calls
this first, then adds its own hover/click listeners on top, and hands the
returned dispose straight through to `workspace.js`'s `register()`. The
`owners` `WeakMap` (body element → `{ item, seen }`) lives entirely in this
file: it is how `record()` finds its way from a clicked DOM node back to the
`Item` that owns it, and how `text.js`'s `tracked()` check and `fresh()`
call answer without ever seeing the map itself.

⚠ **This is the disposer `workspace.js`'s `draw()` drains before
`$root.empty()`.** Nothing else releases the `MutationObserver` — a
structural redraw discards the `$body` this was bound to, and an observer
that outlives its target does not merely linger, it keeps its internal
record queue alive. Measured before a disposer existed anywhere in this
module (2026-08-16, `display.js`'s equivalent leak): **+953
MutationObservers over 20 redraws**; after, both observer counts are **flat
at +0**, reproduced at 20 and 60 redraws.

## `text_commit()` — flush before the DOM is thrown away

```js workspace.js
function paint(item, $body){
	text_commit($body);        // FIRST
	…
	$body.empty(() => draw($body, item));
	text_apply($body, item);   // LAST
}
```

⚠ **A run still being typed into has nothing saved yet** — `text.js`'s
`edit()` writes its `record()` on `blur`, not on every keystroke.
`text_commit()` blurs every `.panel-text-edit` element before `paint()` can
empty the body out from under it, which both saves the in-progress edit and
ends the session cleanly (blur is `edit()`'s own `done()` trigger).

## `box()` — replace, never nest

```js persist.js
export function box(el, tag){
	const had = el.parentElement?.classList.contains("panel-text-box") ? el.parentElement : null;
	if (had?.tagName === tag.toUpperCase()) return had;
	…
}
```

`data.text` holds **one** box per run, so a second `wrap()` (in `text.js`) on
an already-boxed run has to land on exactly the DOM a replay would build
from that one saved key — `box()` replaces the existing wrapper rather than
nesting a new one inside it, or the DOM and the saved record would diverge
on the very next redraw. `dress()` calls it during replay; `text.js`'s
`wrap()` calls it for a user action — same function, same shape either way.

## `fresh()` — a run the drawing does not have

```js persist.js
export function fresh(root){
	const saved = owner.item.get("text") ?? {};
	const key = scope(owner.item) + "/+" + (Object.keys(saved).filter(k => k.includes("/+")).length + 1);
	const made = { tag: "P", text: "Text" };
	owner.item.set("text", { ...saved, [key]: made });
	return dress(added(root, key, made), made);
}
```

Called by `text.js`'s `type_here()` when `T` is pressed over a panel with no
matching prose. Written down **first** and built by calling the same
`dress()`/`added()` machinery the replay uses — there is no second way to
make one, so what lands on screen immediately is what a reload gives back.

## Improvements

1. **`FIELDS`' four entries (`level`, `weight`, `track`, `align`) are read by
   two files now instead of two functions in one** — `text.js`'s
   `text_fields()` loop draws a row per entry, `dress()` here replays one.
   The table is still the deduplication that matters (a naive version would
   have four near-identical `row()` calls); the remaining overlap is the two
   `for...in FIELDS` loops themselves, which could plausibly be one generic
   "apply this table to this element" helper shared across the file
   boundary. *(simple, speculative)*
2. **`scope()`'s `"draw"` branch has no seed-style disambiguation.** A
   `panel(fn)` leaf's hand-drawn content all shares one scope string, so two
   *different* `panel(fn)` panels on the same page with identical structure
   would — if they ever shared a saved document — collide on the same keys.
   Every real caller today gives `panel(fn)` no saver, so this cannot yet be
   observed. *(medium, speculative — worth a test the day `panel(fn)` gets a
   saver)*
