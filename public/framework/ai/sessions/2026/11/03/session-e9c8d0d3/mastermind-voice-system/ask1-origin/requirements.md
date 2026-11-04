# Ask 1: a task filed by the voice agent carries its origin (Budget: $4)

Load the `minion` skill first. Work only in the worktree `C:/Code/lew42/worktrees/qf-2` (branch `worktree/qf-2`, from michael/dev). Tests first, commit by exact path after each working step, do not merge or push (the mastermind reviews and merges). Never stash, never touch the owner's tabs or kill servers.

The owner's words: [owner-feedback-2026-11-03b.md](../owner-feedback-2026-11-03b.md), ask 1 (read it and [ux/Dictate/doc/principles.md](/framework/ux/Dictate/doc/principles.md)). In short:
- The voice agent files each task on the session with the `item` tool.
- The chat shows each task as a message that references it.
- Each task carries `from: {prompt, sentence}` and the owner's raw words.
- It is handed off by id (`spawn_agent task: {from, id}`), and the mastermind that gets it can read the verbatim words.

## Deliverables (each ticked with proof)

1. **`from` on a task.** `tasks.add` (item tool, `Servex/agents/page_tools.js` around :1270-1315) accepts `from: {prompt: "p-…", sentence: "<at>"}` and stores it on the task; it survives replay (`Task` in `public/framework/core/Task/`) and a hand-off. Find out first whether it already does (the spawn call's own `task: {from, id}` uses the word `from` for something else, a record URL; do not break that). Add a test beside the code you touch.
2. **The raw words reach the mastermind.** Prove: a task filed with `from` and `text`, then moved by `spawn_agent task: {from: <session url>, id}` (`move_item`, `page_tools.js:679`), still has `from` and `text` in the moved task's `task.jsonl`, and the new agent's first message includes them (find where Servex writes that first message and, if `from`/`text` are missing, add them as a short line: the sentence's at and the raw words, never retyped by an AI).
3. **A message that references the task.** A `tasks.add` on a voice session writes a `Ref` into `session.messages` (`Servex/agents/ChatWriter.js` ~:98 already has a ref-adding method; check who calls it and whether a plain `item` task add reaches it). Prove with a replay test that the chat's messages list gets one ref line per task added, in order, after the owner's bubble that holds `from.sentence`'s prompt.
4. **The brief.** In `Servex/agents/single-voice-assistant.md`, the task example (the `tasks.add` near the end) now passes `from: { prompt: "<the (prompt p-…) id>", sentence: "<the [on … at <at>] value>" }` and `text` = the owner's words verbatim. One short sentence, no new rules. Keep the brief's tone (unprimed, no lists of banned words).

## Fences
Own: `Servex/agents/page_tools.js`, `Servex/agents/ChatWriter.js`, `Servex/agents/single-voice-assistant.md`, the Task class only if `from` needs a field. Do not touch `Sessions.js` pause or cue code (another minion owns it) or the chat-settings files (plugins panel).

## Report
One screen in your `task.jsonl` as log lines: what changed (file:line), the test commands and their output. Then tell the mastermind in one line via the harness.
