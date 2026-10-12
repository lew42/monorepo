# Voice to session page, in real time (mastermind brief)

**Owner (2026-10-12):** the pipeline must work end to end, live, and from the phone: Whisper keeps working → raw text on screen → the clean transcription and its structure → the refined prompt → organised and presented as cards. The refining LLM writes those cards with the page tools onto the page of the session being talked to (every session has a page at `/framework/ai/sessions/<id>/`; by default an agent works on its own page), whether the owner dictates in the browser or the app. "That's the kind of feedback loop that I'd like." The owner will test it tomorrow on the phone.

**What exists (read STATE/reports first, do not rebuild):** `ai/2026-10-09/refine-dictate-ui/` (VoiceStrip, phase-2 report, mobile-socket answer), `ux/Dictate/doc/voice-architecture.md`, `ext/Refine`, Whisper server under Servex, the task-audit's transcription loose ends (`ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task/by-system.md`, "Transcription and refinement": 10 `now` rows, Haiku-labelled, about 58% reliable). Page tools: `Servex/agents/page_tools.js`; the AI-facing page model is being written by @mastermind-page-ai-api (`core/Page/doc/ai-api.md`); use its tools, ask it, don't fork them.

## Done when (tick each with proof)
- [ ] **Reproduce first** on current `michael/dev`: dictate (a recorded audio file fed headless is fine) and record which stage breaks or lags, with timings, in `STATE.md`.
- [ ] **Whisper stays up:** it survives a reload and a phone reconnect; a crash restarts by itself (Servex) and the page says so in one plain line.
- [ ] **Each stage visible live on the session page:** raw → clean → structure → refined → cards, each written by page-tool deltas as it happens (stream, not poll; about 100 ms updates), one class per stage with its own view.
- [ ] **Phone:** the same flow works at 400 px from the phone address (`10.0.0.135`), proven headless at mobile width.
- [ ] **For tomorrow's test:** a short `ux/Dictate/doc/try-it.md` (open this URL on the phone, press this, expect that) linked from the Dictate readme, and an `owner_note` (kind `needs-you`) pointing to it.
- [ ] Close the transcription `now` loose ends this resolves, each by checking it, not trusting the Haiku label.
- [ ] Layout-check at 400/1200/1920/3440; smoke clean; commit each step; merge.

Sonnet 5.5 (you); Haiku under 60k for reading. Worktree; one Servex restart batched and proven on a private port. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
