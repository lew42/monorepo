# The shared reader — design, and why step 2 stopped short of building it

Written by `minion-minion-chat-reader` after step 1 (ChatV2Model fixes) landed. Step 2 ("make ONE reader both views call") turned out to be bigger surgery than the brief's own stop-line (300 changed lines or a dozen callers), so this is the design, not the build.

## What exists today

- **`ChatV2Model.js`** already IS a shared reader, for the Prompt/paragraph/Task/Question tree: `apply(line)` folds `session.jsonl`'s `tasks.add` / by-id-edit lines into plain objects, with `title`, `text`, `sentences(prompt)`, `phase(question)`, `replies`, `answer`. **V1 already imports it** (`ux/Dictate/chat.js` `draw_task()`) to draw the Task/Question rows that nest under a Prompt. After this task's step 1, its `sentences()` matches core's splitter and its `edit()` matches core's `paragraphs.replace`/dedupe-by-id/raw-push rules (`core/Task/Prompt.js`, `core/List/List.js`).
- **V1's main chat log (`ext/Chat/Chat.js`, 860 lines) is a SEPARATE fold**, not built on `ChatV2Model` at all. It reads flat `{chat:{from,text,at,…}}`, `{react:…}`, `{type:"ask"|"reply"|"update"|"task"}` lines directly — a bubble per utterance, with its own dedupe key (`key()`), merge-into-last-bubble logic (`mergeable`), reactions (`react_on`), threads (`thread_item`), rename, fix/revision pairs, live streaming bubbles. None of this reads a Prompt or a paragraph; it never calls `ChatV2Model`.
- **V2 (`ChatV2.js`/`ChatV2Model.js`) draws only Prompts** — no bubbles, no reactions, no threads, no rename, no live-streaming "draft" bubble, no fix/revision pairs. It is deliberately the read-only "step 1 of the new chat" (`ext/Chat/v2/readme.md`): the owner's own decision record says Chat.js stays untouched until v2 replaces it.

## Why unifying further is NOT a small edit

The brief's ask — "one reader... Fields it must serve: raw, paragraphs, sentences, title/text, replies, questions/tasks, sent marks, working" — is already served by `ChatV2Model` for the Prompt tree. The part that is NOT unified is V1's bubble log, and that is not a reader problem, it is a **data-model gap**: V1's bubbles are built from a different line shape (`{chat:...}`) than V2's Prompts (`{tasks:{add:{type:"Prompt",...}}}`). Pointing V1's bubbles at `ChatV2Model` instead would mean one of:

1. **Make `Chat.js` read Prompts/paragraphs instead of `{chat}` lines** — rewrite `chat_line()`, `key()`, `mergeable()`, `fill()`, reactions/threads/rename/fix-pairs against Prompt/paragraph/reply shapes instead of flat chat lines. `Chat.js` is 860 lines and is imported by `ux/Dictate/Widget.js`, the session detail page, the ✦ sheet, and the desktop drawer (`ext/drawer/ChatView.js`) — a dozen-plus call sites, and every reaction/thread/rename/fix feature has to be re-derived from the Prompt shape (Prompts don't carry `fix`, `revision`, or per-piece reaction anchors today).
2. **Make Servex write chat lines as Prompt lines always** (drop the separate `{chat}` shape) — a Servex-side change (`Servex/agents/Sessions.js`, `PromptLines.js`) plus a migration for every live session, well outside a chat-reader task.

Either path is a real redesign of how V1's chat is modeled, not a refactor of two files — past the brief's own 300-line/dozen-caller stop condition.

## What's left open, decided or not

1. **Smaller, in-scope win, not yet done:** point the session detail page's own chat tab at `ChatV2Model` the same way V1 already does for Task/Question rows, if it has its own separate fold today — not confirmed; worth a follow-up look at `ai/AISession/AISessionDetail.js`'s Chat tab before assuming it needs the same big surgery.
2. **Recommendation:** leave `Chat.js` as the compact V1 bubble log (reads `{chat}` lines) and `ChatV2Model`/`ChatV2.js` as the rich Prompt reader, same as today — they already agree on the Task/Question sub-tree through `ChatV2Model`, which is the one real overlap. A full merge is its own task, sized for a worktree + plan, not a minion step.
3. Not investigated here (budget): whether `ai/AISession/AISessionDetail.js`'s session-detail Chat tab has a third, separate fold of its own that could be swapped for `ChatV2Model` cheaply.
