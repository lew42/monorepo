# Chat architecture — one panel, one log, one composer, every host reuses them

Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation. Hosts (the desktop drawer, the mobile sheet, the AI tab) build the same thing: `ChatPanel`, a `View` that wraps `chat()` (the log, [`Chat.js`](../Chat.js)) and `composer()` (the box, mic and Send, [`Composer.js`](../Composer.js)). Start at [`ChatPanel.js`](../ChatPanel.js); the readme lists every file.

## One panel, not hand-wired copies

**Decided:** every host builds `new ChatPanel({ source, deliver })`, so one fix to the panel updates every surface.
**Why:** three hand-wired builds (a turn list, a standalone composer, a bespoke sheet) drifted apart and each needed the same fixes.
**Instead:** each host wires its own log and box. Rejected: a second copy per host, the repeat CLAUDE.md law 6 forbids.
**Detail:** [decisions.md](./decisions.md) (ChatPanel)

## The log draws what it is given

**Decided:** `chat({ source })` reads a plain array of entries and `sync()` draws only the entries not yet drawn. The log keeps no store of its own.
**Why:** the host already owns the data (a session file, a card's chat); a second store would drift from it.
**Instead:** the log owns its own list and is fed by `deliver`. Rejected: two sources of truth for one conversation.
**Detail:** [demo on the page](/framework/ext/Chat/)

## Bubbles merge by sender and time

**Decided:** a message from the same sender within `MERGE_GAP_MS` (8 s) joins the last bubble, as a new paragraph; otherwise it starts a new bubble.
**Why:** a dictated thought arrives as several sentences; one bubble per sentence reads as spam.
**Instead:** one bubble per message. Rejected for the reason above.
**Detail:** [`Chat.js`](../Chat.js) `mergeable()`

## Only the newest 50 are drawn at first

**Decided:** the first draw shows the newest `recent` (50) entries; the rest wait behind "show earlier", 50 at a time.
**Why:** a long session drawn whole made every open slow.
**Instead:** draw everything and virtualise later. Not built: 50 is enough for every host today.
**Detail:** [`Chat.js`](../Chat.js) `chat()`, the `recent` option

## Scroll follows only at the bottom

**Decided:** the log follows new messages only while the reader is at the bottom (within 4 px); scrolled up, it holds still.
**Why:** a log that jumps while someone reads history is unusable.
**Instead:** always scroll to the newest. Rejected for the same reason.
**Detail:** [doc/scroll.md](./scroll.md)

## The box is one textarea and one control row

**Decided:** the composer is a `textarea` that grows to a maximum height and then scrolls, with mic, Send and ⚙ in one row under it.
**Why:** dictated text runs to many sentences; a single-line `<input>` cannot show them.
**Instead:** a single-line input. Rejected for that reason; see [one-input-2026-10-12.md](./one-input-2026-10-12.md).
**Detail:** [decisions.md](./decisions.md) (Unified composer)

## Dictation is a subclass of the Dictate engine

**Decided:** `ComposerMic` extends `Dictate` ([`Mic.js`](../Mic.js)); the mic types into the box, and a duplicate send is dropped.
**Why:** the same words from the mic within `DUP_WINDOW_MS` (4 s) were posted twice, once per trigger path.
**Instead:** the mic writes its own text without the guard. Rejected: that produced the repeated bubbles.
**Detail:** [duplicate-bubbles.md](./duplicate-bubbles.md) (with the proofs in [proof/](./proof/))

## Drill-in lives in the URL hash

**Decided:** a card's sub-conversation opens as `ChatDrill` ([`Drill.js`](../Drill.js)) at `#chat=<session>~<key>`, never in the query string.
**Why:** `?sheet=` belongs to the sheet itself; the hash is free.
**Instead:** a query parameter. Rejected: it collides with the sheet route.
**Detail:** [drill.md](./drill.md)

## A reload waits for the whole path

**Decided:** a reload on a `#chat=` hash waits up to 1.5 s for the full path to exist, then opens the deepest level that does.
**Why:** a refined line can arrive after its card, and opening at once landed one level short.
**Instead:** open immediately. Rejected for that reason.
**Detail:** [decisions.md](./decisions.md) (Drill in)

## Select and rename live in `Chat.js`

**Decided:** a bubble's select and rename are drawn by `chat()`, which reuses only `ux/Rename`'s `rename_options()` (the network call and fixtures).
**Why:** the bubble's DOM exists only inside `Chat.js`; a second render pipeline would be a copy.
**Instead:** mount `ux/Rename`'s own dropdown into a bubble. Rejected: it is a `View` tree, not a bubble node.
**Detail:** [decisions.md](./decisions.md) (Select, Rename)
