<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build  a button on a task saves its verb as a delta  through the item tool s own writer" (words: build, button, task, sav, verb, delta, through, item, tool, own, writer)

## Tasks (8, best first)
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-02 [core/Item: Page extends Item, live lists saved line by line](/framework/ai/sessions/2026/10/02/page-extends-item/page-extends-item/) — Page extends Item; lists save as lines (e44930ad) ![](/framework/ai/2026-10-02/page-extends-item/shots/live-second-tab-1920.png) one set(delta), replay flag: headless replay, add/add/move every page keeps working: smoke of 7 pages, 0 errors static Store, appe… · paths 4/4 exist
- 2026-10-17 [Undone to tasks: 229 verified-undone asks are idle tasks in their mod…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-to-tasks/) — 229 tasks created and 229 asks now link to them (229 minus 0 that already had one). 0 were already tracked, 0 had no module. Each ask on the undone-asks page links its task; /tasks/ shows them folded per module. node Server/UndoneToTasks.mjs --plan / --apply … · paths 1/1 exist
- 2026-10-16 [Servex checkup: nudge verified, skill tool and task.home built, dorma…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-servex/) — Compaction nudge verified on dev and logged needs_restart; helper-cost-fix stopped; expensive dormant agents left dormant with a read-don't-wake rule; skill tool and spawn task.home built; per-prompt door answered (ask_mastermind); coordination rule added to …
- 2026-10-16 [Item tool in-process: step 12 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-local/) — Landed on michael/dev as 1f4481407.
- 2026-10-16 [Item owns replay: step 13 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-replay/) — Landed on michael/dev as 32802eecc.
- 2026-10-16 [Item tool: step 5 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-tool/) — Landed on michael/dev as fd37b6efe.
- 2026-10-16 [The item tool files the references: step 16 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/tool-files-refs/) — Landed on michael/dev as ee4c71f37 and 75cbc267e.

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 40 files
- [core/Task](/framework/core/Task/) — used by 515 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/DesignTool](/framework/ext/DesignTool/) — used by 32 files
- [ext/Dropdown](/framework/ext/Dropdown/) — used by 5 files

## Docs and readmes
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — ## One persistence system with Page Page extends Item: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one sy…
- [The item system: every class, store, tool and writer that m…](/framework/core/Item/doc/map.md) — An item is a thing kept as one JSONL log: line 1 says what it is, later lines are deltas, Item.set(delta) replays them. The same class runs…
- [Drag-and-drop builder: toolboxes matched to their target (o…](/framework/ext/Figma/doc/builder.md) — The owner's idea: "for any two-column layout with different coloured backgrounds, put a panel to the left and to the right, the same width …
- [Ranking — owner items first, and the order the owner put th…](/framework/ai/AITask/doc/ranking.md) — Three things share one idea. Some items are waiting on the owner, and those go above everything else. Every list here can be put in an orde…
- [The page tool: any agent changes any page by path + delta (…](/framework/core/Page/doc/page-tool-2026-10-09.md) — Dictated in VS Code tab 7efd07d5. Shared by the page system and the AI system (linked from both readmes). ## The owner's ask - Any agent (a…
- [UI — buttons, toolbars, dropdowns, icons: states and targets](/framework/design/ui/readme.md) — UI is the interactive part of a page — everything the reader presses. The built components themselves (the actual button, the actual dropdo…
- [editor — a drag-and-drop block builder assembled from Item,…](/framework/ext/editor/readme.md) — ## Use js const store = (path, key) => dev ? new FileSaver({ path }) : new LocalStorageSaver({ key }); const saver = store("/data/editor.js…
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…

## Sessions tagged with these words
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67
- 2026/10/15 [Voice MCP directives](/framework/ai/sessions/2026/10/15/session-92760713/) — kind/owner model/sonnet mod/servex task/voice-mcp-directives servex/remote-tools · $0.35
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-81909a47/) — kind/owner model/sonnet task/remote-full-registry servex/remote-tools · $1.11
- 2026/10/15 [Remote tools requirements](/framework/ai/sessions/2026/10/15/session-3232cd48/) — kind/owner model/sonnet mod/servex task/remote-tools servex/remote-tools · $0.66
- 2026/10/15 [Tool collapse](/framework/ai/sessions/2026/10/15/session-2f98ae2d/) — kind/owner model/sonnet mod/ai/doc task/tool-collapse framework/sessions · $1.12

## Owner asks
- 2026-09-30 Logs: unknown verbs on AI 2; the validator checks the schema; register experiment and rev… (mastermind-servex (10 PM task, item 12), queued)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, building)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, landed)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## Commits
- 97e3de9a1 Stalled tasks + budgets: Servex/asks/tasks.js writes tasks.json
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box
- 6c4d92f6a Dictate page becomes the workbench: chat() demo, keep option, shared New session button, composer redesign

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,048 tokens of reading, under the 100k limit).

Question: Build: a button on a task saves its verb as a delta, through the item tool's own writer

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build: a button on a task saves its verb as a delta, through the item tool's own writer"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
