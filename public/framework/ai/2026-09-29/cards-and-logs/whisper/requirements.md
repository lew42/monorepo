# Minion brief: the Whisper transcription debug view, as a log

Parent: task-mastermind-cards-and-logs. Owner's words: `../owner-words.md`, first section ("We wanna have access to the raw ... whisper output, and ... whatever kind of local resolution process happens, we might want to see that so that ... reading the actual log file for the whisper process should be relatively straightforward").

## Fixes to what you already built (card/log/) first
a. Log lines inside a card are spaced like paragraphs (`.card`'s `--gap` between children, ~20px); a log wants them tight: lines at ~0.2em, groups at the gap. Scope it to your own `log-` classes.
b. The group toggle reads as a grey button; make it a plain heading-weight summary (a ▸/▾ caret, the label, and a muted count and duration, e.g. "increment() · 2 lines · 3 ms").
c. Register `log-` in `public/framework/styles/css-scopes.txt` (one line, `log-  core/Page/card/log`) — now in your fence.

## The debug view: `card/log/whisper/` (new page, a child of card/log)
Fence: `public/framework/core/Page/card/log/` (incl. `whisper/`) + that one css-scopes line. READ-ONLY for `public/framework/audio/**` and `ux/Dictate/**` (another task owns them): wrap from outside, never edit them.
1. Run a real `Transcriber.Whisper` (`/framework/audio/Transcriber/index.js`) against a CLIP, no mic needed: a small `ClipMic` in your folder that plays `/framework/ai/recordings/jfk.wav` (and a picker for `just_a_test.wav`, `ai/2026-09-22/whisper-servex/clip.wav`) in real time into the same interface Whisper reads (`snapshot() cut() cut_at(n) loudness(samples, floor) wav(samples) rate()` — read `audio/MicStream` for the exact shape and reuse its code by import where you can). Plus a "Use the mic" button with a real MicStream.
2. `Logger.wrap` the instance's `tick`, `transcribe`, `commit_all`, and hook `note_final`/`note_partial`, so each TICK is one group showing: seconds of audio sent, the raw Whisper text, the previous tail, how many words agreed, what COMMITTED (highlighted), the new tail, the ms the request took, and a forced commit (`window_s`) marked as a seam. Skipped ticks (in flight / not loud enough) are one muted line, not a group.
3. Above the log: the running committed transcript, with each commit's seam visible (a thin marker between commits); clicking a seam scrolls to the tick that made it.
4. "Download JSONL" (the `Logger.JSONL` output) and "Load JSONL" (read a saved run back into the same view) — so a run can be kept and compared.
5. Whisper-server is supervised by Servex (`default_whisper_url()` in Whisper.js). If it doesn't answer, the page says so in one sentence, no console error.
6. Route it: `card/log/page.js` children gains `whisper`; the page's title "Whisper debug log", icon, one-line description. Readme + one doc (`card/log/whisper/readme.md`).
7. Prove it: run jfk.wav through headless (Playwright with `--use-fake-ui-for-media-stream` if the mic path needs it; windowsHide; stop what you start), screenshot at 1920 and 400 with at least 5 ticks visible, zero console errors. Commit by exact path.

Log in `ai/2026-09-29/cards-and-logs/whisper/task.jsonl` (this folder). Budget ~$4.
