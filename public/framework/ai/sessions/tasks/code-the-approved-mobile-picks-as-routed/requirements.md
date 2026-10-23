Budget: $12

# Code the approved mobile picks as one routed variant you can tap through on a phone

## What to build

Build one variant, **`/framework/ai/sessions/v/mobile/`**: four pages that link to each other, sized for a 400 px wide phone, using real session data. This is the `code` step of the design process (`Process.DEFINITIONS.design` in `core/Task/Process.js`): the Figma picks are approved, and now they become pages.

| # | Page | URL | What it shows |
|---|---|---|---|
| 1 | **Day list** (the variant's home) | `v/mobile/` (today) and `v/mobile/<yyyy>/<mm>/<dd>/` | That day's sessions, grouped by what needs you: **Needs you** (open questions, blocked), **Running**, **Done** (with the outcome line), then the rest folded. A day header with the count and the cost. |
| 2 | **Sessions, nested by parent** | `v/mobile/all/` (and a "Nested" toggle or tab on page 1, your call) | A child session (a minion or mastermind spawned by another session) sits inside its parent, collapsed with a count ("+6 minions"), so ~70 flat rows become a few parents. Each row is tagged with its kind: **VS Code tab**, **voice**, **mastermind**, **minion**. |
| 3 | **Session page, design B** | `v/mobile/<session id>/` | Open work first. The title scrolls away and a compact bar slides in. Tabs: **Overview**, **Tasks**, **Chat**, swipeable left and right. Uses the existing session menu (`SessionMenu`, `head_tools()`), not a new one. |
| 4 | **Task detail** | `v/mobile/<session id>/<task path>/` | The task's content first, then its subtasks as flat rows (one indent), then its open questions. Status and a segmented bar at the top. |

Every row taps through: day list → session page → task detail, and back.

## The picks to follow (the design)

Read `/framework/ai/sessions/doc/mobile-cards.md` first. Its rules, in short:

- **Card:** a wrapper card with an 8 px margin and radius 4. It has no padding of its own; its header, main and footer pad themselves, so rows run edge to edge. **Never pad twice** (card and content both padding).
- **Card header:** set off from the body by a light grey line, not a border or a different background. Card header styles are explained in Follow-up 2 of the Figma brief.
- **Nesting:** flat rows with one indent and a 2 px rail. Deeper levels open their own page.
- **Status:**
  - green check for done
  - amber, pulsing, for running
  - red for stalled, blocked or an open question
  - grey for open
  - dropped items are not counted
- **Segmented bar:** one segment per child, up to 12; past that, a stacked meter.
- **Ground:** light grey, with white cards.
- **Pictures:** the Figma page bands D (day), E (session page B) and F (task page A). Get one screenshot of a band with the Figma MCP `get_screenshot` (file `QYN0G2URSBHYH5I06MOjxU`, node ids in mobile-cards.md) if you want to see it. Don't edit the Figma file.

## Reuse, don't rebuild (law 6)

- **Session data:** `ai/AISession/`. Use `AISessionDetail` (session page: loading, data, `SessionMenu` via `head_tools`), `AISessionsPage` (`route()`, `arrange()`), `AISessionRows` (`session-tree.json`: `parent`, `role`, `agent`), and the day `index.json` snapshots.
- **Each variant page class extends the class that renders the real page** (Process.js: "a view that extends its parent's view"). For example, `class MobileSession extends AISessionDetail`, overriding `content()`.
- **Task data:** `core/Task/`.
  - `Task` holds the states, `TaskPage` the loading and `TaskView` the sizes.
  - **The segmented bar already exists:** `TaskView.bar()`. A near-copy, `sessions/doc/variants/SegBar.js`, also exists. Use or extend `TaskView.bar()` so there is ONE bar. Don't write a third.
  - Change its colours to the amber and red rules above only if that is a small, safe change. Otherwise, extend it in the variant.
- **Swipeable tabs:** none exist yet. Write one small class (scroll-snap on a horizontal strip of panes, plus a tab row that follows the scroll, with no gesture library). Keep it in the variant's folder for now and name it plainly (`SwipeTabs`).
- **Routing:** `AISessionsPage.route(name)` runs before a `page.js` file is looked up, so `v` would be read as a session id. Make `route()` hand `v` to the variant (one small, clear exception), and say so in your report.

## Where it lives

- Code: `public/framework/ai/sessions/v/mobile/`, which holds `page.js` plus one class per file.
- CSS: one stylesheet beside them. Its class prefix is `mob-`; check `framework/styles/css-scopes.txt` first.
- Link the variant once, from `sessions/doc/mobile-cards.md` (the "Next" section).

## How to work

1. **Worktree:** run `node Server/worktree-up.mjs mobile-picks` (from the main tree). It gives you a private worktree with its own server URL. Build there; never edit the main tree.
2. **Order:** build the pages in the table's order (1 → 4). Commit after each page.
3. **Screenshots:** after each page, take headless Playwright shots at **400 px wide** (and one at 1200 px for the last pass), against your worktree's URL. Save them as `public/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/shots/<page>-400.png` **in the main tree** (a task-dir data file; it is fine there). Then log one line on this task (`item` tool, path `/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/`, delta `{"log":{"text":"..."}}`) naming the shot. Your parent reviews each shot and may message you fixes.
4. **Real data:** use today's sessions (2026-10-22) and session `e00f55c9` (its task folders are under `sessions/2026/10/20/session-e00f55c9/`). No made-up numbers.
5. **Missing parent link:** if a spawned session has no `parent` you can find, don't invent one. List those sessions in your report. Your parent will send it to the system architect.
6. **Ready-to-merge, not merged:** run `node Server/smoke.mjs <worktree>` and fix until it passes. **Do not merge**; the owner approves merges. End with a report: the branch, the four URLs, the shots, what you reused, what you changed outside `v/mobile/`, and which readme your change made out of date.

## Done means

- [ ] All four pages open at 400 px, with real data and tap-through links.
- [ ] Children are nested under their parent, collapsed with a count, and each row is tagged with its kind.
- [ ] The session page has Overview, Tasks and Chat, swipeable, and the existing session menu.
- [ ] The status colours and the one segmented bar follow the rules above.
- [ ] There is a 400 px shot of each page in `shots/`. Smoke passes and the branch is unmerged.
