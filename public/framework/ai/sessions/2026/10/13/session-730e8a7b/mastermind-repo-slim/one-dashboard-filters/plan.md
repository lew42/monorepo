# One dashboard, step 3: the other pages are saved filters of the Inbox

Doc: [one-dashboard.md](/framework/ai/doc/one-dashboard.md) · task: [requirements](requirements.md) · shots: `shots/`

| Page | Showed | Chips that reproduce it | Stays | Dies |
|---|---|---|---|---|
| [/framework/ai/tasks/](/framework/ai/tasks/) | In flight, queued, landed (Today/Yesterday/Week), a row opens the card | `?live&recent=today&kind=task` (`?landed=yesterday\|week` becomes `recent=`) | **Lanes** and **Architecture** tabs (Lanes now reads `state.json` through `DashState`) | `tasks/TasksPage.js` (its own Browse list and rows) |
| [/tasks/](/tasks/) | Every task in a module's `tasks/` folder | `?kind=task&home` (new Home chip: "in a module's tasks/") | nothing | its own list (it used `TasksPage`); now `page.jsonl` names `tasks/SavedFilter.js` |
| [/framework/ai/asks/undone/](/framework/ai/asks/undone/) | 1167 asks by module and verdict | no preset reproduces it (see decision) | its module/verdict view, plus a link to `?kind=ask` | nothing yet |
| `/live/` | | | untouched | |

**The change.** `rail/DashChips.js` holds `SAVED` (the presets) and `saved()`; `tasks/SavedFilter.js` (a `Page`) forwards to the Inbox and keeps the hash. The chip counts now honour the other groups (Today under Kind: task counts tasks only: **13**, equal to `check.landed_today.state`). The Lanes rail link sits in the Inbox foot.

**Decisions**
- Redirect, not mount. Mounting `AIRail` under another url needs its detail pane to work with the host page's routes (`ai/page.js` is outside the fence); a redirect keeps one list, and every old url, query and hash lands on the same rows.
- The tasks preset leaves out the New chip: New includes 289 idle module tasks the old page never showed. Queued stays one click away.
- A Home chip was added to `DashChips` (beyond "export a preset"): `/tasks/` has no other way to be a filter.
- `asks/undone` keeps its view: it reads `undone.json` (1167 asks) while `state.asks` folds 87 (`Server/State.mjs`, fenced out). Follow-up for the owner: fold `undone.json` into `State`, then it becomes `?kind=ask`.
- `public/live/**` is left for the owner (their own agent has uncommitted edits there).
- `TaskState.mjs --watch` still writes `ai/tasks/state.jsonl`: `DashState` tails it as its pulse.
