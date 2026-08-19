## What this file is

Two functions and the paint routine behind them: `claim(who, note)` rings the
whole viewport and marks the tab title, `release()` undoes both, `reclaim()`
reinstates a ring that survived a reload. Nothing in the framework imports
this file — the caller is `Server/plugins/MCP.js`'s `claim` and `release`
tools, through an `eval`, which is also why `paint()` builds its DOM by hand instead
of through a captor: an `eval` runs at global scope, so a factory call there
captures nothing.

## `View`, never `/app.js`

`import View, { div, span } from "../../core/View/View.js"` is not a style
choice. `app.js` imports `DevBar.js`, and `DevBar.js` calls `reclaim()` on
boot — a `/app.js` import here would close that circle, and a circular
partner reads an uninitialized binding on a deep reload, the same trap
CLAUDE.md names for the framework generally.

## The ring goes on `.app`, not `body`

`--prim` is declared on the theme class, which rides `.app`, not `body` — a
ring appended one level out reads every custom property as unset and paints
a flat 6px `currentColor` border instead of the intended colour. `paint()`
appends inside `document.querySelector(".app") ?? document.body` for exactly
that reason; the `body` fallback is for a page with no `.app` yet, not the
intended path.

## A claim has to survive its own target reloading

Why this is `sessionStorage` and not an in-memory flag: an agent editing
files under `public/` reloads its own claimed tab every few seconds via
live-reload, which would drop an in-memory ring before anyone saw it land.
`DevBar.js` calls `reclaim()` on every boot — two lines, chosen because
DevBar is the one dev-tier module already loaded on every page — so the ring
survives a reload it did not choose to happen.

## The title mark is an observer, not an assignment

Every route change rewrites `document.title`, which would silently erase a
plain string prefix a moment after `claim()` wrote it. `mark()` is a
`MutationObserver` on the `<title>` node instead, re-adding the mark every
time the Router replaces it. It stops at a full reload, same as the ring —
`reclaim()` is what puts both back.

## Improvements

1. **Nothing releases on its own.** Already named in the module's own
   readme: a session that dies mid-task leaves a ring on a tab nobody is
   driving, and the fix (a heartbeat) is more machinery than the problem has
   earned so far. *(medium, already the module's own stated next move)*
