<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The chat data model  next phase  one list drives every view  you are a mastermind  on Opus  high effort " (words: chat, data, model, next, phase, one, list, driv, every, view, you, mastermind, opu, high, effort)

## Tasks (8, best first)
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-11-02 [Session chat: one real message list, dual-written](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-messages/) — A voice session's chat is one real list, session.messages, written beside V1's lines; the fast seat's {place} improves now update a sentence's text in place (merges b35ee6370, 9165c4e6c; reviewed twice, every finding answered). one List of real Items, item to… · paths 1/1 exist
- 2026-10-26 [Chat V3 rough draft: a plain view over the session's tasks list, behi…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-v3-draft/) — Chat V3 is merged to michael/dev, behind its own v3 chip (not the default). Demo: [Chat v3](/framework/ext/Chat/v3/). Docs: [readme](/framework/ext/Chat/v3/readme.md). V3 draws the session's tasks list, Prompts at the root: ChatV3.test.mjs 19/19 Raw words gra… · paths 1/1 exist
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-12 [Refine: Haiku by default, one chat input, live refine while you talk](/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/) — Refine runs on Haiku, the outline grows while you talk, and every chat area uses one input. Clean + refine on Haiku, OpenRouter only by the switch: RefineCall.model(); write openrouter in session-backend.txt to flip ([models.md](/framework/ai/doc/models.md)) … · paths 1/1 exist
- 2026-10-01 [Local AI phases 2+3: Servex runs llama-server as a model provider](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/) — Servex talks to a model on this machine's own GPU — merged, restarted, and verified live (a real reply came back from llama-server through the Claude Agent SDK after the restart). checked first (Phase 3 ask 2): llama-server already speaks the Anthropic Messag… · paths 2/2 exist
- 2026-09-25 [AI 2: every element weighed, one timeline, cards open for you](/framework/ai/sessions/2026/09/25/ea1cc34a-7cb3-420e-b6dd-383b3006dead/ai2-lead/) — AI 2, step by step: [press Next](/framework/ai/2026-09-25/ai2-lead/). Every element weighed, the rail is one timeline, and a card made for you opens on your screen. ![](/framework/ai/2026-09-25/ai2-lead/shots/2-rail.png) full-width $ bar: a short bar with its… · paths 0/2 exist, gone: framework/ai2/2026/09/24/ai-dashboard/ framework/ai2/live/

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/List](/framework/core/List/) — used by 28 files
- [core/View](/framework/core/View/) — used by 337 files
- [ext/Chat](/framework/ext/Chat/) — used by 15 files
- [ext/DataGrid](/framework/ext/DataGrid/) — used by 10 files
- [ext/highlight](/framework/ext/highlight/) — used by 24 files

## Docs and readmes
- [Core — the eight classes under every page (listed under Mor…](/framework/core/readme.md) — New here? Read [doc/overview.md](./doc/overview.md) first: the whole core API as short pseudo-classes, and one change followed from click t…
- [Collab — a mastermind's members through phases to a vote, l…](/framework/ext/Collab/readme.md) — ## What One collaboration run — a mastermind fans a question out to a few cheap members, they work through ordered phases (facts, then brie…
- [core/Session/Chat — a session's chat as one real list](/framework/core/Session/Chat/readme.md) — A voice session's conversation is one ordered list of real Items, session.messages, beside the owner's raw words in session.sentences. A vi…
- [DataGrid — one grid for every list of records: a table or a…](/framework/ext/DataGrid/readme.md) — Resize, sort, filter, windowing, and two drawers. The markup that used to be ui/datagrid and ui/table lives here now (those two files re-ex…
- [Object — one default view for any object: a row you can ope…](/framework/ux/Content/Object/readme.md) — view(x) draws any object (an Item, a List, a class, a plain object, an array) as one row: the class's icon, the id, the class name as a sma…
- [Templates — one layout, rendered many times, bound to live …](/framework/core/Page/doc/templates.md) — A template is a page that knows one layout and can draw it as many times as you like, each time with its own data. Instead of hand-building…
- [ext/Chat/list — the simplest live view of a session's chat …](/framework/ext/Chat/list/readme.md) — ChatList draws session.messages ([core/Session/Chat](/framework/core/Session/Chat/readme.md)) as bubbles, in the list's order: the owner's …
- [Browse — one list-and-detail view: a resizable list on the …](/framework/ux/Browse/readme.md) — See it: [the demo](/framework/ux/Browse/) (a Browse with sample rows) and its [Architecture](/framework/ux/Browse/architecture/) tab. The I…

## Sessions tagged with these words
- 2026/10/14 [Dictate-next-4 review](/framework/ai/sessions/2026/10/14/session-eadb28a6/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.83
- 2026/10/14 [Nav-model page with live demos](/framework/ai/sessions/2026/10/14/session-e9f013e5/) — kind/owner model/opus mod/core/page task/mastermind-repo-slim page/catalog · $13.00
- 2026/10/14 [Voice-connector review](/framework/ai/sessions/2026/10/14/session-e5bbf063/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.62
- 2026/10/14 [Tasks dashboard review](/framework/ai/sessions/2026/10/14/session-e1115e59/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/tasks · $0.76
- 2026/10/14 [Reviewer dictate-next-4 session](/framework/ai/sessions/2026/10/14/session-c1ae0db1/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.83
- 2026/10/14 [Scripts rename](/framework/ai/sessions/2026/10/14/session-6a78c3cb/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim docs/readme · $0.90

## Owner asks
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)

## Commits
- 33eaf5e52 Chat: resurface round 2 — answered Question surfaces at the root, by time
- a2436b625 Chat: a Question card moves to the end when it is answered

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: The chat data model, next phase: one list drives every view (you are a mastermind, on Opus, high effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The chat data model, next phase: one list drives every view (you are a mastermind, on Opus, high effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
