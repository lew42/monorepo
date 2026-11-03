<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Item system  a UI action is a saved delta every listener gets" (words: item, system, action, saved, delta, every, listener, get)

## Tasks (8, best first)
- 2026-10-20 [Item and Page readmes: one persistence system; indexing is the tool's…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/requirements.md
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-16 [The item tool files the references: step 16 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/tool-files-refs/) — Landed on michael/dev as ee4c71f37 and 75cbc267e.
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-02 [page-on-item](/framework/ai/sessions/2026/10/02/page-extends-item/page-extends-item/page-on-item/) — 1 PageLog extends Item, on/emit/set routed through Item+Events, id=folder name, bubbles()=false -- shipped, plus a real bug fixed (naming() now actually sets this.id) ✓ · 2 Page keeps add/move/open/walk/find, only set+store collided and both are resolved (set… · paths 2/2 exist
- 2026-10-02 [The card pipeline: every major ask gets a readable card, by node](/framework/ai/sessions/2026/10/03/card-pipeline/card-pipeline/) — Every major ask now gets a real card, written by code — the owner's dashboard explains why each score is what it is. Ask -> card, by node: is_major()/ensure_card() on every 60s tick. 3 of today's 4 named asks got a real card just now; the 4th already had one.… · paths 2/5 exist, gone: framework/ai2/2026/10/02/page-extends-item-one-set-persistence-in/ framework/ai2/2026/10/02/ext-panel2-header-toolbar-main-with-side/ framework/ai2/2026/10/02/ai-system-docs-the-system-tab-now-explai/
- 2026-10-02 [core/Item: Page extends Item, live lists saved line by line](/framework/ai/sessions/2026/10/02/page-extends-item/page-extends-item/) — Page extends Item; lists save as lines (e44930ad) ![](/framework/ai/2026-10-02/page-extends-item/shots/live-second-tab-1920.png) one set(delta), replay flag: headless replay, add/add/move every page keeps working: smoke of 7 pages, 0 errors static Store, appe… · paths 4/4 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 40 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 28 files
- [ext/System](/framework/ext/System/) — used by 8 files
- [ui/item](/framework/ui/item/) — used by 14 files

## Docs and readmes
- [The item system: every class, store, tool and writer that m…](/framework/core/Item/doc/map.md) — An item is a thing kept as one JSONL log: line 1 says what it is, later lines are deltas, Item.set(delta) replays them. The same class runs…
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — ## One persistence system with Page Page extends Item: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one sy…
- [Item architecture — a headless data node, saved as one docu…](/framework/core/Item/doc/architecture.md) — Item is one persistent thing: an id, a data bag, one set(delta), and a place to save. It runs in plain node (no DOM, no transport). Main cl…
- [Items hold items: references, moves, storage targets (the o…](/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md) — Words: the VS Code tab's prompt log (ai/2026/10/20/session-e00f55c9/page.jsonl, 2026-10-21 just after midnight). Essence, with the owner's …
- [Audits: every system that checks what was asked against wha…](/framework/ai/doc/audits.md) — The owner asks for things in long prompts; many asks were never filed or never finished. Over September and October several systems were bu…
- [What every agent reads, the roles, and a readme audit (prop…](/framework/ai/doc/readme-system.md) — The owner's ask: rules get lost because nobody is sure which files each agent reads. Measured below; the moves are proposals until the owne…
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…

## Sessions tagged with these words
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Debug views](/framework/ai/sessions/2026/10/15/session-eafccb46/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Page system audit and documentation review](/framework/ai/sessions/2026/10/15/session-c57d1c4b/) — kind/owner model/opus mod/ai/sessions task/page-system · $17.87
- 2026/10/15 [Voice system requirements](/framework/ai/sessions/2026/10/15/session-c55bafbb/) — kind/agent model/sonnet work/read-only task/ai-system · $0.15
- 2026/10/15 [Debug views requirements](/framework/ai/sessions/2026/10/15/session-baaf8f25/) — kind/owner model/haiku mod/ai/sessions task/page-system · $0.26

## Owner asks
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Padding: percentage padding, a wrapper per grid item, the rule in the layout system (servex-mastermind-opus (spawn at the 10 PM reset), queued)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,048 tokens of reading, under the 100k limit).

Question: Item system: a UI action is a saved delta every listener gets

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Item system: a UI action is a saved delta every listener gets"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
