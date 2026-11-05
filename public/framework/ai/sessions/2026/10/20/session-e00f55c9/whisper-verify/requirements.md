# Verify, with evidence: which engine made the phone's live transcript? (read-only)

**The owner asks (2026-11-01, relayed by the web voice session):**
- Are the live transcriptions on the phone, through `https://monorepo.lew42.com`, actually coming from Whisper (`whisper-server`), or from Chrome's built-in speech API (Google) through the fallback?
- Which engine produced the text during the Servex restart at 17:37 local time, while Servex was down but dictation kept working?
- Does the engine label in the Dictate widget (`ux-dictate-engine`) show it?
- Has it maybe never used Whisper on the phone?

**Already checked by the tab:** exactly one `whisper-server.exe` is running (pid 21324, started 10-20). It's separate from Servex, so it survives a Servex restart with no duplicates.

## Do (read-only)

1. **Read the engine choice** in `ux/Dictate` (`Dictate.js`, `shared_detect_engine`): how it picks Whisper vs the browser's speech API, and how audio reaches whisper-server from a public host (the dev server's proxy?).
2. **Evidence from logs:**
   - whisper-server's log in Servex's logs folder (`whisper.err`), and the dev server's log (`monorepo.out`, `monorepo.jsonl`): requests from the phone through the gateway between 17:00 and 17:45, especially around 17:37;
   - the voice session's own `session.jsonl` (session `v-u48msei`, under `public/framework/ai/sessions/2026/11/01/`), for engine marks on the transcribed lines.
3. **If needed,** load the page headless through the public URL with the key cookie, in a mobile viewport, and read the engine label.

## Write

`answer.md` here: one line each for whisper or browser, during the restart, the label, and "ever used Whisper on the phone", each with its evidence (a log line, a file:line). Commit by path. No code changes, no `python`. **Budget:** about $5.
