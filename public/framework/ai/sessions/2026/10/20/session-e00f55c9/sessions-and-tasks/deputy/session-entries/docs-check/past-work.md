<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "docs check  core Session and core Task readmes after Session entries" (words: doc, check, core, session, task, readm, after, entri)

## Tasks (8, best first)
- 2026-10-20 [docs-check: core/Session and core/Task readmes after Session entries](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-entries/docs-check/) — (no outcome logged)
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-16 [Checkup: the task system and the migration of old tasks](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-task-system/) — The task system build is on dev (17 steps, 44 commits checked), and 211 old tasks now have module homes with nothing deleted (2c8f4b674, 0 check problems, 5 of 5 spot checks link both ways). /tasks/ shows open work first with finished tasks folded; the task w…
- 2026-10-13 [How a page renders: one plain doc under core/Page, linked from the re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/page-rendering/) — core/Page/doc/how-a-page-renders.md answers the owner's question (classes + helpers write the DOM; page.jsonl deltas replay into blocks on top), linked from the Page and framework readmes (7e3c10b23). Landed by the mastermind from the agent's own answer and t…
- 2026-10-03 [core/System: the module itself — readme, page.js, doc/system.md](/framework/ai/sessions/2026/09/30/ui-system/system/docs-module/) — core/System/ is now a real module, not just a class file: readme.md, page.js (a Doc documenting the System class — five live Concepts tiles linking Design/Code/UI/UX/AI, then the minimal page.js example), and doc/system.md (what a System is, the two ways to a… · paths 1/2 exist, gone: framework/core/System/

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [core/Session](/framework/core/Session/) — used by 14 files
- [core/Task](/framework/core/Task/) — used by 795 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files

## Docs and readmes
- [Owner prompts become tasks on the session page](/framework/core/Session/doc/prompt-tasks.md) — What it does. When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as an open task (idle, waiting…
- [Session is a Task: the migration (2026-10-24)](/framework/core/Session/doc/session-is-a-task.md) — What changed: Session extends Task (it was extends Item). The owner asked for it on 2026-10-24 ("make session extend task… properly transit…
- [AITask — the API (moved from the readme)](/framework/ai/AITask/doc/api.md) — <!-- moved verbatim from readme.md lines 4-72, 2026-10-12 readme audit --> js framework/ai/<date>/<slug>/page.js import { AITask, md } from…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [Old — the first Page docs, moved out of the Overview tab an…](/framework/core/Page/old/readme.md) — ## Index [intro](./intro/), [nav](./nav/), [children](./children/), [previews](./previews/), [shell](./shell/), [flow](./flow/) — the six o…
- [core/Session](/framework/core/Session/readme.md) — A Session is one run of an agent or a tab. It is a Task (Session extends Task, since 2026-10-24): it has Task's states, completion and task…
- [Owner notes, 2026-10-16 (evening): compositing tasks (dicta…](/framework/core/Task/doc/owner-2026-10-16-composition.md) — Companion to owner-2026-10-16-task-system.md. The other voice session's vocabulary is in public/framework/ext/Refine/doc/card-types.md (Tas…

## Sessions tagged with these words
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/14 [Scripts rename](/framework/ai/sessions/2026/10/14/session-6a78c3cb/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim docs/readme · $0.90
- 2026/10/13 [Clarity followup daily](/framework/ai/sessions/2026/10/13/session-f5262774/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim docs/readme · $0.15
- 2026/10/13 [Clarity unreferenced verdicts](/framework/ai/sessions/2026/10/13/session-dae7d661/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim docs/readme · $0.15
- 2026/10/13 [Clarity retire shims](/framework/ai/sessions/2026/10/13/session-d2a176d0/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim docs/readme · $0.16
- 2026/10/13 [Core-session architecture documentation](/framework/ai/sessions/2026/10/13/session-46ed371f/) — kind/owner model/haiku mod/core/session task/mastermind-repo-slim docs/architecture · $0.23

## Owner asks
- 2026-09-30 Task pages: grey checkboxes, full-width bars, reports as free content (ui-system brief (after the System class), queued)
- 2026-10-18 Task pages: grey checkboxes, full-width bars, reports as free content (?, tracked)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, dropped)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)

## Commits
- f5d2a7f6a core/Page navigation: the levels picture moves to doc/ (shots/ is git-ignored, so it 404'd on every fresh che…
- 71aec5869 TasksPage: the page for a tasks/ directory; Page.child mounts it on any tasks/, /tasks/ indexes every task ho…
- 17877f6ce core/Page: owner start doc, class map, Router link; readme claims verified (6 stale fixed)
- 86c75498f core/Page docs: index the five unlisted subfolders, fix four stale facts (split size, page.js count, a line r…
- de71e745f refine-queue docs: fixes from the fresh docs check (where to run, two coverage scores, fields read, Refine in…
- 4b79c09e4 console-clean: stop the weight/page.jsonl 404 storm, gate smoke.mjs on console noise
- e756032ee core/Page: four page tools (page_add/set/log/read) + page_note
- 97e3de9a1 Stalled tasks + budgets: Servex/asks/tasks.js writes tasks.json

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,755 tokens of reading, under the 100k limit).

Question: docs-check: core/Session and core/Task readmes after Session entries

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "docs-check: core/Session and core/Task readmes after Session entries"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
