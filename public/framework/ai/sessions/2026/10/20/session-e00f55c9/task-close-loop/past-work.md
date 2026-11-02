<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Tasks  an agent that finishes its work also finishes its task  you are a mastermind  on Sonnet  high effort " (words: task, agent, finish, work, also, you, mastermind, sonnet, high, effort)

## Tasks (8, best first)
- 2026-10-25 [You are the task-mastermind for the Dictate module (public/framework/…](/framework/ai/sessions/2026/10/25/session-9ea7030a/task-mastermind-dictate-improve/) — (no outcome logged)
- 2026-10-25 [Load the minion skill first. Your brief: public/framework/ai/sessions…](/framework/ai/sessions/2026/10/25/session-d3ed399d/minion-chat-roles/) — (no outcome logged)
- 2026-10-25 [You are a fresh AI-system mastermind for voice session v-sq8y7db (pag…](/framework/ai/sessions/2026/10/25/session-e06424f1/mastermind-tasks-completion/) — (no outcome logged)
- 2026-10-25 [You are a fresh child of voice session v-sq8y7db (session page /frame…](/framework/ai/sessions/2026/10/25/session-e06424f1/task-mastermind/) — (no outcome logged)
- 2026-10-25 [You are a fresh child of voice session v-sq8y7db (page /framework/ai/…](/framework/ai/sessions/2026/10/25/session-e06424f1/task-mastermind-2/) — (no outcome logged)
- 2026-10-03 [core/Task: a DOM-free unit of work, with subtasks that gate finish()](/framework/ai/sessions/2026/10/03/list-events/task-class/) — core/Task/Task.js landed — state machine (idle/running/paused/stopped/finished), duration() (running time only), progress() (computed from subtasks), finish() refuses while a subtask is open and names it. state machine + timestamps, one set() per transition: … · paths 3/3 exist
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…
- 2026-09-22 [card-to-task](/framework/ai/sessions/2026/09/22/session-df2f3e2e/card-to-task/) — Landed: a spoken build request now becomes a task, and the card shows a mastermind running it. The fast assistant decides per sentence — build it (route: "task", a brief in the owner's own words, state: "queued") or just a note/question, no task line at all. … · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/Task](/framework/core/Task/) — used by 792 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/highlight](/framework/ext/highlight/) — used by 24 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — > Superseded 2026-10-26 (the owner): a task now stays in the session that files it; a module folder only with an explicit home. Read [the r…
- [The task queue: a session's tasks plus a priority, worked b…](/framework/ai/doc/task-queue.md) — The decision (2026-10-23): there is no new queue system. A mastermind's queue is its tasks, each with a priority. The mastermind starts the…
- [The effort — group](/framework/ai/AITask/doc/effort.md) — A day is the filing system; an effort is how the work is actually thought about — a thread that outlives any one day. group names it, and t…
- [The highlight — the wall on /framework/ai/](/framework/ai/AITask/doc/highlights.md) — A highlight is the one thing a task says about itself to someone who was not there. It is a single line the task appends to its own task.js…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [grip — a rail's resize edge: a strip just inside the edge i…](/framework/ext/grip/readme.md) — Names (grip-zones, 2026-09-30) — so "where's the resize handle?" has one answer: this widget is the grip, and it lives here, at ext/grip. W…
- [Asks — what the owner asked for, and whether it happened](/framework/ai/AITask/doc/asks.md) — An ask is one thing the owner asked for, written down in their own words. It is a line in the running session's task.jsonl, using [ext/JSON…
- [Task queue ai/queue/](/framework/ai/queue/readme.md) — How the queue works, in plain words. There are three lists, and nothing yet joins them. (1) The ranked list on /framework/ai/queue/ is a *v…

## Sessions tagged with these words
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Catalog previews](/framework/ai/sessions/2026/10/14/session-e94e007a/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.19
- 2026/10/14 [oo-census review](/framework/ai/sessions/2026/10/14/session-d0e70f4b/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/oo · $0.26
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-c56372f0/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim framework/inbox · $0.15
- 2026/10/14 [Clarity session naming](/framework/ai/sessions/2026/10/14/session-bfc2468f/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim dictation/clarity · $0.15
- 2026/10/14 [Screenshots never committed](/framework/ai/sessions/2026/10/14/session-b7fa8424/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.17

## Owner asks
- 2026-10-03 Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) (mastermind-servex-10, building)
- 2026-10-02 framework: new home page, dark class cards, sprawl layout (task-mastermind-framework-home, building)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, landed)

## Commits
- 4bed6f7fa heartbeat: no status check for a task whose log says complete but whose branch is unmerged
- 494e754de chat round 4: fix inverted cursor semantics, had_speech_q queue misalignment, stale text/docs
- aca8dfd76 priority.md: three big things in plain words (see and approve the work; every ask becomes a task that finishe…
- 3d56bd918 sessions-and-tasks: the plan. A spawned agent is a session, a task is something to finish; slices, blast radi…
- 1f22c7385 task-closeout: cover every task today's sessions worked on (any day folder); per-session report; stricter 'fi…
- 44b838786 token-reduction: results-gated spend, revive keeps provider, landed-task reap proof
- 95a272385 model-weights: rung 0 (HTML->View helpers) + primer A/B, section 5 harness fixes
- 37879e648 Decisions decided by default; fix accidental-tap UX bug

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Tasks: an agent that finishes its work also finishes its task (you are a mastermind, on Sonnet, high effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Tasks: an agent that finishes its work also finishes its task (you are a mastermind, on Sonnet, high effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
