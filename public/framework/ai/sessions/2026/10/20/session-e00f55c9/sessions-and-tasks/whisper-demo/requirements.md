# Whisper: a demo that shows the raw stream as objects, basics first, drill down

Budget: $8. Opus, medium effort (the owner, 19:12: no Fable; watch usage; one Sonnet minion at most for a mechanical piece). Parent: `vscode-mastermind` (the owner's VS Code tab), who tails your `session.jsonl`: log with the `log` tool, not chat. Own worktree (`worktree/whisper-demo`); commit each working step; `node Server/merge.mjs`; do not restart Servex or the dev server (say if one is needed).

## The owner's ask (2026-10-20, 19:12; words in the tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`, the last line)

- "If I want to see raw Whisper data, I should go to the Whisper class." The demo on [/framework/audio/Whisper/](/framework/audio/Whisper/) shows **every Whisper data point as it comes in**, as an object-oriented log: a sequential, time-based list of messages (flat; hierarchy only if it helps), **basics first, drill down** into the detail. Not an excessive dump of metadata: "I want to know how it works." In particular: how a reply amends itself and then finalizes (interim vs final), made visible and explained.
- **Layout:** a scrollable log with a sticky header (the controls) and a sticky footer, and maybe tabs inside the demo. An inline minimal demo on the page, with a **maximize** to a full-screen takeover of the same view. The demo stage's responsive viewer is not wanted here ("it's not about the responsive UI"). The site's top-tab navigation nests badly; do not restructure it ("we'll fix that later").
- **Cross-link:** everything discoverable; the framework AI system links to the Whisper class (one line in `public/framework/ai/readme.md`'s index of systems, and from `ux/Dictate`'s readme if it is not there).
- Every object demoed shows its object-oriented structure (CLAUDE.md "Show the class"): the class card beside the live instance.

## What exists (reuse; law 6)

- `audio/Whisper/Whisper.js` (`class Whisper`, `Whisper.View`, `Whisper.shared`), `WhisperSession.js` (`record(line)`), `WhisperLog.js` + `WhisperLogRows.js` (the numbered log table that tails `ai/whisper/<date>.jsonl` with `JSONL.live()`; `server interim|final` lines carry the WHOLE server answer in `server`); the child page `log/`.
- The raw replies today go to Servex's single-writer `whisper-raw` log (`Dictate.log_raw`, `POST /log/whisper-raw`, read with `GET /log/whisper-raw?n=50` on `127.0.0.1:8090`); that file is outside the repo, so `live()` cannot tail it. The day file in the repo is written only by the Refine demo (`doc/raw-log.md`). Two logs, two places: pick **one** store the demo tails and the surfaces write (the repo day file through `WhisperLog`, until the voice session's own record takes it: the owner's direction in `audio/Whisper/readme.md`, which waits on `core/Item/Dated` slice 2). Record the choice as a `decision` line with the alternative.
- `audio/Transcriber/Whisper.js`: `on_partial` (ephemeral guess) vs `on_final` (committed); the doc `audio/Transcriber/doc/streaming.md`. `ux/Content/Object/Inspect.js` renders any object's structure as a card. Mic and audio: `ux/Dictate/Dictate.js`, `ext/Mic`.

## Do

1. Read the readmes root → `audio/` → `audio/Whisper/` and the files above; write the class architecture first (which class is the demo view, what it extends, what it composes, who feeds it) at the top of `audio/Whisper/doc/demo.md`, then build.
2. The demo on the Whisper page: a mic button (and a "replay the last session" button so the owner can watch without talking), the live log (one row per Whisper event, basics: time, kind interim/final, the text; click a row to drill into the whole server answer: segments, probabilities, latency), the amend-then-final story visible (an interim row that a final supersedes is marked so). Sticky header/footer, scrollable middle, inline + maximize. No demo stage.
3. One store for the raw lines (above); the chat composer, voice strip and widget write to it too, so dictation on any surface shows up here.
4. Links: `ai/readme.md` system index line; `ux/Dictate/readme.md`; the Whisper readme says what the demo shows and where the data lives (law 9: exact on-disk structure, which writer, which class reads).
5. Proof: `check_page` at 400 and 1200 at least; a headless run with the fake mic (`doc/raw-log-proof.mjs` shows how) that produces rows; shots in your task folder.

## Done when

- [ ] The page shows the live object log for a real dictation, basics first, drill down, interim → final visible.
- [ ] Maximize works; no demo stage.
- [ ] One raw store, every surface writes it; docs and links as above.
- [ ] Merged; `finish-task` in your own `session.jsonl`, one screen, check marks.
