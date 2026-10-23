# Mobile cards for sessions, projects, tasks and processes (Figma, 2026-10-22)

**The page:** [Projects, sessions, tasks, processes](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=324-54823) in the September 2026 Figma file. It starts with a "What to pick" card, then seven bands, each a row of 400 px (phone width) frames built with real data.

Brief and log: [figma-cards](../2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/requirements.md). The earlier page it builds on: [Sessions and tasks](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=307-54823) ([design-first.md](design-first.md)).

## The bands

| Band | What it shows | Node |
|---|---|---|
| A · Parts | components: `Status`, `Segment`, `Chip`, `Stat`, `Row`, `App bar`, `Tab bar` (Active=1–3), `Rail` | 324:54829 |
| B · Card structures | padded, wrapper, edge to edge, small margin; card-in-card vs flat rows vs data grid | 325:54824 |
| C · Session cards | names only, compact, standard, outcome, open questions | 327:55013 |
| D · Browse | the day as one 400×844 screen, the day grouped, the month as rows, the year as calendars | 329:55137 |
| E · Session page | A stats first (sticky bar), B open work first (title scrolls away), C full screen; the Chat tab | 331:55264 |
| F · Tasks, projects, processes | task page A (content, then questions) and B (`{tasks}` placed in the content), project with stages, process with a phase timeline, expand in place, nested bars, upgrade a task to a project | 333:55500 |
| G · Schemes | one master on four grounds set by hand; only the Text mode changes | 336:56027 |

## The picks (alternatives are on the page)

- **Card:** a wrapper card with an 8 px margin and radius 4. It has no padding of its own; its header, main and footer pad themselves, so rows run edge to edge.
- **Nesting:** flat rows with one indent and a 2 px rail. Deeper levels open their own page.
- **Lists:** the day is grouped by what needs you. A session card is Standard; a finished one shows its Outcome, and open questions turn it into the Questions card.
- **Session page:** design B, open work first. The title scrolls away and a compact bar slides in. The tabs are Overview, Tasks and Chat.
- **Bars and status (the owner, 2026-10-22):** green done, amber in progress (pulses), red stalled or blocked (including an open question), grey open, and dropped items not counted. A bar shows one segment per child, up to 12, and a stacked meter past that. A child shows its own segments inside its slot only where each is at least 6 px wide.
- **Scheme:** a light grey ground with white cards. On the dark scheme, red text and the amber glyph are weak.

## Real or modeled

All the numbers come from the session store (`sessions/2026/10/*/index.json`, the task folders of session e00f55c9), computed by a script. Two things are modeled:

- **Process system's seven phases:** that task ran before the process runner existed, so the phases follow `Process.DEFINITIONS.build`.
- **The project's stage (work):** no project file records a stage yet.

## Next

Code the picks as variant pages you can click through on the phone. This is the design process, `Process.DEFINITIONS.design` (branch `task/architect-requests`, written by the system architect): design → review shots → pick → code as `<page>/v/<name>/` → review at 400 and 1200 px → merge.
