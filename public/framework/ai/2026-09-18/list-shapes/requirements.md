# list-shapes — one column, six shapes: the same team content as rows, a title bar, an accordion stack, a drill-down, an inbox rail, a launcher

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one page, six columns, one data set). Clear beats brief by far (a newcomer sees six ways to do the same list and can press each). Prioritize (the six shapes first, the drag second, the notes third).
**Length budget:** level 1 is one screen at 1920: six phone-width columns side by side; at 400 they stack or page. Your landing report is one screen.
**The reader is the overwhelmed newcomer.** Shown, not told. Every control has a visible consequence.

## The owner's words (2026-09-18, 12:45)

> we want to explore UI layout for single column lists, like visual hierarchy. How big is the title? Is the title in a title bar with user interface buttons like a menu or settings? Is it expandable, collapsible, kind of an accordion? Is it part of a stack where accordions often are a zero-gap stack that sit flush with each other? When you click it, does it go deeper, does it launch something, does it switch to a new column? There's all kinds of different variations, and I'm not sure the best way to test all these out. [...] an inbox kind of preview rail that then launches the actual full view is one way to do it. [...] experiment with different types of content, a team management user interface, users and members and groups and how to organize them, maybe a drag and drop or some way to assign members to teams.

And this morning's layout rule: on a phone, nesting is padding — two levels is the limit; hierarchy from indent, weight and size.

## What exists — reuse

- `/imagine/team/` (`public/imagine/team/page.js`): six people, twelve tasks, four lanes as arrays (`PEOPLE`, `TASKS`, `LANES`), a roster rail, drag a chip between lanes through one `assign_lane()` seam via `ext/Draggable`. Read-only for you; import its data if it is exported, else copy the arrays into your page and say so.
- `ux/Tree` (`new Tree({ nodes, drag: true, adapt, acts })`, one `move` event); `core/Page` columns (`…/overview/columns/uses/inbox/` is an inbox rail that opens a reader — the shape the owner named); `ui/` templates (`ui/tree`, `ui/card`, `ui/toolbar`, `ui/accordion` if it exists — `ls public/framework/ui`); the six type levels (`styles/doc/theme.md`, never invent a font-size); the spacing ladder (`/framework/styles/system/`).

## Deliverables

1. **`/imagine/design/lists/`** — a child of `/imagine/design/` (one `children:` word + one visible line there). Six columns, each 24rem wide (a phone), each the SAME content — teams (groups) → members (people) → a member's detail — in one shape:
   1. **Rows** — a plain list: title level, one line under, a hairline between; indent per level.
   2. **Title bar** — each group has a bar: the title, a menu button and a settings button; press either and something visible happens (a menu opens; settings shows the group's two properties inline).
   3. **Accordion stack** — groups flush in a zero-gap stack, one open at a time, members inside; press a header to open it and close the other.
   4. **Drill-down** — press a group and the column REPLACES itself with the members (a crumb at the top to go back); press a member for the detail. The phone regime.
   5. **Inbox rail** — the groups as a preview rail on the left of the column, the selected one's members as the full view beside it (the two panes share the 24rem; say how — or the rail is the column and the view opens as a seventh column beside the six, if the row allows).
   6. **Launcher** — press a member and a sheet slides up over the column with the detail and a close; the list underneath does not move.
   Under each column one line: what a press does, and the deepest level's content width in px measured live (the nesting rule).
2. **Assign by drag**, in at least shapes 1 and 3: drag a member from one group to another (`ux/Tree`'s drag, or `ext/Draggable` the way `/imagine/team/` does it) and the member moves, both counts update; nothing persists across a reload (a demo). Say in the log which shape the drag reads best in and why.
3. **The notes**, one click down (a fold at the bottom): for each shape, one line — where it wins, where it fails (title size, taps to reach a detail, room left for text) — and one sentence choosing the shape the site's own sidebar should use for a deep tree (the sidebar tree lands today; say whether it is shape 1, 4 or 5).

## Rules

- Load `code`, `layout` (all — the box rule, nesting is padding, under a COLUMNS host there is no page grid: `/imagine/` is one; a 24rem column is a rail, `em`/`rem` widths belong to it), `css`, `new-css-class` (the design realm's prefix — read `css-scopes.txt`); `new-task` before the first edit (your dir exists: `ai/2026-09-18/list-shapes/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you. Write your choices as `decision` lines.
- **Fence:** `public/imagine/design/lists/**` (new), one `children:` word + one line in `public/imagine/design/page.js`, your task dir. Nothing else — not `/imagine/team/`, not `ux/Tree`, not `ui/`.
- The owner's dev server (port 80) is running: never touch it; your own is `PORT=8120 node server.js` from the repo root, background, killed by its real Windows PID when you land. Never `git stash`, never `find /`, never drive the owner's tabs. `ui-test` has the headless recipe: press one control per shape and shoot it (six shots), plus the page at 1920 and at 400.
- Demos never persist. Two numbers that must agree: members in the data and rows drawn in shape 1.
- Landing: `outcome` = a headline, the link, the 1920 shot, the six one-line notes, the sidebar sentence, what was left and why. One screen.
