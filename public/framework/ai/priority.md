# Priorities: what agents work on now

The one ranked list of what matters this week. A mastermind reads it before it spawns anything; work that is not on it is logged where it belongs (a one-line `⬜` in the module readme), not built. The owner reorders it; a mastermind updates the "Now" column as work lands. Source: [the 7-day prompt audit](sessions/2026/10/20/session-e00f55c9/prompt-audit-week-2026-10-22.md) (2026-10-22).

**The objective (the owner, 2026-10-22):** complete as many tasks as possible every day. Every owner prompt becomes tracked tasks (or notes) the first time; every session knows all its tasks and child sessions, wherever they live, and its completion is computed from them; a prompt is complete when everything in it is done or documented.

| # | Priority | Now |
|---|---|---|
| 1 | **Session and task views**: the session detail page, task and project views, segmented progress bars, a session completes from its tasks, the day view, the phone list, a compact grid, "done today" as a grid filter | Designed in Figma ([design-first.md](sessions/doc/design-first.md)); build next |
| 2 | **Tasks capture themselves**: a new task lands in the index on its own and defaults into its session's record; each owner prompt's asks are filed the first time ([core/Task](/framework/core/Task/)). **Task resolution:** what is a task, 1–3 per prompt, completion with evidence and confidence ([resolution.md](/framework/core/Task/doc/resolution.md)) | Store slices 1–3 done; auto-indexing open. **Processes** (node runs a task's phases in order; completion automatic) are ready to merge on `task/process-system` ([process.md](/framework/core/Task/doc/process.md)); names wait on the owner: [process-names.md](/framework/core/Task/doc/process-names.md). **Prompt records** merged 2026-10-23: each prompt is broken into parts and its completion computed ([prompt-records.md](/framework/ext/Refine/doc/prompt-records.md)); tab e00f55c9 audited, 42 of 69 prompts complete, the 28 open parts filed as tasks on its session |
| 3 | **Readmes every agent can trust**: short indexes that name every system, read by every agent; CLAUDE.md slimmed into the framework readme ([proposal](doc/readme-system.md)) | Merged 2026-10-22 (7d178fb72); the maps are indexed in [doc/readme.md](doc/readme.md#maps-read-one-before-you-dig) |
| 3b | **Merge approvals**: a "ready to merge" list on the owner's screen, each with what was done and a Merge button; the owner's one decision per project | Not built (no merge UI exists; `Server/merge.mjs` is the gate) |
| 3c | **See the agent context**: which readmes, skills and tools each session got and read, with tokens; one log tool; fewer tools ([direction](doc/readme-system.md)) | Study landed ([agent-context.md](doc/agent-context.md)). The readmes page (layer 1: the chain) was built by run 1 of the build process; `task/readmes-page` is ready to merge |
| 4 | **Dictation works**: one code path for the sidebar and the phone sheet, streaming Whisper ([dictation map](sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/)) | Planned |
| 5 | **One voice assistant per session** (merge the duplicates) | Queued |
| 6 | **Token accounting** by module and role, from a script, kept current | Not built |
| 7 | **Repo prune** (about 24 GB of stale worktrees) after a backup to the E drive | Not verified |
| 8 | **Class architecture**: items hold items ([plan](/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md)) | Ongoing |

**Pace:** the week reset on 2026-10-22; stay at or under pace (`node Server/usage-now.mjs`), and spread the work out rather than stop.
