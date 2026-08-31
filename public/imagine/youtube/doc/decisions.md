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
  five original labs are byte-for-byte unchanged in behaviour. [`cues.md`](./cues.md)
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
every cue, which fired three `router.go()`s racing each other. [`cues.md`](/imagine/youtube/doc/cues.md).

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
2. **The getters answer stale after a setter.** [`api.md`](/imagine/youtube/doc/api.md) — the
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
  [`marks.md`](./marks.md) says why the Data API is still not the answer for a static site.

## Open — the owner decides

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
