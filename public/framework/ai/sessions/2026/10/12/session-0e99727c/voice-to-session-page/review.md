verdict: fix
1. [fix] The brief says the flow "works the same whether the owner dictates in the browser or the app", but only the Refine page posts to `/api/voice`; STATE.md item 9 says the app path is not wired. Either wire it, or show the app's prompts already reach `run_refine` with `session` + `prompt` set (Servex/ext/refine/run.js:228 writes the page only when `id` is set).
2. [fix] "Reproduce first" asks for a recorded audio file fed headless, with each stage's timing in STATE.md. No audio was run, so the Whisper → raw step is never timed (STATE.md item 5). That step is the one most likely to lag on the phone.
3. [fix] The layout check at 400/1200/1920/3440 is a done-when item, but `layout-check.mjs` was not run and the task folder has no `shots/` (STATE.md item 10, `review/` holds only diff.patch). "No horizontal overflow" is not a layout review.
4. [note] VoicePage.js:109/202: a prompt is only dropped from `VoicePage.open` by `done()`, which only `run_refine` calls. If someone dictates and never presses Refine, the prompt and its `lines` stay in memory until Servex restarts, and `GET /api/voice/stream` replays them to every follower. A timeout after the last partial would fix it.
5. [note] Cards are made by code (`Compose.cards`), not written by the refining model as stage 5 of the brief says. The reason and the alternative are recorded in stages/doc/voice-to-page.md, which is reasonable, but it differs from the owner's words, so the try-it doc should say so in one line.
6. [note] Servex.js:53: `POST /api/voice` takes no auth and has CORS open, and it is reachable from the LAN through `<origin>/servex`. Anyone on the network can write voice items onto any session's page.jsonl. The risk is low (data only, 20k cap), but it is a new LAN write path.
7. [note] The phone stream was only proven with Playwright pointing EventSource straight at the private Servex (phone-proof.mjs:381). SSE through the dev proxy at `/servex` (buffering, timeouts) was never exercised, and that is the exact path the phone uses tomorrow.
8. [note] RefineSystem.js `quick()` returns early once a prompt is `done`, so text edited after a Refine does not stream to the page until Refine is pressed again (RefineDemo.js:97 then starts a new prompt id). This is fine, but try-it.md promises raw words "while you speak or type".
9. [note] stages/files.jsonl lists `Stage.js`/`Stage.css` and later marks them `gone`. That is harmless in an append log, but the first two lines point at files that never landed.

## Requirements
- 1 "Raw — Whisper's text, as spoken" — yes — RawStage.js, VoicePage.raw (typed text proven; Whisper text not run)
- 2 "Clean" — yes — CleanStage.js: a mechanical draft first, then the model's version
- 3 "Structure" — yes — StructureStage.js, VoicePage.structured
- 4 "Refined" — yes — RefinedStage.js via Compose.brief, with a Copy button
- 5 "Cards — the refining model writes them onto the page with the page tools" — partly — written with the page tools, but composed by code (finding 5)
- "Which page: every session at /framework/ai/sessions/<id>/" — yes — VoicePage.path, AISessionDetail mounts VoiceFlow
- "same whether … browser or the app" — no — finding 1
- Reproduce first, with timings — partly — /api/refine baseline 6.6 s in STATE.md; no audio run (finding 2)
- Whisper stays up, restarts by itself, page says so in one line — yes — whisper-proof.mjs (crashes:1, about 2 s), Connection.restart_note; reload/reconnect argued, not exercised
- Each stage live via page-tool deltas, streamed, one class per stage — yes — VoicePage queue → page_add/page_set; VoiceFlow > VoicePrompt > 5 VoiceStage subclasses; partials coalesced to 700 ms
- Phone at 400 px from 10.0.0.135, headless — partly — phone-proof.mjs with LAN_HOST; the SSE-through-proxy path was bypassed (finding 7)
- try-it.md linked from the Dictate readme + owner_note needs-you — yes — ux/Dictate/readme.md links it; STATE.md says the note was posted
- Close the transcription `now` loose ends by checking them — yes — loose-ends.md, ten rows with evidence
- Layout check at 4 widths; commit; merge — no — finding 3; branch worktree/voice-session is not yet merged into michael/dev

## Words
- content 1 (plain sentences) — yes — try-it.md reads as steps a newcomer can follow
- content 2 (linked mentions) — yes — readmes link try-it.md and voice-to-page.md as files
- content 3 (short) — yes — stages/readme.md is 11 lines
- content 4 (promises match behaviour) — no — try-it.md "while you speak or type" (finding 8); "five stages" though cards are code-made (finding 5)
