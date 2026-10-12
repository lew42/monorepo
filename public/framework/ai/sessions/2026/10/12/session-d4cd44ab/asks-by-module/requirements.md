# Owner asks, grouped by module (page and AI first)

**The ask (owner, 2026-10-12):** the owner has asked for many of the same things a dozen times. Group every ask by the module it belongs to, merge the repeats, and put each module's list in priority order. Do the page system and the AI system now; transcription is next.

**Why:** the task audit listed what past tasks left undone, but nobody knows how accurate it was or whether it merged repeats.

**What exists (start here, do not redo):** the task audit at `ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task/` (`by-system.md`, `work-items.md`: 186 loose ends in 22 items, Haiku labels about 58% reliable; `verified.jsonl`: 77 checked), `ai/asks.jsonl` (routed asks), the 2026-10-08 `ai-system-docs` review (`ai/2026-10-08/ai-system-docs/review.md`, `findings.md`).

## Done when (tick each with proof)
- [ ] **Owner asks, not just task loose ends:** a node script collects the owner's own prompts that mention the page or AI systems (session logs, `asks.jsonl`, requirements quotes), chunked under 60k tokens per Haiku call; Haiku tags each with a module and a one-line ask, citing the source line. Scripts in this dir, rerunnable.
- [ ] **Merged and checked:** repeats fold into one ask with a count and links to every source; each merged ask is checked against the code (done / partly / open) by Sonnet reading the code, not by the Haiku label. Record the Haiku accuracy you measure.
- [ ] **Where it lands:** `core/Page/doc/asks.md` and `public/framework/ai/doc/asks.md` (or the AI module's own doc dir): open asks first, ordered by how often asked and how much they unblock, each one line + links; linked from each readme. Done asks listed short at the bottom.
- [ ] **Route, don't build:** send each open page ask to @mastermind-page-ai-api or @mastermind-page-content-unify if it fits their brief, transcription asks to @mastermind-voice-to-session-page; the rest stay in the doc for the next run.
- [ ] **Was the docs review good?** One paragraph in `STATE.md`: did the 2026-10-08 ai-system-docs review leave the page and AI readmes current and short (spot-check 5 readmes against the code)? Fix obvious staleness.

Sonnet 5.5 (you); Haiku for the reading, every call under 60k tokens. Never destructive; commit each step. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
