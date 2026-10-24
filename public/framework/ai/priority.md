# Priorities: what agents work on now

The one ranked list of what matters this week. A mastermind reads it before it spawns anything. Work that is not on it is logged where it belongs (a one-line `⬜` in the module readme), not built. The owner reorders it; a mastermind updates "Now" as work lands.

**The objective (the owner, 2026-10-22):** complete as many tasks as possible every day. Every owner prompt becomes tracked tasks the first time, and every dollar spent rolls up to a task the owner approved.

## The three big things (the owner, 2026-10-23: "name the one to three big things, and organize the other tasks inside them")

### 1. See and approve the work

One page per day where the owner sees every session, opens a demo, and approves a whole session with one press. Approving a session approves everything inside it. Spend that never gets approved shows red, as a leak. What is ready to merge sits on the same page.

- **Now:** the review home is a session's own page, for example [your VS Code session](/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/), now built from the Figma session page (band E): a sticky stats bar (cost from the item tool, model, running for, done X of Y), then Overview · Tasks · Chat. The Overview shows the Open, Project, Done and Dropped cards side by side; the Tasks tab is the nested work view with Approve, Approve all and leaks in red. The dated folder of the same session has a Report tab with its real cost, child sessions and counts, and the year and month pages list sessions. The [Merge page](/framework/ai/merge/) is linked from the AI pages and offers Merge latest when a branch moved after review. Console errors on the sessions pages: 2471 → 106 ([re-shoot](sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/reshoot/compare.md)), then 0 on 83 pages ([final sweep](sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/console-sweep/after-final.json)): pages now ask the dev server which files a folder holds instead of guessing, and weight, AI cost and settings do the same. The [day page](/framework/ai/2026-10-24/) counts what landed that day from any folder, has an Approve button on each session (the same approval as the session page), and on today's page shows the Ready to merge list; a named agent's row on the sessions page opens a working page.
- **Inside it:** the phone pages for sessions ([sessions/v/mobile](/framework/ai/sessions/v/mobile/)) and the design picks they follow ([mobile-cards.md](sessions/doc/mobile-cards.md)); the session page with its tasks (its Tasks tab has the Today, Week, Month, Year filter); the closed worktrees whose commits never landed: all 20 sorted, no code was lost, 6 task records restored and the rest kept on their branches ([report](sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/unlanded-worktrees/report.md)).

### 2. Every ask becomes a task that finishes

Each thing the owner asks for is filed as a task the first time, runs step by step, and ends done or documented, with its proof. Nothing is lost between sessions.

- **Now:** the 241 proposed tasks from old asks are sorted: 22 accepted into a priority, 219 in a backlog out of the inbox, with one Approve all press for you on [the Undone asks page](/framework/ai/asks/undone/). Processes use *step*, one class per template, and every build and design now ends with an *index* step (a readme line and a nav link). The [task queue](/framework/ai/queue/) is live (Queue tab): 143 accepted tasks, each with what it is, why, its estimated cost and its score from importance, cost and re-asks. Each task's cost is estimated from landed tasks with similar titles (merged 2026-10-24, shown after the next dev-server restart), so the rows no longer all tie.
- **Inside it:** prompt records (each prompt split into parts, its completion computed: [prompt-records.md](/framework/ext/Refine/doc/prompt-records.md)); processes ([process.md](/framework/core/Task/doc/process.md)); task resolution ([resolution.md](/framework/core/Task/doc/resolution.md)); node chases a started task that goes quiet (the "task chase" and "status chase"); tests clean up after themselves ("clean test").

### 3. Agents that know the rules

Every agent knows where things go and what was decided, from short readmes it can trust, and the right model does each job.

- **Now:** the documentation rule is written (documentation skill §4: `readme.md` is the index, a sibling `<topic>.md` for an often-read topic, `doc/` for the rest; no dated logs in readmes; the mastermind owns its area's docs). Each agent's role text now sits in its system prompt, so compaction keeps it ([compaction](doc/compaction.md), [context drift](doc/context-drift.md)). Rule: every system shows its live instances on a page ([rules.md](/framework/doc/rules.md)); first up, the Role class: a roles page listing each role with its model, effort and the agents running it, and a "Role" block on every session page showing its role's defaults beside what this session ran on. Merged 2026-10-24: the [roles page](/framework/servex/roles/) and the Role block on a session's Models and tokens tab; each new session records its role after the next Servex restart. Next: a cheap pass that makes every readme follow the doc rule. The model experiment: one Opus builder designed and built the Work tab for $12.24 against a $25 budget, about three times what each Sonnet builder cost ([models](/framework/ai/models/)). Its record had read $79.58: Servex counted the whole session again on every wake-up, which inflated every agent that ever slept ($4,783 logged, $1,422 real); fixed and merged 2026-10-23. An Opus planner plus Sonnet builders is not measured yet.
- **Inside it:** the readme system ([doc/readme-system.md](doc/readme-system.md)); seeing which readmes, skills and tools each agent got ([agent-context.md](doc/agent-context.md), the readmes page).

## Later (logged, not built this week)

Dictation works everywhere ([dictation map](sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/)) · one voice assistant per session · token accounting by module and role · repo prune (about 24 GB of old worktrees, after a backup) · class architecture: items hold items ([plan](/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md)).

**Pace:** report it as three numbers, percent of the week used, percent of the week gone, and percent of pace (used ÷ gone), from `node Server/usage-now.mjs`. Stay at or under 100% of pace; spread the work out rather than stop.
