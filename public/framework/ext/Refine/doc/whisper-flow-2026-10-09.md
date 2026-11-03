# Whisper flow: what actually fails (2026-10-09)

**Short answer: Whisper did not fail. Keep local Whisper.** Of about 145 requests to whisper-server in my measurements, none failed. The "lots of errors" the owner saw on Refine were a page bug that threw after every successful Whisper reply.

## What I measured (a script, not memory)

| Check | Result |
|---|---|
| 26 direct requests (1–14 s clips, plus 6 at once) to `127.0.0.1:8178/inference` | 0 failed; reply in 4–100 ms; header `access-control-allow-origin: *` |
| 8 headless runs of `ext/Refine/test/dictate-flow.mjs` (a real synthesized voice as the fake mic, 15 Whisper requests each) | 0 failed requests, 0 HTTP errors; reply 0.2–0.3 s |
| Servex `server_logs` for whisper-server, today | empty (nothing is logged there) |
| The ErrorLog day file `ai/errors/2026-10-09.jsonl` | 1 line: `Cannot read properties of undefined (reading 'value')`: not Whisper |
| Browser console on the old Refine page | one `TypeError ... reading 'value'` **per spoken sentence** |

## The failure the owner saw

It is HTTP, not the socket, and it was not Whisper. Whisper answered; then `RefineDemo` handed Dictate the raw `<textarea>` element as `$input`. Dictate reads `.el` on what it gets (`push_to_target`), so every settled sentence threw a `TypeError` and never reached the box. The words showed in the grey caption, the box stayed empty, and the console filled with errors: "a lot of errors", one per sentence. Fix: `$input: () => this.$box` (the View). The earlier note `doc/nothing-to-refine-2026-10-09.md` named this cause, but the line on the `michael/dev` branch still had `.el` when this task started; it is fixed now and the headless test fails on the old line.

The "socket" in the old status line was the dev live-reload socket, which has nothing to do with dictation; it is no longer printed.

## What can still go wrong (all of them already say so on screen)

- whisper-server is not running: the page shows `Whisper: error: not reachable`; Dictate says "Whisper has gone quiet".
- The dev server or Servex is down or lagging: `/api/refine` fails, the Refine step shows `error: …` in red. This is the "site breaks" the owner feels; it is not transcription.
- No microphone permission: Mic step red with the browser's reason.

## Recommendation: local Whisper vs a hosted API

**Stay on local Whisper.** Evidence: 0 failures in ~145 requests, 0.2–0.3 s replies, private, free. A hosted API would add a network hop and a cost for no failure it would fix; the failure was in our page. One honest gap: nothing records Whisper failures over time, so this is a measurement of today, not a month. The cheap next step, if it ever fails for real, is to write each failed request to ErrorLog (one line in `Dictate.transcribe`), and only then weigh a hosted fallback (used only when `127.0.0.1:8178` does not answer).
