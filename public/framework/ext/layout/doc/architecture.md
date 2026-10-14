# Layout architecture — one toolbar steers anything, and the drawer pushes

Layout is a toolbar and a right-hand drawer for demo and guide pages that let the reader arrange things. Entry: [`layout.js`](../layout.js) (`box`, `bar`, `selectable`), with [`panel.js`](../panel.js) for the selection and [`words.js`](../words.js) for the vocabulary. Its pattern is a registry: `layout.words` maps a word to a control builder.

## One bar, words as a registry

**Decided:** `layout.bar($target, words)` serves a `View`, a bare `Element` and a live `Page`; a control is `layout.words.name = $el => control`, listed as a string.
**Why:** the old code had two near-duplicate bars, and adding a knob meant editing both.
**Instead:** a parameter list per target, or a fixed switch of controls every caller edits.
**Detail:** [`doc/vocabulary.md`](./vocabulary.md)

## The bar fills itself in a microtask

**Decided:** `layout.bar()` returns an empty strip and fills it on the next microtask (`layout.js`, `queueMicrotask`).
**Why:** `page.view` is assigned only after `content()` returns, and reading `page.render()` inside `content()` re-enters `render()` and recurses.
**Instead:** fill synchronously (recursion), or make callers wait (an `await` they must remember).
**Detail:** [`doc/decisions.md`](./decisions.md)

## The drawer pushes, it never covers

**Decided:** the selection's controls open in one right-hand rail per document, and the rail pushes the page over.
**Why:** a properties panel that covers the element being edited is the one thing it must never do.
**Instead:** a floating panel over the page, which covers the edit.
**Detail:** [`doc/drawer.md`](./drawer.md)

⚠ **Code check:** this module no longer draws the rail. `panel.js` imports [`ext/drawer`](/framework/ext/drawer/), which owns the push (`--rail-push` in `ext/drawer/drawer.css`). `doc/drawer.md` still says `panel.js` writes `--drawer`: stale.

## Selecting fills an open drawer, it never opens one

**Decided:** `select()` refills the drawer only when it is already open; `open()` is the one explicit way in, wired to the bar's sliders chip.
**Why:** "too jumpy": the drawer popped open on every click.
**Instead:** auto-open on select (the original; rejected by the owner). A page with a selectable region and no bar therefore has no way in, on purpose.
**Detail:** [`doc/decisions.md`](./decisions.md)

## Deselect on an outside click, in the capture phase

**Decided:** a document click listener runs with `capture: true`, and `popstate` and Escape deselect.
**Why:** a rail click can redraw the rail and detach its own target; `closest()` on that target then reads as an outside click.
**Instead:** a bubble-phase listener, which fails on that redraw.
**Detail:** [`doc/selection.md`](./selection.md)

## What is selectable

**Decided:** a region, its direct items, and the items of a nested `flex`/`grid`, never deeper. A selected page gets page words (`shape fill flow measure`), never container words.
**Why:** `.page.standard` is already a grid, and a page must never become a hoverable region itself; the sliders chip is the only way to select a page.
**Instead:** a DOM inspector, which shows too much.
**Detail:** [`doc/selection.md`](./selection.md)

## The `fill` word pairs `overflow: auto`, and the bar rests dimmed

**Decided:** `fill` sets `overflow: auto` inline beside `.page.fill`, and `.layout-bar` rests at `opacity: 0.4`, fully opaque on hover, focus or touch.
**Why:** `overflow: hidden` clipped a long page's bar; a bar hidden until hover hid the "click a word on it" pitch.
**Instead:** change `Page.css` to `auto`, or `opacity: 0` at rest (both rejected).
**Detail:** [`doc/decisions.md`](./decisions.md)

## Controls are shared primitives

**Decided:** `pick`, `menu`, `toggle`, `chips`, `knob` and `btn` in [`controls.js`](../controls.js) are the widgets; callers may import them directly, without a bar.
**Why:** the properties region in [`ext/editor`](/framework/ext/editor/) and the popover in [`ext/Panel`](/framework/ext/Panel/) need the same controls.
**Instead:** a copy in each module (two versions to keep in step).
**Detail:** [`doc/controls.md`](./controls.md)

## A control's value is set after its options exist

**Decided:** `menu()` sets the selected option after its list is built, and `knob()` reads its value at build and writes only on input.
**Why:** an option marked selected mid-build is silently the wrong one; a knob that stamped its default narrowed every page's `--measure` at load.
**Instead:** write on build (the bugs above).
**Detail:** [`doc/controls.md`](./controls.md)

## Open

- A bar steers one container; a nested box's own words are reachable from the panel, not the bar. [`doc/decisions.md`](./decisions.md)
- `--page-pad` has no knob: it is a shorthand, so a slider cannot drive it. [`doc/decisions.md`](./decisions.md)
