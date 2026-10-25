# Dictation perf: the phone sheet opens in 0.4 s at 4x CPU

Brief: [requirements.md](./requirements.md). Branch `worktree/dictation-perf`, five commits, one per step, biggest saving first. Nothing is merged.

## Before and after

Measured at 4x CPU, 390 px phone, cold cache, a 207-bubble session, Servex and `/api/hitl` stubbed (0 paid calls). Harnesses: `ux/Dictate/test/load.mjs` (3 runs) and `freeze.mjs` (60 s, hand-driven captions and the fake real mic).

| Measure | Before | After |
|---|---|---|
| First bubble painted after tapping ✦ | 8016 / 8159 / 8762 ms | 421 / 387 / 403 ms |
| Sheet visible after the tap | 165 to 184 ms | 161 to 175 ms |
| Bytes loaded on open | 3.55 MB | 3.08 MB |
| Bubbles drawn on open | 207 | 43 (the newest 50 chat lines) |
| Tasks over 50 ms while talking (hand mode, 3 runs) | 14 (longest 81 ms, 783 ms blocked) | 0 / 0 / 0 |
| Tasks over 50 ms while talking (fake mic, 3 runs) | 6 (longest 105 ms, 473 ms blocked) | 0 / 1 (57 ms) / 0 |

Both targets are met: under 0.5 s to open, nothing frozen over 100 ms.

## What each commit did

1. **`anchor()`** (`Widget.js`): asks for an animation frame; the frame reads layout once however many lines were drawn or captions redrawn. Most of the saving: the replay read layout once per drawn line.
2. **`refresh()`** (`Widget.js`): a history replay refreshes the lines once after the batch, not once per line.
3. **`on_level`** (`Dictate.js`): the meter writes (button fill, mic indicator, `on_meter`) happen once per frame with the newest level, as `DictationBar` already did.
4. **History window** (`Widget.js`, `chat.js`, `Session.watch`'s new `on_history`): only the newest 50 chat lines are drawn; "show earlier (N)" draws the previous 50 above without moving the reader. Proof: `test/earlier.mjs` (225 held lines come back in five clicks, in time order, the reader's line did not move).
5. **`Session.watch()`** (`Session.js`): after the first read, a poll asks only for the bytes past the last line (`Range`, one byte early so an idle poll is a 1-byte 206). It was 237 KB every 1.5 s. Proof: `test/watch.mjs` (half-written line, multi-byte text, bad line, a server that ignores `Range`). Docs: `ext/Session/doc/watch.md`.

## Decisions

- **Not done: skipping `anchor()` when the draft's height did not change.** Layout is read inside the frame callback just before paint, so the read adds no extra layout; a height check would not save it. Commit 1 already removes the cost.
- **The poll stays.** The live wire is cut every 30 s and the poll carries the history when a sheet opens, so it was made cheap (a tail read), not removed.
- **`chat.js` was edited though it is outside the stated fence:** it is the only caller that can pass `on_history`; the change is one line.

## Checks

- `flicker`, `reconnect`, `order`, `refresh`, `earlier`, `watch`: pass.
- `stall` (2 failures in the "late" scenario) and `anchor` (1 failure, "no box moved while words streamed in": the drawer feed and first bubble move once each) fail the same way on the untouched `monorepo.localhost`, so they are not from this work. Left for the dictation mastermind.
- `node Server/smoke.mjs` on the worktree: no FAIL.

## Docs updated

`ux/Dictate/doc/voice-assistant.md#nothing-jumps`, `ext/Session/readme.md`, new `ext/Session/doc/watch.md`.

## Known loss

A placement or refinement line in the shown part that points at a bubble still behind "show earlier" is not re-applied when that bubble is drawn.
