# Voice asks, round 2: state

Brief: [requirements.md](requirements.md). List: [ux/Dictate/doc/asks.md](/framework/ux/Dictate/doc/asks.md) (entries carry the commit links).

| # | Ask | State | Proof |
|---|---|---|---|
| 1 | duplicate-bubbles | **Not reproduced.** No fix made. | `dup-e2e.mjs`, `prove-dup-*.mjs`, walk |
| 2 | vscode-voice-path | Built: Echo writes the same voice page as Refine. Needs the Servex restart (below). | `proof.mjs` A |
| 3 | prompt-to-board-cards | Built: **To board** button, `POST /api/voice/card`, one card + one `queued` ask line, idempotent. | `proof.mjs` C, `ui-proof.mjs` 1 |
| 4 | whisper-status-stream | Built: `GET /api/whisper/stream` (SSE), `VoiceStrip` listens, poll kept only as the no-stream fallback. | `proof.mjs` B, `ui-proof.mjs` 2 |
| 5 | per-sentence-model-clean | Built, **opt-in and off**: `run_refine({ clean_live: true })`. About $0.07 per sentence measured, more than one whole-prompt clean. | `proof.mjs` D |

## 1. duplicate-bubbles: what was tried

- Both `prove-dup-*.mjs` proofs pass. The voice walk (desktop and phone) shows one voice prompt and no chat duplicates.
- `dup-e2e.mjs` drives the Dictate demo chat mic with a recorded clip against real Whisper and Servex. Exactly one `/api/session/say` per run. Bubble counts above one came from the demo session keeping its history between runs, not from duplicates.
- One real oddity: a pause cut in the middle of a word repeated one word across the chunk seam ("ask not what" then "What your country"). It may come from how the test clip was cut, so it is recorded, not fixed. If a duplicate shows again: note the page and the time, run `dup-e2e.mjs`.

## 5. The cost, measured

Three sentences cost $0.21 (about $0.07 each): each call starts a fresh session. Cutting that per-call cost matters more than cutting the number of sentences. It stays off until you want it for one session.

## Servex restart

Four Servex changes (Echo mirror, `/api/voice/card`, `/api/whisper/stream`, `clean_live`) are proven together on a private Servex: `node public/framework/ai/sessions/2026/10/12/session-fb723164/voice-asks-2/proof.mjs` (ports 8190/8189/8188, no Whisper; `SKIP_D=1` leaves out the $0.20 step). One batched restart makes them live (`node Servex/sustain.mjs --restart`). Until then an old Servex answers 404 on `/api/whisper/stream`, which the page treats as "no stream" and falls back.

## Left

- Approve/improve on a board ask, and the board creating tasks while you dictate (prompt-to-board-cards, second half).
- Echo stays off by default (`SERVEX_ECHO`), for cost.
- `ext/Refine/stages/files.jsonl` picked up three generated census lines for files unrelated to this task.
