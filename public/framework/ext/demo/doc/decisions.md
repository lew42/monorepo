# demo — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Show the code, run it, and let the reader push it around — from **one** source.
`demo(fn)` stringifies `fn` *and calls it*, so the code shown and the thing
rendered cannot be two different things.

## Four doors

| | |
|---|---|
| `demo(fn)` | a quoted example inside a page about something else — code pane, render, caption, `<>` HTML pane |
| `page.demo()` | a demo PAGE: the path, the stage, a layout bar wired to it, the source column beside |
| `demo.stage(fn)` | the render on its own: the site's one resizable viewport |
| `demo.app(tree)` | a `Page` tree playing App and Router inside a box |

Everything else is one of those with its config filled in:

- **`demo.exhibit({…})`** — a detail page: `page.demo()` plus a Variants wall (`exhibit.js`)
- **`demo.page(name, fn, config)`** — a function as a demo page (`exhibit.js`)
- **`demo.tree(config)`** — a site tree as one (`exhibit.js`)
- **`demo.layout(config)`** — a whole page as one, with `twin:` and `parts:` (`layout.js`)
- **`demo.source(fn | string)`** — the shell's own code block, on its own (`demo.js`)
- **`sample(root)`** — the shared nine-child fictional site, for anything needing *a* tree

## The files

```
demo.js       demo(), demo.stage(), demo.source(), source_block() — the one code surface
shell.js      page.demo() — the one demo UX; the four sugars are config over it
stage.js      the three boxes, the strip, the handle, the ruler — one viewport
exhibit.js    demo.exhibit() + demo.page() + demo.tree()
layout.js     demo.layout() — a whole page as a demo page
app.js        demo.app() — App and Router for one in-memory tree
pane.js       one device frame, for ext/Panel/Workspace's viewports
sample.js     the shared sample tree
```

## The merge — 14 render variants to 6 (2026-08-30)

The audit, the numbers and the five-step order are in
[ai/2026-08-30/demo-merge/proposal.md](/framework/ai/2026-08-30/demo-merge/).
Step 1 moved 17 clipping `height:` call sites to `min:`. Steps 2–5 landed the
same day:

- **the expando died** — `demo.source()` was a `<details>` every caller reopened
  with `.attr("open","")`. One `source_block()` now serves it, its `.file()` form
  and `page.demo()`'s peer column, with the copy button on all three;
- **`demo.stage.two()`, `two.js`, `two.css` and `twin()` deleted** — a second
  width mechanism beside the stage's own presets, plus a dead export. `twin.js`
  became `pane.js`, which is the one live thing in it;
- **the four sugars became config over `page.demo()`** — four defining files
  changed, 231 call sites untouched. `exhibit.js` lost its private band, source
  block and bar; `exhibit.css` went from 93 lines to 27;
