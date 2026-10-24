# Priorities: what agents work on now

The one ranked list of what matters this week. A mastermind reads it before it spawns anything. Work that is not on it is logged where it belongs (a one-line `⬜` in the module readme), not built. The owner reorders it; a mastermind updates "Now" as work lands.

**The objective (the owner, 2026-10-22):** complete as many tasks as possible every day. Every owner prompt becomes tracked tasks the first time, and every dollar spent rolls up to a task the owner approved.

## The three big things (the owner, 2026-10-23: "name the one to three big things, and organize the other tasks inside them")

### 1. See and approve the work

One page per day where the owner sees every session, opens a demo, and approves a whole session with one press. Approving a session approves everything inside it. Spend that never gets approved shows red, as a leak. What is ready to merge sits on the same page.

- **Now:** the review home is a session's own page, for example [your VS Code session](/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/). Its new first tab, "Work", is built, reviewed and fixed on `worktree/qf-3` ([shots](sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/review-page/shots/work-flat-1920.png)): the children nested (29 top rows, 41 folded inside), own and rolled-up cost ($227 own, $692 with everything under it), duration, "36 of 68 tasks complete" counted only from records, the open tasks, Approve, Approve all, leaks in red, the Today ▾ pill. v/review is dropped. The merge is yours; its smoke check still fails on the task-folder pages it links to (the same pages fail on michael/dev), which the system architect is fixing. The Merge list ([/framework/ai/merge/](/framework/ai/merge/)) folds in later.
- **Inside it:** the phone pages for sessions ([sessions/v/mobile](/framework/ai/sessions/v/mobile/)) and the design picks they follow ([mobile-cards.md](sessions/doc/mobile-cards.md)); the session page with its tasks; a time filter (Today, Week, Month, Year) inside a session; the 19 closed worktrees whose commits never landed.

### 2. Every ask becomes a task that finishes

Each thing the owner asks for is filed as a task the first time, runs step by step, and ends done or documented, with its proof. Nothing is lost between sessions.

- **Now:** the 241 proposed tasks from old asks are sorted: 22 accepted into a priority, 219 in a backlog out of the inbox, with one Approve all press for you on [the Undone asks page](/framework/ai/asks/undone/). Processes use *step*, one class per template, and every build and design now ends with an *index* step (a readme line and a nav link). The task queue, a page you can open showing what is queued, why, its cost and its priority, has its look shot and is now the system architect's to finish.
- **Inside it:** prompt records (each prompt split into parts, its completion computed: [prompt-records.md](/framework/ext/Refine/doc/prompt-records.md)); processes ([process.md](/framework/core/Task/doc/process.md)); task resolution ([resolution.md](/framework/core/Task/doc/resolution.md)); node chases a started task that goes quiet (the "task chase" and "status chase"); tests clean up after themselves ("clean test").

### 3. Agents that know the rules

Every agent knows where things go and what was decided, from short readmes it can trust, and the right model does each job.

- **Now:** the documentation rule is written (documentation skill §4: `readme.md` is the index, a sibling `<topic>.md` for an often-read topic, `doc/` for the rest; no dated logs in readmes; the mastermind owns its area's docs). Each agent's role text now sits in its system prompt, so compaction keeps it ([compaction](doc/compaction.md), [context drift](doc/context-drift.md)). Rule: every system shows its live instances on a page ([rules.md](/framework/doc/rules.md)); first up, roles as a Role class, started after the session page (look first). Next: a cheap pass that makes every readme follow the doc rule. The model experiment: one Opus builder that designs and builds a whole slice, compared with an Opus planner plus Sonnet builders ([models](/framework/ai/models/)).
- **Inside it:** the readme system ([doc/readme-system.md](doc/readme-system.md)); seeing which readmes, skills and tools each agent got ([agent-context.md](doc/agent-context.md), the readmes page).

## Later (logged, not built this week)

Dictation works everywhere ([dictation map](sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/)) · one voice assistant per session · token accounting by module and role · repo prune (about 24 GB of old worktrees, after a backup) · class architecture: items hold items ([plan](/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md)).

**Pace:** report it as three numbers, percent of the week used, percent of the week gone, and percent of pace (used ÷ gone), from `node Server/usage-now.mjs`. Stay at or under 100% of pace; spread the work out rather than stop.
