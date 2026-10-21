# The ✦ sheet is a page

On a phone, the ✦ sheet can be dragged from part of the screen up to all of it. At the top it stops being a panel over the page and becomes a page of its own. It gets its own url, and the phone's own back button steps it down. (The owner, 2026-09-30: "as I swipe this thing up… all the way at the top, it's almost like we've just navigated to this page… the user's operating system level back button should always work.")

**No separate ‹ Back button in the head** (voice-sheet-header, 2026-10-01 — the owner: "I don't know if we need a back button… we have the X, the X makes much more sense to me"). The ✕ already closes the sheet all the way, from any height including full screen (`close()`, `rail.js`), so a second button doing almost the same thing was one control too many. Only the phone's own hardware back button steps a full sheet down to "open" first, one state at a time.

Screenshots of every step: [Mobile bottom rail](/framework/ext/drawer/rail/).

## One layout, opened in place, and the reconnect (2026-10-20)

**What the owner sees now.** ✦ opens the sheet over the page, and the page stays visible above it. The sheet is three rows at every height: the head (AI ▾, New session, ✕), the chat well, and the mic footer. Dragging the top edge only changes the height: the well grows or shrinks, nothing swaps. At 90% it snaps open to the full screen. Dragged down to the bottom it is the compact strip: the same head and footer, with the well at 0 px. The 40 px series, before and after: [Voice and chat surfaces](/framework/ux/Dictate/surfaces/#the-phone-sheet-step-by-step).

- **The well:** full width, padding left and right only, no top or bottom padding (bubbles scroll under the head and the footer), square, in an unpadded parent (`rail.css`, "FULL-WIDTH CHAT"). The owner's words, 10-19 and 10-20: [asks.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/well-asks/asks.md).
- **No unexplained arrows.** The strip's ⌃ and ▾ buttons are gone (drag the edge instead). The chat's jump button says its job: **↓ Newest**, a pill stuck to the well's bottom edge (`ext/Chat`, `sticky_scroll()`).
- **Opened in place.** On the phone, ✦ no longer routes to `<path>/ai/`: that page replaced the page behind with an empty "The chat is in the sheet" page. The size is in `history.state`, so back still steps it down. A link or a reload of `<path>/ai/` still opens the sheet. The alternative, not built: keep the route and draw the page it is about behind it.
- **First click opens the three rows** at the remembered height (60% the first time), not the one-line strip: the full wall of text is the mode while we debug.

**Why it stopped reconnecting.** On the phone, Servex is reached through the dev server's `/servex` proxy. While Servex restarts, the proxy answers **502**, and a browser `EventSource` that gets a non-200 answer closes for good. On localhost the connection is simply refused, which the browser does retry, so it only failed on the phone. Now `Session.stream()` (`ext/Session`) reopens itself, 1 s then doubling up to 15 s, and the sheet's head shows a **Reconnect** button while the wire is down (press it to try at once). Proof without restarting anything: `ux/Dictate/test/reconnect.mjs` answers the stream with 502 for a few seconds and checks the button, the automatic reopen, and the log lines (5/5 pass).

### The log

Every failure is one line in the **Whisper bucket**, `ai/whisper/bucket.jsonl`, with `src: "connection"`: `lost`, `retry failed`, `reconnect pressed`, `reconnected` (with how long it was down), and `say failed` when a sentence could not be sent. Open it at [the Whisper log](/framework/audio/Whisper/log/). Decision: this bucket, because it is written through the dev server, which is up exactly when Servex is down. The alternative was the voice session's own record, but Servex is its only writer, and Servex is the thing that is down.

## The url: `<path>/ai/` (2026-10-17, sheet step 5)

| State | Url | What shows |
|---|---|---|
| closed | `/framework/ext/drawer/` | the bottom rail only |
| open (strip, split or full) | `/framework/ext/drawer/ai/` | the sheet, about that page; the size is in `history.state`, not the url |
| open on a view | `/framework/ext/drawer/ai/dictation/` | the same, on that view (chat, live, sessions, dictation, settings) |

- `<path>/ai/` is an [`AIPage`](../AIPage.js) (`class AIPage extends Page`). `Page.child()` mints one for any page with no real `ai/` page of its own. A real one wins: on `/framework/`, ✦ opens the sheet in place, because `/framework/ai/` is the AI system.
- Above 52em the `AIPage` shows in the page (the chat and its views). Below it, the page is hidden and the sheet shows it, so the page it is about stays behind.
- (Until 2026-10-20; on the phone ✦ now opens in place, see above.) ✦ goes to `<path>/ai/` at the strip. Each step up adds a history entry with the same url, so back steps down one size, then closes. A reload or a link lands at split, with `<path>` put underneath, so back closes it.
- Old links are rewritten once with `replaceState`: `?sheet=open` becomes `<path>/ai/`, and `?drawer=dictation` becomes `<path>/ai/dictation/` (`AIPage.old_link()`).
- ⚠ A page that writes `history.replaceState(null, …)` wipes the sheet's size. Pass `history.state` instead (the Dictate playground did this until 2026-10-17).

## One chat, one feed (2026-10-17)

The sheet, the dock's AI tab and the routed `AIPage` all show the same conversation, so only one of them mounts it: `AIPage.holder()` answers `"sheet"` (below 52em), `"dock"` (the AI tab is open) or `"page"`. The chat view of `AIPage` mounts only as the page holder and otherwise shows a one-line pointer; a window crossing 52em hands the chat over (`Sheet.Panel.release()` gives back the chat, the feed and the dictation bars; the page mounts or lets go). `Sheet.Dock.start()` does not auto-open the dock while an `AIPage` is showing. `tabs/ai.js` disposes the feed and the box with its chat, tells the others when it mounts (`drawer-chat`), and `AIPage` points to the dock when ✦ opens it after the page mounted, taking the chat back when the dock shuts. Before this, the hidden page on a phone mounted a second chat and feed (2 and 2), and `<path>/ai/` at 1920 px mounted one in the page and one in the dock. Proof: `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-double-mount/probe.mjs`.

## The desktop dock (2026-10-17, sheet step 6)

Above 52em the AI is the right drawer (`drawer(fn)` filled by the `DrawerTabs`), which pushes the page instead of covering it. `Sheet.Dock` opens it by default at 1920 px and wider; ✕ shuts it and that is remembered (`lew42-sheet-dock-shut`), and ✦ opens it again and forgets. Below 1920 it starts shut and ✦ opens it. `drawer(fn)` stays the plain right-hand container any module can fill.

## The live space: `AIFeed` (2026-10-17, sheet step 7)

[`AIFeed`](../AIFeed.js) (`class AIFeed extends View`) streams the page's own `ai/log.jsonl` with `live()` (never a timed refresh) and puts each event (a task opened, a decision, a log line) as a quiet one-line row in the chat's own bubble column, so the chat and the page's events read as one stream, newest at the bottom. When the chat opens, the last five events sit at the top. The phone's sheet and the desktop AI tab both use it, and the sheet follows the page when you navigate. It also streams the page's own `ai/chat.jsonl`, where the page's pair answers (`page_reply`), shown as ↩ rows. There is no All / Chat / Live switch yet.

## Page hand-off (2026-10-17, sheet step 8)

There is one conversation (the voice session's smart assistant), and it knows the page each line was said on. "File a task about this page" or "ask this page's expert" goes to that page's own `Layers` pair with `ask_manager({card: <page path>, text})`, and the assistant writes the task line into the page's folder with `dir_log` (`task`, event `opened`). The feed shows both: the task line from `ai/log.jsonl`, and the pair's answer from `ai/chat.jsonl`. The rule is in `Servex/agents/session-smart.md` (4b), which is read at every spawn, so no Servex restart. The alternative, a This page / Everywhere switch with two conversations, was not taken.

## Proven end to end (2026-10-17)

A real headless run at 400 on `/framework/ext/drawer/ai/`: a real voice session, real Whisper, a speech-synthesised file as the fake mic ("Please file a task for this page." / a fresh second sentence each run). Seconds from the last sentence landing in the session file: the voice assistant's `place` line (a card) **4.7 s**; the **task folder** in `ext/drawer/tasks/` **7.9 s**; the `task` line in `ai/log.jsonl` and the feed row in the sheet **9.2 s**. The task's first line is written by the item tool, with the session file as its `source`. This needed one edit outside the sheet's code: rule 4b of `Servex/agents/session-smart.md` now makes the task through the item tool and still writes the `dir_log` line, because the item tool writes nothing to the feed's file ([edit-session-smart.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-handoff-proof/edit-session-smart.md)). Servex reads that role text at every spawn, so no restart was needed. The run before the edit made no folder (5.9 s to the log line and feed row only). The proof's second sentence is new each run because the assistant rightly answers "already filed" to a repeat of an open task. Also found: `/framework/core/Page/ai/` is a real page (the page-based AI system), so the sheet does not open on it. Run it again: `node public/framework/ux/Dictate/test/handoff.mjs http://monorepo.localhost <shots dir>` (paid: a few cents of agent turns; shots are not committed). Task: [sheet-handoff-proof](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-handoff-proof/).

## Before 2026-10-17: the `?sheet=` url (kept for history)


| State | Url | What shows |
|---|---|---|
| closed | `/framework/` | the bottom rail only |
| open | `/framework/?sheet=open` | the sheet over part of the screen, at the height you last left it |
| full | `/framework/?sheet=full` | the sheet is the whole screen |

Going **up** a state adds a history entry: tapping ✦ (closed → open), or letting go of a drag near the top (open → full). Going **down** a state goes back through those same entries: the phone's back (one state at a time), ✕ (all the way to closed, from any height), or letting go of a drag near the bottom. So the phone's back button always steps the sheet down one state, and it never leaves the site while the sheet is showing.

A reload or a shared link at `?sheet=full` opens the sheet at full height, and first rebuilds the two entries under it (closed, then open). The phone's back still steps down twice before it would leave. A sheet opened from the url starts **quiet**: the microphone waits for a tap, because nobody asked it to listen.

## The drag

Letting go settles the sheet by where it was let go, through `Sheet.Size.settle()` (2026-10-16; it replaced `full_at` 85% and `close_at` 28%). At 90% of the screen or more, it goes full. Under half the strip (50 px), it closes. Under about halfway from the strip to 30% of the screen, it is the strip (110 px since 2026-10-20: the head plus the mic footer). Anywhere else it is split at the height you let go, and that height is remembered (kept between 30% and 88%). The numbers are static fields on `Sheet.Size`.

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
- **Nesting a sheet inside this sheet doesn't work — but giving a bar inside it its own independent height does.** `DrawerRailSheetV1` is `position: fixed`, which always measures from the real screen's edge, never from its own DOM parent — a second instance put inside the first would float on top of it, not live inside it. The actual mechanism (a plain box, `ext/grip`'s y-axis handle, one CSS height variable) nests fine, because `grip()` only ever reads its own immediate parent's edge — a live, draggable proof of both halves: [nested-sheet-example](/framework/ai/sessions/2026/10/01/nested-sheet-example/nested-sheet-example/).
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