- **`demo.app()` prints its own width readout** — the 45 bare boxes that had none
  were the whole of "sometimes the site shows the width, sometimes not". Hidden
  by CSS inside a stage (duplicate) and inside a preview card (noise at
  `zoom: 0.25`, and it ate 26px off every thumbnail's crop).

What did **not** happen: `demo.source`/`demo.source.file` were not deleted
outright. The proposal costed that at "22 sites"; it is 19 separate FILES
(`core/Page/overview/` ×8, `styles/layouts/` ×2, `/web/` ×9), past the fence this
task was given. The names survive as doors into the one block, which is the whole
of what deleting them would have bought.

## Who uses it

Framework-wide — this is the site's one example mechanism, not a module some
pages opt into. Live counts (excluding this directory and the dead `core/new/`
tree): `demo()` in ~61 files, `demo.stage()` in 35, `demo.exhibit()` in 31,
`demo.tree()` in 28, `demo.page()` and `demo.layout()` in 23 each, `demo.app()`
in 17, `demo.source()` in 3. Every page under [Layouts](/framework/styles/layouts/),
[Sections](/framework/styles/sections/), [Components](/framework/ui/), the
[Page overview](/framework/core/Page/) and [`/web/`](/web/) is built on one of
these doors. Enumerating each caller one line at a time (the usual form of this
section) would be a wall exceeding this module's own doctrine against walls —
the meaningful fact is the count, and that it touches nearly every catalog leaf
on the site. A caller worth naming individually: [Form field](/framework/ui/field/)
is the one place `demo.exhibit({ page })`'s Variants wall gets three levels deep.

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
- **⚠ The API tab's "Replaced at runtime" banner is wrong on all seven members.**
  `demo.stage = (fn) => {…}` and the other six are function expressions assigned to a
  *member* expression, which never gets its name inferred (confirmed:
  `demo.stage.name === ""`) — so `Doc`'s `patched()` check (`fn.name !== name`) reads
  every one of them as a runtime patch, when none of them are. Filed as the audit's
  top recommendation; the fix is in `demo.js` / `exhibit.js` / `app.js` / `layout.js`
  (name each assignment: `demo.stage = function stage(fn){…}`), not in this readme.

## Two soft dependencies, and why they stay soft

`demo/` imports neither `ext/markdown` nor `ext/highlight`, and works better with
each: `view.md ? … : …`, `code[lang] ? … : …`, `code.file ? … : fetch(…)`. Each ext
patches its target at import time, so **the feature test is the dependency check**.
An ext may lean on an ext; only core may never.

`ext/layout` is the exception and is hard-imported by `exhibit.js`: it is the site's
one control surface, and a bar every page has to remember is a bar half the detail
pages would not have.

## Landed — the 17 clips (2026-08-30, demo-merge step 1)

`demo.tree()`'s `height:` config key silently clipped: `app.css`'s
`.demo-app-pages { overflow: auto }` turned any render taller than the box into a
scrollable-but-invisible cut, and 16 call sites plus one raw `demo.app(…).style({
height })` (17 total) hit it — worst case `core/Page/overview/landing`, 74% of its
content hidden. Fixed the way `shell.js`'s prototype already proved: `height:` is
gone, `min:` is a **floor** (`min-height`, never a ceiling), and `.demo-app-pages`
is `overflow: visible` — with no call site left setting a real height, the flex
column auto-sizes to its content, so the old `overflow: auto` was already inert
(verified, not just reasoned: reverting the three files round-trip reproduced the
proposal's own 1174/1587px-hidden number exactly; the fix took it to 0 at all 17
sites, 1920px, headless). `demo.layout()` was untouched — no call site there ever
used its `height:`. Three more identical raw `demo.app(…).style({ height })` sites
turned up at `imagine/vary/colstyles/{cards,finder,ink}/` — not in the audited 17,
left as a follow-up.

## Open

- **`demo.tree()` and `demo.layout()` are both config-only page factories over
  `demo.exhibit()`, `demo.page()` is a name-first triple.** Worth deciding whether
  that's a real inconsistency or two legitimately different shapes — the audit
  takes a position.
- **A tall bare stage letterboxes on a wide monitor** (`demo.tree()` with an
  explicit `min:` — was `height:`, `doc/record.md` §19.6) — unfixed, the cap
  belongs on the tree, which is the thing that knows it wanted a window.
- **The definition column doesn't stick** beside a tall render on a wide screen —
  `position: sticky` is three lines and no asker yet (§19.6).
- **A div is still not a viewport** (see Traps) — the iframe that would fix it is
  costed but deliberately not built (§6).

Full list, with every reversal and measurement: `doc/record.md`'s own Open
subsections (§16, §18, §19.6, §21).

## The long form

[`doc/record.md`](record.md) — twenty sections of question → options → weighing →
verdict: the HTML pane, the toolbar, the width presets and the reversal that moved
them into the stage's own strip (§17 → §20), the two-up's 800ms → 2ms drag, the
exhibit band's measurements at 390/810/1440/3440, and every open question.
