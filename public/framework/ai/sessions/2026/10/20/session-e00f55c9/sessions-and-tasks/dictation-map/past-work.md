<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  a thorough map of every piece  and a plan  PLANNING ONLY  no code  no moves  no merges of code " (words: dictation, thorough, map, every, piece, plan, plann, only, code, mov, merg)

## Tasks (8, best first)
- 2026-10-17 [Worktrees: a plan-first script removed 6 landed worktrees, kept 23](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-cleanup/) — node Server/Worktrees.mjs --plan lists the 30 non-pool worktrees with a verdict. --apply removed the 6 whose work is on michael/dev (2 forced over regenerated files only) and left 23 alone: 3 with unmerged commits and 19 with real uncommitted files. No branch…
- 2026-10-13 [Figma to code: 36 pages inventoried, 6 have code, 17 only a doc, 13 n…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/figma-to-code/) — The round-trip inventory is on the Figma pages: 36 Figma pages and 36 inventory rows (counts agree); 6 have a code page, 17 only a doc, 13 nothing yet. Landed a1129ce8d. Landed by the mastermind from the agent's own log line and merge commit (the agent ended …
- 2026-10-12 [AI code as classes: every census bag under ai/ converted](/framework/ai/sessions/2026/10/12/session-971b7153/ai-classes-asks/) — Every function bag the census listed under framework/ai/ is now a class, one per commit, merged to michael/dev: Faces, the nine cards/ classes, the rail/ classes, AskFold, AskRows, PageTypes, SystemClasses, HealthDevbar and AIOverview. Classes, not function b… · paths 3/4 exist, gone: framework/ai2/live/
- 2026-10-09 [AI: merged AI 2 into AI with shims at every old path](/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/) — AI 2 is now part of AI, nothing deleted. cards and rail moved by one script (git mv, manifest, reversible): [cards](/framework/ai/cards/), [rail](/framework/ai/rail/); old docs in [ai/doc/ai2](/framework/ai/doc/ai2/history.md) every old /framework/ai2/... imp… · paths 3/3 exist
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-04 [Local brain: qwen2.5-coder qualified, Echo's prompt cleaning moved on…](/framework/ai/sessions/2026/10/04/local-brain/local-brain/) — Landed: qwen2.5-coder wins among 3 local models, now does Echo's prompt cleaning at $0. Full numbers: [report.md](/framework/ai/2026-10-04/local-brain/report.md). node question generator, 5 levels, computed answers: 619 questions 100+/level, all 3 models: qwe…
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-01 [Card body shows the refined dictation (merge 5); ai2.css census for m…](/framework/ai/sessions/2026/09/30/inbox-ext/card-body/) — Merge 5 is built and proven: a card shows its own refined dictation, points first. Card.chat(line) draws summary/edit lines as the card's own points, clean folds underneath closed — 03db3de0 proof: a fixture card shot at 400/1920 on /framework/ai/ and /framew… · paths 3/3 exist

## Docs and readmes
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [Prior work — every piece of layout and paging work found, i…](/framework/core/Page/layout/doc/prior-work.md) — Three read-only surveys went through /imagine/ and /layouts/, through framework/, and through two months of task logs (2026-09-29). This is…
- [Every Figma page, and whether code exists for it](/framework/ext/Figma/doc/figma-pages.md) — Generated by node Server/figma-roundtrip.mjs (never edit). The story and the counts: [round-trip.md](./round-trip.md). | Figma page | Node …
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [3 — traps (moved from the readme)](/framework/ai/v/3/doc/traps.md) — <!-- moved verbatim from readme.md lines 77-189, 2026-10-12 readme audit --> ## Watch out - A card merged into log before log.live() has fi…
- [generator — export and the code tab (moved from the readme)](/framework/core/Page/generator/doc/export-and-code-tab.md) — <!-- moved verbatim from readme.md lines 36-88, 2026-10-12 readme audit --> ## Export — the tree, as files The button under the spec box wr…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)

## Commits
- 4da29b48e dictation-map brief: planning only, a thorough map; sessions-views brief queued (study, URL options, day and …

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,546 tokens of reading, under the 100k limit).

Question: Dictation: a thorough map of every piece, and a plan. PLANNING ONLY: no code, no moves, no merges of code.

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: a thorough map of every piece, and a plan. PLANNING ONLY: no code, no moves, no merges of code."

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
