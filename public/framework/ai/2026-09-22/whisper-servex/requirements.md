# whisper-servex — does dictation work today, and does the owner's voice reach the log?

Minion: Sonnet, effort high. Session id `aae87ca0-102f-45b2-b923-326d5329caf8`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Private dev-server
port **8095**; private whisper test port **8179** (the owner's real whisper-server is 8178 —
never touch it). Owner's words today: "spawn a minion to look into our Whisper system, and see
if we can get that working with Servex."

## What exists

- `ai/2026-09-19/whisper-local/` — whisper.cpp (cuBLAS) + `large-v3-turbo` installed at
  `%LOCALAPPDATA%\lew42\whisper\`, `whisper-server` on `127.0.0.1:8178`, 76–98 ms per 10 s clip
  on the RTX 4070 SUPER. `ux/Dictate` in the browser talks to it directly.
- `ai/2026-09-19/whisper-autostart/` — `Server/plugins/Whisper.js`: the dev server starts
  `whisper-server` itself; four boot cases (not installed · already running · spawned · skipped
  with `NO_WHISPER=1` or a private port).
- The sibling task `servex-port` is porting that plugin's four cases into Servex as a supervised
  process (`Servex/`), so **do not build the supervisor** — your job is the truth about whether
  the stack works and the missing link: the transcribed text becoming log entries.

## Deliverables

1. **Is it working right now?** In the log, with numbers: is `whisper-server` answering on 8178
   (curl its health/`/inference`); is the model file there and which one; transcribe one real
   clip through it (record none — use any short `.wav` the install ships with, or generate a
   spoken clip with Windows' built-in `System.Speech` synthesizer to a wav, then send it) and
   log the returned text and the time; does `ux/Dictate` on a page load headless without errors
   and reach the server (Playwright, your private server on 8095). If any step fails, fix it if
   the fix is inside `ux/Dictate/**` or `Server/plugins/Whisper.js` (a `Server/` edit means:
   hold, `node --check`, boot your private server and curl it before you release), or say
   exactly what is broken and what it needs.
2. **Voice → log.** Today the transcript appears on screen. Make each finished utterance also
   become one log entry `{at, type: "prompt", by: "owner", text, via: "whisper"}` posted to a
   log endpoint whose URL is one constant in `ux/Dictate`: `POST http://127.0.0.1:8090/log/prompts`
   (Servex's single-writer log, being built by `servex-port` — its shape is `POST /log/<name>`
   with a JSON body), falling back to the dev server's existing append route if Servex is not
   answering (find it — `Server/plugins/AILogs.js` or `Ask.js`; log which). Prove it with a
   headless run that posts one utterance and the line appears in the file; if Servex is not up
   when you test, prove the fallback path and say so.
3. **One page, `ai/2026-09-22/whisper-servex/page.js`:** the stack as a four-box diagram
   (mic → Dictate → whisper-server → log), each box green/red from your measurements, the
   numbers under it, and a "try it" button that runs the synthesized-clip test against 8178 and
   shows the text. Screenshot at 1280 into `shots/`.

## Fence

`ux/Dictate/**`, `Server/plugins/Whisper.js` (only if a fix is needed), your task dir, and
`ai/2026-09-22/page.js` `children:`. Append-only to `.jsonl`. Nothing under `Servex/`.

## Length

Page: one screen. Landing report: eight sentences, the working/not-working verdict first.
