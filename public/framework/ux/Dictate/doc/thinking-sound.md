# The thinking sound: why it is silent, and two ways to signal "working on it" (proposal, 2026-11-03)

**What it is.** A short tone the phone plays while the assistant works on something slow, so the owner is not left in silence. Code: `Recite.start_thinking()` / `play_cue()` (`audio/Recite/Recite.js:288`, `:311`), asked for by the owner on 2026-11-02.

## Why it does not play (checked, three causes)

1. **Nobody in the single seat ever fires it.** The cue plays only on a session line `{thinking: {by: "smart"}}` (`Recite.js:265`). Only the smart seat's brief tells its agent to write that (`Servex/agents/session-smart.md:56`). The single assistant's brief (`Servex/agents/single-voice-assistant.md`) never mentions it, and session `v-z0jonhy` has zero `thinking` lines. So in single mode the cue cannot fire.
2. **The tone's AudioContext is probably asleep.** `play_cue()` makes `new AudioContext()` the first time it is needed, from a wire event, not a tap, and never calls `resume()`. A browser keeps a context made without a tap in `suspended`, so the tone is scheduled and nothing is heard. The tap unlock (`unlock_on_tap`, `:83`) unlocks only the `<audio>` element used for speech, not this context. Not yet proven on a device: the first step of the fix is to log `ctx.state` in the existing `thinking cue` trace.
3. **It also needs read-aloud on (`this.auto`) and a fresh page.** On 2026-11-02 the owner's phone ran a stale cached `Recite.js` (the cue code was not even there); that is the cache-version task's cause, separate from 1 and 2.

Also: one 0.18 s tone at gain 0.1 is easy to miss on a phone speaker.

## The two ways to signal a heavy question

**A. A quick response first, while the work continues.** The assistant says one short sentence at once ("Looking at it; my guess is the cue never fires in single mode"), then delegates, and the real answer arrives later as an agent update. Good when the first idea is itself useful. Cost: it is a reply, so it uses a turn, is read aloud (and can echo), and the "one item at a time, very small" style means it must stay one sentence.

**B. The thinking sound, then the answer later.** A tone the moment the assistant starts something slow. Costs no tokens and nothing to read aloud, so no echo risk. It says "working" but nothing about what.

**The owner's addition: let the assistant fire it itself, as a triple bleep.** This is already the design: the assistant writes one delta line through the item tool, `item({path: "<session>", delta: {thinking: {by: "smart"}}})`, and the page plays the tone. What is missing is only (1) the instruction in the single brief and (2) the tone: three short bleeps (about 0.12 s each, 660 Hz, 0.08 s apart) at a clearer volume, played once, then repeated every ~6 s (not 2 s) until the reply starts, 60 s at most.

**The owner's addition: near-instant, with a "..." marker.** The signal should mean one thing: "message received, I have asked someone, the answer will be late". Two parts:

- **The marker is the same `thinking` line, not a message.** It is a data line in `session.jsonl` (no text, never read aloud, never a bubble). Chat V3 draws it as a small "..." row at the end of the chat while the line is open, and removes it when the next assistant reply or an agent update arrives, or a `{thinking: {by: "smart", done: true}}` line closes it. One line, two readers: Recite plays the sound, V3 shows the dots. (V3 does not draw it today: to build, in `ext/Chat/v3/ChatV3.js`; first check that views ignoring an unknown line type stay quiet.)
- **Near-instant means code writes it, not the model.** Asking the model to write it first still costs a model turn start (a second or two). Faster: `Sessions.js` writes the `thinking` line itself the moment the single seat makes its first handing-off tool call (a `spawn_agent`, a message to the mastermind, or an `ask_*`; the same place `heard()` already sees tool events, ~:1569). The line is then there within a few hundred milliseconds of the decision to delegate, and the brief needs no instruction for it. Not on every pause cue (that was the "after every line" annoyance), only on a real hand-off.

## What is built now (ask10, 2026-11-03)

Steps 1, 2 and 4 of the recommendation below are done:

