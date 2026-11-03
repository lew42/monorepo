# Where Panel properties live

**Proposal, 2026-08-15.** Not applied, nothing implemented. Weight: a
recommendation with one measurement behind it, revisable on Mike's word.

## The question

`ext/Panel` is turning into the shell of a real web editor (`ext/editor` is
already a consumer), and a panel has properties a person edits — `dir`,
`template`, `align`, `tone`, `mode`, `grow`, and soon size. Today the closest
thing to a property surface is `ext/layout`'s right-hand drawer, but that drawer
belongs to a different concern (what a *selected element* reads as), and it is
one-per-document. `dev/DevBar` is the other right-hand rail, and it should stay
dev-only — arguably strippable on a published build. So: where do a Panel's
properties go, where does contextual inspector UI go generally for apps built on
this stack, and how would two contextual sidebars coexist?

## What exists today

**The `ext/layout` drawer** — `public/framework/ext/layout/panel.js`. Four
module-level singletons (`$panel, $shell, $sel, host`), so **one drawer per
document**, opened by `select($el)`, closed by Escape, `popstate`, or a
capture-phase outside click. It **pushes**: it writes `--drawer: 19rem` onto
`.app`, and `public/framework/framework.css:168-174` reserves
`min(--drawer + --devbar, 100% - --rail-floor)` as `padding-inline-end`. Its
content is a fixed script in `public/framework/ext/layout/body.js` — the tag
name, the `div.c("…")` line that would build it, container/page/item word groups
— plus whatever `layout.context(el, fn)` registered at or above the selection
(`panel.js:17`). That WeakMap is the **only** extension point.

