<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Merge page  no dead ends" (words: merge, dead, end)

## Tasks (8, best first)
- 2026-10-13 [Record files: a plain git merge dropped appended lines](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/task-log-race/) — Cause found, fixed, guarded, recovered. - ✅ Writer: a plain git merge --no-ff run in the dirty main tree at 17:38:07 (git parks the tree, hard-resets, the put-back failed). Not an autostash, not append.mjs, not LogSweeper; committed history never lost a line.…
- 2026-09-24 [loose-ends](/framework/ai/sessions/2026/09/24/loose-ends/loose-ends/) — Six weeks of loose ends, decided: only five things still need you. About 900 tasks since 2026-08-08 were checked, plus the memory notes and both handover files. About 60 items had been parked for the owner. 22 were already settled by later work, and the rest …
- 2026-08-30 [demo-merge](/framework/ai/sessions/2026/08/30/demo-merge/) — page.demo() prototyped, and the demo system audited to numbers. 14 render variants, 584 call sites, 17 fixed-height clips (6 of 8 sampled pages cut content at 1920 - worst hides 74%), and the width readout missing on exactly one thing: a bare demo.app() box, … · paths 2/2 exist
- 2026-08-30 [demo-merge-2](/framework/ai/sessions/2026/08/30/demo-merge-2/) — 14 render variants to 6 — steps 2-5 of the demo-merge landed. demo(fn), page.demo(), mini(), and three engines (stage, demo.app, layout.bar). 231 call sites moved onto one shell by changing four files. ![](exhibit-1920.png) Deleted — two.js, two.css, demo.sta… · paths 6/7 exist, gone: framework/ext/demo/files/
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-09-24 [concurrency](/framework/ai/sessions/2026/09/24/concurrency/concurrency/) — Agents can now fork themselves, wait on each other, and survive a Servex restart. Merged into michael/dev as 230171d5, plus b6c5d5c0 (restart guard); goes live with this restart. - fork_self: an agent asks a copy of itself one question in the background. Meas…
- 2026-09-22 [board-from-events](/framework/ai/sessions/2026/09/22/49dfc8b4-d179-4c67-a735-3c9738452615/board-from-events/) — A Servex-hosted agent now appears on the AI board with nobody writing a card for it. An Agents strip sits under the toolbar on every view of /framework/ai/v/3/ — one chip per live Claude session Servex is holding, pushed the instant a token arrives over GET /… · paths 4/5 exist, gone: framework/ai/v/3/agents.js
- 2026-09-22 [reuse-audit](/framework/ai/sessions/2026/09/22/session-a96166b5/reuse-audit/) — The features you named are already merged. The duplication that is left is 739 dead files and one card shape written 27 times. You asked this before, on 18 September, as the [overlap study](/framework/ai/2026-09-18/overlap-study/) — four of its five merges ha… · paths 1/1 exist

## Docs and readmes
- [JSONL — append-only .jsonl logs the AI blindly appends to, …](/framework/ext/JSONL/readme.md) — > Converge: how a .jsonl is written, read and indexed is one system: [core/Page/doc/jsonl.md](/framework/core/Page/doc/jsonl.md) ("The stor…
- [AITask architecture — render the working log, from session …](/framework/ai/AITask/doc/architecture.md) — AITask extends [Page](/framework/core/Page/Page.class.js) and serves as the master template for a task's detail view, a day's dashboard, an…
- [ai/merge — the "ready to merge" list and its Merge button](/framework/ai/merge/readme.md) — Page: [/framework/ai/merge/](/framework/ai/merge/). One card per branch an agent has marked ready; the owner's one decision per project is …
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [The error page renders into $pages, never $app](/framework/core/App/doc/error-page.md) — js error(error){ this.$pages.empty(() => { … }); } Emptying $app would delete the chrome, so the one page that most needs navigation would …
- [Log — an object-oriented logger, rendered as nested cards](/framework/core/Page/card/log/readme.md) — Give any object its own this.log(...). Wrap a method and every call it makes becomes its own group, holding whatever it logs inside. Render…
- [How a page renders](/framework/core/Page/doc/how-a-page-renders.md) — Short answer: a page is a class instance. Most pages are still written as code with the little helper functions (h1(), p(), div()). A page …
- [Template — a page that renders many times, each time from i…](/framework/core/Page/Template/readme.md) — Template extends Page: render() draws a new view every call (views), clone(data) makes a new use of the layout that reads through to its so…

## Sessions tagged with these words
- 2026/10/15 [Minion handoff messages visibility](/framework/ai/sessions/2026/10/15/session-cce1ac2c/) — kind/owner model/haiku mod/ai/sessions task/loose-ends · $0.53
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/13 [Store framework refactor](/framework/ai/sessions/2026/10/13/session-9248043b/) — kind/owner model/opus mod/ai/sessions mod/server mod/.claude/hooks/append task/mastermind-repo-slim · $19.39
- 2026/10/13 [Page templates binding merge](/framework/ai/sessions/2026/10/13/session-21449a90/) — kind/owner model/sonnet work/read-only task/page-templates-binding-merge · $0.51

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 AI 2 merges into /framework/ai/ (later) (ai/todo.md, parked)
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex-9, routed)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex-9, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: Merge page: no dead ends

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Merge page: no dead ends"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
