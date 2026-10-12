# Voice to session page

Task: `ai/2026-10-12/voice-to-session-page/` (requirements.md, STATE.md).

## Flow

Browser `RefineSystem.stream(text)` (150 ms trailing throttle) → `POST /api/voice {session, prompt, text, final, source}` → `Servex/ext/refine/VoicePage` → page tools (`page_add` then `page_set`) → `page.jsonl` of the session → `VoiceFlow` on the session page (tails it, about 100 ms).
`/api/refine` runs the same stages (`Servex/ext/refine/run.js`) and calls `VoicePage` after raw, clean, structure and notes.

## On a phone: no dev socket, so a read-only stream

The dev socket (and so the page-file tail) is localhost-only because it also carries `rpc:write`; from `10.0.0.135` a page file is loaded once, not streamed. So `VoiceFlow.follow(session)` opens `EventSource` on `GET /api/voice/stream?session=<uuid>` (Servex, read-only, through the dev proxy at `<origin>/servex`). It replays the open prompts' lines, then sends each new line. Same lines as the page file, so `VoiceFlow.read` folds both the same way. Rejected: opening the dev socket to the LAN (RCE), polling the page file.

## Wire format (one item per prompt)

`{"content":{"add":{"id":"voice-<prompt>","type":"voice-prompt", ...}}}` first, then `{"voice-<prompt>": {raw, clean, structure, subject, refined, cards, notes, ms, status}}` shallow-merged. No `title`, so the chat does not draw a bubble for it.

## Classes

- Server: `VoicePage` (per-prompt write queue; `raw`, `clean`, `structured`, `notes`, `failed`, `done`).
- Browser: `VoiceFlow` > `VoicePrompt` > six `*Stage` (base `VoiceStage`).
- Shared, DOM-free: `Compose` (brief, cards).

## Decisions and the rejected alternative

- **Cards and the refined prompt are composed in code** (`Compose`), not written by a model: the brief said the refining model writes the cards, but the structure stage already returns the outline the cards are made from, so a third model call would add seconds and cost for the same text (law 7: compute, don't recall). The clarity flags and tags on the cards still come from the Haiku pass. Alternative if the owner wants model-written cards: one more call after `structured()`.
- **Partials are coalesced** server-side to one page write per 700 ms (the browser posts every 150 ms), so a long dictation does not bloat `page.jsonl`, which every load replays.

- **Names `VoiceStage`/`VoiceStageView`**, not `Stage`: the auto class `.stage` collides with the framework preview rule in `Page.css` (the box was 242 px wide).
- **`Compose` is DOM-free** because Servex imports it; `View.js` needs `Element`.
- **Views built in callbacks** go inside `this.append(() => ...)` of the intended parent, or the `View.captor` adopts them in the wrong place.
- **A stage with no data draws nothing** (`ready`), so a throwing `body()` cannot strand the captor.
- Rejected: a second WebSocket just for stages (the page tail already streams); writing hand-made JSON (the page tools only).
- Whisper: supervised by Servex (`Process.Whisper`); `GET /api/whisper` reports `crashes`/`last_crash`, and `Connection.restart_note()` shows it in one line.

## Open

- **The VS Code app path** (Echo, `Servex/agents/Echo.js`) writes its own page items and does not call `VoicePage`; wiring it means calling `VoicePage.raw/clean/structured` from Echo's clean and structure steps. Decision: not tonight, a different system with its own owner; only the Refine page streams.
- `POST /api/voice` has no auth and CORS open, like the other `/api/*` routes, and is reachable from the LAN through `<origin>/servex`: data only, 20k cap.
- The SSE stream through the dev proxy (`Server/plugins/ServexProxy.js`) was not exercised against a private Servex (the proxy target is fixed at :8090).

## Proofs

`ai/2026-10-12/voice-to-session-page/`: `proof.mjs` (server stages), `whisper-proof.mjs` (kill and restart), `phone-proof.mjs` (400 px browser).

## Things you mentioned (2026-10-12)
`ThingsStage` sits under the raw words and turns every module name you say into a link card, with no model and no server (the fast assistant the owner scrapped did this job with a model; this does it in the browser in about a millisecond). It matches `things.json` (built from the folders by `ThingsIndex.mjs`) plus the `#` Mention map; ordinary-English names (Page, Tree) only match when spoken capitalised. Proof: `ai/2026-10-12/refine-asks/things-proof.mjs`.
