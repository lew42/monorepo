# Task system: does it actually work?

Expected cost: about $2. Sonnet, medium effort. The owner is tired of asking for things that aren't done, so prove each answer with a real file line or a test, not by reading code alone.

Read `public/framework/core/Task/readme.md`, `doc/resolution.md`, `doc/cracks.md` and `public/framework/core/Session/readme.md` first.

## Answer these, each yes or no with its evidence

1. When a Servex-spawned agent files a task, does it land in that agent's `session.tasks`, and does the task show in the parent's session and in its completion value? Test with one throwaway child (`spawn_agent`, Haiku, one small job) and read both records.
2. Does every session have a completion value that is right? Compute it for `e00f55c9` and for 5 recent spawned sessions, and compare with what the session page shows. The handover says 170 of 186 child entries were "unlinked": is that still true?
3. Does a VS Code tab get the same record as a spawned agent? Known so far: this tab has `sessions/2026/11/04/session-5132a480/session.jsonl`, and the item tool with an explicit `path` writes there and returned `completion: 0`.
4. How many sessions from the past 7 days filed the owner's asks as tasks at all, against how many prompts they received? Compute it with a script.

## Fix this known bug

The `item` tool with no `path`, called from a VS Code tab, wrote to `public/page.jsonl`, the site's root page, though its description says "omit = your own session page" (2026-11-04, this tab; I removed the 7 lines). See `Servex/agents/page_tools.js` around line 160. A tab's call must reach its own session or be refused with the reason. Add a test.

## Deliver

- Fix in a worktree (`take_worktree`), reviewed, landed with `merge.mjs`.
- What you learn goes in `public/framework/core/Task/readme.md` or `core/Session/readme.md`, the place a future agent reads. Your report here only links to it.
- A short `report.md` in this folder: the four answers, then anything broken, ranked. File each broken thing as a task on your session.
- Leave zero footprint: close the child, the worktree, any server or browser you started. List what you closed.
