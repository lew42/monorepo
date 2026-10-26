# When the smart assistant is woken (the wake policy)

**What it is.** A voice session has two assistants. The fast one places each sentence as you speak (cheap, per sentence). The smart one is an Opus turn: expensive, and it answers in words you have to read. So the smart one is not woken per sentence. It hears your words as one batch, and only when one of three things happens.

## The rule

| Wakes the smart assistant | Cue it is told (last line of the prompt) |
| --- | --- |
| You **paused**: silence for `gap_ms` (default 6 s). The time you spend speaking again does not count: the timer stops while the floor is `speaking` and starts a whole gap when it turns `done` | `(paused 6 s)` |
| You **asked**: the last words end in `?`, or a sentence starts with "smart" / "mastermind" (after an optional "hey", "okay") | `(asked)` |
| **`every` finished sentences** (default 6; only text ending in `.` `!` `?` counts, a comma chunk is not a sentence, and text with no punctuation only goes out on the gap, a question, the name or mic-off) piled up since the last batch | `(6 sentences)` |
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

## Next: the smart seat tails its own session log (opt-in built 2026-10-25, policy not yet replaced)

**Built, off by default.** `POST /api/session/settings {session, tail: true}` (`tail: false` turns it off) makes [`Sessions.js`](../../../../../Servex/agents/Sessions.js) `tail_log()` give the smart seat a Follow subscription on its own `session.jsonl` (`gather_ms` 1500, or `tail_ms` on the session) with `heard: true` (only the owner's chat lines, the fast seat's `{place}` lines and Question items are delivered) and `skip_by` set to the seat itself. The server's housekeeping lines (`sent`, `refined`, `quiet`, `skip`...) wake nobody; without that filter `feed_smart`'s own `{sent}` line woke the seat in a loop (found in review). `feed_smart()` still wakes a sleeping seat through the policy (and sends that first batch); once it is awake, the policy's batch message is skipped and Follow delivers the raw lines. Test: `node Servex/agents/WakePolicy.test.mjs` (last check). Needs a Servex restart, at a time the owner picks.

**Caveats of the opt-in:** the policy still decides when a sleeping seat wakes and still records what it sent; every Follow delivery is a paid turn, so `gather_ms` is the cost knob; lines written while the seat slept are not replayed on a resume (a fresh spawn reads the last 40); `skip_by` is fixed when the subscription is made. **Still to do:** the Prompt-record shape for the fast seat's `{place}` lines, and deleting `waker` / `WakePolicy.js` once a live call proves tail mode.

The owner wants one mechanism instead of this policy: the smart assistant follows its own `session.jsonl` with the existing follow tool ([`Servex/Follow.js`](../../../../../Servex/Follow.js)), with a gather window that can be set, and no separate message path.

**How it works today.** The fast seat is woken once per finished thought and writes one `{place}` line per sentence. The smart seat is NOT woken by those lines. It hears only the owner's raw lines, batched by this policy: 12 s of quiet, a line ending in "?", its name, or 6 sentences ([`WakePolicy.js`](../../../../../Servex/agents/WakePolicy.js), defaults `gap_ms: 12000, every: 6`). [`Sessions.js`](../../../../../Servex/agents/Sessions.js) `feed_smart()` sends the batch as a message, with the page, the `at` time and the Prompt id. A question wakes it at once, but no Question item is made: the fast seat writes only `{place}`.

**How following the log differs:**

- **What arrives:** raw JSONL lines exactly as written: owner lines, the fast seat's `{place}` lines, `quiet` lines and the smart seat's own replies. Today it gets clean text with a reason why it was woken.
- **When:** Follow sends `gather_ms` after the FIRST change. This policy waits for 12 s of quiet after the LAST line, and stops the clock while the owner is speaking.
- **Questions:** each line is equal, so a question no longer jumps ahead. It reaches the smart seat after one gather window instead.

**What removing the policy takes:**

1. **A line filter on the subscription.** Without it, the smart seat's own reply lines wake it again, a loop. Raw whisper pushes and `quiet` lines also cost a paid turn each. Follow already filters a parent's child tail (`of` with `worth_waking`), so this is one more filter of the same kind: owner lines, `{place}`, Question items; never lines `by` the follower.
2. **Subscribe the smart seat when its session starts, not by hand.** Then delete `waker` and `feed_smart` from `Sessions.js`, and `WakePolicy.js`. The settings route (`gap_ms` and `every`) becomes one knob, `gather_ms`.
3. **Questions:** the fast seat writes a Question item for a sentence it recognizes as a question; that line is what wakes the smart seat. This is a role-text change, plus a check that the item tool accepts the item in a session file.
4. **A Servex restart** to load it, at a time the owner picks, never during a call.

Cost: about half a day of Sonnet, plus a review. It is a shape change, so the plan is shown before it is built.

**The send-after-pause timeout:**

- The browser's mic sends after 2 s of quiet (`pause_send_ms` and `paragraph_pause_ms` in [`ext/Chat/Mic.js`](../../../ext/Chat/Mic.js)).
- The 12 s here is the smart seat's batch gap, a separate wait.
- Lowering it to about 4 s is one setting (POST `/api/session/settings {session, gap_ms: 4000}`), with no restart. Each wake is an Opus turn, so the cost grows with it.
