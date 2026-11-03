# Dictation: Reconnect that says what it does, refresh-then-dictate works, every error caught, a compact Debug tab

Budget: $25. Opus, high effort. Load the `minion` skill first. Owner's words: Part 3 and Part 7 of [../requirements.md](../requirements.md) (read those two parts only). Card: `/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/`. Your parent is `mastermind-dictation-2`.

Start from [ux/Dictate/doc/debug-tab.md](/framework/ux/Dictate/doc/debug-tab.md) and [doc/flicker.md](/framework/ux/Dictate/doc/flicker.md) (what the last builder did), then `ux/Dictate/chat.js`, `ux/Dictate/DictateHealth.js`, `ux/Dictate/DictateDebug.js`, `ux/Dictate/Widget.js`, `ext/drawer/Sheet.js`, `ext/Chat/Mic.js`, `dev/Socket/Socket.js`. Headless harnesses with a fake mic and a stubbed Servex are in `ux/Dictate/test/` (`stall.mjs`, `debug-tab.mjs`, `reconnect.mjs`, `flicker.mjs`): extend them, don't start over.

Work in a worktree (`node Server/worktree-up.mjs dictation-solid`, branch `task/dictation-solid`). Each step: build, prove, `node Server/smoke.mjs <worktree>` with no FAIL, commit, then merge it with `node Server/merge.mjs` (step 4 needs a review report first: `node Server/review.mjs`). One step at a time, merged before the next, so the owner can try each one live. After each merge, log one `show:` line on your task and message your parent (`send_to_agent mastermind-dictation-2`) with one sentence: what is live and how to try it.

## Steps, in order

1. **Reconnect.** Find exactly what the sheet's Reconnect button reconnects (today: `chat.js` `link` state, Session.stream's live wire to Servex; `Sheet.js:263` and `:407`). Find why it shows seemingly at random (a short blip? a socket that flaps during a dev reload?) and why the last press seemed to crash the page; reproduce both headless. Then: the button names what it reconnects and why ("Servex link down for 12 s: <reason> · Reconnect"), shows only when that link has really been down past a grace period, and a press can never throw or double-open the stream.
2. **Refresh, then dictate.** This is the owner's typical failure: refresh the page, press the mic, nothing works. The "This page is out of date — reload" pill is ours (`dev/Socket/Socket.js` `mark_stale`). Reproduce headless: open the sheet, dictate, reload (also: reload while the pill shows), dictate again. Find why it is dead (mic not released, a stale session or socket, a reload deferred while dictating, the mic not starting) and fix it. Also "the mic sometimes won't start": whatever the cause, the mic button says why. The proof is a test (`test/refresh.mjs`) that passes 5 runs in a row.
3. **Every error caught, deliberately.** Each stage (mic, Whisper, sentence, send, agent reply, live wire, render) catches its errors and either shows them (a red light and a log line) or ignores them on purpose, with a one-line comment saying why. A `window` `error` / `unhandledrejection` lands in the Debug log too. Nothing fails silently.
4. **A compact Debug tab** (Part 7 item 3, plus Part 3 item 6). A row of lights at the top, one per stage, green / amber / red, so "all green = should work"; hover or tap shows its last error. Under it, a compact live log: one short line per record with a timestamp and a stage tag, the raw data one click down (Whisper's raw text, each send, each reply, each error). Not paragraphs. A resize handle between the Debug panel and the chat (a sheet within a sheet), so they no longer fight for space; its height survives a reload. Use the existing `DictateHealth` state; don't build a second pipeline. Load the `page`, `layout` and `ui` skills before this step. Shots at 390 and 1920 into `solid/shots/`.

Leave alone: the order in which bubbles appear (another agent, `order/`, is finding that at the data; don't change placement or bubble ordering code beyond what steps 1–4 need); the sheet's load speed (`load-perf/`). If your fix needs those files, say so to your parent first.

## Never

Never kill or restart the dev server or Servex, never drive the owner's tabs (headless only), never stash (diff instead). Any whisper-server a test of yours starts is stopped by that test; reuse the one on port 8178 when you can.

## Done when

Steps 1–4 merged to michael/dev, each with its proof; `ux/Dictate/doc/debug-tab.md` updated (the lights, the log, the handle, what Reconnect does); findings as `log` lines in `solid/task.jsonl`; the landing line links the shots.
