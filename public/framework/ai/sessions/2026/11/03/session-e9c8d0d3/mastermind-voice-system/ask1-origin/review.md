verdict: fix
1. [fix] The proof for deliverable 3 (one ref line per task, in order, after the owner's bubble) is not committed. It exists only as an uncommitted edit to `Servex/agents/task-origin.test.mjs` in the worktree `qf-2`. `review/diff.patch` (commit 5d1b2fc43) still holds the old check, which only asks "is there any Ref?". Commit the edit. With it, the test passes 12 of 12 (run 2026-11-03).
2. [note] In that uncommitted test, the test file writes the owner's bubble itself, before any task (`task-origin.test.mjs`, the `messages.add` Prompt line). So "after the bubble" is true just because of the setup. A bubble written by `ChatWriter.owner()` would prove the real order.
3. [note] With an object `from`, the asker stamp is skipped (`page_tools.js:1319`, which checks `a.from === undefined`). So a voice-filed task gets no automatic "it's done" notice when it completes. `Servex/agents/doc/messaging.md:40` records this as a tradeoff. The owner did not ask for the notice, but the voice session will not hear about completion unless the mastermind tells it.
4. [note] `from` now has three meanings on a task: an asker's agent id, a Prompt id (a Question's `from`, `core/Task/doc/prompt.md:37`), and the new `{prompt, sentence}` object. `messaging.md:40` names only the first two clashes; one line in `core/Task/readme.md` listing all three would help the next reader.
5. [note] The owner's words reach the mastermind only through `spawn_agent task: {from, id}` (`Agents.js:230`, `:250`). If the voice assistant messages `mastermind-voice-system` instead (`single-voice-assistant.md:54`), only the id goes along. No live spawn has exercised the `Agents.js` path yet; one handoff after the merge would confirm it.

## Requirements
- 1 "`from` on a task … survives replay and a hand-off" — yes — `task-origin.test.mjs` checks 1, 2 and 6 pass: the written line, `Task.replay` and the `move_item`'d task.jsonl all keep `from` and `text`. The spawn's own `task.from` (a record URL) is not broken: `task_origin()` reads it as the source file.
- 2 "The raw words reach the mastermind" — yes in code, but not proven live — `handoff-note.js` adds ` The owner's own words (at <at>): "<text>"` to the first message (`Agents.js:250`). It reads them before the unawaited move starts (`Agents.js:230`).
- 3 "A message that references the task … in order, after the owner's bubble" — yes, but only in the uncommitted test — 3 refs come out in the order the tasks were added, all after the bubble (finding 1).
- 4 "The brief" — yes — `single-voice-assistant.md:57` passes `from: {prompt, sentence}` and `text: "The tab bar is broken on my phone."`; one sentence was added at :61. No list was added and the brief's tone is unchanged.
- Fences — yes — the code changes are in `page_tools.js`, `Agents.js` (the spawn's first message, which deliverable 2 points to), the new `handoff-note.js`, docs and the test. `Sessions.js` and the chat-settings files are untouched.
- Class instances page — n/a (no new class; `handoff_note` and `task_origin` are functions)
- Indexed — yes — `Servex/agents/readme.md:118` names `task_origin()`, `handoff-note.js` and `task-origin.test.mjs`; `doc/messaging.md:40` covers the overloaded `from`.
- A fresh agent can continue — yes — requirements.md, the session.jsonl log and the earlier review findings in review.jsonl say what was done and what is left.

## Words
- Plain sentences — yes — the brief sentence and the messaging.md note are clear. The messaging.md line is long but explains a real tradeoff.
- Owner's words — yes — the example now uses first person ("my phone"), as the owner would say it.
