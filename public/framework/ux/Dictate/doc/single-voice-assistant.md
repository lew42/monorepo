# The single voice assistant: one agent per voice session

**What this is.** A setting that gives a voice session ONE Sonnet agent in place of today's pair (the fast seat that places and cleans each sentence, the smart seat that answers). It hears every sentence as it ends, tidies it, files it silently, and speaks only when you pause. The default (`voice`, the pair) is untouched. The brief the agent reads: `Servex/agents/single-voice-assistant.md`. Built for [Chat V3](/framework/ext/Chat/v3/readme.md). Plan, findings and the owner's words: [the build's task folder](/framework/ai/sessions/2026/10/20/session-e00f55c9/single-voice-assistant/plan.md).

## Turning it on
- **Every session:** write the word `single` in `session-assistant.txt` (or set `SERVEX_SESSION_ASSISTANT=single`); read at boot, so Servex restarts for it. The word is one of `fast`, `voice` (default), `single`, `off`.
- **From the phone:** the gear panel's **voice assistants** row (One assistant / Two assistants / Default) does the per-session POST below; its line shows which is live ([settings.md](settings.md)).
- **One session:** `POST /api/session/settings {session, assistant: "single"}`. `assistant: null` drops it back to the boot word. If an agent is already awake for that session it is put to sleep; the next sentence wakes the new seat.

## What happens to a sentence (`Servex/agents/Sessions.js`: `single_say`, `single_cue`, `heard`)
1. `say()` hands the sentence straight to `single_say()`: no refine, no thought hold, no wake gate, no fast agent, no code-filed Question.
2. The agent gets `[on <page> at <at>] <words>`, then `(sentence)`, `(prompt p-…)` and `(message m-…)`. It cleans minimally with the item tool: a `{place}` line with `edit: "improve"` and the cleaned `text`. Chat V3 draws that cleaned text through a `clean` line; the raw words stay behind "show raw". A card title is `messages.<message id>.title`.
3. It ends the turn with no text. Text from a turn with no open cue is dropped in code, even if the model talks.
4. After `single_pause_ms` of quiet (default 1000, `SERVEX_SESSION_SINGLE_PAUSE_MS`), only when the agent is idle (a busy one is retried), Servex sends `(pause: reply now only if a question is open)` and opens the cue. That turn's text becomes the reply (one short paragraph; [reply-pacing.md](reply-pacing.md)); an empty answer is dropped. A new sentence cancels the timer.
5. Heavy work: the agent files a task on the session and spawns a helper with `spawn_agent task: {from, id}`; it does no digging and has no `eval`.

## Where each piece is
- Role row `single-voice-assistant`: `Servex/agents/roles.js`; model tier `voice_single` (Sonnet, effort low): `Servex/agents/tiers.js`.
- The proof: `Servex/agents/Sessions.single.test.mjs` (plain node, no model). It runs every `js` example in the brief for real against a temp session file, then replays the file the way Chat V3 reads it (cleaned words, title, paragraphs, raw kept).

## Not built yet
Read-aloud mechanics from reply-pacing · moving a sentence to another paragraph or card as data Chat V3 draws (the `place` line is written, V3 does not move cards from it yet) · Ref cards · the grey/green check in single · cards that absorb walls · heard-only context · a voice-system mastermind for the agent to hand its own fixes to. Live cost per sentence is to be measured on the first real session.
