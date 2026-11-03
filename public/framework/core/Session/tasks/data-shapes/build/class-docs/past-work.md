<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build C  class docs that show  not tell  plan step 6  first slice  in a worktree  NOT merged" (words: build, clas, doc, show, not, tell, plan, step, first, slice, worktree, merged)

## Tasks (8, best first)
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…
- 2026-10-17 [Worktrees: a plan-first script removed 6 landed worktrees, kept 23](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-cleanup/) — node Server/Worktrees.mjs --plan lists the 30 non-pool worktrees with a verdict. --apply removed the 6 whose work is on michael/dev (2 forced over regenerated files only) and left 23 alone: 3 with unmerged commits and 19 with real uncommitted files. No branch…
- 2026-10-16 [AI sheet checkup: route decided, steps 2 to 4 merged, 5 to 10 queued](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/) — The AI sheet is routed at <path>/ai/ (decision d-sheet-route), recorded with its two alternatives in ext/drawer's owner doc; the layout pick (A's short head, E's live feed, A's strip) stands. Steps 2 to 4 are merged on dev, one commit each: Sheet.Panel is one…
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-14 [Scripts: the last four function bags are classes; two Servex cores ha…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-rename-5/) — AskEach, Browser, Collab, Decide are classes (merged fe2728518, case fix after); callers relinked, outputs identical to the old files, undo proven on a copy; Agents.js and directory.js have a plan in Servex/agents/doc/class-plan.md, decision d-agents-director…
- 2026-10-13 [PWA: manifest and icons merged; the state and next steps documented](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/pwa-check/) — The site now serves a manifest with icons (merged 1b4bc1136); lab/doc/pwa-state.md says what works today and lab/doc/next.md what is next. Landed by the mastermind from the agent's own answer and the merge commit (the agent ended its turn without a landing li…
- 2026-10-12 [core/Page: Page.class.js split plan](/framework/ai/sessions/2026/10/12/session-38388428/page-split-plan/) — Split plan written, no code moved. The file is 2,270 lines but only 1,027 are code: 926 (40%) are comments, and about 260 lines are four helper classes already living in it. measured by script: core/Page/doc/split-measure.mjs one-screen plan with class tree, … · paths 1/1 exist
- 2026-10-12 [Page: Columns and Links move to their own classes](/framework/ai/sessions/2026/10/12/session-e55f5a4b/page-split-2/) — Page.class.js is 1315 to 1086 lines. Columns and Links now live in their own class files; Page keeps the same facades. Reviewed: 1 fixed, 4 noted ([review.md](/framework/ai/2026-10-12/page-split-2/review.md)). Step 5, Columns out of Page: Columns.js (PageColu…

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/Classify](/framework/ext/Classify/) — used by 1 files
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ui/doc](/framework/ui/doc/) — used by 5 files, no readme
- [ux/doc](/framework/ux/doc/) — used by 3 files, no readme

## Docs and readmes
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [Wizard architecture — steps as composition, not class inher…](/framework/ux/Wizard/doc/architecture.md) — Wizard (Wizard.js) is a generic multi-step engine, extended by lessons, courses, and signup flows. It composes steps as plain objects with …
- [Token sync: what a sync would do, and its first slice](/framework/ext/Figma/doc/next.md) — sync.js today is only the cold-deep-link reader; it syncs nothing. A real sync would read [tokens/map.json](/framework/ext/Figma/tokens/) (…
- [The full-window view — a url, not a class](/framework/styles/layouts/doc/full-view.md) — Split out of readme.md. ## 3. "Maximize", with a router that only knows path segments Question. A layout wants to be seen without a docs co…
- [The AI dashboard: plan, approved page, and what slice 1 shi…](/framework/ai/doc/ai-dashboard-plan.md) — Built (slice 1, 2026-10-19): /framework/ai/ is now the dashboard; its structure is in [AIDashboard/readme.md](../AIDashboard/readme.md). Th…
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [Module audit: a process that reads every module and propose…](/framework/ai/doc/module-audit.md) — The owner's ask (2026-10-24, item 4 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)). A manage…
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …

## Sessions tagged with these words
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Page system class map documentation](/framework/ai/sessions/2026/10/15/session-09f3c4b6/) — kind/owner model/sonnet task/page-system docs/classes · $0.38
- 2026/10/14 [Clarity architecture](/framework/ai/sessions/2026/10/14/session-b38b6926/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim docs/classes · $0.14
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)
- 2026-10-18 Worktrees: remove merged ones; Servex drops their subdomains (?, tracked)

## Commits
- ee2ed62d6 process-system: Process extends Task (phases node runs in series) + ProcessRunner; one item call creates a bu…
- a0e29d4e4 Page: a delta can add a tab and change the six layout words, redrawn live
- ab58949d2 docs(claude): design the class architecture before building
- 6123a53c4 Sessions tab: CSS-grid data grid, master-detail side peek, Panel2 preview levels
- 13754e1c9 docs: one-dictation docs pass (chat.js, Session markers, drawer)
- acd9cd4c1 core/Page/layout/switcher: the Switcher pattern, a CSS-only proof it needn't monkey-patch active classes
- 4444b3b5e AI 2: finish the Needs you tab, the Needs review rail filter, and Reviewed control
- a4d3b79a0 Dictate: real mic feedback + subclassable variants (deliverables 3-4)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Build C: class docs that show, not tell (plan step 6, first slice), in a worktree, NOT merged

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build C: class docs that show, not tell (plan step 6, first slice), in a worktree, NOT merged"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
