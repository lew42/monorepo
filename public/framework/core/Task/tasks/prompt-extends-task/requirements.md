# core/Task: Prompt and Question extend Task

**Why this exists.** The owner asked for `Prompt extends Task` on 2026-10-24 (session-is-a-task brief, items 21 and 21b). The deputy filed it as an open task on its record (`prompt-extends-task-prompts-in-session-t`), but it was deferred at review and never built. On 2026-10-25 the owner picked the chat shape it serves: Option C in [chat-shape.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-shape.md). Read that file's Decision section first, then items 21–21b and 31 of [session-is-a-task/requirements.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-is-a-task/requirements.md).

## Build

1. **`class Prompt extends Task`**, registered so `tasks.add({type: "Prompt", …})` makes one.
   - It holds the raw Whisper or typed text (`raw`, never lost), the cleaned `paragraphs` (each with an id), the numbered sentences with ids, and `replies`.
   - A reply may carry an anchor: a sentence id, or a sentence id plus a word range.
   - Its own `tasks` hold the asks made from it. Completion and cost roll up on read: task → prompt → session.
2. **`class Question extends Task`**, with three states:
   - **open** when it is asked;
   - **answered** once it has an `answer`;
   - **complete** once the owner has read it.
   - "Answered but not complete" must be one query.
3. **Small deltas for the fast assistant:** add a paragraph, and append text to a paragraph by id (core/Item's inbox already notes partial string edits). Each one is one item-tool call, a few ms.
4. **Fold `prompts.jsonl` into the session.** Write a scripted migration with a dry run and a manifest: every record in a session's `prompts.jsonl` becomes a Prompt in that session's `session.jsonl`, keeping its raw text, clean sentences, parts and cites. `Server/PromptRecords.mjs` and the hook then write Prompts directly. Keep the old file in place, and say so in the readme.
5. **The trace query.** Given words the owner said, find the Prompt, its time, the tasks made from it, and each task's state. A node script or a Task static, plus a test.
6. **Tests and readme.** Put `Prompt.test.mjs` and `Question.test.mjs` beside the classes, and update `core/Task/readme.md` with the shape in plain words (item 21b).

## Fences

- **Yours:** `core/Task/`, `core/Session/` (only what this needs), `Server/PromptRecords.mjs`, `Servex/agents/PromptTasks.js` and the migration script.
- **Not yours:** the chat widget. mastermind-dictation-2 builds Chat v2 on your classes; agree field names with it by message.
- `ext/Refine/Prompt.js` is the old plain class. Extend or replace it; don't leave two Prompt classes. Say which you chose and why.
- Work in a worktree, then review, then merge via `node Server/merge.mjs <worktree folder>`.