**DevBar** — `public/framework/dev/DevBar/DevBar.js`, mounted on `<body>`
*outside* `.app`, docked at the same inline-end edge behind `--devbar`. Worth
knowing before planning around it: **it is not localhost-gated today**.
`public/app.js:76` calls `devbar(this)` on every page, production included; only
`dev/Socket` checks the hostname. The gate is a keystroke (`Ctrl + \`) and the
`dev-open` class on `<html>`. Its `sections` array is deliberately *not* a
registry (`dev/DevBar/readme.md`) — adding a section is a function plus an array
entry, in that file.

**Panel** — `public/framework/ext/Panel/workspace.js:117` (`controls()`). A
panel's own properties already live **on the panel's bar**: two split buttons, a
3×3 alignment popover, the `T` template menu, the tone menu, hug/fill, close. A
*content* leaf separately gets `layout.bar($body)` floated into its corner — and
that bar selects the **content element**, opening the layout drawer for the
content, never for the panel. Nothing about a `Panel` is in the drawer today;
the two surfaces are already cleanly divided.

**Editor** — `public/framework/ext/editor/page.js:239`. It already answered this
question for itself: `properties` is one of five **regions in the workspace**,
built from `layout.words` + `controls.js` directly, never through the drawer. It
also actively defends against the drawer — `quiet()` (`page.js:62`) stops
`click`/`mouseover` inside every region *because* a click reaching `.panel-body`
is `ext/layout`'s "select this region", and the drawer it opens pushes the whole
app aside.

## The measurement that shapes the answer

The drawer's push is on `.app` — the **entire shell**. So an inspector for
something *inside* a workspace narrows the workspace while you are adjusting it:
you size a panel against a viewport 19rem shorter than the one you ship. Two
rails at once is ~38rem of chrome against a `--rail-floor` of 26rem — comfortable
at 3440, tight at 1280. A workspace that already knows how to split, drag, size
and persist its own regions does not need a second, differently-persisted docking
mechanism to hold its own properties.

---

## Candidate A — Stay in the drawer; Panel registers via `layout.context()`

Panel calls `layout.context($body, $sel => …)` and its properties appear as an
extra group under the selection's own words.

- **Owner:** `ext/layout`. Panel becomes a consumer.
- **Dev vs production:** no split — the drawer is production chrome already.
- **Two at once:** impossible. Four module singletons mean one drawer, and its
  content is one selection's script; a panel inspector and a content inspector
  cannot both be open.
- **API cost:** zero new surface. Cheapest by far.
- **Against:** the drawer's fixed preamble (`source($el)`, container/flex words)
  is wrong for a Panel — a panel is not a box you would type. Every panel would
  have to become "selectable", which is exactly what `ext/editor`'s `quiet()`
  suppresses. And `ext/Panel` would import `ext/layout`'s *selection model*, not
  just its controls, which is a much bigger dependency than the `controls.js`
  borrow it has today.

## Candidate B — The inspector is a panel region

Generalize what `ext/editor` already does: a `properties` entry in `ext/Panel`'s
own `T` vocabulary (`templates.js`), drawing the currently-focused panel's
controls. Any workspace gets an inspector by putting one in the arrangement; a
saved layout remembers it.

- **Owner:** `ext/Panel`. No new module, no new tier.
- **Dev vs production:** nothing to split. It is part of the app, arranged by the
  person using it, and DevBar stays untouched and separately strippable.
- **Two at once:** free, and better than layering — two inspector panels side by
  side, resizable, draggable, persisted, each already a first-class region. This
  is what a workspace *is*.
- **API cost:** one template entry plus a notion of "which panel is focused"
  (which the bar-per-panel model currently avoids having). Call it one property
  and one event on the root `Panel`.
- **Against:** only serves apps that *are* a workspace. A plain page with a
  single `panel(fn)` still needs somewhere to put properties, and that somewhere
  is the bar (which is fine) or the drawer (Candidate A).

## Candidate C — A new ext owns the docked rail

`ext/rail` (name to be argued): a small module owning one docked strip — fixed
position, its own `--rail-N` token, open/close, Escape, the clamp. `ext/layout`'s
drawer becomes the first instance; a Panel inspector could be a second; DevBar
could stay as it is or become a third.

- **Owner:** a new ext. `ext/layout/panel.js` shrinks to selection + content.
- **Dev vs production:** unchanged — a rail is not dev chrome; DevBar's dev-ness
  stays its own business.
- **Two at once:** the honest version of layering. `framework.css` currently sums
  two hardcoded names; this replaces them with a shell that reserves the sum of N
  open rails. Every rail also inherits the `--rail-floor` clamp for free.
- **API cost:** a real new module, one new class or door, plus a migration of the
  drawer onto it and a change to a `framework.css` line the whole site reads. It
  also invites a registry (rails pushing themselves in from a distance), which is
  the black magic DevBar explicitly declined.
- **For:** it is the only candidate that answers "any number of contextual right
  sidebars" literally, and it deletes a duplicated mechanism rather than adding
  a parallel one.

## Candidate D — Promote the rail into core

Same as C, but the rail lives on `App`/`View` — `app.rail(fn)` — so core owns the
shell contract that `framework.css` already half-implements.

- **Owner:** `core/App`.
- **Dev vs production:** unchanged.
- **Two at once:** as C.
- **API cost:** the highest. A new core name (and `core/Sidebar`'s record is the
  precedent for how hard a second core component has to fight to exist: "does
  every site want it, and does it work with no configuration?"). A rail is chrome
  an *app* wants, not chrome every site wants — the homepage will never open one.
- **Against:** core would be growing surface for exts. The `--drawer` /`--devbar`
  line in `framework.css` is already the minimum core contribution, and it costs
  nothing when nobody sets the tokens.

---

## Recommendation

**B now; C when a second non-workspace consumer appears; D not yet.**

Panel properties belong in a **panel region**, not in a rail. The reasoning is
the measurement above: an editor whose inspector narrows the canvas is an editor
measuring the wrong viewport, and `ext/editor` already reached this conclusion
independently and wrote `quiet()` to defend it. A workspace gives layering,
resizing, two-at-once and persistence for free — all four of the things a rail
would have to grow API for. The `T` vocabulary is the seam that already exists.

Keep the `ext/layout` drawer exactly as it is, for exactly what it does now: the
**selected element's** words on an ordinary page. It is not the Panel's property
surface and should not become one.

Treat **C as the recorded escalation path**, not as work to do. The trigger is a
second consumer that needs a contextual sidebar and is *not* a workspace — at
that point two rails exist for real, `framework.css` is summing two hardcoded
names for the third time, and the generalization has earned itself. Until then it
is a module built for one caller.

DevBar is a separate question and should stay separate: the fix for "dev-only,
strippable" is one hostname check at `public/app.js:76`, not a shared rail
abstraction. Worth doing on its own, whichever candidate wins.

## Open questions for Mike

1. **Focus, not selection.** B needs "which panel is the inspector inspecting."
   Is a focused panel a new concept you want, or should the inspector follow the
   *last panel whose bar was touched* (no new state, slightly surprising)?
2. **Does the per-panel bar survive?** If properties move into an inspector
   region, the bar could shrink to split/close/grip — or keep everything, and the
   inspector is the wide version. Both are defensible; they are different UIs.
3. **Panel height.** `.panel-workspace { height: var(--panel-height, 34em) }`
   (`ext/Panel/panel.css:11`) is the fixed height. Is the target "a workspace
   fills the page region" (a `.page.fill` story), or "a call site keeps tuning
   the token"? The answer changes whether an inspector region can assume a tall
   column.
4. **Does a published app keep `Ctrl + \`?** If DevBar is stripped in production,
   anything currently reachable only from it needs a home first.
