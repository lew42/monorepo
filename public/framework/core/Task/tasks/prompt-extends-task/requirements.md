# core/Task: Prompt and Question extend Task

**Why this exists.** The owner asked for `Prompt extends Task` on 2026-10-24 (session-is-a-task brief, items 21 and 21b). The deputy filed it as an open task on its record (`prompt-extends-task-prompts-in-session-t`), but it was deferred at review and never built. On 2026-10-25 the owner picked the chat shape it serves: Option C in [chat-shape.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-shape.md). Read that file's Decision section first, then items 21–21b and 31 of [session-is-a-task/requirements.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-is-a-task/requirements.md).

Option C = the chat shows each dictation as a Prompt card holding its asks (see chat-shape.md).

## Build

```
Session
└─ Prompt  (raw, paragraphs[id], sentences[id], replies[anchor])
   ├─ Task   (an ask made from it)
   └─ Question  open → answered → complete
```

- [x] 1. **`class Prompt extends Task`**, registered so `tasks.add({type: "Prompt", …})` makes one.
   - Proof: `core/Task/Prompt.js`, `Prompt.test.mjs` 13/13.
   - It holds the raw Whisper or typed text (`raw`, never lost), the cleaned `paragraphs` (each with an id), the numbered sentences with ids, and `replies`.
   - A reply may carry an anchor: a sentence id, or a sentence id plus a word range.
   - Its own `tasks` hold the asks made from it. Completion and cost roll up on read: task → prompt → session.
- [x] 2. **`class Question extends Task`**, with three states:
   - Proof: `core/Task/Question.js`, `Question.test.mjs` 6/6; `{unread:{}}` is the one query.
   - **open** when it is asked;
   - **answered** once it has an `answer`;
   - **complete** once the owner has read it.
   - "Answered but not complete" must be one query.
- [x] 3. **Small deltas for the fast assistant:** add a paragraph, and append text to a paragraph by id (core/Item's inbox already notes partial string edits). Each one is one item-tool call, a few ms.
   - Proof: `paragraphs: {add|append|replace}`, `raw: {push}`, `replies: {add}`; tested in `Prompt.test.mjs`.
- [x] 4. **Fold `prompts.jsonl` into the session.** Write a scripted migration with a dry run and a manifest: every record in a session's `prompts.jsonl` becomes a Prompt in that session's `session.jsonl`, keeping its raw text, clean sentences, parts and cites. `Server/PromptRecords.mjs` and the hook then write Prompts directly. Keep the old file in place, and say so in the readme.
   - Proof: `Server/PromptsToSession.mjs` (dry run, manifest, idempotent), 11/11; `PromptRecords.mjs` mirrors into `session.jsonl`, `Server/PromptGroup.test.mjs` 7/7; readme says `prompts.jsonl` stays.
- [x] 5. **The trace query.** Given words the owner said, find the Prompt, its time, the tasks made from it, and each task's state. A node script or a Task static, plus a test.
   - Proof: `Server/PromptTrace.mjs` and `Prompt.trace`, `PromptTrace.test.mjs` 3/3.
- [x] 6. **Tests and readme.** Put `Prompt.test.mjs` and `Question.test.mjs` beside the classes, and update `core/Task/readme.md` with the shape in plain words (item 21b).
   - Proof: both tests beside the classes; `core/Task/readme.md` + `doc/prompt.md`.

## Fences

- **Yours:** `core/Task/`, `core/Session/` (only what this needs), `Server/PromptRecords.mjs`, `Servex/agents/PromptTasks.js` and the migration script.
- **Not yours:** the chat widget. mastermind-dictation-2 builds Chat v2 on your classes; agree field names with it by message.
- [x] `ext/Refine/Prompt.js` is the old plain class. Extend or replace it; don't leave two Prompt classes. Say which you chose and why.
  - Proof: replaced. The old class is now `PromptRun` (`ext/Refine/PromptRun.js`); core `Prompt extends Task` is the only Prompt. Why: [doc/prompt.md](../../doc/prompt.md#one-prompt-class-the-decision).
- Work in a worktree, then review, then merge via `node Server/merge.mjs <worktree folder>`.
