# When the smart assistant is woken (the wake policy)

**What it is.** A voice session has two assistants. The fast one places each sentence as you speak (cheap, per sentence). The smart one is an Opus turn: expensive, and it answers in words you have to read. So the smart one is not woken per sentence. It hears your words as one batch, and only when one of three things happens.

## The rule

| Wakes the smart assistant | Cue it is told (last line of the prompt) |
| --- | --- |
| You **paused**: silence for `gap_ms` (default 6 s). The time you spend speaking again does not count: the timer stops while the floor is `speaking` and starts a whole gap when it turns `done` | `(paused 6 s)` |
| You **asked**: the last words end in `?`, or a sentence starts with "smart" / "mastermind" (after an optional "hey", "okay") | `(asked)` |
| **`every` sentences** (default 6) piled up since the last batch | `(6 sentences)` |
| The mic went off (the dictation ended) | `(the mic went off)` |
| A ❓ reaction on an assistant line: the lines waiting go first, then "explain it" | `(asked: a reaction)` |

A typed line is a deliberate send, so it waits only the short `quiet_ms` (1.5 s), not the pause gap. A line that merely mentions a mastermind ("spawn that mastermind") or ends a rhetorical question mid-thought does not wake it. The one send that is NOT gated is the respawn recovery in `Sessions.woken()`: a restarted seat re-hears the one line it never answered, which is a recovery and not a new thought.

## The knobs: one place

`gap_ms` and `every`, **per session**, on that session's entry in Servex's `sessions.json` (the field `wake`). A session with no `wake` uses the defaults in `Servex/agents/WakePolicy.js` (`WAKE_DEFAULTS`; boot overrides `SERVEX_SESSION_WAKE_GAP_MS`, `SERVEX_SESSION_WAKE_EVERY`).

**Set them** (the dictation widget's settings panel does this): `POST /api/session/settings {session, gap_ms, every}` (`Sessions.settings()`). Allowed: `gap_ms` 1000 to 60000, `every` 1 to 50; anything else is a 400; `null` drops a knob back to the default. The answer is the knobs now in force. Read them back with the same call and no knobs.

## Where it lives

- `Servex/agents/WakePolicy.js`: the policy, pure (the clock is injected). `add(id, lines, {hold_ms, elapsed_ms})`, `silence(id, ms)`, `flush(id, why)`.
- `Servex/agents/Sessions.js`: `waker` (the one gate), `feed_smart()` (the one place owner words reach the smart seat), `settings()`; `release_thought()`, `gather()`, `quiet()` and `owner_reacted()` feed the gate.
- Proofs: `node Servex/agents/WakePolicy.test.mjs` (fake clock, no model: 20 sentences over 2 minutes with three pauses wake it 4 times, not 20). The replay of real sessions: `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/wake/` (`replay.mjs`, `report.md`).

## What it saved on the recorded sessions

See `wake/report.md`. Short version: the recorded sessions are mostly short spoken questions ("can you hear me?"), which are asked-wakes by design, so the saving there is small; it is large for a continuous dictation of many sentences.
