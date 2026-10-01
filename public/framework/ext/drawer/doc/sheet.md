# The ✦ sheet is a page

On a phone, the ✦ sheet can be dragged from part of the screen up to all of it. At the top it stops being a panel over the page and becomes a page of its own. It gets its own url, and the phone's own back button steps it down. (The owner, 2026-09-30: "as I swipe this thing up… all the way at the top, it's almost like we've just navigated to this page… the user's operating system level back button should always work.")

**No separate ‹ Back button in the head** (voice-sheet-header, 2026-10-01 — the owner: "I don't know if we need a back button… we have the X, the X makes much more sense to me"). The ✕ already closes the sheet all the way, from any height including full screen (`close()`, `rail.js`), so a second button doing almost the same thing was one control too many. Only the phone's own hardware back button steps a full sheet down to "open" first, one state at a time.

Screenshots of every step: [Mobile bottom rail](/framework/ext/drawer/rail/).

## Three states, three urls

| State | Url | What shows |
|---|---|---|
| closed | `/framework/` | the bottom rail only |
| open | `/framework/?sheet=open` | the sheet over part of the screen, at the height you last left it |
| full | `/framework/?sheet=full` | the sheet is the whole screen |

Going **up** a state adds a history entry: tapping ✦ (closed → open), or letting go of a drag near the top (open → full). Going **down** a state goes back through those same entries: the phone's back (one state at a time), ✕ (all the way to closed, from any height), or letting go of a drag near the bottom. So the phone's back button always steps the sheet down one state, and it never leaves the site while the sheet is showing.

A reload or a shared link at `?sheet=full` opens the sheet at full height, and first rebuilds the two entries under it (closed, then open). The phone's back still steps down twice before it would leave. A sheet opened from the url starts **quiet**: the microphone waits for a tap, because nobody asked it to listen.

## The drag

Letting go settles the sheet by where it was let go. At 85% of the screen or more (`full_at`), it goes full. Below 28% (`close_at`), it closes. Anywhere between, it stays where you let go, and that height is remembered. Both numbers are prototype fields on the sheet class, so a variant can change them.

While you drag, the sheet has a real height (`.drawer-rail-sheet-sized`), not only a ceiling. With only `max-block-size`, a drag above the sheet's own content did nothing: the finger moved and the sheet stayed where it was. The edge stays under the finger (measured within 1 px) because `ext/grip` now remembers where in the strip the finger landed, on the y axis only.

## The code

- `DrawerRail.to(mode)` is the one way to change state: it pushes, goes back, or replaces, then shows. `apply(mode)` only makes the screen match a state and never touches history. The popstate listener calls `apply(routed())`.
- `history.state.depth` counts our own entries above the closed one (open = 1, full = 2). A step down goes back only when that count says the entry below is ours. Otherwise it replaces the current entry, so it never goes back into a different page.
- After an in-app link, the new page's url gets `?sheet=open` written back (a full sheet steps down to open so the new page is in view). That entry has no depth, so ✕ there replaces it rather than going back to the page you came from.
- `core/Router` ignores a popstate that stays on the same path (`popped()`). Before, every back step reloaded the page underneath, scrolled it to the top and fired `navigated()` again.

## Watch out

