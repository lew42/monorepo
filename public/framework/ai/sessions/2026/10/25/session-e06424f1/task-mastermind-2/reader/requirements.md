# Reader: one shared Prompt reader for Chat V1, V2 and the session detail page

Budget $6, Sonnet. Load the `minion` skill first. Parent: task-mastermind-2 (plan: [../plan.md](../plan.md)). Work in a worktree (`node Server/worktree-up.mjs chat-reader`), commit each step by exact path, never edit the main tree, never restart the dev server, never `git stash`.

Read first: [dictation-debug/handoff.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/handoff.md), [ux/Dictate/doc/pipeline.md](/framework/ux/Dictate/doc/pipeline.md), [core/Task/doc/prompt-record.md](/framework/core/Task/doc/prompt-record.md), `core/Task/Prompt.js`, `core/Task/sentences.js`, `ext/Chat/v2/ChatV2Model.js`, and how V1 (`ux/Dictate/chat.js`, `ux/Dictate/Widget.js`, `ext/Chat/Chat.js`) reads the same session.jsonl.

The owner: one shared reader/Prompt data for Chat V1 and V2; V1 compact, V2 rich is fine; the same on the session detail page. Unify through the reader, not by migrating content.

## Do, in this order (land step 1 first)

1. **V2 model fixes, small:** `ChatV2Model.sentences()` imports `core/Task/sentences.js` (drop its regex; "session.json" must stay one sentence). `edit()` handles `paragraphs.replace` ({id,text}), `raw` pushes as string or array, and dedupes `paragraphs.add` by id (core keeps one). Extend `ChatV2.test.mjs` for each. Commit and log.
2. **The shared reader:** find where V1 and V2 each fold lines into prompts, paragraphs, replies and questions, and make ONE reader both views call.
   - Extend what exists (core's `Prompt` fold, or a thin plain-object fold both import); never write a second one.
   - It serves: raw, paragraphs, sentences, title/text, replies, questions/tasks, `sent` marks, and `working:{by,at}` (added by a sibling task; pass unknown fields through).
   - V1 keeps its compact look. Point the session detail page's chat at the same reader if it has its own.
   - **Stop rule:** if it is big surgery (over about 300 changed lines, or a dozen callers), write the design into `plan.md` here, report, and do not build it.
3. Update the readmes you touched (ext/Chat/v2/readme.md; the "What survives replay" table in prompt-record.md) so they are true now.

## Check and land

`node public/framework/ext/Chat/v2/ChatV2.test.mjs` plus whatever test V1 has. A screenshot of V1 and V2 for the same session at 400 and 1200, read yourself, `git add -f` into `shots/`. Log findings as `log` lines in your own task log. Report one screen to task-mastermind-2: what changed, test counts, what is left open. Do not merge; task-mastermind-2 reviews and merges.
