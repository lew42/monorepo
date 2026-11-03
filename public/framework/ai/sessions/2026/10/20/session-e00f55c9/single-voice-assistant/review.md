verdict: fix
1. [fix] The task folder can't be continued from git: `investigation.md`, `past-work.md` and `review/` are untracked in the main tree and missing from `worktree/single-voice`. Commit them with the task.
2. [fix] The "Investigate first" asks were never done. investigation.md stops at pass 1: its timings are "read from the code, not yet measured". Its Pass 2 list (one real session timed, the SDK no-text check, the reply queue, turn-taking prior art, findings written into `ux/Dictate/doc/`) is all unticked. So the owner's "stall, then burst" question has no measured answer. Do pass 2, or file it as a task on the session.
3. [fix] Ask 6 and the 16:10 ask ("it reads the framework readme and its own role readme", "it reads the mastermind readme so it knows the spawn tools") are not met. The spawn spec has `sdk: { tools: [] }` (Sessions.js, `single ?` spec), so the agent cannot read any file. The brief (`Servex/agents/single-voice-assistant.md:55-57`) names its own files but gives it no way to read them. Inline the few lines it needs, or give it Read.
4. [fix] The brief teaches moves that Chat V3 doesn't draw: `to: "paragraph"`, `to: "card"` and `edit: "move"` (`single-voice-assistant.md:18-31`). plan.md "Built" admits that V3 draws no move or card from `place`. So two of the three silent filing moves the owner asked for (ask 3: new paragraph, new card, move) change nothing on screen, and each still costs a Sonnet turn. Either add the verb that V3 reads ("add a tool verb if one is missing"), or cut those moves from the brief until V3 draws them. Also, the "starts a card" sentence at :18 is followed by a paragraph example, not a card one.
5. [fix] The 16:10 "context cards built step by step" asks are only partly met. Nothing is built or tested for: add a card, add a paragraph to that card by its id, add a Ref to a task, child session or page. The ids test (`Sessions.single.test.mjs:439-443`) only covers a top-level `tasks.add`, but the owner asked for "every `add`, at any depth".
6. [fix] Unbuilt owner asks are recorded only as prose in "Not built yet" (`ux/Dictate/doc/single-voice-assistant.md:19-20`). These are Ref cards, the grey/green check and no 🧠 in single (ask 5), cards that absorb walls, the read-aloud follow-up, and heard-only context. Law 10 and "file each ask" need each one filed as a task on the session, so none is lost.
7. [fix] Stale doc: `ux/Dictate/doc/fast-and-smart.md:5` still says `session-assistant.txt` takes `voice`, `fast` or `off`, and doesn't mention `single`. `ux/Dictate/doc/settings.md` doesn't list the new `assistant` knob on `/api/session/settings`. `ux/Dictate/doc/map.md:32` (the "every dictation piece" map) has no row for the new role. The comment at `Servex/agents/Sessions.js:84` also still reads "the word off, fast or voice".
8. [note] The pause cue fires after every pause, whether or not a question is open (`single_cue`), so each pause costs one extra Sonnet turn just to say nothing. The owner asked for "the cheapest way to say nothing". Gating the cue in code, for example only after a "?" sentence or an open Question since the last reply, would skip most of those turns.
9. [note] The cue is timed from when each sentence reaches Servex (`single_pause_ms` after `single_say`), not from the owner's silence. The floor's `quiet` event (ux/Dictate/floor.js), which `answer_quiet_ms` already uses, is closer to "about 1 s of silence".
10. [note] The "own write" check (`Sessions.single.test.mjs:455`) only asserts `!tail`. It doesn't prove that the item tool's write never comes back to the writer through `updates`/`follow`, which is what the owner asked.
11. [note] The test writes a temp folder into the live site tree under a hard-coded date (`public/framework/ai/sessions/2026/11/02/.single-voice-test-<pid>`, test :421). The dev server's watcher will see it. A tmp repo root passed to `run_item` would be safer, if `run_item` allows one.
12. [note] The 16:20 fold-in is not addressed: correcting an early-sent sentence when Whisper's final text differs. The brief's clean path (`place` + `improve`) could serve it, but nothing wires Whisper's correction to it.
13. [note] The dual path checks out. Every gate now takes `s`, dual-only behaviour is keyed on `assistant_of(s) === "off"`, and the existing tests pass: `Sessions.test.mjs` 29/29 and `Sessions.single.test.mjs` 11/11, run in the worktree.

## Requirements
No page changed, so there are no shots; only Requirements and Words are answered.
- 1 "One agent, a new role… a setting picks single or dual… dual stays the default" — yes — `roles.js` row `single-voice-assistant`, `tiers.js` `voice_single` Sonnet, `ASSISTANTS` + per-session `settings({assistant})`; the default is still `voice` (test 1)
- 2 "It gets every sentence as it ends… minimal cleaning… never rewording" — yes — `single_say` sends each sentence at once (test 3); brief :9; V3 shows the cleaned text with the raw words kept (test :445-453)
- 3 "Silent work first: file it, show the right context card, amend a card by id" — no — cleaning and the title work; paragraph, card and move aren't drawn by V3; there are no Ref cards (findings 4, 5)
- 4 "Speak on a pause cue (~1 s, a setting); can a turn end with no reply; bigger work to a spawned agent" — yes — `single_cue`, `SERVEX_SESSION_SINGLE_PAUSE_MS`; `heard()` drops text when no cue is open; the brief delegates with `spawn_agent task:{from,id}` (finding 8 on cost)
- 5 "One check mark per sentence… no 🧠… cards absorb walls" — no — deferred and not filed (finding 6)
- 6 "It knows its own system… brief explains the item tool per move… add a verb if missing, test each" — no — it can't read the readmes; the move verbs V3 needs aren't added (findings 3, 4)
- Investigate first 1–4 — no — pass 1 only, no measured timings, no prior art (finding 2)
- Also in the plan: reply queue, heard-only context, session switching — yes — plan.md "Owner's words" covers all three
- 16:10 brief short and names its own files — yes — 53 lines, test :415-419
- 16:10 answer silently, delegate heavy work, no `eval` — yes — brief :42-53
- 16:10 add returns ids at any depth; no echo of own writes — no — top level only; the echo check is weak (findings 5, 10)
- 16:20 correct a sentence by id — n/a
- 16:30 pacing rules in the brief — yes — brief :42-44 (silent first, one paragraph, on the question's card)
- Class with live instances — n/a

## Words
- content: plain sentences, one idea each — yes — `ux/Dictate/doc/single-voice-assistant.md` opens with "What this is" in plain words
- content: the takeaway first — yes — the doc's first paragraph and the brief's first line
- content: no undefined jargon — no — the doc uses "thought hold", "wake gate" and "cue" without defining them (doc :9)
