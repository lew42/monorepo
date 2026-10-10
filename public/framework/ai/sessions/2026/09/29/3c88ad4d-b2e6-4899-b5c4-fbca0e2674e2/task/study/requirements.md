# Lifecycle study: how much does the system leave running?

Load the `minion` skill first, then `page`. Parent: task-mastermind-lifecycle. Card dir: `public/framework/ai/2026/09/29/lifecycle-nothing-left-running-nested-ta/`.
**The owner's words:** `public/framework/ai/2026-09-29/lifecycle/requirements.md` (read it; you own deliverable 2). The owner: "how many things are created that are never finished and how many servers are started that are never shut down properly? How many work trees get orphaned and are just sitting there?"

## Count (a number for each, with how you counted)
1. **Tasks started and never landed:** task dirs under `public/framework/ai/2026-09-*/` whose task.jsonl has no `landed_at`. Split by day.
2. **Servers started and never stopped:** the live process list right now (`Get-CimInstance Win32_Process -Filter "Name='node.exe'"`: `server.js` wrappers and `run.js` children, with cwd/path and MB), matched to worktrees and to whether their task landed. Also `.worktree-logs/` for past ones.
3. **Worktrees orphaned:** `C:\Code\lew42\worktrees\*` and `.worktrees.json` (repo root). Orphaned = branch merged into michael/dev (`git merge-base --is-ancestor`) or task landed/dead, yet still on disk or still serving. Report disk size too (a rough `du -sh` per dir is fine).
4. **Agents left idle holding a claude process:** Servex `GET http://127.0.0.1:8090/agents` (or `Servex/agents` registry file), idle rows with a live process, and their MB.
Also: the 3 quick-fix worktrees are all held by stopped agents since 09-28 (qf-2, qf-3, qf-4), so `take_worktree` fails. Include that.

**Read only; stop nothing.** A later step reaps. Put scripts and raw JSON in `public/framework/ai/2026-09-29/lifecycle/study/` (a `counts.json` with the four numbers and the rows).

## The page
Use `create_page` for `public/framework/servex/lifecycle/` (under /framework/servex/), in the worktree **C:\Code\lew42\worktrees\lifecycle** (branch `worktree/lifecycle`; commit there, never the main tree). The page loads `counts.json` (copy it next to the page as `data.json`), and shows, top first: four big numbers; one bar chart (inline SVG or a CSS bar chart; no new library) of what's left running, by kind, with MB; a table of the 10 worst cases (name, kind, age, MB, owner task, why it's orphaned). One line on what the reaper will do: "a task that lands now closes its own servers, watchers, browsers and idle helpers." It needs a readme.md and a doc/ (one short doc: how each number was counted). Look at it at 1920 with `mcp__site__shot` on `http://127.0.0.1:54967/framework/servex/lifecycle/` and judge it.
Another minion is editing Servex/ and Server/ in the same worktree: stay out of those.
Every Node spawn/exec sets `windowsHide: true`. Stop anything you start. Land your log with `landed_at`; outcome 80 words at most, with the four numbers.
