# Plan: the single voice assistant, first merge (one quick pass, 2026-11-02)

**What this is.** The smallest version that runs end to end: a setting value `single` that gives a voice session ONE new Sonnet agent (role `single-voice-assistant`) in place of the fast seat and the smart seat. It gets every sentence as it ends, files it silently with the item tool on `session.messages` / `sentences` (the lists [Chat V3](/framework/ext/Chat/v3/readme.md) draws), and replies only when Servex sends a pause cue. Dual (`voice`, the default) is not touched. Brief: [requirements.md](requirements.md). Findings: [investigation.md](investigation.md).

## Names and homes (law 8)
- Role and agent: `single-voice-assistant` (row in `Servex/agents/roles.js`, tier `voice_single` = Sonnet in `Servex/agents/tiers.js`). Alternative: low-effort Opus, same row, change the tier.
- Brief: `Servex/agents/single-voice-assistant.md`, about 600 words (`session-smart.md` is 3,800; `voice-assistant` skill is 650). It lists its own files so the assistant can improve them.
- Setting: the value `single` in `ASSISTANTS` (`Sessions.js:83`), same file and env var as today (`session-assistant.txt`). Read at boot, so a restart (vscode-mastermind's) is needed after merge.

## Core shape (small edits in `Servex/agents/Sessions.js`, all gated on `single_seat()`)
```js
single_seat(){ return this.assistant === "single"; }     // fast_off() also true in single, so no fast agent and no code-filed Question
// spawn(): role "smart" + single_seat() -> role "single-voice-assistant", system = brief("single-voice-assistant") + where (lean: no settings, door on)
// release/hold: in single, say() hands each sentence to feed_smart at once (no 2.5 s thought hold), why = "sentence"
// pause cue: after the last sentence, single_pause_ms (1000, SERVEX_SESSION_SINGLE_PAUSE_MS) of silence -> send "(pause: reply now only if a question is open)", sets s.cue_open
// heard(): in single, a turn's text becomes a chat reply ONLY if s.cue_open; empty text or a turn with no cue is dropped (already how an empty result behaves, line 1515); cue_open clears at the result
```
**"Can a turn end with no reply?"** Yes: `heard()` returns on empty text (line 1515), and a model's end-of-turn after tool calls may be empty. The brief says "after filing, end with nothing"; the `cue_open` guard enforces it in code even if the model talks.

## What the assistant does (in its brief, one line per move; each is a tested item-tool call)
File a sentence (default: stays in the last paragraph) · start a new paragraph · new card with a title · move several sentences to a card · correct a sentence by id (punctuation, capitals, known words, fillers; never rewording; the raw words stay) via the `place` line / sentence text set that dictate-mic-sentences left (`ux/Dictate/doc/upload.md`) · answer a question on its own card, one short paragraph, only on a pause cue · delegate anything heavy: file a task on the session, then `spawn_agent` with `task: {from, id}` (it reads the mastermind readme, does no digging itself). Reply-pacing rules in [reply-pacing.md](/framework/ux/Dictate/doc/reply-pacing.md): silent first, one short paragraph, on the question's card.

## Files
`Servex/agents/Sessions.js` (the gated edits) · `roles.js`, `tiers.js` (one row each) · `single-voice-assistant.md` (new) · `Servex/agents/Sessions.single.test.mjs` (new) · docs: `ux/Dictate/doc/single-voice-assistant.md` (new, the how-it-works page), a line in `ux/Dictate/readme.md`, `Servex/agents/roles/readme.md`, `ai/doc/readme.md` (law 10).

## Tests, named first (all should FAIL today; plain node, no model, under 5 s)
1. `session_assistant()` returns `single` for the file/env word; no file and no env still returns `voice`.
2. Single: `say()` spawns no fast agent, writes no code-filed Question, and the smart seat spawns with role `single-voice-assistant` and its own brief (not `session-smart.md`).
3. Single: a sentence reaches the seat with no thought hold (before `answer_quiet_ms`).
4. Pause cue: exactly one cue after `single_pause_ms`, none while sentences keep coming; a turn's text without an open cue is dropped; an empty turn is dropped; a cue turn's text becomes a reply.
5. Brief: under 700 words; names its own files; and every item-tool example in it is run for real against a temp session file through `run_item`: move a sentence to a new paragraph, new card with a title, move several sentences, amend by id. Each `add` returns its `ids` (the owner's chaining question; fix `page_tools.js` if one at depth doesn't), and the writer is not woken by its own write (it is not in tail mode; asserted).
6. V3 draws what it writes: replay those same lines into `Session`, then `ChatV3` placement (`placement.test.mjs` style, node) gives the title, the paragraph split and the card.
7. Dual regression: the existing `Sessions.test.mjs`, `chat-messages.test.mjs`, `Follow-skip.test.mjs` pass unedited.

## Build steps (each commit-sized)
1 tests 1-4 red, commit · 2 setting + gates, green · 3 brief + role/tier row, test 5-6 red then green (adds an item verb only if one is missing) · 4 docs + index, `NavCheck` · 5 `review.mjs` · 6 `merge.mjs`. Live smoke after the restart: say two sentences and a question into a `single` session, read the lines the seat wrote and what V3 shows.

## Cost and time
Built on Sonnet by me: about 2 h, $6 to $9, plus review $1.5 to $2; about $10 of the $20. Running cost: one Sonnet turn per sentence plus one per pause cue, against today's Haiku seat plus Opus-seat batches; to be measured on the live smoke (log both numbers). Worth it: yes, it is the owner's stated next move and the shortest route to proving one agent.

## Owner's words, checked line by line
1 one new role, setting, dual default, name first: done above. 2 every sentence, minimal cleaning, raw stays: brief + place path. 3 silent work (file, amend by id): in; **show a Ref card: later** (V3 draws no Ref yet). 4 pause cue (setting, 1 s), empty turn answer: in. 5 screen: **check mark and "cards absorb walls": later** (V3 `marks()` is a no-op). 6 knows its system: brief + readmes it reads. Added asks: short brief naming its files: in; answer silently with a short line: in; delegate everything heavy with `spawn_agent task:{from,id}`: in; add-returns-id: tested; no self echo: tested; `context()` view and the smallest-verb set: first verbs only, `context()` later; no `eval`: in. Reply pacing rules: in the brief. Heard-only context: single makes it cheap but needs Recite to report how far it read, so it stays parked. Session switching: unchanged (sentences go to the session selected when sent; asserted by the existing mixup tests).

## Later (named, not built here)
Read-aloud mechanics from reply-pacing (prepare halfway, 1 s gap, extra turn after read) · grey/green check and no 🧠 in single · cards that absorb walls · Ref cards and `context()` · heard-only context · a standing Opus helper per session · voice-system mastermind.

## Improved
(Step 3 skipped by the owner's "one quick pass"; vscode-mastermind approves instead.)