1. **`Sessions.js` marks a hand-off, not the model.** `heard()` (~:1728) checks every tool-event the single seat makes: the first one whose name matches `HANDOFF_TOOL` (`spawn_agent`, `send_to_agent`, `ask_mastermind`, `ask_manager`, `ask_module`, `ask_expert`, `ask_directory`) in a turn writes `{thinking: {by: "smart"}}` and sets `s.thinking_open = true`. Never twice in one turn (`s.turn_said`, reset at the top of each turn in `single_say()` and `single_cue()`'s `fire()`). **Suppressed when a `say` was already queued or released earlier in the same turn** (`queue_say()` sets `s.turn_said = true`) — a spoken "I've asked the mastermind" is the signal then, not a beep; the delegated answer still arrives the normal way, as a fresh `say` once the delegate's work wakes the seat again. `release_say()` closes an open cue with `{thinking: {by: "smart", done: true}}` the moment the real reply is written, whether that reply is the hand-off sentence itself or the delegate's answer landing later. No change was needed to the single brief — the mark is code, not an instruction.
2. **`play_cue()` plays three bleeps**, ~0.12 s each at 660 Hz, ~0.08 s apart, gain 0.3 (was one 0.18 s tone at 0.1 — "easy to miss"), repeating every 6 s (was 2 s, `cue_repeat_ms`) until the reply starts, done arrives, or 60 s passes. `ctx.state` is traced on every `thinking cue` line, and a `suspended` context is `resume()`d before the tone — `unlock_on_tap()` also makes/resumes the same `cue_ctx` on the first real tap, so it is rarely still suspended by the time a cue fires.
4. **Tests**: `Recite.test.mjs` gained a `done:true` test (closes the cue with no reply text at all) and a `play_cue` test proving the trace names `ctx.state` and `resume()` is called on a suspended context. `Sessions.single.test.mjs` gained four tests: one hand-off call writes one open line and a second in the same turn writes nothing more; a `say` queued first suppresses the open line while the delegated answer still reaches the owner as a later `say`; `release_say` writes the `done` line and clears `thinking_open`; releasing with nothing open writes no stray `done` line.

**Not built: step 3, Chat V3's "..." row.** Out of budget for this task (ask10's brief made it a stretch, done only "if steps 1, 2, 4 land under budget"). ⬜ Chat V3 (`ext/Chat/v3/ChatV3.js`) does not yet draw anything for an open `thinking` line — it needs to ignore the line type safely today (unverified; check before building it) and later draw the dots, removing them on the next reply, an agent update, or `done`.

**Not proven on a device.** `ctx.resume()` is called and traced (proven by test); whether a given phone is actually audible is not — that needs a real phone with read-aloud on. `node --check` passes on both edited files; `node Recite.test.mjs` needs a DOM (`/framework/core/Test/view/?file=audio/Recite/Recite.test.mjs`) and `node Servex/agents/Sessions.single.test.mjs` could not be run in this worktree — `Agents.js` imports `@anthropic-ai/claude-agent-sdk`, which is not installed here (pre-existing, unrelated to this change; the same family of issue as the two failures the brief already excuses).

## Recommendation (as proposed, for reference)

**Do B always, A only when there is something worth saying.** On any hand-off the `thinking` line (sound plus "..." marker) appears at once, free and silent in the chat. If the assistant also has a real first idea, it says it in one sentence on the next cue; it never says "looking into it" (the filler the owner already ruled out). Build, in order:

1. `Sessions.js`: write `{thinking: {by: "smart"}}` when the single seat makes its first hand-off tool call (plus a one-line fallback in the brief: "if you hand something off, the system marks it; you can also write the line yourself"); write the closing `done` line when its reply or the helper's update lands.
2. `play_cue()`: `ctx.resume()` before the tone, create the context in `unlock_on_tap`, trace `ctx.state`, and play the triple bleep.
3. Chat V3: draw the "..." row while a `thinking` line is open; stop the sound and the dots also when an agent update arrives (a delegated answer comes back as `agent_update`, not a smart reply), and cap the repeats.
4. A test in the existing Recite headless test: a `thinking` line fires the cue once, a reply cancels it, and a suspended context is resumed; plus a V3 replay showing the dots and then removing them.
