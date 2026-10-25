# Dictation: open the sheet in under half a second and stop the freezes

Budget: $10. Sonnet, high effort. Load the `minion` skill first, then `code`. Owner's words: Part 3 item 1 and Part 7 item 2 of [../requirements.md](../requirements.md). Your parent is `mastermind-dictation-2`. Card: `/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/`.

**Dispatch after `solid/` has merged** (it edits the same files). Start from current `michael/dev`.

## The measurements (read first)

[../load-perf/report.md](../load-perf/report.md) has every number, with file:line. Its harnesses `load.mjs` and `freeze.mjs` are in that folder: copy them into `ux/Dictate/test/` as `load.mjs` and `freeze.mjs` so anyone can re-run them, and pass the worktree's own URL (from `.worktrees.json`), never `monorepo.localhost`, which is the main tree.

Before (median of 3, 390 px, cold): first bubble 1.4 s at 1x, 7.2 s at 4x CPU. Longest freeze while dictating: 264 ms at 4x, 22 tasks over 50 ms per minute.

## Do, one commit each, in this order (largest saving first)

1. `ux/Dictate/Widget.js:250` `anchor()`: at most once per animation frame, never during a history replay, and skipped when the draft's height did not change. It covers both the load and the caption redraws.
2. `Widget.js:319` `refresh()`: run once after the replay batch, not per line.
3. `ux/Dictate/Dictate.js:424-431` `on_level`: store the level and write the styles once per frame, as `DictationBar.js:70` already does.
4. Draw only the newest 50 bubbles on open, as `ext/Chat/Chat.js:335` (`recent = 50`) does, with an "earlier" control for the rest. Reuse Chat.js's way of doing it if it fits.
5. `ext/Session/Session.js:203` `watch()` re-downloads the whole file every 1.5 s. Either fetch only the bytes after `seen`, or (better, "stream, don't poll") check whether the session's SSE stream already carries what `watch()` polls for. If it does, drop the poll.

(The `mark()` replay calls are fixed by `solid/`; check they stay fixed.)

## Done when

- Both harnesses re-run 3 times with the same settings show **first bubble under 0.5 s at 4x** and **no freeze over 100 ms at 4x**, or the numbers say why not.
- `ux/Dictate/test/flicker.mjs`, `stall.mjs`, `reconnect.mjs` and `order.mjs` still pass against your worktree.
- `node Server/smoke.mjs <worktree>` shows no FAIL.
- `ux/Dictate/doc/voice-assistant.md#nothing-jumps` and the `ext/Session` readme (on `watch()`) say what the code now does.

Deliverable: `perf/report.md`, one screen with a before/after table. Findings go as `log` lines in `perf/session.jsonl`. Work in a worktree (`node Server/worktree-up.mjs dictation-perf`), and don't merge: message your parent in two sentences when it is ready. Stub `/api/hitl` in every run; the first probe sent 531 real paid calls. Never kill or restart the dev server or Servex, never drive the owner's tabs, never stash.
