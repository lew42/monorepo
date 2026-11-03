# Ask 10: the thinking sound (three quick beeps; a hand-off marks itself; the answer must still arrive)

Load the `minion` skill first. Budget: $4. Work ONLY in the worktree `C:\Code\lew42\worktrees\voice-think` (branch `worktree/voice-think`, from `compliance/dev`). Never git stash; never restart the dev server. Commit by exact path after each piece; a clean `git status` in the worktree at the end.

## The owner's words (owner-feedback-2026-11-03b.md, ask 10)
"The thinking sound: three quick beeps for now. No beep when the agent has said 'I've asked the mastermind', but it must then deliver the answer."

## Read first (do not read more than needed)
- `public/framework/ux/Dictate/doc/thinking-sound.md` — the design (causes, the three fixes, build order). Follow its "Recommendation" steps 1, 2, 4. Step 3 (V3 "..." row) is a stretch: do it only if steps 1, 2, 4 land under budget; otherwise add one `⬜` line to that doc.
- `public/framework/audio/Recite/Recite.js` (`start_thinking`, `play_cue`, `unlock_on_tap`, the `thinking` wire handler near :265) and its headless test.
- `Servex/agents/Sessions.js` (`single_say`, the tool-event handling in `heard()` ~:1569) and `Servex/agents/single-voice-assistant.md` (887 words; the cap of 900 is enforced in `Sessions.single.test.mjs:158-160`, so do not grow it past 900).

## Deliverables (each ticked with proof)
1. **Three quick beeps.** `play_cue()` plays three bleeps (~0.12 s each, 660 Hz, ~0.08 s apart, audible gain), once, then repeats every ~6 s until the next assistant reply, an agent update, or a `{thinking:{done:true}}` line, 60 s at most. Create/resume the AudioContext (`ctx.resume()` before the tone; create it in `unlock_on_tap` too). Log `ctx.state` in the existing `thinking cue` trace.
2. **Code marks a hand-off, not the model.** In `Sessions.js`, when the single seat makes its first hand-off tool call in a turn (spawn_agent, send_to_agent to a mastermind, any ask_*), the server appends `{thinking:{by:"smart"}}` to the session itself. Only once per turn.
3. **No beep after a spoken hand-off.** If the seat already has a `say` queued or released in this same turn (e.g. "I've asked the mastermind"), do NOT write the thinking line. But in that case the answer must still arrive: check the delegated answer path (`agent_update` landing -> the seat's next turn -> a `say`/reply) still delivers, and prove it with a test (a say, then an agent update, ends with a delivered reply).
4. **Closing.** The server writes `{thinking:{by:"smart",done:true}}` when the seat's next reply or the helper's agent update lands; Recite stops the repeats on it.
5. **Tests first, then code.** Add to the existing Recite headless test (a `thinking` line fires the cue once, a reply cancels it, a suspended context is resumed, `done` stops it) and to `Sessions.single.test.mjs` (hand-off writes one thinking line; a say first suppresses it; done closes it; the answer after a spoken hand-off is delivered). Run `node Servex/agents/Sessions.single.test.mjs` and the Recite test; the pre-existing failures `ext/Chat/send-count.test.mjs` and `Servex/agents/landing-check.test.mjs` are not yours.
6. **Docs, in the same task:** update `ux/Dictate/doc/thinking-sound.md` (what is built, what is left) and the Recite readme line for the cue; one line in the single-seat doc if behaviour changed.

## Rules
- Resolve found problems now; no "out of scope". If you cannot prove a deliverable, say which and why in your final reply.
- If unsure whether the AudioContext fix works on a device, say so plainly: the test proves `resume()` is called, not that a phone is audible.
- Final reply: one screen — what landed, commit ids, test results, anything unproven. Log lines go in your own `session.jsonl`.
