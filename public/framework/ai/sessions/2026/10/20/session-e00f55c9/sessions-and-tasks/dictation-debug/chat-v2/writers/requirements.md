# Chat v2, step 3: the assistants write the conversation

Budget: $8. Load the `minion` skill first, then `code`. Your parent is `mastermind-chat-v2`. The owner's raw words are in `public/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/`.

## What the owner wants

A session's conversation is its `tasks` list in its `session.jsonl`, and Chat v2 (`public/framework/ext/Chat/v2/`, live at `/framework/ext/Chat/v2/?src=<session.jsonl url>`) draws it. Today nobody writes those lines. Make the two voice assistants write them.

- **The fast seat** (`Servex/agents/Sessions.js`, `voice_say`, line ~426) writes **Prompts only**. A new Prompt is added when the owner starts speaking. Each utterance pushes its raw Whisper text, and the cleaned text goes into paragraphs.
- **The smart seat** (its instructions are `Servex/agents/session-smart.md`) writes **replies, questions and tasks** onto the prompt they answer.
- **The page talks to the assistants too.** UI errors, clicks and page context go down the same POST as speech (`Servex/Servex.js`, `router.post("/api/voice", …)`, line ~812), tagged `kind`: `speech` (the default), `error`, `click` or `context`. The fast seat files errors as `log` lines; the smart seat reads all of them as context.

Read the decision first: `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-shape.md`, the Decision section to the end, including "Two more".

## The line shapes (agreed; write exactly these)

```js
{"tasks":{"add":{"type":"Prompt","id":"p-<ms>","raw":[],"paragraphs":[],"replies":[],"tasks":[]}}}
{"p-<ms>":{"raw":{"push":"whisper text"}}}
{"p-<ms>":{"paragraphs":{"add":{"id":"a","text":"…"}}}}          // or {"append":{"id":"a","text":" more"}}
{"p-<ms>":{"title":"…","text":"…"}}                                 // smart seat: the refined version
{"p-<ms>":{"replies":{"add":{"id":"r-<ms>","text":"…","by":"smart","ts":"<iso>","anchor":{"sentence":"a1","words":[0,3]}}}}}   // anchor optional
{"p-<ms>":{"tasks":{"add":{"type":"Question","id":"q-<ms>","text":"…","from":"p-<ms>"}}}}
{"q-<ms>":{"answer":{"text":"…","by":"smart","ts":"<iso>"}}}
```

The real `core/Task/Prompt.js` and `Question.js` classes are being built by `mastermind-prompt-task` and have not landed. Don't write them or depend on them; write the plain lines.

## Build

1. **Look first** (about 15 minutes):
   - Find which `session.jsonl` the voice session belongs to and how lines are appended to it today (the item tool, `Item.set`, Servex's single writer). Use the existing writer; never add a second `fs.appendFile` path.
   - Write `plan.md` in this folder, one screen: the files you will change, the function names, and what each writes where.
   - Log it as a `log` line, then build straight on; don't wait for an answer.
2. **One small writer module** that both seats' code paths use, for example `Servex/agents/PromptLines.js`, with one function per line shape above. Sessions.js calls it from `voice_say`. Keep the Sessions.js change small.
3. **The smart seat**: add a short section to `session-smart.md` saying which lines to write and through which tool. Show one example of each line.
4. **The kind-tagged POST**: `/api/voice` accepts `kind` (default `speech`) and routes `error` to a `log` line and `click`/`context` to the smart seat as context. Add a small browser module, `public/framework/ext/Chat/v2/report.js`, that posts `window.onerror`/`unhandledrejection` as `error` and opt-in clicks as `click`. Don't touch `ux/Dictate/*`: another agent is working there.
5. **Test without the live Servex**: a node test (`Servex/agents/PromptLines.test.mjs`) that writes each line shape into a temp `session.jsonl` through the module. It then folds the file with `public/framework/ext/Chat/v2/ChatV2Model.js` and asserts the prompt, raw, paragraphs, reply, question and answer all come out. Servex runs your code only after the parent's restart; say in your report exactly what the restart will switch on.

## Fence

You may change only these: `Servex/agents/Sessions.js` (the `voice_say` path only), `Servex/agents/session-smart.md`, `Servex/Servex.js` (the `/api/voice` route only), the new `Servex/agents/PromptLines.js` and its test, the new `public/framework/ext/Chat/v2/report.js`, and a "Who writes" section in `public/framework/ext/Chat/v2/readme.md`.

## Rules

- Worktree `C:\Code\lew42\worktrees\chat-v2-writers`, branch `worktree/chat-v2-writers`. Commit after every working piece; never edit the main tree.
- `node --check` every JS file. From the main repo root, run `node Server/smoke.mjs C:/Code/lew42/worktrees/chat-v2-writers`; it must show no FAIL.
- Never kill or restart the dev server or Servex (no `sustain.mjs --restart`), never drive the owner's tabs. Follow the minion skill's never-list (no stashing; diff instead).
- Every spawned process sets `windowsHide: true`.
- Log progress as `log` lines in `session.jsonl` in this folder, using `node .claude/hooks/append.mjs <file> <lines.json>`.
- Write each design decision into the readme's Decisions, one or two sentences with the alternative.
- Don't merge: your parent reviews and merges.

## Deliverable

Committed on `worktree/chat-v2-writers`. Your last message is one screen: what writes what, the commit, the test result, what the Servex restart turns on, and your decisions with their alternatives.
