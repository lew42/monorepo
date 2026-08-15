# demo

Show the code, run it, and let the reader push it around — from **one** source.
`demo(fn)` stringifies `fn` *and calls it*, so the code shown and the thing
rendered cannot be two different things.

## Four doors

| | |
|---|---|
| `demo(fn)` | a quoted example inside a page about something else — code pane, render, caption, `<>` HTML pane |
| `demo.stage(fn)` | the render on its own: the site's one resizable viewport. `.two(fn)` is its two-up mode |
| `demo.exhibit({…})` | a detail PAGE: the stage, a layout bar wired to it, the definition open below |
| `demo.app(tree)` | a `Page` tree playing App and Router inside a box |

Everything else is one of those with its config filled in:

- **`demo.page(name, fn, config)`** — a function as a demo page (`exhibit.js`)
- **`demo.tree(config)`** — a site tree as one (`exhibit.js`)
- **`demo.layout(config)`** — a whole page as one, with `twin:` and `parts:` (`layout.js`)
- **`demo.source(fn | string)`** — the code, closed, below a render (`demo.js`)
- **`sample(root)`** — the shared nine-child fictional site, for anything needing *a* tree

## The files

```
demo.js       demo(), demo.stage(), demo.stage.two(), demo.source()
stage.js      the three boxes, the strip, the handle, the ruler — one viewport
two.js        the two-up: one builder, two simulated widths, one handle
exhibit.js    demo.exhibit() + demo.page() + demo.tree()
layout.js     demo.layout() — a whole page as a demo page
app.js        demo.app() — App and Router for one in-memory tree
twin.js       the two-pane card: a 390 phone beside a 3440 monitor
sample.js     the shared sample tree
```

## Three things that will bite you

- **A div is not a viewport.** Everything intrinsic responds to the handle and to a
  simulated width — `auto-fit`, `%`, `flex-wrap`, container queries. A
  `@media (max-width: 45em)` inside an example does **not**: it asks the browser
  viewport, which did not move. Drag a demo to 390px and it still shows its desktop
  branch. The fix, when it is wanted, is an iframe; the cost is in `doc/record.md` §6.
- **The three boxes cannot be merged.** `.demo-stage` › `.demo-screen` › `.demo-render`.
  `overflow` on the stage clips the handle that hangs over its edge (measured: the
  drag stopped working); `overflow-x` on the render forces `overflow-y` off `visible`
  for every demo on the site.
- **`stage.js` emits `.demo-btn`, which `demo.css` owns.** It cannot import `demo.js` —
  `demo.js` imports it, so the pair would be a cycle, and a cycle breaks only on deep
  reloads. The class arrives with whoever built the stage.

## Two soft dependencies, and why they stay soft

`demo/` imports neither `ext/markdown` nor `ext/highlight`, and works better with
each: `view.md ? … : …`, `code[lang] ? … : …`, `code.file ? … : fetch(…)`. Each ext
patches its target at import time, so **the feature test is the dependency check**.
An ext may lean on an ext; only core may never.

`ext/layout` is the exception and is hard-imported by `exhibit.js`: it is the site's
one control surface, and a bar every page has to remember is a bar half the detail
pages would not have.

## The long form

[`doc/record.md`](doc/record.md) — twenty sections of question → options → weighing →
verdict: the HTML pane, the toolbar, the width presets and the reversal that moved
them into the stage's own strip (§17 → §20), the two-up's 800ms → 2ms drag, the
exhibit band's measurements at 390/810/1440/3440, and every open question.
