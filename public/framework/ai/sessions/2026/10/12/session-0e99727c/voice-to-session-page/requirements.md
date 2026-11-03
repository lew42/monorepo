# Voice to session page, in real time (mastermind brief)

**Goal:** when the owner speaks, they watch their words turn into cards on the session's own page, live, from the phone. They test it tomorrow.

**The five stages, each shown on the page as it happens:**
1. **Raw** — Whisper's text, as spoken.
2. **Clean** — the same text, tidied.
3. **Structure** — the clean text split into its points.
4. **Refined** — the finished prompt.
5. **Cards** — the refining model writes them onto the page with the page tools.

**Which page:** every session has one at `/framework/ai/sessions/<id>/`. By default an agent writes to its own page. This works the same whether the owner dictates in the browser or the app.

> "That's the kind of feedback loop that I'd like." (the owner, 2026-10-12)

**What exists (read STATE/reports first, do not rebuild):** `ai/sessions/2026/10/09/session-48083d9d/refine-dictate-ui/` (VoiceStrip, phase-2 report, mobile-socket answer), `ux/Dictate/doc/voice-architecture.md`, `ext/Refine`, Whisper server under Servex, the task-audit's transcription loose ends (`ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task/by-system.md`, "Transcription and refinement": 10 `now` rows, Haiku-labelled, about 58% reliable). Page tools: `Servex/agents/page_tools.js`; the AI-facing page model is being written by @mastermind-page-ai-api (`core/Page/doc/ai-api.md`); use its tools, ask it, don't fork them.

## Done when (tick each with proof)
- [ ] **Reproduce first** on current `michael/dev`: dictate (a recorded audio file fed headless is fine) and record which stage breaks or lags, with timings, in `STATE.md`.
- [ ] **Whisper stays up:** it survives a reload and a phone reconnect; a crash restarts by itself (Servex) and the page says so in one plain line.
- [ ] **Each stage visible live on the session page:** raw → clean → structure → refined → cards, each written by page-tool deltas as it happens (stream, not poll; about 100 ms updates), one class per stage with its own view.
- [ ] **Phone:** the same flow works at 400 px from the phone address (`10.0.0.135`), proven headless at mobile width.
- [ ] **For tomorrow's test:** a short `ux/Dictate/doc/try-it.md` (open this URL on the phone, press this, expect that) linked from the Dictate readme, and an `owner_note` (kind `needs-you`) pointing to it.
- [ ] Close the transcription `now` loose ends this resolves, each by checking it, not trusting the Haiku label.
- [ ] Layout-check at 400/1200/1920/3440; smoke clean; commit each step; merge.

Sonnet 5.5 (you); Haiku under 60k for reading. Worktree; one Servex restart batched and proven on a private port. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
