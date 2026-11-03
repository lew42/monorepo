# demo architecture — one source, one demo UX, every other door is config

`demo/` shows a piece of code and runs it from the same source, so the example can never drift from the code. Its one UI is `page.demo()` in [shell.js](./../shell.js); the other doors are configuration over it. Entry: [`demo.js`](./../demo.js) (`demo()`, `demo.stage()`, `demo.source()`), with the main pieces in [`shell.js`](./../shell.js), [`stage.js`](./../stage.js) and [`app.js`](./../app.js).

## The code shown is the code that ran
**Decided:** `demo(fn)` reads `fn.toString()`, drops the wrapper, dedents it, then calls `fn` with the result box as its captor.
**Why:** a second copy of an example, pasted into a string, goes stale the first time someone edits the function.
**Instead:** a hand-written code string beside the render. Cheaper to write, drifts silently.
**Detail:** [doc/decisions.md](./decisions.md#four-doors)

## One demo UX, four doors over it
**Decided:** `page.demo()` ([shell.js](./../shell.js)) is the only thing that draws a demo band. `demo.exhibit()`, `demo.page()`, `demo.tree()` and `demo.layout()` are config over it, not separate renderers.
**Why:** the merge went from 14 render variants to 6; the four shapes are now calls with different config and 231 callers untouched.
**Instead:** each shape keeps its own band. That was the 14 variants, and their widths and clipping drifted apart.
**Detail:** [doc/decisions.md](./decisions.md#the-merge--14-render-variants-to-6-2026-08-30)

## The render has a floor, never a height
**Decided:** a render takes `min:` (a `min-height`), never `height:`. [shell.js](./../shell.js) and [app.js](./../app.js) have no height path.
**Why:** a fixed height clipped 17 demos, the worst hiding 74% of its content.
**Instead:** an explicit `height` that clips whatever is taller. Measured, not kept.
**Detail:** [doc/decisions.md](./decisions.md#the-17-clips)

## The three boxes stay three
**Decided:** `.demo-stage` › `.demo-screen` › `.demo-render` remain separate elements.
**Why:** `overflow` on the stage clips the drag handle that hangs over its edge; `overflow-x` on the render turns `overflow-y` off for every demo.
**Instead:** one box. Measured: the drag stopped working.
**Detail:** [doc/decisions.md](./decisions.md#three-things-that-will-bite-you)

## The viewport is simulated, not an iframe
**Decided:** [stage.js](./../stage.js) resizes a `div` with a handle and reports a simulated width, and everything intrinsic responds to it.
**Why:** a `div` in a `div` needs no reload, and the handle, ruler and width readout all run inline.
**Instead:** an iframe, which would make `@media` honest. Costed, not built.
**Detail:** [doc/record.md](./record.md) §6

## No import cycle: `stage.js` never imports `demo.js`
**Decided:** [stage.js](./../stage.js) imports only `View`. [demo.js](./../demo.js) imports `stage.js`, so the reverse would be a cycle.
**Why:** a parent ↔ child import cycle breaks only on a deep reload.
**Instead:** the `.demo-btn` class lives in `demo.css`, which `stage.js` emits without importing.
**Detail:** [doc/decisions.md](./decisions.md#three-things-that-will-bite-you)

## Highlight and markdown are optional, found by feature test
**Decided:** `demo/` imports neither `ext/markdown` nor `ext/highlight`. [demo.js](./../demo.js) checks for them at runtime and falls back to a plain code block (`// Soft dependency` at line 126).
**Why:** each ext patches its target when it loads, so a feature test is the honest dependency check.
**Instead:** a hard import, which would load two exts for every page that shows one example.
**Detail:** [doc/decisions.md](./decisions.md#two-soft-dependencies-and-why-they-stay-soft)

## `demo.app()` plays an in-memory tree, with no real links
**Decided:** `demo.app()` ([app.js](./../app.js)) defaults to `urls: false`, so an in-memory tree emits `data-demo-url`, not an `href` that would 404.
**Why:** a 404 on middle-click and in crawlers came from links to addresses that exist only in the demo.
**Instead:** real `href`s. Pass `urls: true` only when `scope:` is a real page.
**Detail:** [doc/decisions.md](./decisions.md#three-things-that-will-bite-you)

## ⚠ Known open: the API banner names the wrong members
**Decided:** `demo.stage`, `demo.source` and `demo.app` are arrow functions assigned to a member expression ([demo.js](./../demo.js) line 67, 95; [app.js](./../app.js) line 33), so they get no `name`.
**Why:** the `Doc` "Replaced at runtime" check reads an unnamed function as a patch. None of them are patched. This is still open.
**Instead:** name each assignment (`demo.stage = function stage(fn){…}`). Not yet applied.
**Detail:** [doc/decisions.md](./decisions.md#three-things-that-will-bite-you)

## Open
- A tall bare stage letterboxes on a wide monitor; the cap belongs on the tree. [doc/decisions.md](./decisions.md#open)
