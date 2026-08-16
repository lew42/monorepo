## random.js

What `random` **means**. It is the one name in the `T` menu that is a verb rather
than a template, and this is the whole of it: `scatter()` rolls an arrangement
into a panel, `resolve()` sweeps a document for leaves that still say `"random"`.
Thirty lines, extracted from `workspace.js` on 2026-08-15 — the one idea in that
file that was not assembly.

## It draws from a vocabulary it is handed

```js random.js
export function scatter(item, entries, depth = 0)
export const resolve = (root, entries) => …
```

The template vocabulary rides the **root panel** (`vocab(item)` in
`workspace.js`, so `ext/editor`'s five regions never leak into another page's
menu), and reading it from here would mean importing `workspace.js` — which
imports this file. ⚠ **A mutual import breaks only on deep reloads**, so the
vocabulary is an argument instead: three call sites in `workspace.js` pass
`vocab(item)`, and this file imports nothing but `Panel` and `TONES`.

`entries`, not a list of names, because that is the shape everything else in the
module already passes around (`T.entries`, `properties.js`'s `entries`).

## A roll is a commit, and it is bounded

```js random.js
if (depth < 2 && Math.random() < 0.6 - depth * 0.25){
	item.set("dir", any(["row", "col"]));
	for (let n = 2 + Math.floor(Math.random() * 2); n--; ) item.add(new Panel());
```

Two levels deep, two or three ways wide, 60% odds of splitting at the top and 35%
one level down — so a roll is a *layout*, never a fractal. Everything it decides
goes through `set()`/`add()`, which is what makes it a commit: the panel's own
`change`/`add` events save the document, and a reload comes back to the same
arrangement rather than a fresh one. Twelve rolls measured: 8 splits, 4 leaves,
every template name in the vocabulary.

⚠ **`scatter()` clears the panel first** (`[...item.items].forEach(kid =>
item.remove(kid))`) — a `random` picked on a panel that is already a split
replaces the split, it does not nest inside it.

## `resolve()` is for the document you wrote by hand

`Panel.defaults` says `template: "blank"`, deliberately — a `divide()` that
handed its new sibling `"random"` would roll three columns on every split. So
`"random"` only ever reaches `data` when somebody *asks* for it, and a
hand-authored `panels.json` can hold it. `resolve()` rolls those leaves in a
guarded pre-pass, before any DOM is built, which is why `draw()` calls it with a
`drawing` flag around it: the `add`s it fires must not re-enter the draw.

`!item.draw` skips a leaf whose content the call site supplied — `panel(fn)`
draws that function, and a document never named a template for it.

## Improvements

1. **The odds are three literals in one condition** (`0.6`, `0.25`, `2 +
   random() * 2`). They read well enough at three lines, but nothing on the page
   says why 60% is the right chance of a split — a sentence with the shape it
   produces (a roll is a layout, not a fractal) is above; the numbers themselves
   have never been tuned against anything. *(simple, speculative)*
2. **`resolve()` walks the whole tree on every structural redraw.** It is cheap
   at panel counts a person can see (31 on `/full/`), and the guard makes it
   safe, but it is O(tree) work for a condition that is almost always false —
   only a hand-authored document has a `"random"` left in it. *(simple,
   speculative)*