- **Closing the sheet keeps the mic running** (mic-keeps-running, 2026-10-01 — the owner: "I don't
  necessarily like that closing it stops recording"). Before this, `hide()` called `stop_mic()` on
  every hide, no matter why — the ✕, a drag down, the phone's back, OR the window just widening past
  52em. That looked safe because the OLD mic-only sheet threw its whole mic+thread away on close, and
  `ux/Dictate`'s own mic-hijack rule (`Dictate.js`'s `LIVE`/`visibilitychange`) already stops a
  `Dictate` taken off the page — but this sheet's widget (`this.panel`, `DrawerRailSheetChat.
  ensure_mount()`) stays mounted in the DOM the whole time the sheet is hidden, `rc("on")` is only a
  CSS class, so nothing was ever actually unmounting it; `stop_mic()` was the only thing stopping the
  mic, called on purpose, every time. Now `hide({ keep_mic })` only stops it for the ONE case that is
  still a real "unreachable" problem — the window widening past 52em (`DrawerRail.apply()`/
  `watch_breakpoint()`) — a REAL close (`apply()`'s `mode === "closed"`) leaves it running: the owner
  can keep talking with the sheet shut and see it land on reopening it, or on the desktop drawer's own
  AI tab, which shares the same global session (`ux/Dictate/chat.js`). The page-hidden/pagehide
  mic-hijack rule itself is untouched — it still stops every live `Dictate` the instant the whole TAB
  is hidden or left, this sheet's mic included.
- **Nesting a sheet inside this sheet doesn't work — but giving a bar inside it its own independent height does.** `DrawerRailSheetV1` is `position: fixed`, which always measures from the real screen's edge, never from its own DOM parent — a second instance put inside the first would float on top of it, not live inside it. The actual mechanism (a plain box, `ext/grip`'s y-axis handle, one CSS height variable) nests fine, because `grip()` only ever reads its own immediate parent's edge — a live, draggable proof of both halves: [nested-sheet-example](/framework/ai/2026-10-01/nested-sheet-example/).
- Show or hide the sheet with `rail.to(mode)`, never by toggling `.on` yourself. Otherwise the url, the history and the screen stop agreeing.
- The sheet's own box also has the class `.drawer-rail-sheet-panel` (View stamps the class name `DrawerRailSheetPanel`). A bare rule for that class hits the sheet too: a `display: flex` there once kept the sheet on screen after ✕ (fixed with a descendant selector in `rail.css`).
- Above 52em the sheet is hidden but the url is left alone. Narrowing the window again shows whatever the url names.
- Chrome's own toolbar auto-hide never reaches this sheet, even dragged to `full` — and the fix is bigger than it looks. Full story below.

## Chrome's toolbar auto-hide does not reach the full sheet (2026-10-01, sheet-chrome-autohide)

The owner's question: on an ordinary page, scrolling down lets Chrome's own address bar slide out
of the way on a phone, and scrolling up a little brings it back. Does that ever happen on this
sheet, dragged all the way to `full`? The owner's own guess was that the chat thread scrolling in
its own nested box, instead of the page itself scrolling, was why not.

**No, it never reaches the sheet — but "a nested scroll area" is not quite the reason, and the
real fix is not a small one.** Two separate facts:

1. **Every page's own scroll on this whole site is already a nested box**, not the document.
   `html`/`body`/`.app` are all pinned to exactly 100% height (`framework.css`), so the real
   `<body>` never scrolls at all — `.pages` (`core/Page/Page.css`, `overflow-y: scroll`) is the
   one box that does, on every page. Chrome still hides its toolbar when `.pages` scrolls, because
   Chromium promotes whichever single scrollable box fills almost the whole screen, with nothing
   else competing, to act as the page's scroll for exactly this purpose (its "implicit root
   scroller" — the same rule that lets any single-page app's one big scroll div drive the
   toolbar). So a nested scroll box, by itself, was never the blocker — `.pages` is one, and it
   already gets the toolbar to hide.
2. **The sheet can never offer Chrome a box like that.** `.drawer-rail-sheet` is
   `position: fixed; inset-inline: 0; inset-block-end: 0` even in its `full` state (`rail.css`) —
   a second box stacked OVER `.pages`, not part of it, so the box Chrome actually promoted
   (`.pages`) just sits underneath, covered and motionless, while you scroll inside the sheet. And
   even taken on its own, the part of the sheet that actually scrolls — the thread
   (`.drawer-rail-sheet-thread`, or `Widget.js`'s own `.ux-dictate-widget-thread` /
   `-feed-wrap`) — is only part of the fixed box: the head row and the composer sit beside it as
   separate flex children (`.drawer-rail-sheet-head`, `.drawer-rail-sheet-panel` in `rail.css`),
   so the thread itself never fills the full screen either. Chrome will not promote a scroller
   that doesn't fill the viewport, so neither box ever qualifies, fixed or not.

**What a real fix would take, if the owner wants it built:** make the thread itself the one
`position: fixed; inset: 0` box while the sheet is full, with the head and the composer laid out
as `position: sticky` children INSIDE that same scrolling box instead of flex siblings around it
— and hide `.pages` outright (`display: none`, not just a lower `z-index`) while the sheet is
full, so it stops being the box Chrome already promoted. That is a real rewrite of the full
sheet's shape: the grip handle's height math, the composer's own keyboard-avoidance, and the
sticky-bottom autoscroll (`ext/Chat/doc/scroll.md`) all currently assume today's head/composer-
as-siblings layout, and would need re-checking against the new one. Not a CSS tweak.

**Why this was researched, not built:** there is no way to verify the one thing that actually
matters — whether Chrome's real toolbar hides — without a real phone. A headless screenshot
(Playwright, `site.shot`, devtools device emulation) never draws Chrome's own address bar at all;
the "device" in every one of those tools IS the whole viewport, so no screenshot could ever show
this working or not. Landing a rewrite of a part of the sheet that had three separate regressions
land the same day (`fullscreen-rail-void`, `voice-sheet-header`, this file's own history above)
with no way to confirm it actually fixes the one thing it is for is the wrong trade — the owner's
own hunch (nested scroll) pointed at the right neighbourhood but the actual wall is
`position: fixed`, and the fix above is the scoped follow-up task if it is still wanted, to be
proven on an actual phone, not a prototype guess.
