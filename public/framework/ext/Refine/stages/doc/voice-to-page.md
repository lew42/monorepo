# Voice to session page

Task: `ai/2026-10-12/voice-to-session-page/` (requirements.md, STATE.md).

## Flow

Browser `RefineSystem.stream(text)` (150 ms trailing throttle) → `POST /api/voice {session, prompt, text, final, source}` → `Servex/ext/refine/VoicePage` → page tools (`page_add` then `page_set`) → `page.jsonl` of the session → `VoiceFlow` on the session page (tails it, about 100 ms).
`/api/refine` runs the same stages (`Servex/ext/refine/run.js`) and calls `VoicePage` after raw, clean, structure and notes.

## Wire format (one item per prompt)

`{"content":{"add":{"id":"voice-<prompt>","type":"voice-prompt", ...}}}` first, then `{"voice-<prompt>": {raw, clean, structure, subject, refined, cards, notes, ms, status}}` shallow-merged. No `title`, so the chat does not draw a bubble for it.

## Classes

- Server: `VoicePage` (per-prompt write queue; `raw`, `clean`, `structured`, `notes`, `failed`, `done`).
- Browser: `VoiceFlow` > `VoicePrompt` > five `*Stage` (base `VoiceStage`).
- Shared, DOM-free: `Compose` (brief, cards).

## Decisions and the rejected alternative

- **Names `VoiceStage`/`VoiceStageView`**, not `Stage`: the auto class `.stage` collides with the framework preview rule in `Page.css` (the box was 242 px wide).
- **`Compose` is DOM-free** because Servex imports it; `View.js` needs `Element`.
- **Views built in callbacks** go inside `this.append(() => ...)` of the intended parent, or the `View.captor` adopts them in the wrong place.
- **A stage with no data draws nothing** (`ready`), so a throwing `body()` cannot strand the captor.
- Rejected: a second WebSocket just for stages (the page tail already streams); writing hand-made JSON (the page tools only).
- Whisper: supervised by Servex (`Process.Whisper`); `GET /api/whisper` reports `crashes`/`last_crash`, and `Connection.restart_note()` shows it in one line.

## Proofs

`ai/2026-10-12/voice-to-session-page/`: `proof.mjs` (server stages), `whisper-proof.mjs` (kill and restart), `phone-proof.mjs` (400 px browser).
