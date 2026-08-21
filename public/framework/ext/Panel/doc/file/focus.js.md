## focus.js

The selection: which panel you last pointed at, which panel a click would take
next, and every way both get given up. Focus is **not document state** — it rides
the root panel as an id, exactly the way the vocabulary does, and never reaches
`toJSON`.

```js focus.js
export const focused = item => { const root = item.root(); return root.find(root.focus); };
```

## The invariant (2026-08-19): one selection per PAGE

Exactly one panel on the page is selected, or none; every live view of it wears
the ring and nothing else does. This file is its only writer:

```js focus.js
function rings(root, target){
	document.querySelectorAll(".panel.focus").forEach(el => el.classList.remove("focus"));
	if (target) pair(root).els.get(target)?.forEach(el => el.classList.add("focus"));
}
```

⚠ The **document**, not one workspace — a page draws many, and one root draws
many boxes. ⚠ **Every** live view, because `paint.js`'s `views` holds one entry
per item (the last box drawn) and landing through it painted hidden viewports.
`pair(root)` walks the tree and each box together and hands back item → elements
and element → item; `view()` drew them from the same walk, so no ids are needed.

## `inspects()` — the entry that reads the selection is never handed it

A template declaring `focus: true` (the `properties` inspector) is the one thing
that reads `focused()`, so `view()`'s click test refuses to focus it — an
inspector clicked into would start inspecting itself. The hover honours it too:
nothing is marked on a panel a click cannot select.

## `drill()` — one function, two readers

`drill(item)` answers *what does a click here take*: the outermost unopened
group on the path, then one group further in, then the leaf. The **click** calls
it and the **hover** calls it, so `.panel-hover` and the next selection can never
disagree. `step_out()` is the same walk read backwards, which is Escape.

## Two document events, and an import in neither direction

`panel-focus` says the selection moved, carrying the panel or `null`;
`panel-unfocus` is anyone asking for it back. Both are dispatched on the
**document**, because an `Item` event only reaches something holding the root and
nothing outside a workspace ever does — which is how `tools.js`'s rail and
`ext/DesignTool` follow the selection with no import either way. It is also how
roots release each other with no registry: each one lets go on a `panel-focus`
whose `detail.root()` is not itself. The full model:
[Focus, and the panel that reads it](/framework/ext/Panel/doc/focus/).

## `selection(root, $root)` — per box, then per root

Called once per box by `mount()`. The **hover** listeners are per box (the
pointer is in one of them); everything else is per root:

```js focus.js
if (wired.has(root)) return;
listen("keydown", e => { if (e.key === "Escape") back_out(root); });
listen("panel-unfocus", () => back_out(root));
listen("panel-focus", e => { if (e.detail?.root() !== root) drop(root, false); });
listen("click", e => { if (!e.target.closest?.(OFF)) drop(root); }, true);
```

⚠ Seven boxes once bound seven Escape handlers: the first stepped out of the
group, the next read the new state and stepped out again, and the ones that ran
after `root.focus` was gone returned early with their own rings still on screen.

⚠ The click-off listener is in the **capture** phase — a control that redraws its
own bar has detached the clicked button before a bubbling listener runs, and
`closest()` on a detached node reads as a click outside.

⚠ `root.on("remove", …)` clears focus in a **microtask**, because `move()` is a
remove followed by an insert — a drag of the focused panel would otherwise
unfocus it mid-flight.

## What this file styles

`focus.css` — `.panel-hover` only. The `.panel.focus` ring is still `panel.css`'s
and belongs here beside it.
