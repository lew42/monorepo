# DevBar

A right-docked rail of developer chrome, on every page. `Ctrl + \` toggles it, the
`✕` shuts it, its inline edge and four preset buttons resize it, and everything it
remembers is one `localStorage` document. Seven files: the shell (`DevBar.js`),
what it shows (`tools.js`), this page's AI threads (`ask.js`), the rendering
vocabulary (`parts.js`), what it remembers (`settings.js`), the resize edge
(`grip.js`), the look (`devbar.css`).

```js
import devbar from "./framework/dev/DevBar/DevBar.js";

render(){ …; devbar(this); },
navigated(){ devbar.refresh(); },
```

## The three things that will bite you

- **`dev-open` on `<html>` is the entire state.** The slide, the shell's push and
  what the `✕` undoes are all CSS off that one class. So anything that wants to
  react to the rail reads a class or a token — never a property on this module.
- **A preset drops `--rail-floor` to 0, permanently.** `.app` normally stops its
  push above a 26rem reading column, which floors the page at 416px and makes a
  "390" button a liar. Any deliberate width — a preset or a drag — clears that
  floor, so afterwards a drag can squeeze the page below 26rem too. `MIN` (200px,
  `settings.js`) is the only guard left, on both sides.
- **The rail renders during `App.render()`**, before the router exists and before
  the socket connects. Everything it shows is read at render time, which is why
  `refresh()` exists and why `navigated()` has to call it.

## Decisions

**Sizing the page by sizing the rail.** The rail is the only thing between the
window and the page, so a preset is one subtraction: `--dev-rail = innerWidth -
target`. Nothing new measures anything, and the `viewport` section that already
*reported* the width is where the buttons that *set* it belong — one section, not
two about the same number. A target the window can't hold (3440 on a 1920 screen)
has no rail width that reaches it, so that button disables itself and says which
window it needs, rather than clamping and quietly missing. The lit state reads
`settings.width`, **not** a measurement: `.app` eases its push over 0.18s, so
anything measured right after a click reads mid-transition.

**One document, not one key per setting.** `open` and `width` were two raw
`localStorage` keys in two files, and x-ray wasn't remembered at all. They are now
one `LocalStorageSaver` document (`settings.js`), which is also the first place a
new knob costs nothing to persist. Every piece of it is a class or a custom
property on `<html>`, so restoring is only writing them back — nothing in the rail
holds state of its own. `load()` resolves on a **microtask**, and microtasks drain
before the first paint, so there is no flash despite the promise.

**Knobs are remembered as a list of class names.** `settings.knobs` is
`["dev-outline"]`, not `{xray: true}`. The class already *is* the state (a redraw
reads it back off `<html>`), so storing the class name adds remembering and
nothing else — and a new knob is one `check()` call with no schema to update.

**`ai` — the threads live beside the page, not under a date.** A thread is
`<page>ai/<slug>/task.jsonl`. See `ask.js` and the ext/Ask record for why a chat
is the same thing as a task; what matters here is that the **dir listing is the
index**, so the rail reads `/directory.json` and nothing declares or crawls
anything. The section remembers which thread you were last in *per page*
(`settings.threads`), because otherwise every visit opens with a click that only
re-selects where you already were.

**Naming a thread is a native `prompt()`.** Crude on purpose: it happens twice a
week, and an inline form is a whole control surface — with its own validation,
its own escape key and its own styles — for two words. Revisit if thread creation
ever becomes frequent.

**`parts.js` exists to avoid a cycle.** `section()`/`row()`/`check()` were private
to `tools.js`, and `ask.js` needs `section()` — but `tools.js` imports `ask.js` to
put it in `sections`, so `ask.js` importing `tools.js` back would be the mutual
import that breaks only on deep reloads. Three functions in their own module, and
imports flow one way again.

**The rail is the first `dev` → `ext` import in the repo.** The constraint is that
**core** never imports an ext; `dev` is downstream of both and opts in the same way
`app.js` does. Named because it is a direction nothing had taken before, not
because it is a problem.

**Where does it mount — inside `.app`, or on `<body>`?**
`ext/layout`'s drawer is inside `.app` and documents why: `color-scheme` is forced
there, so a panel on `<body>` would render light while the page is dark, and
`--drawer` is only read on `.app`. Neither applies here — this rail forces its own
`color-scheme: dark`, and `--devbar` is declared on `:root`. **Verdict: `<body>`.**
Outside `.app` it is also outside `.theme-lew42`, so the site's type scale, its
uppercase buttons and its Montserrat never reach it — a dev tool that changes size
when you change the site's theme is a dev tool you cannot trust. The cost is real
and worth naming: this rail cannot borrow a component class from the theme.

**Dark, without a palette.** Every colour token in `framework.css` is a
`light-dark()` pair, and `light-dark()` resolves against the element that *uses*
the token. So `color-scheme: dark` on `.dev-bar` is the whole dark theme — ink,
surface, line, wash and subtle all retune together and this stylesheet names no
colour at all. Same mechanism `App/mode.js` uses on `.app`.

**Two rails at one edge.** `--drawer` was the shell's only reservation, and a
second panel sharing it would silently lose its push the first time `deselect()`
cleared the token. `.app` sums `--drawer + --devbar` now (`framework.css`), the
layout panel insets itself by `--devbar` so the two sit side by side, and the
`.mode-btn` pill clears it too. Three one-line edits, and the clamp above a 26rem
reading column still governs the total — at 480px the reservation collapses to
64px and the rail covers, which is what a drawer is supposed to do down there.
`--devbar` is on `:root` rather than `.app` because there is one rail per
*document* and the rail itself hangs off `<body>`, where it could not inherit it.

**No handle when closed.** `/web/nav/drawer/` says the button that opens a drawer
must be persistent — that rule is about reader-facing navigation. This is dev
chrome behind a keystroke, and a permanent tab on the right edge of every page is
a visible cost paid by everyone to remind one person of a shortcut they know.
Open question rather than a settled one: if the rail is ever hard to find, a
low-opacity edge tab is the fix.

**The grip has no resting state.** A splitter is normally a permanent bar, which
costs a visible seam on every page for a gesture used once a session. This one is
a 2rem hover strip straddling the edge with nothing in it: the pill appears where
your pointer already is and rides its Y, so you never aim. Half the strip hangs
over the page and swallows clicks in its rightmost ~16px — that is the price of a
hit area you don't have to find, and it is paid only while the rail is open.

**The pill is `--prim`, and that is not decoration.** It straddles the boundary,
so it is drawn on the page's light background as much as on the rail's dark one —
the first version used `--subtle` (translucent white) and was genuinely invisible
on its left half. Only a hue reads on both. The whole edge lights at 45% under the
same hover for the same reason: findability is the affordance, not the dot.
Sizes are `rem`, never `em` — the rail's text is `0.8rem`, so an `em` pill came out
3.2 × 12.8 instead of 4 × 16. A grab target does not scale with the type beside it.
(It is 6 × 32 now; 4 × 16 was too small to see. Mike, 2026-08-14.)

**Dragging turns the shell's easing off** via `--rail-ease`, a token `framework.css`
reads on `.app`'s transition. Not a rule naming `.app` from here: the width is
written every frame, and an eased push trails the pointer by 0.18s and reads as
lag. The token is the same contract shape as `--devbar`.

**Deliberately not a registry.** `sections` is a plain array in `tools.js`. A
`DevBar.tool(name, fn)` API would be the moment other modules start pushing
themselves in from a distance, which is exactly the black magic this codebase
avoids — and the array is one line to edit.

## Known limits

- The socket row settles once, on `socket.ready`. If the dev server dies *while*
  the rail is open the row keeps saying `connected` until something refreshes it.
  Live-reload restarts the page anyway, so this has never been visible.
- A resize redraws the whole body. Cheap, but it does drop focus — **and the `ai`
  section is focus-sensitive now**: resizing the window mid-sentence loses what you
  had typed. The preset buttons repaint only themselves for this reason; the
  window `resize` listener still does not.
- A preset is computed at click time, so **resizing the window afterwards leaves
  the page at the old width** — no preset stays lit, which is honest, but nothing
  re-derives either. Re-click to re-fit.
- **A thread carries `requested_at` and never `landed_at`**, so once the board
  crawls these it will read every chat as permanently "running". How a chat thread
  displays is the ext/AI task's call, not something to guess at here.
- **The thread list is one `/directory.json` fetch per rail redraw** — that is
  every navigation. It is a dev-only file the server already keeps warm, but a
  cache is the obvious next move if it ever shows.
