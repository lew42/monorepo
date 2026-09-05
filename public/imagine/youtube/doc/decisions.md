# Decisions — the YouTube lab

Built 2026-08-30; the engine lifted out and a sixth lab added 2026-08-31. Everything below was
measured headless against the live pages unless it says otherwise.

## The six, and what each one proves

| page | width | proves |
|---|---|---|
| [`panel/`](/imagine/youtube/panel/) | `large`, `default` | every exposed method as a control, every event in a feed |
| [`course/`](/imagine/youtube/course/) | `large`, `index` | nav→time and time→nav, both real framework navigation |
| [`yield/`](/imagine/youtube/yield/) | `large` | the player scales aside and keeps playing; the UI takes the stage |
| [`split/`](/imagine/youtube/split/) | `large` | the timeline OFFERS values and never overwrites yours |
| [`chat/`](/imagine/youtube/chat/) | `large` | forward catches up, backward replays |
| [`marks/`](/imagine/youtube/marks/) | `large` | where a cue table comes from — the list you edit IS the live timeline |

## Settled 2026-08-31 — the engine is not a video player

- **`cues.js` is its own file**, and `Player` is three lines of delegation into it. The engine
  fires through an injected `fire`, so a page still listens to the one object it holds and all
  five original labs are byte-for-byte unchanged in behaviour. [`cues.md`](/imagine/youtube/doc/cues/)
- **The formatters moved with it.** `clock()` and `seconds()` are timeline vocabulary, not video
  vocabulary; importing `youtube.js` to print `"1:32"` would have pulled a stylesheet and
  Google's loader into a 3D scene.
- **`clock()` grew an hour branch.** A two-hour talk read `"127:14"`, and `marks/` emits these
  strings for a human to paste.
- **The proof the extraction was worth it is outside this module:**
  [`/imagine/scenes/tour/`](/imagine/scenes/tour/) imports `Cues` and `Clock` unchanged and
  walks a 3D world's urls on a wall clock. Welded to a `Player`, that was impossible.
- **Keyboard transport on `panel/`, rendered from ONE table** — Space/K, ← →, J L, ↑ ↓, M, 0–9.
  The legend under the controls is printed from the same list that dispatches, so an advertised
  key and a working key cannot drift. Every press logs into the feed as its API call name.
  Measured: Space paused, M muted, ↓ took volume 100 → 90, `5` jumped to 453s of 905, and
  typing `2:30` into the seek box was not stolen.
  ⚠ Once focus is inside the player the keydown is cross-origin and this document never sees
  it — YouTube's own shortcuts take over, which is the right answer. The label says so.
- **`marks/` starts on the Jobs talk on purpose**, because that is what `course/` is built on:
  the array you copy out pastes straight into that page's `CHAPTERS`.

## The two directions, measured

The heart of the ask. Both are ordinary framework moves and neither is a special case.

| | what was done | url after | playhead after |
|---|---|---|---|
| **nav → time** | clicked the `Loss` segment | `/imagine/youtube/course/loss/` | **362s** |
| **time → nav** | `seek(640)` | `/imagine/youtube/course/death/` | 642s |
| **scrub back** | `seek(100)` | `/imagine/youtube/course/dots/` | 102s |

⚠ **The two directions will chase each other unless one of them can say "already here".** The
chapter's `activated()` seeks only when the playhead is OUTSIDE its own span; inside it, time
is what opened the page and there is nothing to do.

⚠ **`follow()` must check that the page is still on screen.** `rest()` pauses on the way out,
which fires one last state change and one last read — without the guard the page routes the
reader straight back to a chapter they just left.

⚠ **`follow()` stands down under 32em of row.** The arrangement pages one column at a time
down there, so opening a chapter scrolled the video off the left edge and the course lost the
thing it is about (shot at 400, 2026-08-30). On a phone the bar, the clock and the chapter name
still follow the playhead; only the automatic routing stops. Tapping a chapter still seeks.

⚠ **Navigation comes from the engine's INDEX, not from a cue's `fn`.** A backward scrub replays
every cue, which fired three `router.go()`s racing each other. [`cues.md`](/imagine/youtube/doc/cues/).

