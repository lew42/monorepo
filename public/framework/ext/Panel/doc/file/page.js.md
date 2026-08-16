## page.js

The module's own reader's-introduction, and the one file in this directory
that is not code any other module imports. Built on `Doc` — see
`/framework/ext/doc/` for what the six sections it derives are.

## The `/full/` route is a second door, not a second document

```js
route(name){
	return name === "full" && full(this, () => workspace().style("--panel-height", "100%"));
}
```

`route()` is `Page`'s undeclared-child hook — checked only after memory and
the filesystem probe find nothing named `full`. Calling `workspace()` again
here opens a **second live mount of the same `/data/panels.json` document**;
it is not a separate variant page. See the open item on multiple mounts in
[Decisions](/framework/ext/Panel/docs/decisions/).

## The live workspace is not wrapped in `demo()`

Unlike the throwaway `panel(fn)` examples further down, the persisted
`workspace()` embed is a real, reload-surviving document — the same
convention `ext/editor/page.js` uses for its own shell. Wrapping a real
document in `ext/demo`'s stage chrome (code pane, device-width presets) would
mislabel it as a disposable sample; it stays a plain `.bleed` box, matching
`ext/editor`.

## The inspector demo is a `Panel` tree, so it needs no saver

```js page.js
const row = new Panel({ data: { dir: "row" } }).add(
	new Panel({ data: { template: "wall" } }),
	new Panel({ data: { template: "properties", mode: "hug" } }));
```

The same door as the hug demo below it — `panel(tree)` mounts a detached tree
through `mount()`, which never cared how many panels it was given. Focus is
instance state on whatever root it is handed, so a workspace with no saver
inspects perfectly well and writes nothing: the demo is live and disposable at
once. It is deliberately *two* panels, one of each kind, because the point being
shown is a control surface that is not attached to the thing it controls.

## The hug demo is the fix's own proof

```js page.js
new Panel({ data: { template: "rail", mode: "hug" } }),
new Panel({ data: { template: "hero" } })
```

A rail that hugs beside a page that fills **is a sidebar** — which is the whole
argument for the mode, made in two lines and one picture rather than a
paragraph. It is deliberately a *row*, because that is the axis where hugging a
`cq` scene used to measure 0px and take the panel with it (`panel.css`, the
hug/fill trap): the rail now stands at a measured 248.3px with the hero at
599.4px beside it. It is also the page's only demo built from a `Panel` tree by
hand — `panel(seed)` takes one, the same door `panel(structure(42))` uses
further down.

## The two generator demos are the same seed, twice

```js page.js
panel("space");            // …the layout as a PICTURE, with the dial
panel(structure(42));      // …a layout as real panels, nine of them
```

They sit in that order because it is the path the UI wants you to take: dial to a
layout you like, then hit the bar's dashboard icon to make it real. `structure(42)`
is hard-coded rather than rolled so the page reads the same on every load — the
seed with a topbar, a rail, a hero, a changelog, a toc *and* a footer, which is
every furniture template and four bands in one shot. A rolled demo would
sometimes be a two-panel stack and would make the caption a lie.

## Improvements

1. **The `/full/` link in the opening paragraph is prose, not a `code.js`
   label or a `demo(…, { full: true })` wired button** — the mechanism
   `ext/demo` already has for exactly this ("a LINK, and only when the page
   claims `<url>full/` via `route()`") is available to the two illustrative
   `panel(fn)` demos on this page but isn't used to surface the module's own
   `/full/` route. *(simple, speculative — the current plain link works)*
2. **This audit's rewrite added the two-way link** — the Overview now names
   `ext/editor` as built from the same `Panel` class and the same
   `workspace()` call, beside the `divide()`/`close()` code block, so the
   relationship reads from both sides. Kept here as a note for the next
   editor pass: if `editor/page.js` is rewritten again, check this sentence
   still names it accurately. *(simple, useful — done)*
