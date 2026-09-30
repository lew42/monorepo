# Decisions

## Select, Rename, ✓/? marks (2026-09-29, `ai/2026-09-29/audio/next-chat-hitl/chat-wire/`)

**What it is:** `readme.md`'s "Select, Rename, ✓/? marks" section is the summary; this
is the how and the trade-offs.

- **Select and rename live in `Chat.js`, not `ChatPanel.js`,** because the DOM they
  need (which bubble, its title node) only exists there — `ChatPanel` hands `chat()`
  two small seams (`on_select`, `rename: {options, on_renamed}`) instead of reaching
  into `chat()`'s own private elements from outside.
- **Rename never rebuilds `ux/Rename`'s dropdown markup** — `chat()` draws its own
  `<select>` (same "pick a name… / keep current / 5 names" shape) because a chat
  bubble is a plain DOM node from `Chat.js`, not a `View` tree `ux/Rename`'s own
  `Rename` class could mount into without a second render pipeline. What IS reused,
  for real, is the only part that matters: `rename_options()` — the network call and
  the fixtures fallback.
- **The renamed piece is the bubble's FIRST piece** (`bubbles.get($b).pieces[0]`) —
  "the heading, or the first line" (requirements.md). A bubble merges several
  messages from the same sender close together (`MERGE_GAP_MS`); renaming always
  targets the line the bubble opened with, never a later merged paragraph.
- **The rename fix line always carries `from: {kind: "owner"}`** — same as
  `ux/Rename`'s own log, which carries no `from` at all. The owner is who renames a
  card, even a card the assistant said.
- **Marks are stored ON THE PIECE** (`piece.mark`), not drawn once and forgotten —
  `piece_node()` renders it every `fill()` (a merge, a fix), so a redraw never loses
  the badge or asks `marks()` again.
- **Left open:** choosing a clarification card's option does not flip its sentence's
  ? back to a ✓ the way `ux/Understand`'s own demo does (`on_chosen`) — that demo
  wires a card straight to its sentence's badge; here the card is a `place` line,
  loaded asynchronously and generically (any `ux/Content` module), with no return
  path back to the piece that asked for it. Worth building once a real caller
  actually needs the loop closed, not guessed at now.
- **Left open:** the "Rename" fix line goes through `this.deliver` when the host gave
  one (a real card, a real session), same as any composer message — but no live
  caller yet reads a `fix: true` line and skips re-asking the assistant for it (only
  `Chat.js`'s own `chat_line()` does, for what's already on screen). A caller with
  its own persisted log needs to treat a `fix` line as "replace, don't re-answer",
  the same way `readme.md`'s "revision line" section already flags for a real
  session file — this is the same shape, applied to a title instead of a sentence.

## ChatPanel (2026-09-29, `ai/2026-09-29/audio/c-chat/`)

**What it is:** `ChatPanel.js`, a `View` subclass wrapping `chat()` (the log) and
`composer()` (the box, the mic, Send) into one class with one view, so any host
builds the exact same chat widget instead of its own hand-wired copy. Demo, v1
next to v2: [`panel/page.js`](../panel/page.js).

**Variable height, pure CSS.** The owner (2026-09-29): "the height should be
variable so that it could start small and grow to a maximum height and then be
scrollable." `.chatbox-panel` in `Chat.css` is a flex column with `max-height:
var(--chatbox-panel-max, 70vh)` and no height of its own; the log inside is the
one child that shrinks (`min-height: 0`), so it is the one that scrolls once
the ceiling is reached. No JS measures anything. A host sets
`--chatbox-panel-max` to change the ceiling (70vh fits a mobile sheet; a host
that is already the drawer's own full height sets `100%`).

**Open: `chatbox-` is not in `css-scopes.txt`.** The prefix was already in wide
use across `Chat.js`/`Composer.js`/`Chat.css` before this task, just never
registered; `css-scopes.txt` is outside this task's fence (`ext/drawer/**` and
`ext/Chat/**` only). Whoever can write that file next: add `chatbox-    ext/Chat`
under the `# ext` block.

**Wired in (phase 2, after `task-mastermind-mobile-nav` merged and the go-ahead
came through):**
- `ext/drawer/tabs/ai.js`'s default `ai()` now builds a `ChatPanel` for both a
  card thread (`source: () => card.chat_entries()`, `answer:` posting through
  `ai2/compose.js`'s `say()`) and a plain page (the panel's own local list,
  seeded from `tabs.thread.history`). The old hand-wired build (a `turn()` list
  plus a standalone `composer()`) is kept, unchanged, as the named export
  `aiV1` — not the default, but one import away.
- `ext/drawer/rail.js`'s new `DrawerRailSheetPanel` is the sheet's own
  `ChatPanel`, the new `DrawerRail.Sheet` default: it starts listening the
  moment it opens (`start_mic()`, from `open()`), and every finished sentence
  still becomes its own visible thing — now a chat bubble, the same
  unification the drawer's AI tab makes, in place of the old bespoke "prompt
  item" cards. The old builds stay reachable: `DrawerRail.SheetV1` (mic-only,
  no links) and the new alias `DrawerRail.SheetLinksV1` (mic-only + the links
  footer — what was the actual outgoing default right before this change).
- `drawer.css` sets `--chatbox-panel-max: calc(100dvh - 9rem)` for the
  drawer's own panel (a percentage doesn't work there — see the rule's own
  comment for why) and `rail.css` gives the sheet's panel `flex: 1 1 auto;
  min-block-size: 0; max-height: none`, so it fills whatever the sheet's own
  `max-block-size: 70vh` leaves after the head and the links footer, rather
  than guessing a number.
- **Known trade, not a bug:** a card CHANGE while the sheet is held open across
  a navigation rebuilds `DrawerRailSheetPanel`'s whole `ChatPanel` (no seam to
  swap only the log's source without a bigger API than the brief asked for),
  which restarts its mic for a beat; `start_mic()` runs again right after every
  rebuild, so the gap is a beat, never a silence.
- **The line minion B (refinement levels) extends:** both new `ChatPanel(...)`
  call sites (`ai.js`'s two branches, `rail.js`'s `sync_card()`) carry a
  one-line `⚠ THE LINE MINION B EXTENDS` comment; `ChatPanel.js`'s own
  `composer({...})` call carries the matching note, since that is the one
  place a `refine:` option would have to reach every host at once.
- **Composer width fix**, found on this task's own demo screenshot
  (`panel-1920-demo4.png`): `.chatbox-compose-input` needed an explicit
  `width: 100%` — `flex: 1` alone left the text box sized to its placeholder,
  not the row, because `.auto`'s `field-sizing: content` (framework.css) sizes
  an `auto`-width axis to its content. `Chat.css` has the full note.
