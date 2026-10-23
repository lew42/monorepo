# Figma: mobile cards for sessions, projects, tasks and processes

Estimate: $15 (an estimate, not a cap). Opus, high effort. You are the Figma design mastermind: you may spawn helpers to explore in parallel, but only one agent writes to Figma at a time (rate limit). Parent: `vscode-mastermind`: log with the `log` tool. Design only: no code.

## Read first

The `figma` skill (`.claude/skills/figma/SKILL.md`) and `public/framework/ext/Figma/readme.md` with its docs (`doc/use-figma.md`, `doc/troubleshooting.md`). The data you are drawing: `core/Task/readme.md`, [process.md](/framework/core/Task/doc/process.md), [Task notes §5–7](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md), `ai/sessions/readme.md`, [design-first.md](/framework/ai/sessions/doc/design-first.md). Use real data from `public/framework/ai/sessions/2026/10/` (this session's `sessions-and-tasks/` folder has many tasks). For a system question, ask `mastermind-system-architect` (it may be asleep: its findings are in `ai/doc/readme.md`).

## The owner (2026-10-22, the tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`, the long prompt about Figma and mobile cards; read it whole)

- **File and page:** the September 2026 file (`QYN0G2URSBHYH5I06MOjxU`). A new page, "Projects, sessions, tasks, processes". The old "Sessions and tasks" page (`307:54823`) holds earlier designs: build on them.
- **Mobile first**, the most important data first. A session: cost, model, status, progress (open vs closed), its projects, tasks and processes. Browsing: the day (also month, year) list of sessions. Detail views matter most: session, project, task, process, each with its content and its children, clickable down.
- **Frames are mobile width, not phone mockups:** any height, any content. Group variants in sections of three to five columns, roughly equal heights (masonry-like). One fixed-height frame per screen is fine where the header, footer and rail space matters.
- **Colour schemes:** a master component duplicated per scheme, as on the file's other pages. The background is set by hand (white, light grey, dark), not part of the scheme; the text scheme follows the background. Use the file's tokens and its responsive (resolution) variables.
- **Card structure to explore:** full-width cards (edge to edge header, padded content, footer) vs cards with a small margin; a "wrapper" card with no padding or gap whose header, main and footer each pad themselves; white cards on light grey with a small radius, so scrolling shows where one card ends; nesting without wasting the narrow width; data grids. Don't over-nest on mobile.
- **Content:** any card can hold arbitrary content plus its list of children (content above or below, or a template that places the list); questions on a task (an open question keeps it open).
- **Status:** green check for done (not orange-red); one bar style per bar; segmented progress bars.

## Done when

- [ ] The new page has: session card variants, session detail, day list, project/task/process cards and details, card-structure studies, schemes; real data.
- [ ] A review shot of each section in your log; a one-screen summary of what to pick, with the alternatives. `finish-task`.
