## repeat.js

The *other* `+` — one appended to the end of a **repeating run** a template
drew (a grid of cards, a nav rail, a list of quotes), which clones the last
item. Own file because the detection (what counts as a run) and the cloning
are a different concern from anything else here, and `persist.js`'s `text`
shape — one key addressing one dressable element — does not fit a whole
cloned subtree.

```js repeat.js
const MIN_RUN = 3;
const ADD_CLASS = "panel-repeat-add";
```

## A run needs THREE things: same tag, same full class set, and a class at all

```js repeat.js
const signature = el => el.classList.length && el.tagName + "." + [...el.classList].sort().join(".");
```

The class-length guard is the whole finding: without it, three plain `<p>`
tags in a row — ordinary prose, no template intent behind it — would read as
a repeating run too. Requiring a class signature ties "repeating" to
something a template actually *marked*, and it measured 17 tiles across the
demo page with zero false positives.

## The longest run wins, depth-first

```js repeat.js
function find_run(root){
	let found = runs_in(root);
	root.querySelectorAll("*").forEach(el => { found = runs_in(el, found); });
	return found;
}
```

`querySelectorAll("*")` walks every descendant, so a grid three `div`s down
is found over the loose wrapper around it — `runs_in` only ever replaces
`found` with a *longer* run, never a shallower one at the same length.

## Normal flow, not an overlay — it costs the z-index budget nothing

Unlike `insert.js`'s stub, this tile is a real sibling appended into the
run's own container, sized and positioned by whatever layout (grid or flex)
already governs the run. No `position: absolute`, no pointer tracking, no
entry in [doc/overlays.md](../overlays.md)'s budget — appending has exactly
one valid target, so there is nothing to track the cursor for.

## Persistence rides `text`, under its own key

```js repeat.js
const key = scope(item) + "/" + REPEAT_KEY;
```

Appended clones are saved as HTML strings under `panel.data.text`, the same
map `persist.js` already keys by drawing — a mirror sharing `text` with its
master shows the same appended items. `persist.js` itself skips this one key
on replay (`REPEAT_KEY`), so the two files divide the map without either
reading the other's writes.

## `repeat_apply()` — the same synchronous hook `text_apply()` gets

```js repeat.js
const owners = new WeakMap();
```

`apply()` still runs from a `MutationObserver` for a lazy template — the
same lazy-landing shape `persist.js`'s `text_observe` uses — but a template
that draws its DOM synchronously inside `paint()` used to already have
painted before the observer's first callback fired, leaving a saved clone
briefly absent. `owners` (root → `{ item, seen }`) is what lets a second
entry point, `repeat_apply()`, reach the very observer `repeat_layers()`
already set up, so `paint()` can call it right after `text_apply()` — same
disconnect-apply-observe guard `run()` uses, reused rather than duplicated.
A lazy template is unaffected: `repeat_apply()` finds nothing in a body
that hasn't landed its content yet, and the observer takes over once it
does, exactly as before.

## Improvements

1. **`find_run` re-walks the whole subtree on every mutation**, including
   ones this file's own `apply()` just caused (guarded by disconnect/observe
   around the insert, so it doesn't loop — but a large template with many
   candidate runs would be the case to profile). *(simple, speculative)*
