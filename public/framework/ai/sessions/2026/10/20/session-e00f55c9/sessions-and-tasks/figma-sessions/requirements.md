# Figma: design sessions, projects and tasks (and improve the Figma system as you go)

Budget: $8. Opus, medium effort. Parent: `vscode-mastermind`, who reviews your frames by screenshot and sends notes to your inbox: log with the `log` tool, and post the node id of every frame you finish. **No code, no worktree.** You only work in Figma and in `ext/Figma/doc/`.

**First:** load the `figma` skill and follow its read-first order; then the plugin's `figma-use` and `figma-generate-design`. Check you have the `mcp__figma__*` tools; if you do not, log an `alert` line saying so and stop (the mastermind will draw instead).

## Where

File `QYN0G2URSBHYH5I06MOjxU`, page **Sessions and tasks** (`307:54823`). A first pass is there, drawn by the mastermind with real data from 2026-10-20: progress anatomy, session card at three densities, day view 400 and 1200, session page 400 and 1200, task page 400, Task vs Project, plus components `Progress / Segment` (done, active, open) and four icons. It uses hard-coded Montserrat sizes and some hard-coded greys: **rebuild it properly** on the file's system (text styles `h1`–`h4`/`body`, `Colors`/`Text` variables, `Resolution` modes per [use-figma.md](/framework/ext/Figma/doc/use-figma.md)), keep what works, and replace frames rather than stacking duplicates (move a superseded frame into an auto-layout frame named "Superseded", never a Section; never delete).

## The owner's asks (2026-10-20, 22:35 and 23:00; essence in [ai/sessions/doc/design-first.md](/framework/ai/sessions/doc/design-first.md))

1. **Cards first.** A list of good cards is the day view; mobile friendly. A card is titled properly and shows an overview (three main tasks done → three checked). Densities: compact (names only, see more at once), standard, rich.
2. **The single session page** (name, nickname, completion bar, duration, total cost including child sessions, model, nested tasks and projects; tabs Overview and Chat, probably no more), **the task page** (content, subtasks, progress), **the project page** (`class Project extends Task`: looks much like a task, a bit more prominent, a folder icon; a task is a checkbox; a project keeps a **recent sessions** list linking to them).
3. **How they nest:** a session holds tasks and projects; projects hold tasks; segmented progress bars, composite when nested (a parent reflects its children and is one segment of its own parent).
4. **Sessions recede.** Once tasks and projects work, the end user cares about tasks and projects, not which session did them; sessions matter for context and cost. Design a **task/project-first** view of a day beside the session-first one, so the owner can compare.
5. **Scopes and widths:** year, month, day lists; 400 up to 1200, 1920 and 3440; multi-column only where width earns it. Reusable templates (a card, a list, a page shell) as components.
6. **Not now:** the routing between them, and moving tasks out of session folders; the owner will decide later.

## Improve the system (lightly)

Every lesson that applies every time: one line in `ext/Figma/doc/use-figma.md`. Every edge case: a dated entry in `ext/Figma/doc/troubleshooting.md`. If the `figma` skill misled you, say how in `.claude/skills/figma/improvements.md`. Commit those doc edits (`git add` by exact path, attribution line).

## Done when

- [ ] The page holds: progress anatomy, session card (3 densities), task card, project card, day view session-first and task-first (400 and 1200), session page, task page, project page (400 and 1920), and a month view (1200): all on the file's tokens and styles, with real data.
- [ ] One screenshot per frame in your log (node ids); the mastermind's notes answered.
- [ ] Docs improved as above and committed; `finish-task` in your own `session.jsonl` with a link to the page.
