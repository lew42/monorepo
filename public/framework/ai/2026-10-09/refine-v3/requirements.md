# Refine v3: fast clean-first, a session per run, Whisper as a class, the instance explorer

The owner, 2026-10-09 ~18:45 (VS Code tab 7efd07d5), using [Refine](/framework/ext/Refine/) after phase 2 (`VoiceStrip`) landed. Read `ext/Refine/readme.md`, `ext/Refine/doc/vision-2026-10-08.md` (Addenda 4-5) and the code skill's "A system's logs and debug view belong to its class" paragraph first.

## What the owner saw
- "Refining..." with no model, no time estimate, no cost. Then **refine done in 64.5 s** for 125 words: far too slow. Then **the refinement disappeared** (bug: find and fix).
- The raw Whisper text appears fast but has no label. Whisper seems to **amend itself** (earlier text revised); not visible.
- Clarity and weight are 1 and 1 on almost every sentence: the scoring says nothing.
- The Refine System card sits in a narrow right column, not responsive; the class architecture card is good ("what I was looking for"); a Whisper log appeared below it, hand-built on this page.

## Do, in order (commit each step)
1. **Clean first, immediately.** The cleaned text appears within about a second of each Whisper chunk, before any refinement. Measure and show time per stage.
2. **Each LLM run is its own new session** (never reuse an old one), launched through Servex/the SDK, so its model, tokens, cost and duration show on the page and link to its session page. Pick the fastest cheap model that does the job (test Haiku 5.5 vs Sonnet 5.5 low effort on the same 125 words; record the numbers).
3. **Clarity per sentence by a cheap model**: score one sentence at a time with only its immediate context (Haiku). Compare against the current scorer on the same text; keep whichever separates clear from unclear.
4. **Whisper as classes**: one `Whisper` (the server: up/down, model, restarts) and many `WhisperSession`s (one per dictation surface), each with its own log of every request: audio size, how often sent, reply, latency, and every self-amendment of earlier text. Its view lives on the class (`Whisper.View`, `WhisperSession.View`), used by any page; move the hand-built log off `ext/Refine`. Bonus if cheap: a timeline you can replay (what audio was sent when, what came back).
5. **The instance explorer on Refine**: full width, columns that wrap (auto-fit). Labelled sections (Whisper raw · Clean · Refined · Scores), or tabs where there are a handful. Beside or merged with it, the class architecture card as a live **instance explorer**: how many of each instance exist, how they nest, expandable to properties and logs, updating as the owner dictates. Reuse the framework's default instance/debug view (`ux/Content/Object/DefaultView.js` or whatever the code skill names); do not invent a page-specific one.

## Fence
You own `ext/Refine/`, `audio/Transcriber/` (Whisper), `ux/Dictate/VoiceStrip.js`. `mastermind-page-system` owns `core/Page/`; `minion-session-detail-live` owns `ai/AISession/`. Message them before touching their files.

## Rules
Sonnet. Worktree; smoke-test at 400 and 1400; commit each step; `Server/merge.mjs`. Scripts read logs. Land with finish-task: one screen, a screenshot, and the measured times and costs.
