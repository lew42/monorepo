<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat v2  step 3  the assistants write the conversation" (words: chat, step, assistant, write, conversation)

## Tasks (8, best first)
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist
- 2026-10-01 [Chat: fixed assistant replies drawing twice](/framework/ai/sessions/2026/10/01/chat-duplicate-messages/chat-duplicate-messages/) — Fixed: every assistant reply drew twice in the chat. [ux/Dictate/chat.js](http://monorepo.localhost/framework/ux/Dictate/) listens for new lines two ways at once (an SSE push and a file poll) and only the owner's own echoed message was ever deduped against th… · paths 2/3 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-12 [Refine: Haiku by default, one chat input, live refine while you talk](/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/) — Refine runs on Haiku, the outline grows while you talk, and every chat area uses one input. Clean + refine on Haiku, OpenRouter only by the switch: RefineCall.model(); write openrouter in session-backend.txt to flip ([models.md](/framework/ai/doc/models.md)) … · paths 1/1 exist
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…
- 2026-10-09 [Chat: duplicate bubbles fixed at three sources](/framework/ai/sessions/2026/10/09/session-54aa047d/dup-chat-bubbles/) — Duplicate chat bubbles fixed (b87834ba2), one shared chat component, three causes. one bubble per message, typed and voice: 2x before, 1x after, at 400 and 1920 ([doc](/framework/ext/Chat/doc/duplicate-bubbles.md), proofs in doc/proof/) text twice inside one …
- 2026-10-02 [jsonl-writers](/framework/ai/sessions/2026/10/02/jsonl-writers/jsonl-writers/) — All 5 unchecked JSONL writers closed. A hand Write/Edit onto an existing .jsonl is now blocked; the browser's rpc:append validates every line before writing; ledger.mjs's own writes go through one checked path that can never go silent; flags.jsonl has a real …

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 10 files

## Docs and readmes
- [Chat — a scrolling chat log, composer, and conversation wid…](/framework/ext/Chat/readme.md) — Follows new messages while scrolled to bottom, formats Markdown bubbles with avatar icons, and supports threading and reactions. ## Use js …
- [Chat v2: a session's chat, drawn from its tasks list](/framework/ext/Chat/v2/readme.md) — Read-only step 1 of the new chat (the owner's decision, [chat-shape.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tas…
- [chat.js — one chat box, one conversation, every surface](/framework/ux/Dictate/doc/chat.md) — Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the desktop ☰ drawer's AI tab, a card's own sidebar,…
- [The voice assistant: one assistant places each sentence as …](/framework/ux/Dictate/doc/voice-assistant.md) — What it is. One plain assistant, the voice assistant, listens to a voice session. Each time you finish a sentence, your words are already s…
- [The ai section — a chat is a task](/framework/dev/DevBar/doc/threads.md) — <page>ai/<slug>/task.jsonl A thread is a directory next to the page it's about, holding the same task.jsonl [ext/JSONL](/framework/ext/JSON…
- [Chat architecture — one panel, one log, one composer, every…](/framework/ext/Chat/doc/architecture.md) — Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation…
- [Chat](/framework/styles/layouts/chat/readme.md) — Conversation list, transcript, composer. Code: styles/layouts/chat/page.js _Stub — more to come._
- [chat.js — notes and architecture](/framework/ux/Dictate/doc/chat-notes.md) — ## Controller factory pattern Everything this file used to do with one module-level singleton now lives in create_controller(), so it can b…

## Sessions tagged with these words
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26

## Owner asks
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (servex-mastermind-opus, landed)

## Commits
- 9e947fcd7 sheet step 8: page hand-off from the global chat

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Chat v2, step 3: the assistants write the conversation

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat v2, step 3: the assistants write the conversation"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