## Widths: `fill` was tried and is a no

Measured with both rails open, at 400 / 1280 / 1920 / 3440:

| word | widths | verdict |
|---|---|---|
| `fill` | 400 / 859 / 1472 / **2936** | **no** — at 3440 the even seam made a **2340px** video, taller than the viewport; the page was one enormous frame with a control strip stuck to it |
| `large` | 400 / 859 / 1024 / 1152 | **yes** — the 64em ceiling is the answer the row already has, and the leftover is drawn as the column slots it is |

All five labs are `large` for that reason, and the halves are capped from the inside as well —
`.yt-controls` at 34em, `.yt-form` and `.yt-room` at 30em — so the leftover goes to the video,
which is the one thing on the page that can spend it.

⚠ **`bleed` was on all five and came off.** A row of controls that ends flush against the
screen edge reads as clipped; the column's own 14px inset is exactly the fix, and it puts
every block on the one left edge the site's other rule asks for.

⚠ **The readout grid is 9em, not 7em, and that is arithmetic.** Six readouts want a track count
that divides six. 7em gave four columns and the last row ended in a wide grey off-cut of the
`--line` floor; 9em is three columns from 480px up and two below it — full rows at every width.

## Three bugs the probe found that reading would not have

1. **`input.attr(…)` instead of `input().attr(…)`.** The factory is a function; a property
   access on it throws two frames later. `div.c` and `input.c` both work, which is what makes
   the bare form look plausible.
2. **The getters answer stale after a setter.** [`api.md`](/imagine/youtube/doc/api/) — the
   whole of `settle()`.
3. **The 400 course routed away from its own video.** Above.

## Scrollbars — the two that were asked for

`.yt-feed` (10em) and `.yt-log` (16em) both scroll, deliberately: a log is a scroller and a
room is a room. `.yt-yield-ui` scrolls too, because a wizard step can exceed a 20em stage at a
narrow width. Nothing else on any of the five pages scrolls at 400 / 1280 / 1920 / 3440, and
`document.scrollWidth === clientWidth` at all four.

## What was cut

- **Destroying the player on leave.** `rest()` pauses and keeps the iframe, so coming back
  finds the video where you left it. Destroying it left the cached column view holding a dead
  box.
- **A draggable chapter bar.** The bar is the chapter NAV; the video's own scrubber is the
  scrubber. Two ways to seek in one 2.4em strip is a `layout` Q4 failure — the page would show
  the same thing twice.
- **A second UI in `yield/`.** Three steps of ONE form beats three unrelated widgets: a course
  is a sequence, and one component proves the mechanism as well as three would.
- **Time-driven chat AUTHORSHIP** (typing into the room). The room is a replay; a real chat is
  a different program, and mixing them would have made the scrub meaningless.
- **`page.store()` persistence** for the form data. Out of fence, and `/imagine/store.js`
  already has the proposal.

## Closed 2026-08-31

- **The chapter marks are hand-typed seconds.** They still are — but nobody has to type them
  with a stopwatch any more. [`marks/`](/imagine/youtube/marks/) is the tool, and
  [`marks.md`](/imagine/youtube/doc/marks/) says why the Data API is still not the answer for a static site.

## Closed 2026-09-04 — `panel`'s keyboard legend did nothing on a cold load

