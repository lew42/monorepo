# The mobile dictation sheet: reconnect, one strong layout, screenshots at every step

Budget: $10. Opus, medium effort (the owner, 19:12: no Fable; watch usage; Sonnet minions for mechanical pieces). Parent: `vscode-mastermind` (the owner's VS Code tab), who tails your `session.jsonl`: log with the `log` tool, not chat. Own worktree (`worktree/mobile-sheet`); commit each working step; `node Server/merge.mjs`; the main site is production (`hold.mjs` around live writes); do not restart Servex or the dev server (say which one is needed).

## The owner's ask (2026-10-20, 19:35; essence in [ux/Dictate/doc/owner-2026-10-20-dictation-first.md](/framework/ux/Dictate/doc/owner-2026-10-20-dictation-first.md), last section; words in the tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`)

1. **Reconnect (priority one).** The voice session on the site stops reconnecting. Find why (`ux/Dictate/Connection.js`, the socket and `ext/Session` routes, Servex restarts today at 18:33, 18:54, 19:13, 19:32 are a likely cause: the sheet must survive one). The button attempts a reconnect; every failure writes a line to a system log the owner can open (one existing log, never a new system: the session's own record, or the Whisper bucket, or `WhisperLog`; decide and log the decision with the alternative).
2. **The UI, proven by screenshots.** Headless at 400 px: open the ✦ sheet from the bottom nav (first click), shot; then drag the top edge up 40 px at a time, a shot at every step, to the snap-open full page; keep the series in your task folder (`shots/sheet-000.png` …) and on one page the owner can scroll (`surfaces/` already shows every surface; add the series there, never a second page). This series is the before. The same series after is the proof.
3. **One strong layout, no layout switching.** Three rows: a header (sticky), a full-width scrollable chat well, a footer with the mic control (sticky), compact. The well has left and right padding only, no top or bottom padding (bubbles scroll under the header and footer), no border radius, and its parent has no padding. No grey down-arrow button whose purpose is unknown: either it has a clear job and looks like it, or it goes. The page behind the sheet must stay visible. The snap-open at ~90% stays (the owner likes it). A one-line compact mode remains possible; the full wall of text is the mode now.
4. **The earlier instructions.** The owner dictated the chat-well instructions into a voice session a day or two ago: read `ux/Dictate/ai/v-*.jsonl` (pre-10-19 voice sessions, flat files) and `ai/sessions/2026/10/19/` and `10/20/v-4lwslx3/` (today's) for them; honour them, do not re-ask.

## What exists (reuse)

`ext/drawer/rail.js` (the sheet), `ux/Dictate/chat.js` (the one chat every surface mounts), `ux/Dictate/Widget.js`, `Connection.js`, `ext/Chat/Mic.js`; the surfaces page `ux/Dictate/surfaces/` and `doc/surfaces.md`; past asks: `ux/Dictate/doc/asks.md` (19 clusters; tick what you land), `doc/widget.md`, `doc/mobile-socket-2026-10-09.md`, `doc/latency.md`; headless proof scripts: `ux/Dictate/test/`, `audio/Whisper/doc/raw-log-proof.mjs`.

## Done when

- [ ] Reconnect works after a Servex restart (prove it: restart nothing yourself; simulate by closing the socket) and failures are in a log the owner can open.
- [ ] The after series at every 40 px shows one layout that only grows; the well rule holds; the page behind stays visible; 400 and 1200 checked with `check_page`.
- [ ] `doc/asks.md` ticked; the Dictate readme says what the sheet is and where its log is (law 9).
- [ ] Merged; `finish-task` in your own `session.jsonl`, one screen, check marks, the before and after shots side by side.
