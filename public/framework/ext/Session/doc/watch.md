# `watch()`: how the session file is followed

`watch(file, on_line, { every, on_status, on_history })` in `Session.js` polls the session's `session.jsonl` and hands each line, once, to `on_line`. The live wire (`stream()`) is the fast path; the poll is the safety net and the way history arrives when a sheet opens, so it cannot be dropped (the wire is cut every 30 s by the LAN proxy).

## What a poll costs

- **First read:** the whole file (a long session is 200+ KB).
- **Every later poll:** only the bytes after the last line handled. The request is `Range: bytes=<offset - 1>-`, one byte early on purpose: an idle poll is then a 1-byte `206`, never a `416` (which Chrome writes to the console on every poll). The extra byte is the newline before the new part and is dropped.
- A server that ignores `Range` answers `200` with the whole file; `watch()` cuts the new part from it (`bytes.subarray(offset)`), so it works anywhere, only without the saving. The static production site and the dev server both honour `Range`.
- `offset` counts bytes of lines already handled, so multi-byte text is safe. A half-written last line is not counted: the next poll starts before it. A bad line is reported once (`bad_line`) and counted.
- A `416` (the file became shorter than `offset`) is treated as "nothing new", as a shorter file always was.

Before 2026-10-25 every poll downloaded and re-parsed the whole file: on a 207-bubble session that was 237 KB every 1.5 s.

## `on_history(lines)`

Called once, with all lines of the first read (parsed), and returns the lines to draw now. The phone sheet (`ux/Dictate/chat.js`) uses it to keep all but the newest 50 chat lines back behind a "show earlier (N)" button (`Widget.Thread.hold_history()`); the chat is not slowed by a long past. Return nothing to draw everything.

Proofs: `ux/Dictate/test/watch.mjs` (tailing, half-written line, multi-byte, with and without `Range`), `test/earlier.mjs` (the button).