**Found by the clarity review.** `panel/` is `youtube/`'s `default` column — shown on
`/imagine/youtube/` without ever being routed to. `render_column()` in
`core/Page/Page.class.js` only `render()`s a default column, never `activate()`s it, so
`panel`'s own `activated()` — the method that attaches the keydown listener for the whole
keyboard legend — never ran. Every key on the legend (Space, ← →, J L, ↑ ↓, M, 0–9) was
silently a no-op on first landing, and the worse half of the same bug: `deactivated()`
never ran either, so pressing play and then leaving for another top-level page left the
4×/second poll running forever (`Player.live` stuck above 0 — the exact invariant this
readme's Watch-out section names).

Fixed in `youtube/page.js` — the parent now activates/deactivates its own default column
by hand, the same workaround `core/Page/overview/columns/uses/split/page.js`'s parent
already carries for a never-routed REGION:

```js
activated(){ this.default_column()?.activate(); },
deactivated(){ this.default_column()?.deactivate(); },
```

Verified: keyboard shortcuts fire on a cold load; `Player.live` returns to 0 after
navigating away mid-play; the routed `/panel/` url is unaffected (`render()`/`activate()`
are both idempotent, so the extra call is a harmless no-op once the router activates it
for real).

⚠ **This treats the symptom, not the cause.** The real fix belongs in `render_column()`
itself, so every `default` column site-wide gets it for free rather than each leaf
carrying its own copy of this workaround. `activate()` can't simply replace `render()` on
line 307 as-is — `activate()` opens by calling `this.container()`, which for a column
walks up to `this.parent.$pages`, and `$pages` is still being built by the very callback
that would make the call (the ordering trap `child()`'s own comment already names two
lines above this one: `this.app.router` in a default column's content threw, 2026-08-29).
The shape that avoids it — call `render()` to build the view exactly as today, THEN
`activate()` it once `$pages` exists, both inside the same host method so no leaf ever has
to know:

```diff
  render_column(host){
      const stack = () => {
          this.column_grab(this.column(host));
          this.$pages = div.c("page-column-pages", () => this.default_column()?.assign({ app: this.app }).render());
+         this.default_column()?.activate();   // render() above already built the view; $pages exists now, so container() resolves
      };
```

Proposed, not applied — `core/` is out of this module's fence. It would also want a test:
a `default` column's `activated()` firing on cold load, and its `deactivated()` firing when
the reader leaves without ever routing to it directly (this module's own `panel/` is a
ready-made repro).

## Closed 2026-09-05 — `panel/` is a real 3-column card, and the five one-word labs got stills

**The UX rethink pass.** Two changes, both inside this module's own fence.

**`panel/` was two columns** — the video, then one 34em-wide stack of all eight control
groups (readouts, seek, transport, shortcuts, speed, sound, source, feed). Split into
three: seeking/transport/shortcuts LEFT, the stage CENTRE, readouts/speed/sound/
source/feed RIGHT — the shape the owner asked for by name (a live centre with controls
one side, readouts the other), and one already proven to win on this site where the
centre is a real live thing with real numbers beside it. `.yt-panel-left` and
`.yt-panel-right` cap at 18em/20em, same ceiling reasoning as the old single
`.yt-controls`: the leftover goes to the video.

⚠ **A DOM order that "just works" at one width can be wrong at another — measure both.**
The first attempt used an unconditional CSS `order` (left / video / right always), which
looked right at 3440 but was WORSE at 1280: the row wraps to one column under ~56em, and
`order` keeps working there too, so it pushed the video below three control groups on a
cold, narrow landing — the exact thing this page exists to show first. Caught only by
measuring 1280 as well as 3440 (`scrollH` 1199 → **1377px**, worse). Fixed with
`.yt-panel { container-type: inline-size }` and `@container (min-width: 56em) { … order
… }`: the video stays FIRST in the markup (and first on screen) until the row is
actually wide enough to hold three real columns, only then does it move to the centre.

**Measured, at 3440** (panel column's own body — `.page-column-body`'s rect and
`scrollHeight`, not `document.scrollHeight`, which the columns shell pins to the
viewport regardless of what this page does):

| | before | after |
|---|---|---|
| column `scrollHeight` | 1110px | **859px** — fits its 852px box, no internal scroll |
| column `scrollHeight` at 1280 | 1199px | **988px** |
| width used / dead space | 2412px / 70.1% / 1028px | unchanged — the columns-row band, not this page's to close (see "Open" below, and 2026-09-04 above) |

Kept: shorter, same width story, and the video is now BIGGER (both side columns are
narrower than the old single 34em stack).

**The five one-word labs — Course, Yield, Split, Chat, Marks — said nothing until you
clicked one.** `youtube/page.js` took `index: true` and calls `this.previews()` on its
children minus `panel` (already open beside it — the same reasoning `course/`'s own
`index: true` uses for its chapter bar) instead of leaving core's default column() row
list (icon + one word) to speak for them. Each of the five got a `preview(nav)`
override pointing at a real Playwright screenshot of its OWN distinguishing UI — no
core change, `design/color` and `gallery/cards` already use the identical
`preview_card(nav, () => img…)` shape:

| lab | still shows |
|---|---|
| `course/` | the video and its colored chapter bar (Opening/Dots/Loss/Death/Foolish) |
| `yield/` | the video already stepped aside into the corner, mid-form |
| `split/` | video one side, the four-field form the other |
| `chat/` | video beside the empty room box |
| `marks/` | Mark/Clear, "No marks yet.", and the `player.cues(...)` output box |

Shots at `public/imagine/youtube/shots/<slug>.jpg`, one shared `.yt-shot{object-fit:
cover}` rule. `yield/`'s is a forced DOM state (`.yt-yield-stage.yt-aside` + one
`.yt-step.yt-on`, added directly for the screenshot) — the mechanism is invisible
before 25 real seconds of playback, and a still that showed a plain paused video would
have taught nothing.

⚠ **Giving a page a real `preview()` for the first time exercises code that never ran
before, and it can find a bug that survived unnoticed.** `yield/page.js` had a method
named `card(title, fn)` for its own wizard steps. Core's `Page.nav()` reads `this.card`
as a page's SIZE-modifier field (the `.two`/`.tall`/`.big` words), and `preview_card()`
does `.ac(nav.card)` — `View.ac(arg)` calls `arg.split(" ")`, so the method itself
(truthy, not a string) threw `arg.split is not a function` the instant this page asked
`yield/` for a card. The exact class of bug `Page.class.js`'s own `default_column()`
comment already names for `opens()` — a page's plain-noun method squatting a name core
reads as a field — met a second time. Renamed to `step_card`; the trap is worth
knowing before it bites a sixth page: **grep `nav(){`'s field list
(`url`/`label`/`icon`/`card`/`description`) before naming a page method after one of
those five words.**

Verified after both changes: `ui-test` (drive.mjs) on a cold `/imagine/youtube/` load
— never routed to `/panel/` — pressing **M** with zero clicks logged `mute()` into the
feed (the keyboard-on-cold-load fix from 2026-09-04, still good); pressing play then
navigating away via the real breadcrumb link dropped `Player.live` back to 0 (the
poll-leak half of the same fix, still good). Zero console errors at 400/1280/1920/3440.

## Open — the owner decides

- **The critique's 3440 number is unchanged and still open.** `/imagine/paging/critique/`
  ranks this module 17th: 62% of 3440 used, 1028px dead on the right of the third column,
  score 82. Confirmed still true (shot, 2026-09-04). Its proposed alternate — "add a third
  wide column, a transcript or the marks timeline the page already builds" — is a real
  feature, not a width-word change: `fill` was already tried and rejected above with a
  measured shot (2340px video, taller than the viewport), and that verdict still holds, so
  the dead space cannot be closed by widening `panel`/`course`/etc. any further without
  reopening that regression. Wiring `marks/`'s live cue table in as a companion column
  beside `panel` is plausible and stays inside this module's own fence, but it is a genuine
  design decision (which lab gets a permanent neighbour, and whether that neighbour should
  open by default) rather than a caveat-and-ship fix — left open for the same reason the
  four items below are.
- **Should a chapter boundary be a hard stop?** Today the video runs on and the nav follows. A
  course might want it to pause and wait for you.
- **`index: true` on `course/` hides core's row list** because the bar shows the chapters. At
  400 the bar's labels clip to five characters (`OPENI`, `FOOLIS`). The `title` attribute has
  the full name; whether a phone should get the rows back instead is a real question.
- **Should the keyboard transport be `Player`'s rather than `panel/`'s?** It is one table and
  one guarded handler, and four other labs would take it unchanged. It is a page's decision
  today because a page is where the reader's expectations live — but the duplication in
  `marks/` (which binds only `M`) is the first hint that it wants to move.
- **`marks/` writes nothing down.** Reload and the table is gone. `page.store()` is the obvious
  next move and `/imagine/store.js` already has the proposal; it was out of this fence.
