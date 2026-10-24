<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Item tool  instant read  query and CRUD of any item by path" (words: item, tool, instant, read, query, crud, any, path)

## Tasks (8, best first)
- 2026-10-23 [On the session /framework/ai/sessions/2026/10/20/session-e00f55c9/ (r…](/framework/ai/sessions/2026/10/23/spawned/task-mastermind-note-tasks/) — (no outcome logged)
- 2026-10-20 [Item and Page readmes: one persistence system; indexing is the tool's…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/requirements.md
- 2026-10-20 [core/Item: the store, dated index and query plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/) — The plan is written: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md). Not built yet. inventory: every writer and reader, file:line (section 1) class architecture: Dated + DatedFiles on Item.Store, with alternatives (section 2) … · paths 1/1 exist
- 2026-10-20 [updates: a cloud agent gets only what changed since its last call](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/updates-tool/) — updates tool landed and merged (restart Servex to go live). one tool updates, a cursor per caller, peek, cap 50 with more: External.updates(), test Servex/ext/remote/RemoteMCP.test.mjs passes one sentence in RemoteMCP.INSTRUCTIONS, plus follow({path, agent:"v…
- 2026-10-17 [ask-does-it-already-exist-before-any-age](/framework/ai/tasks/ask-does-it-already-exist-before-any-age/) — (no outcome logged)
- 2026-10-16 [.item-tool-test-36876-caller](/framework/ai/sessions/2026/10/16/.item-tool-test-36876-caller/) — (no outcome logged)
- 2026-10-16 [Step 3c: the item tool works on live instances](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-live/) — Landed on michael/dev as c641c540f.
- 2026-10-16 [Item tool in-process: step 12 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-local/) — Landed on michael/dev as 1f4481407.

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 40 files
- [ext/DesignTool](/framework/ext/DesignTool/) — used by 32 files
- [ext/Query](/framework/ext/Query/) — used by 5 files
- [ui/item](/framework/ui/item/) — used by 14 files
- [ui/toolbar](/framework/ui/toolbar/) — used by 9 files
- [ui/tooltip](/framework/ui/tooltip/) — used by 6 files

## Docs and readmes
- [The page tool: any agent changes any page by path + delta (…](/framework/core/Page/doc/page-tool-2026-10-09.md) — Dictated in VS Code tab 7efd07d5. Shared by the page system and the AI system (linked from both readmes). ## The owner's ask - Any agent (a…
- [Widths — the meter for styles/layouts/400/: ten urls read a…](/framework/ext/DesignTool/widths/readme.md) — ## Use Open [/framework/ext/DesignTool/widths/](/framework/ext/DesignTool/widths/) and press a width button. The same call, from code: js i…
- [Draggable — grab-and-move for any View; Sortable reorders, …](/framework/ext/Draggable/readme.md) — ## Use js import Sortable from "/framework/ext/Draggable/Sortable.js"; class Card extends Sortable { drop_check(target){ return target !== …
- [Timeline — a general h/v timeline (CSS-var positioning, gre…](/framework/ext/Timeline/readme.md) — ## Use js import { Timeline } from "/framework/ext/Timeline/Timeline.js"; new Timeline({ orientation: "h", zoom: 6, items: [ { from, to, la…
- [The item system: every class, store, tool and writer that m…](/framework/core/Item/doc/map.md) — An item is a thing kept as one JSONL log: line 1 says what it is, later lines are deltas, Item.set(delta) replays them. The same class runs…
- [Navigation — the path: how links look, persistent or switch…](/framework/design/navigation/readme.md) — Navigation is how a reader gets anywhere on the site and finds their way back: tabs, a rail, a sidebar, a sheet, a modal, full screen. Move…
- [Reply in place — talk to one item, where it already is](/framework/ext/Ask/doc/reply.md) — Every item on a task page is a thing you might want to say something about: an ask card, a decision row, a task card on the day board. repl…
- [Taste — the third DesignTool tier: eleven weighted ideal ra…](/framework/ext/DesignTool/taste/readme.md) — ## Use js import { rate } from "/framework/ext/DesignTool/taste/taste.js"; rate(document.querySelector(".page.active-page")); // → { score,…

## Sessions tagged with these words
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-d75b6d76/) — kind/agent model/sonnet work/read-only task/remote-full-registry servex/remote-tools · $0.14
- 2026/10/15 [Clarity remote tools](/framework/ai/sessions/2026/10/15/session-6c354292/) — kind/agent model/sonnet work/read-only task/remote-tools framework/digest · $0.15
- 2026/10/13 [First reply performance optimization](/framework/ai/sessions/2026/10/13/session-4b2da2d0/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim servex/remote-tools · $0.98
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,536 tokens of reading, under the 100k limit).

Question: Item tool: instant read, query and CRUD of any item by path

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Item tool: instant read, query and CRUD of any item by path"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
