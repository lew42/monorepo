<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build A  the data backbone  plan step 1  in a worktree  NOT merged" (words: build, data, backbone, plan, step, worktree, not, merged)

## Tasks (8, best first)
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…
- 2026-10-25 [Build the session switcher in the dictate widget (also the mobile she…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/) — Round 2 landed: owner live-testing found the dropdown reflowed the header (huge in-flow list pushed the title/chips/v2-chip down, "vertically centered" on desktop). Rebuilt session_switcher() on ux/Popover.menu() (top-layer popover, built-in height cap + scro…
- 2026-10-20 [Sessions views: plan and a three-variant prototype (nothing built)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/) — Plan and prototype ready for your pick; the real pages are unchanged. see the session view with its tasks, three ways, real data: [prototype](/framework/ai/sessions/doc/variants/) (shot at 400, 1920, 3440) segmented, nested progress bar: one shared SegBar, al…
- 2026-10-17 [Worktrees: a plan-first script removed 6 landed worktrees, kept 23](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-cleanup/) — node Server/Worktrees.mjs --plan lists the 30 non-pool worktrees with a verdict. --apply removed the 6 whose work is on michael/dev (2 forced over regenerated files only) and left 23 alone: 3 with unmerged commits and 19 with real uncommitted files. No branch…
- 2026-10-16 [live-pointers: /live cards become pointers; their data moves to the l…](/framework/ai/sessions/2026/10/16/voice-20261016/live-pointers/) — The work landed as b9cf153f8 (its own log line says so; the landing line was never written because the agent was stopped): refine-build and overnight data in their task logs, ai/audits/index.jsonl + readme linked from ai/readme.md, transcripts line in past-wo…
- 2026-10-16 [AI sheet checkup: route decided, steps 2 to 4 merged, 5 to 10 queued](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/) — The AI sheet is routed at <path>/ai/ (decision d-sheet-route), recorded with its two alternatives in ext/drawer's owner doc; the layout pick (A's short head, E's live feed, A's strip) stands. Steps 2 to 4 are merged on dev, one commit each: Sheet.Panel is one…
- 2026-10-16 [Today's dictations as tasks: step 17 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/proof-data/) — Landed on michael/dev as 115117050.
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist

## Modules that exist now (files outside the module that import it)
- [ext/DataGrid](/framework/ext/DataGrid/) — used by 10 files
- [ui/datagrid](/framework/ui/datagrid/) — used by 3 files

## Docs and readmes
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [One replay: every line in a session's log is applied throug…](/framework/core/Session/doc/one-replay-plan.md) — The owner's rule (2026-10-26): every line of session.jsonl is applied through the replay system, by the item's set(), with no special proce…
- [Module audit: a process that reads every module and propose…](/framework/ai/doc/module-audit.md) — The owner's ask (2026-10-24, item 4 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)). A manage…
- [DataGrid — one grid for every list of records: a table or a…](/framework/ext/DataGrid/readme.md) — Resize, sort, filter, windowing, and two drawers. The markup that used to be ui/datagrid and ui/table lives here now (those two files re-ex…
- [editor — a drag-and-drop block builder assembled from Item,…](/framework/ext/editor/readme.md) — ## Use js const store = (path, key) => dev ? new FileSaver({ path }) : new LocalStorageSaver({ key }); const saver = store("/data/editor.js…
- [Wizard architecture — steps as composition, not class inher…](/framework/ux/Wizard/doc/architecture.md) — Wizard (Wizard.js) is a generic multi-step engine, extended by lessons, courses, and signup flows. It composes steps as plain objects with …
- [Past work via a Haiku child session: a reusable search with…](/framework/ai/doc/past-work-haiku.md) — The owner's ask (2026-10-24, item 5 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)): finding …
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Sessions data investigation](/framework/ai/sessions/2026/10/15/session-b19f18df/) — kind/owner model/haiku mod/ai/sessions task/sessions-data · $0.31

## Owner asks
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)
- 2026-10-18 Worktrees: remove merged ones; Servex drops their subdomains (?, tracked)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-03 Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) (mastermind-servex-10, building)

## Commits
- 633c4fbbf core/Session: data-shapes build briefs (A backbone, B default view, plan review)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Build A: the data backbone (plan step 1), in a worktree, NOT merged

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build A: the data backbone (plan step 1), in a worktree, NOT merged"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
