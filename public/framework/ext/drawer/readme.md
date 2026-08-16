# ext/drawer

The right rail — one per document, opened by anything, shut only by its own ✕.

```js
import { drawer } from "/app.js";

drawer(($slot, $body) => {
    $slot.empty(() => { span("What this is about"); });
    $body.empty(() => { /* the controls */ });
});

drawer.refresh();     // the same content again, for a subject that changed
drawer.close();       // what the ✕ calls
drawer.showing();     // is it open
```

`fn($slot, $body)` fills two slots. `$slot` is the caller's half of the **pinned**
head; `$body` **scrolls**. The ✕ sits beside `$slot` and is never handed over,
so nothing a caller draws can leave the reader with no way out.

## It pushes, it does not cover

`--drawer` is the inline-end strip `.app` yields (`framework.css`), written by
`drawer.js` onto the same element the rail inherits its width from — so the
reserved strip and the rail are one number and can never disagree. A properties
panel that covers what you are editing is the one thing this widget must never
do.

## Decisions

- **It left `ext/layout` (2026-08-16, Mike).** The rail was `ext/layout/panel.js`'s
  private half, reachable only through that module's own selection — so
  `ext/Panel`, which wants somewhere to put the words that will not fit a hover
  overlay, had no way in that did not drag the selection machinery with it. Split
  along the seam that was already there: **the rail is generic, what it shows is
  not.** `ext/layout` kept the selection, the word registry and the look of its
  own content (`.layout-*`); the shell, the push, the pinned head and the ✕ came
  here.
- **Deselecting no longer closes it (Mike, 2026-08-16).** It used to, and a click
  anywhere on the page then threw away the reader's scroll position along with
  whatever they were reading. Losing a *selection* is not a reason to lose the
  *rail* — a caller redraws it saying nothing is selected. The ✕ is the only
  thing that shuts it, which is also why `deselect()` no longer reopens a rail
  that was already closed.
- **`fn($slot, $body)`, not a config object.** The head/body split is real logic
  — a rail whose ✕ scrolls away is a rail you cannot shut — so it belongs here
  rather than being retyped by every caller. Handing back the two views keeps
  `empty(fn)`, the blessed re-capture form, at the call site.

## What will bite you

- **⚠ The rail mounts inside `.app`, never on `<body>`.** `color-scheme` is forced
  on `.app` (`App/mode.js`), so a rail on the body renders light while the page
  around it is dark — and `--drawer` is read on `.app` alone, so the push is lost
  too.
- **⚠ `rem`, not `em`.** The shell's padding resolves against `.app`'s font-size
  and the rail's width against its own `0.85em`; an `em` value reserves the wrong
  strip.
- **⚠ `z-index: 40`** sits between `.demo.max` (30) and the mode button (60): the
  rail must reach over a full-screen demo without burying the scheme toggle.
- **⚠ It docks beside the dev rail, not under it.** Both claim this edge;
  `inset-inline-end: var(--devbar, 0px)`, and `framework.css` already reserves
  the sum of the two.
- **⚠ A caller wiring a listener to the returned rail must do it once.** `on()`
  adds a listener per call and `drawer()` is called on every redraw —
  `ext/layout/panel.js` guards with a flag.

## Who uses this

| caller | for |
|---|---|
| [`ext/layout`](/framework/ext/layout/) | the selected element's words, its tokens, and the line that builds it |
