# Prompt and Question: what the owner said, as tasks

A **Prompt** is one thing the owner said or typed, kept as a Task. A **Question** is a question asked of the owner or by the owner, kept as a Task. Both live in a session's `session.jsonl`, so the chat can show a dictation as a card holding its asks (Option C in [chat-shape.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-shape.md)). Code: [`Prompt.js`](../Prompt.js), [`Question.js`](../Question.js). Tests: `node Prompt.test.mjs`, `node Question.test.mjs` (in `core/Task/`). The record shape with example lines, who groups sentences into Prompts, and the open defects: [prompt-record.md](prompt-record.md).

```
Session
└─ Prompt  (raw, paragraphs[id], sentences[id], replies[anchor])
   ├─ Task   (an ask made from it)
   └─ Question  open → answered → complete
```

## Prompt

| Field | What it is |
|---|---|
| `raw` | Array of text chunks, exactly as heard or typed. Only ever appended to; never edited or dropped. |
| `paragraphs` | The cleaned text, a list of `{id, text}`. |
| `sentences` | Computed from the paragraphs by the one splitter, [`sentences.js`](../sentences.js); never stored: `<paragraph id><n>` (`a1`, `a2`…), or `r<n>` before any paragraph exists. A migrated paragraph may carry its own `sentences` array so the old numbering still holds. |
| `title`, `text` | The smart assistant's refined version of the Prompt. `prompt.text` returns it, or the cleaned paragraphs when there is none; `prompt.cleaned` is always the paragraphs joined. |
| `replies` | A list of `{id, text, by, anchor}`. `anchor` is `{sentence: "a2"}` or `{sentence: "a2", from: 3, to: 7}` (word positions); no anchor means the reply is to the whole prompt. |
| `tasks` | The asks made from it (Tasks, Questions), as for any Task. |
| `parts`, `subject`, `refined`, `notes`, `handled`, `process` | The splitter's record, kept as plain data ([ext/Refine/doc/prompt-records.md](/framework/ext/Refine/md/doc/prompt-records/)). `parts[].cites` are sentence ids. |

**Completion is computed on read, never stored.** With `parts` recorded, a Prompt is complete when every part is settled (done, documented, answered, no-action, or a task that is complete) and no sentence is left uncited. Otherwise it is the share of its own `tasks` that are complete. It reads `complete` by itself when that reaches 1, so a Session's tally counts it. Cost sums the same way: task → Prompt → Session.

**Deltas** (one item-tool call each; `P` is the Prompt's path):

- more words heard: `{raw: {push: "text"}}`
- a new paragraph: `{paragraphs: {add: {id: "b", text: "…"}}}`
- add to a paragraph: `{paragraphs: {append: {id: "b", text: " more"}}}` (makes it if missing)
- rewrite a paragraph: `{paragraphs: {replace: {id: "b", text: "…"}}}`
- a reply: `{replies: {add: {id: "r1", text: "…", anchor: {sentence: "b1"}}}}`

## Question

`line_fields`: `text`, `from` (the Prompt it came from), `answer` (`{text, by, at}`). `question.phase` is `open` (no answer), `answered` (has an answer, not yet read) or `complete` (the owner read it). **Answered but not read is one query:** `item({path: SESSION, delta: {unread: {}}})` returns every answered, not-complete Question in the session. `{complete: {}}` needs no evidence on an answered Question; reading it is the evidence. A Question nests under its Prompt's `tasks`, or sits in the session's list with `from` naming the Prompt; both are found.

## One Prompt class (the decision)

There was an older plain `Prompt` in `ext/Refine/Prompt.js`. It is now **`PromptRun`** (`ext/Refine/PromptRun.js`): the live refine demo's object, which keeps its scoring and view and borrows `KINDS`, `OUTCOMES`, `SETTLED` and `settled` from core `Prompt`. Core `Prompt extends Task` is the only class named Prompt, because the owner's chat needs a Prompt that is a Task (tasks nest, state rolls up, the item tool can address it). The alternative, making the Refine class extend Task, would pull a demo-only view and scorer into core.

## Where Prompts are written, and the old file

- **New prompts:** `Server/PromptRecords.mjs` still writes the session's `prompts.jsonl` (the Coverage card, Dictate and Echo read it), and **also** writes each Prompt into `session.jsonl`: one `tasks.add` of type `Prompt` the first time, then a delta updating its paragraphs, parts and subject. `prompts.jsonl` stays in place and is not deleted.
- **Old prompts:** `node Server/PromptsToSession.mjs` (dry run by default; `--apply` writes; `--repo <checkout>` picks the tree) folds each session's `prompts.jsonl` into `session.jsonl` as Prompts, keeping raw, clean sentences (as explicit `sentences`, so the old cites keep their meaning), parts and cites. It writes a manifest of every session and prompt it touched, skips a prompt already present (safe to re-run), and skips an old folder with no `session.jsonl`.
- **Asks already filed** stay where they are, at the session root, linked back by `source.prompt` / `from`.

## The trace: "didn't I ask for this?"

`node Server/PromptTrace.mjs "words you said" [--session <slug|id8>] [--days 30] [--min 0.8] [--json]` finds the Prompt whose words contain yours, when it was said, the tasks made from it and each one's state. The same query is `Prompt.trace(session, words)` (a static; test: `node Server/PromptTrace.test.mjs`).
