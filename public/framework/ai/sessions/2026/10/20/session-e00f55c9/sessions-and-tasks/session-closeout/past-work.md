<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "This session s tasks  every one closed with evidence  and the splitter fixed" (words: session, task, every, one, closed, evidence, splitter, fixed)

## Tasks (8, best first)
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-24 [Closed worktrees: no code lost; 6 task records restored](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/unlanded-worktrees/) — The 20 closed worktrees with unmerged commits lost no code every branch sorted: 20 by the script = 20 table rows ([report](report.md)) 6 records restored to michael/dev (3 reviews, 2 docs-checks, a lines.json); 37 files left on their branches, each with its r…
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-13 [Dictate: one New session button, one mic indicator](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-session/) — One New session button and one mic indicator on every mic surface. one New session: sheet, AI tab and Dictate page all call chat.js's button; the other two copies are gone. Proof: proof.mjs pressed it on the 400 px sheet and the 1200 px drawer, session id to … · paths 1/2 exist, gone: framework/ux/Dictate/md/doc/chat/
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 15 files
- [core/Task](/framework/core/Task/) — used by 773 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Task resolution: what becomes a task, and how every task en…](/framework/core/Task/doc/resolution.md) — Today a task ends only if the agent remembers to end it. This page is the model that makes it end on purpose: few tasks, each linked to the…
- [One state of everything](/framework/ai/doc/one-state.md) — What you asked for (2026-10-17, 22:50): one coherent data structure, sessions plus module tasks, that represents the current state of every…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [AITask architecture — render the working log, from session …](/framework/ai/AITask/doc/architecture.md) — AITask extends [Page](/framework/core/Page/Page.class.js) and serves as the master template for a task's detail view, a day's dashboard, an…
- [AITask views: what each one shows, and who uses it (checked…](/framework/ai/AITask/doc/views.md) — One screen. The owner asked ([ask 3](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-10.md)) whether t…

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- 2ca2bc8ef core/Task: TaskPage asks for task.jsonl first in a <module>/tasks/<slug>/ folder, so a task page makes no 404
- ab055dec1 asks-to-tasks: merge smoke fixes — 5 proposals under page-less modules move to their paged parent; allow two …
- 691997e5f Sessions account for every task: explicit parent wins, a tab session with no log gets one, --links census and…
- 8d35a1123 mastermind role: standing system architect respawned daily, logs over chat, approve plans in autonomous mode;…
- 41b93b214 sessions-and-tasks: the decided shape (owner 16:30) - one session.jsonl for every origin, tasks are lines, pr…
- 9ecff3280 Servex: every spawn opens a task dir (task: false opts out); private-Servex proof
- 4b78063c5 state: class State, one structure for every task in both stores, folded through Task.js, with a self-check; T…
- 9e947fcd7 sheet step 8: page hand-off from the global chat

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,433 tokens of reading, under the 100k limit).

Question: This session's tasks: every one closed with evidence, and the splitter fixed

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "This session's tasks: every one closed with evidence, and the splitter fixed"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
