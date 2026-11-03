# The thinking sound (ask10, 2026-11-03)

**What it is.** Three short bleeps the phone plays while the single seat hands a question off to a mastermind, so the owner is not left in silence. Server: `Servex/agents/Sessions.js` `heard()` (also documented in [`Servex/agents/doc/say-tools.md`](/Servex/agents/doc/say-tools.md)). Client: `Recite.start_thinking()` / `play_cue()` (`audio/Recite/Recite.js`, also documented in its [readme](/framework/audio/Recite/readme.md)).

## What is built

- **Code marks the hand-off, not the model.** The single seat's first hand-off tool call in a turn (`spawn_agent`, any `ask_*`, or `send_to_agent` to a mastermind) writes `{thinking: {by: "smart"}}` on the session. Never twice in one turn, and never when a `say` was already queued or released earlier in the same turn — a spoken "I've asked the mastermind" is the signal then, not a beep.
- **Closing, two ways.** `release_say()` writes `{thinking: {by: "smart", done: true}}` the moment a real reply is written (the hand-off sentence, or the delegate's answer landing later as a fresh `say`). Separately, the delegate's own message landing on the seat closes it directly and at once — never the owner's own lines (including a tail-mode echo), and never one of Servex's own nudges (spend, compaction, landing-check: anything `from` starting `"servex"`). `Recite.agent_update()` also cancels the cue client-side on any such line, independent of the server's `done` line.
- **A cue never blocks forever, or across turns.** Past `SERVEX_SESSION_THINKING_OPEN_MS` (default 70000) an open cue is stale and a fresh hand-off opens a new one anyway. A cue an earlier turn left open never blocks a hand-off in a NEW turn either way, tied to a per-session turn id bumped at every turn's end — a normal result or an interrupted one.
- **The tone.** `play_cue()`: three ~0.12 s bleeps at 660 Hz, ~0.08 s apart, gain 0.3, repeating every 6 s until closed or 60 s pass. `ctx.state` is traced, and a suspended `AudioContext` is `resume()`d — in `play_cue()` itself and again on the first real tap (`unlock_on_tap()`).
- **Tests**: the ask10 checks in `Servex/agents/Sessions.single.test.mjs` (19/19, run for real) cover all of the above, including the real `say → hand-off → agent_msg → next turn → say` delivery path end to end. `Recite.test.mjs` has matching cases but needs a browser; not run from this worktree.

## Left

- ⬜ **Chat V3's "..." row.** `ext/Chat/v3/ChatV3.js` does not yet draw anything for an open `thinking` line. Needs: confirm it ignores the line type safely today, then draw the dots while open and remove them on close.
- ⬜ **The Recite-side tests** (`done:true` closing, `ctx.state`/`resume()`) have not run in a browser.
- ⬜ **Audibility on a real phone** is unproven — only that the tone-scheduling code runs.

## The ordering edge case

If the model calls the hand-off tool BEFORE queuing its spoken line, the open `{thinking:{by:"smart"}}` line is written first (nothing has suppressed it yet), and `release_say()` closes it moments later when that sentence releases. The owner may hear one short beep-and-stop, then silence until the real answer, rather than no beep at all — still "no beep running on into the silence," just not identical to the `say`-first case. Fixing this exactly would mean asking the model to always `say` before it hands off (a brief change), not a cheap code one, and was not done.
