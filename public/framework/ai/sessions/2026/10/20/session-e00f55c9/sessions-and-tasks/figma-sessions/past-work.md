<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Figma  design sessions  projects and tasks  and improve the Figma system as you go " (words: figma, design, session, project, task, improve, system, you)

## Tasks (8, best first)
- 2026-10-08 [task-system-design](/framework/ai/sessions/2026/10/08/task-system-design/task-system-design/) — One task system proposed: reuse core/Task, state computed from task.jsonl, tasks hold a page by reference, in-process tools. find every task system: inventory.md (10 stores, 1,312 task.jsonl, 80% landed) design.md covers the 7 points, with alternatives filed:…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-19 [You are an Opus mastermind standing by for voice session v-timqv56 (t…](/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/) — (no outcome logged)
- 2026-10-16 [Session extends Item: step 7 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/session-item/) — Landed on michael/dev as 6858167bc.
- 2026-10-16 [Checkup: the task system and the migration of old tasks](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-task-system/) — The task system build is on dev (17 steps, 44 commits checked), and 211 old tasks now have module homes with nothing deleted (2c8f4b674, 0 check problems, 5 of 5 spot checks link both ways). /tasks/ shows open work first with finished tasks folded; the task w…
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/Session](/framework/core/Session/) — used by 12 files
- [core/Task](/framework/core/Task/) — used by 515 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/DesignTool](/framework/ext/DesignTool/) — used by 32 files

## Docs and readmes
- [The Figma ↔ browser loop: the design is the spec, tools che…](/framework/ext/Figma/doc/figma-browser-loop.md) — Recorded from the owner's dictation, 2026-10-12 (session f155ecbd). The problem: layouts keep breaking — grounds with no padding, wasted sp…
- [System — the one page that says what the design system is, …](/framework/styles/system/readme.md) — ## Index - [studies](./studies/) — the evidence behind the design system's numbers ## Use Need a space? Type the class, never the number. j…
- [Auto layout in practice: the Figma side of "using the space"](/framework/ext/Figma/doc/figma-layout.md) — The general rules (fluid first, no voids, no clipping, repetition, masonry) live in the design system: [design/layout/doc/space.md](/framew…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Projects: a folder with project.jsonl, moved into its modul…](/framework/ai/tasks/doc/projects.md) — A task is a line in its session's log. A project is a task with subtasks, requirements or a review, so it gets a folder holding project.jso…
- [Layout — the layout system: how pages sit among pages, how …](/framework/core/Page/layout/readme.md) — Layout is not one class or one file here. It is a system spread over several modules, and this folder is its index. Read it top down, in th…
- [Owner notes, 2026-10-17: routine procedures in the task sys…](/framework/core/Task/doc/owner-2026-10-17-node-driven.md) — Sixth note. The owner's words are verbatim in [requirements-15.md](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/re…
- [Figma properties to framework layout words (2026-10-10, fir…](/framework/ext/Figma/doc/mapping.md) — Goal (the owner's): what you see in Figma is what the browser renders. This table says which Figma signal implies which of our words, and w…

## Sessions tagged with these words
- 2026/10/13 [Figma design system sweep](/framework/ai/sessions/2026/10/13/session-662b3ef6/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs page/design-system · $8.88
- 2026/10/13 [DS Diagrams & charts page](/framework/ai/sessions/2026/10/13/session-09ac677b/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs page/design-system · $7.59
- 2026/10/14 [Figma Claude designs kit demo](/framework/ai/sessions/2026/10/14/session-c3c905da/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs page/demo · $2.29
- 2026/10/14 [Figma type kit brief](/framework/ai/sessions/2026/10/14/session-9446b75f/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs framework/tasks · $1.69
- 2026/10/14 [Figma fluid audit](/framework/ai/sessions/2026/10/14/session-81277d72/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs · $1.37
- 2026/10/14 [Figma captions kit](/framework/ai/sessions/2026/10/14/session-5bae46a9/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs · $2.12

## Owner asks
- 2026-09-30 Padding: percentage padding, a wrapper per grid item, the rule in the layout system (servex-mastermind-opus (spawn at the 10 PM reset), queued)
- 2026-10-18 Padding: percentage padding, a wrapper per grid item, the rule in the layout system (?, tracked)
- 2026-09-30 Design and code: /framework/design/ and /framework/code/ as browsable knowledge; skills t… (task-mastermind-design-code, routed)
- 2026-09-30 Design and code: /framework/design/ and /framework/code/ as browsable knowledge; skills t… (task-mastermind-design-code, landed)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)

## Commits
- 429a1bd4e figma-sessions brief: design sessions, projects and tasks in Figma on the file's system; improve the Figma do…
- 21cd94045 ai/sessions design-first: link the Figma Sessions and tasks page (first pass)
- af0d3a00a ai/sessions: design-first direction (Figma before code), tonight's decisions taken without waiting
- f11611e94 figma-claude-designs: Sessions grid bug report at 3440 (nested scrollers, holes in the sticky header) with sc…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,626 tokens of reading, under the 100k limit).

Question: Figma: design sessions, projects and tasks (and improve the Figma system as you go)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Figma: design sessions, projects and tasks (and improve the Figma system as you go)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
