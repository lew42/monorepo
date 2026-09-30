# Shell — decisions

## The prefix is `core-shell-`, not `shell-`, and the class is `CoreShell`

The brief for this module said `shell-`. `framework/styles/css-scopes.txt` already reserves the
bare word `shell` and every `.shell-*` class for `/imagine/shells` (a different, older lab). Two
problems stacked: writing `shell-` classes by hand would collide with that lab's own rules, and
naming the actual JS class `Shell` would collide it a second, silent way — `View.classify()`
(`core/View/View.js`) walks the constructor chain and adds a class for every link in it, kebab-
cased from the real `.name`, so a class literally named `Shell` paints a bare `.shell` on every
instance no matter what you import it as. The class is `CoreShell`, and `Shell` is just an export
alias onto the same class (`export { CoreShell as Shell }`) — `new Shell({...})` still works
exactly as the brief asked, `this.constructor.name` is still `"CoreShell"`, and the classify()
class is `.core-shell`, matching the `core-shell-` prefix on everything else in the file. The new
prefix is written into `framework/styles/css-scopes.txt` in this same task.

## Constructor content vs. the method of the same name

`new Shell({ header, left, right, footer, main })` — those five words need to be both something
you PASS and something a subclass can OVERRIDE (`header()`, `left()`, …, per the brief). Those
can't be the same property: every `View`'s constructor is `Object.assign(this, ...args)`
(`code` skill §2), so passing `header: fn` would silently replace the prototype method `header()`
with your plain function — there would be nothing left for a subclass to override, and the `code`
skill's own "names that collide with core" section names exactly this trap. `assign()` is
overridden here to pull the five region values out into `this.content` before the rest of the
options reach `Object.assign` — so `header()` etc. stay real, overridable methods, and what they
draw is always `this.content.header`.

## `frame` mode never draws `main`

A `frame: true` shell is the WINDOW's own frame — fixed over everything, `main` an empty,
`pointer-events: none` hole so the real page underneath is what you actually see and click.
Drawing whatever content was passed as `main` on top of that hole would defeat the whole point
(a page you can no longer click through), so `main()` checks `this.frame` first and always
returns the empty hole box in that mode, regardless of what `content.main` holds. A caller who
wants `frame` and a real `main` at the same time doesn't have a use case yet; if one shows up,
the hole and a real main can't both be "the whole point" and the brief's own words — "an empty …
hole" — settle it for now.

## Below 34em: stack, not a toggled sheet

The brief left this as "keep it simple and say which." A toggled sheet needs an overlay, a scrim
and a close affordance — machinery a small, general-purpose Shell has no other use for, and the
brief's own dev-shell design already plans to lay a real sheet (`ext/drawer`) on top of a plain
Shell for the one case that wants it (`dev/DevShell`, Minion B's build). Stacking (`left`, then
`main`, then `right`, top to bottom) needs nothing but a media query that swaps the grid's own
template — no JS, no extra markup, nothing to open or close. `ext/grip` already hides its own
handle below 34em, so nothing extra was needed to turn resizing off once stacked.

## Reusing `Page.Store` instead of a second `try/catch`

The brief asked for the remembered width to be "wrap[ped] in try/catch." `core/Page`'s own
`Page.Store` (`Page.class.js`) already is that guard — read/write/patch over one JSON blob,
falling back to an in-memory value and warning once rather than throwing, for exactly the cases
that make raw `localStorage` throw (private mode, a full quota). `core/Sidebar` already reuses it
under `id: "sidebar"` for the same reason (its own `Sidebar.Store` was deleted when `Page.Store`
gained the `id:` seam, 2026-09-18). `Shell` does the same thing under `id: "shell:" + this.name`
— one key per named shell, nothing saved at all for an unnamed one.

## What a fresh mastermind should check

- `new Shell({ left, main, right })` renders three boxes with nothing else on the grid — no
  hairline down the middle where `header`/`footer` would have been.
- Dragging `left`'s right edge (or `right`'s left edge) resizes it, 12rem to half the room, and
  double-clicking puts it back.
- A named shell's dragged width survives a reload; an unnamed one's does not.
- `main: new Shell({...})` actually shows a second, complete shell inside the first one's main
  cell, not just a box.
- `frame: true`'s `main` cell never shows whatever `main` content was passed — see the page's own
  `frame` demo, which pins the frame to a small preview box instead of the real window so it can
  be shown without covering the page.
