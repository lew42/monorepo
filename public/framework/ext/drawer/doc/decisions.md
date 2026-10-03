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

- **The width is a SECOND token, `--drawer-w` (2026-08-18).** `--drawer` doubles as
  open/shut — `close()` clears it to release the strip — so a rail you had dragged
  sprang back to `19rem` the moment it shut. Width and open/shut are two questions:
  `--drawer-w` holds the width (on `.app`, beside `--drawer`), `--drawer` is written
  as `var(--drawer-w, 19rem)` so the two are still one number while the rail is open,
  and one `localStorage` key (`lew42-drawer-w`) carries it across a reload. Restored
  in `build()`, before the rail's first paint. `framework.css` needed no change — it
  reads `--drawer` exactly as before.
- **The drag clamps at `innerWidth - 26rem`, not `innerWidth - MIN` (2026-08-18).**
  Past that, `.app` stops widening its push (`--rail-floor`'s default, `framework.css`)
  while the rail keeps growing — the reserved strip and the rail would stop being one
  number, which is the one promise this module makes. So the page keeps its reading
  column and the rail can have everything else. The floor is read from the root's
  font-size once, at import; the sheet breakpoint in `drawer.css` mirrors the same
  `26rem` by hand for the same reason it always did (a custom property cannot drive a
  media query).
- **The resize edge is `ext/grip`, not this module's own (2026-08-18).** It was `dev/DevBar`'s, welded to that rail's settings;
  extracting it was cheaper than a second copy, and the copy would have re-learned the
  offscreen bug the hard way. What this module supplies is what a width *means* here:
  the clamp above, `--drawer-w`, and the key. `ext/grip/doc/decisions.md` has the
  record — including why a shut drawer's grip cannot linger (it is inside the box, so
  it slides off screen with it, or lands behind the dev rail at `z-index` 50 vs 40 —
  measured both ways).
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

## The mobile bottom rail (2026-09-29)

