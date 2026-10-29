<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build I  the item tool  generic over every class  plan step 1e  from build D s branch  NOT merged" (words: build, item, tool, generic, over, every, clas, plan, step, branch, not, merged)

## Tasks (8, best first)
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-20 [core/Item: the store, dated index and query plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/) — The plan is written: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md). Not built yet. inventory: every writer and reader, file:line (section 1) class architecture: Dated + DatedFiles on Item.Store, with alternatives (section 2) … · paths 1/1 exist
- 2026-10-16 [AI sheet checkup: route decided, steps 2 to 4 merged, 5 to 10 queued](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/) — The AI sheet is routed at <path>/ai/ (decision d-sheet-route), recorded with its two alternatives in ext/drawer's owner doc; the layout pick (A's short head, E's live feed, A's strip) stands. Steps 2 to 4 are merged on dev, one commit each: Sheet.Panel is one…
- 2026-10-16 [Item tool in-process: step 12 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-local/) — Landed on michael/dev as 1f4481407.
- 2026-10-16 [Item tool: step 5 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-tool/) — Landed on michael/dev as fd37b6efe.
- 2026-10-16 [The item tool files the references: step 16 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/tool-files-refs/) — Landed on michael/dev as ee4c71f37 and 75cbc267e.
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 44 files
- [ext/Classify](/framework/ext/Classify/) — used by 1 files
- [ext/DesignTool](/framework/ext/DesignTool/) — used by 32 files
- [ui/item](/framework/ui/item/) — used by 14 files
- [ui/toolbar](/framework/ui/toolbar/) — used by 9 files
- [ui/tooltip](/framework/ui/tooltip/) — used by 6 files

## Docs and readmes
- [The item system: every class, store, tool and writer that m…](/framework/core/Item/doc/map.md) — An item is a thing kept as one JSONL log: line 1 says what it is, later lines are deltas, Item.set(delta) replays them. The same class runs…
- [One replay: every line in a session's log is applied throug…](/framework/core/Session/doc/one-replay-plan.md) — The owner's rule (2026-10-26): every line of session.jsonl is applied through the replay system, by the item's set(), with no special proce…
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Layouts — every whole-page layout as a class string, on one…](/framework/styles/layouts/readme.md) — ## Index - [catalog](./catalog/) — every layout ranked, with use count, what content it suits and when not to; [content → layout](./catalog…
- [Module audit: a process that reads every module and propose…](/framework/ai/doc/module-audit.md) — The owner's ask (2026-10-24, item 4 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)). A manage…
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Wizard architecture — steps as composition, not class inher…](/framework/ux/Wizard/doc/architecture.md) — Wizard (Wizard.js) is a generic multi-step engine, extended by lessons, courses, and signup flows. It composes steps as plain objects with …

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-d75b6d76/) — kind/agent model/sonnet work/read-only task/remote-full-registry servex/remote-tools · $0.14
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Voice MCP directives](/framework/ai/sessions/2026/10/15/session-92760713/) — kind/owner model/sonnet mod/servex task/voice-mcp-directives servex/remote-tools · $0.35

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-10-12 Settle Item/List/Content/Page classes (asked 15x) (mastermind-page-content-unify, routed)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)

## Commits
- b975a0aae core/Session: data-shapes plan, fold in the plan review (steps 1d one writer, 1e generic item tool, browser r…
- 49d13df45 ai: one chat component everywhere (sheet = session chat tab, dictation wired in), voice agent builds its sess…
- 710437388 core/Page page-mastermind: now = building the item tool; servex improvement: WorktreeWatch reports only break…
- 527b66c83 core/Page: plan.md v2 - navigation, items and pages, tests, build order
- d061859ff core/Item map: how the browser and the item tool each save a change; build brief for item-act
- ee2ed62d6 process-system: Process extends Task (phases node runs in series) + ProcessRunner; one item call creates a bu…
- a69736157 Task system: plan written, awaits the owner's approval
- 8a303b28b Dev bar's AI tab: mount the one global chat(), keep the old thread picker as v1

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Build I: the item tool, generic over every class (plan step 1e), from build D's branch, NOT merged

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build I: the item tool, generic over every class (plan step 1e), from build D's branch, NOT merged"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
