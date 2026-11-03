# Mobile cards for sessions, projects, tasks and processes (Figma, 2026-10-22)

**The page:** [Projects, sessions, tasks, processes](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=324-54823) in the September 2026 Figma file. It starts with a "What to pick" card, then nine bands, each a row of 400 px (phone width) frames built with real data.

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
| H · Process | the process page running (execute phase pulsing, pause and stop) and waiting on you (merge, one button), a phase opened (do text, session, outcome, cost), the `Process row` component (`Process row` set 340:119305, states running, waiting, done) in a session's Tasks tab and on the day list; from run 1 of `readmes-page`, 7 phases, $4.27. Shot: [G.png](../2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/process-views/shots/G.png) | 339:56428 |
| I · Nested sessions | sessions nested by parent: folded under a count, a parent opened, a child that is itself a parent (one indent, then its own page), and sessions with no recorded parent (small "no parent link" note); every row has a kind tag. Parts: `Kind tag` set 342:56674 (VS Code tab, voice, mastermind, minion, reviewer, clarity), `Fold` 342:56675, `Session row` 342:56678. From today's `session-tree.json` and `2026/10/22/index.json`; frame 3 draws the one-indent rule, since today's tree records no tab-to-mastermind link. Shot: [H.png](../2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/process-views/shots/H.png) | 341:56545 |

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

Built: [the mobile variant](/framework/ai/sessions/v/mobile/), four pages (day list, nested sessions, a session, a task) on real data. How it is built: [v/mobile/readme.md](/framework/ai/sessions/v/mobile/readme.md).

## Keeping the designs true (the owner, 2026-10-22)

When the task, session or process data changes (a new field, a renamed state, a new kind of session), update these Figma bands to match, in the same task that changed the data. The fields to draw from are in [core/Task/doc/process.md](/framework/core/Task/doc/process.md), [core/Session/readme.md](/framework/core/Session/readme.md) and [core/Task/readme.md](/framework/core/Task/readme.md). A band drawn from fields that no longer exist is a bug, the same as a stale readme.
