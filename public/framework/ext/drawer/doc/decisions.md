# drawer — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

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

- **A full-screen page pushes too (2026-08-16).** `.page.layout-full`
  (`styles/layouts/layouts.css`) is `position: fixed; inset: 0` — its containing
  block is the viewport, so `.app`'s `padding-inline-end` push never touched it and
  the rail sat *on top of* the thing being edited, exactly the outcome this module
  exists to prevent (measured: 1872px workspace both before and after opening the
  rail, at 1920 on `/framework/ext/Panel/full/`). Fixed by restating `.app`'s
  reservation formula on `.page.layout-full`'s own `inset-inline-end` — two formulas
  that must now be kept in sync, which is a bug report about `framework.css`, not a
  design this module is happy with: **proposed, not applied here** — hoist both into
  one `--rail-push` token defined once on `.app`, read by any element that wants to
  yield the same edge, fixed-position or not (custom properties inherit past
  `position: fixed`; only the DOM parent chain matters).
- **A viewport narrower than the push's own floor gets a full sheet, not a partial
  cover (2026-08-16).** Below `--rail-floor`'s default (`26rem`) the push clamps to
  0 by design — you cannot push what has no room — but the rail still opened at its
  fixed `19rem`, covering 76% of a 400px screen and leaving a sliver of page too
  narrow to read anything in. `@media (max-width: 26rem)` makes the rail the whole
  sheet instead: no partial overlay, no sliver, the ✕ is still the way out. The
  breakpoint is **not** wired to `--rail-floor` itself (a custom property can't drive
  a media query) — it matches that token's *default*, and the two are independent
  decisions that happen to share a number today.
- **It left `ext/layout` (2026-08-16, the owner).** The rail was `ext/layout/panel.js`'s
  private half, reachable only through that module's own selection — so
  `ext/Panel`, which wants somewhere to put the words that will not fit a hover
  overlay, had no way in that did not drag the selection machinery with it. Split
  along the seam that was already there: **the rail is generic, what it shows is
  not.** `ext/layout` kept the selection, the word registry and the look of its
  own content (`.layout-*`); the shell, the push, the pinned head and the ✕ came
  here.
- **Deselecting no longer closes it (the owner, 2026-08-16).** It used to, and a click
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
- **⚠ `position: fixed` opts an element out of the push, not just out of the flow.**
  Its containing block is the viewport, so `.app`'s `padding-inline-end` never
  reaches it — anything full-bleed (`.page.layout-full`) has to restate the
  reservation on its own `inset-inline-end` or the rail overlays it. See Decisions.
- **⚠ A caller wiring a listener to the returned rail must do it once.** `on()`
  adds a listener per call and `drawer()` is called on every redraw —
  `ext/layout/panel.js` guards with a flag.

## Who uses this

| caller | for |
|---|---|
| [`ext/layout`](/framework/ext/layout/) | the selected element's words, its tokens, and the line that builds it |
