# Sessions and tasks: design in Figma first, then build (the owner, 2026-10-20 22:35)

Words: the VS Code tab's prompt log (`ai/2026/10/20/session-e00f55c9/page.jsonl`, the last line of the day). Essence, with the owner's certainty kept.

## Priority

**The session and task views are the top priority.** Dictation matters but is not top priority (its map and five decisions: [ux/Dictate/doc/map.md](/framework/ux/Dictate/doc/map.md)). Stay under pace; do no more than needed.

## Design first (should, and "we need to prioritize it")

Explore the design space in Figma **before** coding, so we know what the views look like and which fields they need. The owner can see, edit, adjust and approve there; once final, the browser build matches it. File: the September 2026 Figma file `QYN0G2URSBHYH5I06MOjxU` (agents cannot make new files; a new page in it is fine), page **Sessions and tasks**.

What to design, from 400 px up to 1000 and 2000 px:

- **Cards first.** A list of good cards is the day view, and it is mobile friendly. A session card is titled properly and shows an overview: if three main tasks were done, show those three checked off. The right preview varies; a compact density shows names only, to see more at once. Views may be configurable; one perfect view is not the point.
- **The single session page**, devoted to one session: name, nickname, completion bar, essentials (duration, total cost including child sessions, model), its tasks and projects nested. Maybe tabs: **Overview** (status, cost, details) and **Chat** (the actual messages); probably no more.
- **The single task page**: content, subtasks, progress bar, the rest.
- **Scopes**: year, month, day: a list of matching sessions or tasks, multi-column on wide screens.
- **Progress bars** are one generalized, reusable thing: segments per step, nested composites, a few appearances, one data input.

## The class question (could; decide at build time)

A list shows each session's **preview**; a click shows its **full** view. Options the owner named: a `Session.View` class with `preview()` and `render()`; or no view class, just `render()` and `preview()` template methods on `Session` when there is little dynamic behaviour; sub-templates (the progress bar) reusable either way. Since we want to try many variants, separate template functions may be easier to swap. Not a rabbit hole now.

## Columns

The preview rail opening a column that opens more columns "gets tricky; maybe it has been a mistake" until the owner can describe what they want. Lists behave like the preview rail: preview renders in the list, full render on its own page.

## Decided tonight without waiting (the owner: never wait on him; revisable)

From [views-plan.md](views-plan.md), each the planner's first-ranked option: places are paths and filters a query; no column system on the sessions pages, each place one full page; `Session extends Task` (one completion API); the nickname and summary bullets are written by a tool at finish-task (Haiku), never by hand; `/framework/ai/<date>/` redirects to the day folder and `ai/AIDay` moves aside. The **layout** (A inline, B drop-down, C two panes) is chosen in Figma, not from the prototype. The five dictation decisions in the map are accepted as ranked and wait behind this work.

## First pass in Figma (2026-10-20 22:50)

[Sessions and tasks page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=307-54823), built from real sessions of 2026-10-20: the segmented progress bar (simple, 21 steps, composite, beside or under a title), the session card at three densities (compact, standard, rich), the day view at 400 and 1200 (3-column grid), the session page at 400 and 1200 (Overview and Chat tabs, nested tasks), the task page at 400, and Task vs Project (checkbox vs folder, bold title, bar and count). Components: Progress / Segment (done, active, open) and four icons. Edit freely there; the build follows what you settle on.
