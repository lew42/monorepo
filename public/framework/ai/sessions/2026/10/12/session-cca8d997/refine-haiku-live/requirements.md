# Refine: Haiku by default, one chat input everywhere, live incremental refinement (mastermind brief)

**Owner (2026-10-12, dictated):** today [Refine](/framework/ext/Refine/) ran transcriptions through OpenRouter. While we pay for Claude tokens anyway, keep OpenRouter to a minimum.

## 1. Haiku by default, with the switch kept
- Clean + refine run on **Haiku**, quickly and cheaply. Keep the existing file switch that flips everything to OpenRouter (find it; [ai/doc/models.md](/framework/ai/doc/models.md) and the `models-asks` task set voice/Refine to `openai/gpt-6-luna`); default it to Claude, OpenRouter only when Claude tokens run out.
- **Each Haiku session stays under 100k tokens** (CLAUDE.md cost rule): auto-compact or start a fresh session with the current refined prompt as its seed. Measure: tokens per turn over a 10-minute dictation.

## 2. One chat input, everywhere (law 6)
Every chat area (session detail, the VS Code-style sidebar, the Dictate page, Refine…) uses the same input: text field + microphone + a gear for settings, same look and behaviour. Find the existing chat widget and make it the one; don't build a second. Decide input vs auto-growing textarea (owner's worry: a growing textarea next to a button looks wrong and eats the area above; maybe a single-line input that scrolls); record the alternative.

## 3. The mic always uses prompt refinement
Whenever there is a microphone icon, dictation goes through the refine pipeline (raw → clean → structure → refined), built into the transcribe widget everywhere:
- The **raw** text shows in the input as a rough reference while speaking.
- **Chat bubbles show the clean text**, paragraphed, never a wall of raw text.
- **Live refinement:** today Refine only refines when you press its button (and it works well). Make it run as cleaned sentences arrive: first produce a refined prompt, then **amend that structure** as the owner clarifies or adds detail, so new sentences land in the right place in the structure instead of piling up. That gives the owner confidence everything said is tracked. This is the hard part: get a first working version, measure latency per sentence, record what to try next.

Reuse: `ux/Dictate/doc/voice-architecture.md`, `ux/Dictate/doc/asks.md`, the `voice-to-session-page` five stages (raw/clean/structure/refined/cards on the session page), `refine_step`. Coordinate with @mastermind-sessions-detail (its chat area) and @mastermind-style-system (input styling).

## Process
Opus 5.5 for the incremental-refine design, Sonnet to build, Haiku in the pipeline. Worktree; screenshots at 400/1200/1920/3440 before and after for every chat surface touched; `hold.mjs` around live batches; smoke clean; commit each step; merge. `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open: keep going through all of it.
