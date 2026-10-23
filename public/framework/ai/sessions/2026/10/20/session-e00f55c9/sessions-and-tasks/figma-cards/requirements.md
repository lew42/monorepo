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

## Follow-up (the owner, 2026-10-22, the next tab prompt)

- **More than one design** for each view; there is no single right answer.
- **A design-to-code process**: design, review by screenshot, then code the approved variants as real pages so the owner can click through them on the phone (Figma does not work there). Variants as a tree: a default, versions and sub-versions, each a set of changes. Write this as a process in `core/Task/doc/process.md`'s terms, with the system architect.
- **The mobile header** may scroll away or not be sticky, or the page goes full screen; show the options.
- **Segmented bars:** one segment per child, green done, amber pulsing in progress, red stalled or blocked; a nested segment shows its children only where they fit (a 12-step child does not fit in one small segment: show its own bar on its own card instead).
- **Preview vs detail:** a child shows as a preview on its parent (a summary, its bar) and opens to its own routed detail page; drill down on the phone. Maybe expand in place: show both.
- **Upgrading a task to a project** in the UI.

## Follow-up 2 (the owner, 2026-10-22, the next tab prompt)

- **Card headers:** a title bar on a card, styled several ways: a light grey line, no border, a different background. Sticky header and footer inside a tall card, the middle scrolling (show it if Figma can; otherwise note it for code).
- **Card vs content:** a card has padding, a background and a radius; content inside it is transparent. A header/main/footer card drops its own padding and each section pads itself. Never double-pad (a padded parent with a padded child is usually a smell).
- **Session navigation:** the session's name on one line with a menu button aligned right, opening a templated list of actions and sub-pages (settings, saved to `session.jsonl`). Also consider tabs, a drop-down, a sheet.
- **Micro-interactions on mobile:** a small sheet from a toolbar button, a "+" that expands filters in place, drop-downs, swipeable tabs instead of wrapping ones (the site's top tabs wrap today), resizable bottom or top sheets.
- **Variants, and where they live:** design the UI for browsing a tree of variants of any page or component, and propose where variants are stored and named (own folder, or the parent's `page.jsonl`), with the system architect.
- **Keep your docs current, conclusions only:** the Figma readmes hold decisions and outcomes, not a dated log; the log is your task's JSONL.

## Follow-up 3 (the owner, 2026-10-22)

- **Is it running?** Every task, project and process shows whether it is active with a small indicator (a dot or a play triangle), not a colour change or a heavy outline; once running, pause and stop buttons sit beside it; a queued task shows it will start on its own.
- **Buttons write to the log:** pressing start, pause, stop or approve appends a line to that item's JSONL, and the agents subscribed to it get it at once with the owner's intention clear.
