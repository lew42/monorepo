## generate.js

The one seam between the layout space and `ext/Panel`, in both directions.
`generate(panel)` is the `space` template's payload — a leaf as a window on the
space, `gen(seed)` writing a page as spec text, `render(text)` turning it live,
a three-control dial stepping the seed. `structure(seed)` is the translator:
the same spec walked into a real `Panel` tree. `sow(item, seed)` is the bar's
verb for it. `templates.js` holds only the lazy import; everything else is these
hundred lines. Full record:
[The layout generator](/framework/ext/Panel/doc/generator/).

## The seed is the whole state

`gen(seed)` is an **address** — the same integer is the same layout forever, in
any browser — so there is nothing to serialize but the integer:

```js generate.js
seed = Math.max(0, at);
panel?.set?.("seed", seed);
```

`Panel` already persists arbitrary keys, so `set` writes `data.seed`, emits
`change`, and the root saves. The optional chaining is not defensive noise: a
call site can hand `generate()` no panel at all, and then the seed rolls fresh
on every mount and nothing is written. `Math.max(0, at)` parks the left arrow at
zero rather than walking into negative addresses.

## ⚠ The screen is refilled inside a callback

```js generate.js
$screen.empty(() => { render(gen(seed)); });
```

`render()` builds with bare factories, so anywhere but a callback it appends to
whatever the captor has since become. `empty(fn)` re-establishes `$screen` as
the captor before calling it — this is the same shape `templates.js` uses for
its lazy imports, and the reason neither file has an `await` in it.

## ⚠ `render()`'s root is a `.page`, kept visible by one class

`spec.js` gives it `page default`, and `Page.css`'s util-layer rule hides every
`.page` that is neither active, an active ancestor, nor `.default`. A
generated page inside a panel is in **no** router chain, so `default` is the
only thing standing between it and `display: none` — and if either side ever
drops it, the screen goes blank with nothing logged. Neither file is the obvious
place to look.

## …and `structure()` keeps nothing at all

```js generate.js
export function structure(seed){
	return node(parse(gen(seed))[0] ?? { line: "", kids: [] });
}
```

Pure, because `gen` and `parse` are: the same integer is the same tree forever,
which is what makes the translation testable without a browser in the loop. It
returns a **detached `Panel`**, not a plain object — `Item`'s constructor already
takes `{ data, items }`, so a tree of `new Panel(…)` *is* the wire shape, and
`panel(structure(42))` mounts one with no second interpreter in between.

The opposite bargain to the picture: `sow()` writes no seed, because the moment a
layout is panels the **tree** is the address, and a dragged band would make a
stored seed a lie.

⚠ **A single child is not a split.** The spec nests one box per declaration, so a
rails layout with neither menu nor toc is a row inside a row inside a row.
`node()` collapses any node whose translation yields one child into that child,
keeping the outer's `grow` — `Panel.absorb()`'s rule, applied at build time so the
degenerate split is never constructed. Left in, `close()` would absorb it on
sight and the reader would wonder where their panel went.

⚠ **Every name in `PANELS` must exist in the `T` vocabulary.** `paint()` falls
back to a no-op draw for a name it doesn't recognise — a blank body, nothing
logged. This is why `rail`, `toc` and `brand` landed in `templates.js` in the same
breath as the map that emits them.

⚠ **A one-leaf seed has to announce itself.** `sow()`'s remove/move pair is what
the workspace hears; a seed whose whole translation is a single leaf moves
nothing, so `item.data = {…}` — a plain assignment, not `set()` — changed the
panel with no event behind it, and the bar's dashboard button was a dead click:
no repaint, no save. Measured at **43 of 5000 seeds** (170, 248, 295, 415 first).
One line closes it, and the call site in `workspace.js` repaints:

```js generate.js
if (!made.items.length) item.emit("change");
```

## `share()` — one currency for two kinds of claim

```js generate.js
if (basis) return +(parseFloat(basis.slice(8)) / 8).toFixed(2);
return words.some(word => word === "flex-1" || word === "fluid") ? 8 : 1;
```

A spec sizes a track two ways (`flex-1`, `--basis:15em`) and `Panel` has one
(`grow`), so both convert: **one share is 8em**, a fluid track claims eight, and a
track claiming nothing takes one. That last constant is the load-bearing one — it
is what makes a topbar a band rather than a hairline (1:8:1 gives a 40em panel a
4em bar). Measured against the real page in
[The layout generator](/framework/ext/Panel/doc/generator/).

## The dial is bottom-right, and that is forced

`.panel-bar` is a full-width strip floating over the *top* of every panel and it
hit-tests the moment the panel is hovered, so controls of the template's own
belong at the other end. Its look — `.panel-t-space`, `.panel-t-screen`,
`.panel-t-dial`, `.panel-t-seed` — lives in `templates.css` with the rest of the
`T` vocabulary, including the two measured sizing rules the screen depends on.

## Improvements

1. **A seed can be stepped and rolled but never typed.** The whole point of an
   address is going back to one; today that means clicking the arrow a few
   hundred times or editing the saved JSON. A number input in the dial is a
   handful of lines. *(simple, important)*
2. **Picking `space` to look at it commits a seed immediately** — the first
   `show()` writes through `panel.set`, so browsing the `T` menu and choosing
   are indistinguishable to the document. The same bargain `scatter()` makes,
   for the same reason, but worth knowing before adding a second generator.
   *(medium, speculative)*
3. **`space` ignores `panel.get("tone")`**, like the scene templates, because a
   generated page paints its own surfaces — so the bar still offers tone chips
   that do nothing here. Either the entry declares `tone: true` and honours it,
   or the bar learns to hide the control. *(medium, useful)*
4. **`sow()`'s seed can only be rolled or inherited, never chosen** — the dice
   takes no argument from the UI, so reaching a specific address as *panels*
   means putting `space` in a leaf, dialling to it, then dicing. Fine as the
   intended path; a seed field in the dial (improvement 1) would close both.
   *(simple, speculative)*
5. **The file carries two jobs** — the picture and the translation —
   held together by sharing `gen`, `roll` and the idea that a seed is an address.
   The seam if it ever splits is `structure`/`node`/`share`/`sow` moving out
   whole; nothing above them would change. *(medium, speculative)*