`rail.js`/`rail.css` — below 52em, an ✦ button (a listening sheet) and a second
button (this same drawer's tabs), pinned to the bottom of the screen. The side
drawer above was not a template to copy for this: it is `position: fixed`, so
it has to restate its own width as a `padding-inline-end` reservation on
`.app` (`--rail-push`) to keep the page from sitting behind it — two numbers,
kept in sync by hand.

- **The second button reads ⋯ "More", not ☰ "Menu" (the task mastermind,
  2026-09-29, judging the first shots).** It launched as a second ☰, copying
  menu.js's own glyph and label — but deliverable 1 (this same day) moved the
  page's OWN ☰ to the top of the screen on mobile, so a second ☰ down here at
  the bottom read as "press this again," not "here's something else," even
  though it opens a different thing (the drawer, not the page's nav). `⋯
  "More"` names what it actually is: a way to reach everything that doesn't
  fit as its own button. The old glyph/label/title are prototype fields
  (`menu_icon`, `menu_label`, `menu_title`), not hard-coded in `menu_button()`,
  so nothing was deleted — `DrawerRail.V1` (a two-line subclass, `rail.js`)
  restores the ☰ "Menu" look verbatim for anyone who wants it back.

- **A plain, non-fixed flex child of `.app`, not `position: fixed` (the
  option actually chosen).** `.app` is already `height: 100%; display: flex;
  flex-direction: column` with `.pages` as its one growing row
  (`framework.css`) — so a bar that is simply the LAST child of that column,
  `flex: 0 0 auto`, already takes its own space and `.pages` shrinks to fit
  above it. One layout fact (the column has three rows now, not two), nothing
  to compute, nothing that can drift out of sync the way `--rail-push` can.
- **The alternative the brief asked to weigh: full-height, independently-
  scrolling sections for the whole page (rejected).** This would mean giving
  every page a snap-scrolling, fixed-viewport-height section model instead of
  the one long scrolling column `.pages` already is — a rewrite of how every
  page on the site scrolls, to solve a problem ("reserve one bar's height")
  that flexbox already solves for free. Only worth it if the rail needed to be
  full-screen or independently scrollable itself, which it does not: it is a
  few centimetres tall and fixed in height.
- **A near-alternative also considered and rejected: `position: fixed` with a
  manual `padding-block-end` reservation on `.pages`, mirroring the side
  drawer's own `--rail-push` token.** Works, but only by re-deriving the exact
  bookkeeping problem the flex-child answer skips entirely — a token to write,
  a token to read, and a media query in two files that have to agree on the
  bar's height. Chosen only when a bar needs to float OVER content on
  purpose (the side drawer does, this one does not).
- **The sheet itself IS `position: fixed`** (`.drawer-rail-sheet`), because it
  is a modal-style overlay that is meant to cover content, including the rail
  itself, while it is open — the one place in this pair where "cover, don't
  reserve" is the right call.
- **No error banner of its own in the sheet.** `ux/Dictate` already shows an
  honest, specific message beside its own mic button — no device, no
  permission, no engine reachable — and a second sentence here said the exact
  same thing a few lines down. Mic feedback (the sound only once the mic is
  truly on, the wording of each message) is `ux/Dictate`'s job; this sheet
  only supplies where its widget lives and what a finished sentence becomes.
- **The ‹ Back button was removed from the sheet's head (voice-sheet-header,
  2026-10-01 — the owner: "I don't know if we need a back button… we have the
  X, the X makes much more sense to me").** It only ever did one thing the ✕
  didn't already do (step a full-height sheet down to "open" instead of all
  the way closed), and the phone's own hardware back button still does that.
  Removing it also fixed the header's "text alignment is way off" complaint:
  the row was three buttons spread by `.flex.split` (`justify-content:
  space-between`), and once "Back" was CSS-hidden outside full height, only
  one of the two gaps still had a second button to push against, so the
  title+path block drifted instead of sitting flush left. The fix is
  `drawer-rail-sheet-heading { flex: 1 1 auto }` (`rail.css`): the title fills
  whatever space the ✕ (and "More") don't need, so it is always flush left
  and they are always flush right, with no `space-between` guesswork left at
  all. The ✕ also shrank from a 2.75rem touch target to 2.2rem, matching
  "More" beside it, for the owner's separate "make the header smaller,
  vertically, much more compact" — it was the tallest thing in the row.

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
| [`ext/Panel`](/framework/ext/Panel/) | the focused panel's, text run's or item's properties (`tools.js` → `properties.js`) |

## Sharing the rail

Two modules fill this one box today, and a third is expected to. **The rail is a
surface, not a place to keep things** — every `drawer(fn)` call replaces the
contents, so whoever filled last owns what is showing, and the fill before it is
gone. That is deliberate: two rails at one edge would fight over the same push.

- **Churn is free; subscriptions are not (measured 2026-08-26).** 1,700 rebuilds
  of the rail's contents on `/framework/ext/Panel/` — about 61k elements and 34k
  listeners created — left Chrome's counters flat after a forced GC: nodes 10664 →
  10664, listeners 3821 → 3821, heap +0.03 MB. `empty()` detaches the subtree, and
  `View.on()` keeps no registry outside the element it wires, so DOM, listeners and
  closures are collected together. What does *not* collect is a fill that subscribes
  to something outliving it — `item.on(…)`, an observer, a `document` listener, an
  entry in a non-weak `Map`. `ext/Panel`'s `properties()` shows the discipline: its
  `hear` unbinds itself the moment its element is no longer in a workspace.
- **Redraw by re-announcing your subject, not with `refresh()`.** `drawer.refresh()`
  replays the *last* fill function untouched — which may be another module's, and
  even when it is yours it may describe a subject that has since changed. `ext/Panel`
  dispatches `panel-focus` again instead, so one path draws the rail no matter what
  provoked the redraw (`properties.js`'s `apply()`).
- **A click inside the rail is not yours by default.** `ext/layout/panel.js` wires one
  click listener on the rail and never unwires it, so it hears clicks on *every*
  caller's controls — for a while that redrew `ext/Panel`'s properties as ext/layout's
  "nothing selected" on the first click. Panel's rows claim their own with
  `stopPropagation` (`properties.js`'s `row()`); a third caller has to do the same
  until the ownership test lands (proposal: `ai/2026-08-19/panel-bar-sweep/`).
- **Fill, don't open.** Forcing the rail open on selection reads as jumpy (the owner,
  2026-08-18). Callers `dock()` once at load — `drawer.showing() || empty()` — and
  after that only fill a rail that is already up.
- **Say who is talking, and keep the reader's place.** `$slot` is the caller's half of
  the head: a one-word tag there (`panel`, the tag name) is how the reader knows which
  module the controls belong to. And `$body.empty()` throws away the rail's scroll
  position — restore it a frame later if the redraw is the same subject rewritten.

# Click-to-select needed an explicit switch, not just "drawer open" (2026-09-30, card-measure-gap)

The owner: *"when I click the actions dropdown it highlights the element… I think we want to
maybe use an inspect mode to toggle that on, we don't want to automatically select things just
by clicking on them… it kind of destroys all the UX."* Full task:
[`ai/2026-09-30/card-measure-gap/`](/framework/ai/2026-09-30/card-measure-gap/), `doc/select.md`.

`DrawerSelect.active()` used to be `tabs.mine()` alone — true any time the drawer happened to be
open on its own tabs, so a plain click anywhere not on `OWN_CLICK`'s short list (links, buttons,
inputs, `[role=button]`) read as "select this content," including a `<summary>` custom dropdown
trigger (`ext/Dropdown`'s `.ui-menu-trigger`, not a native `<button>`). It now also requires an
`inspect-mode` html class — a plain `dev/DevBar/parts.js` `check()`/`knob()` knob, the same
mechanism `dev-outline` (the x-ray toggle) already uses, added as its own row in the drawer's
Settings tab. Off by default, and it survives a reload the same way `dev-outline` does. Turning
it off also proactively clears any live hover/selection (the `check()` `changed` callback), so a
stale highlighted element is never left with no way back to it — though Escape still works
regardless, as it always did.

Alternative rejected: scoping `OWN_CLICK` to catch every custom control instead (`<summary>`,
`role=button`, a future picker). That treats the symptom one selector at a time and a new control
would reopen the same bug; a mode the owner explicitly turns on is the fix the owner asked for by
name.

# The AI tab's own header/body/footer, and the bug that broke it (2026-10-03, drawer-cleanup)

The owner, dictated at 3440 with the drawer open: *"My drawer is broken... that scroll area must
have a broken height, because it's offset and there's a bunch of weird overlap... the composer is
cut off at the bottom and overlaps the list above it."* Before/after:
[`ai/2026-10-03/drawer-cleanup/`](/framework/ai/2026-10-03/drawer-cleanup/).

**The real bug: a closed dropdown that never actually closed.** `tabs/ai.js`'s session-header
switcher (`$list.el.hidden = true`) sits next to a `drawer-ai-switch-list flex v` class — and
`.flex { display: flex }` lives in `@layer util`, which always beats `@layer theme` regardless of
selector specificity (`css` skill, rule 3). A theme-layer `[hidden]{display:none}` selector loses
that fight too unless it carries `!important` — measured live, the "closed" list of 12 past
sessions was rendering at **~940px tall** the whole time, pushing the composer hundreds of pixels
down past `.drawer-body`'s own bottom edge. That one object was the entire bug: the "broken
height," the "weird overlap," the composer reading as "cut off... overlaps the list above it," and
`.drawer-body` having to scroll everything (including the session name) under the pinned tab strip
instead of just the thread. `.drawer-inbox[hidden]` next to it had the exact same `.flex` sibling
and the exact same missing `!important` — named in its own comment as the fix ("`.flex` would
otherwise beat `[hidden]`") but never actually measured with one on. Both now carry `!important`.

**Once that was fixed, the three-part shape (header hugs / body is the only scroll box / footer
pinned by flex-grow) the owner asked for was already there** — `drawer.css`'s own long-standing
comment on `.drawer-ai-panel`/`.ux-dictate-widget-*` already built exactly this chain (flex:1,
min-block-size:0, no max-block-size, all the way down to the thread). The phantom 940px block was
the only thing defeating it. Proved live: with a 4000px-tall real thread scrolled to its own
bottom or top, `.drawer-head`'s bottom, the session header's top and the composer's top/bottom
never move — `.drawer-body` itself never scrolls (`scrollHeight === clientHeight`) — only
`.ux-dictate-widget-thread` does.

**The footer's own look — no border, no second padding, flush to the drawer's true edges
(the owner: "the footer goes full width with no white border round it, its light-gray background
area gets the DEFAULT padding... don't want a unique padding value for everything").**
`Widget.css`'s `.ux-dictate-widget-shell .ux-dictate-widget-composer .chatbox-compose` rule borders
the composer on three sides and rounds its bottom corners — right for a STANDALONE widget (the
Dictate page, the mobile sheet) where the composer reads as the bottom of one rounded card, wrong
in the drawer where it read as a second box floating inset inside the first. `drawer.css` now
overrides it, one class more specific: no border, no radius, `padding: var(--pad)` (the page's own
default, not a made-up number), `background: var(--wash)`.

- **Only `margin-inline` cancels `.drawer`'s own side padding, never `margin-block-end`.**
  `.drawer-body` has `overflow: auto`; a negative margin that bleeds a descendant past an ancestor
  that actually clips is counted as scrollable overflow, not visible content — tried first with a
  bottom margin too, and measured 14px of dead scrollable space at the bottom instead of a flush
  edge. Fixed instead by giving `.drawer` itself **no bottom padding** (`padding-block-start` +
  `padding-inline` only) — `.drawer-body` then already reaches `.drawer`'s true bottom edge on its
  own, and the composer, last in its own flex chain, is flush there for free. The side margin still
  needs `!important` for the same `.flex > * { margin: 0 }` (`@layer util`) reason as the `[hidden]`
  fix above — padding/background/border on the same selector all applied with no `!important`
  needed; only `margin` was being silently zeroed back out.
