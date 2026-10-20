# AIDashboard `ai/AIDashboard/`

The default page at `/framework/ai/`: one day's agent sessions, grouped by where they came from, nested by who spawned whom, each cost added up the chain. Plan and the approved page: [doc/ai-dashboard-plan.md](../doc/ai-dashboard-plan.md). The old Inbox is one link away at `/framework/ai/inbox/`.

## Structure (one class per file)

| File | Class | Job |
|---|---|---|
| `AIDashboard.js` | `AIDashboard extends View` | the page body: reads the url, draws the parts, repaints on change |
| `SessionStore.js` | `SessionStore` | loads a day's `index.json`; reloads on every `DashState` tick (a stream, no timer) |
| `SessionTree.js` | `SessionTree` | plain class: joins parent (an agent name) to child, computes origin and the cost roll-up |
| `SessionRow.js` | `SessionRow extends View` | one session, with its children nested when open |
| `DayStrip.js` | `DayStrip extends View` | the last seven days (a side list on desktop) |
| `OriginChips.js` | `OriginChips extends View` | Voice / VS Code / Servex / Scheduled chips, count and cost, and Live |
| `UsageLine.js` | `UsageLine extends View` | the usage meters, via `ai/usage/UsagePace.js` |
| `AIDashboard.css` | | all rules `ad-` prefixed, in `@layer site` |

`page.js` shows it when the path is exactly `/framework/ai/`; nothing else changed there.

## Data: read only, no store of its own

- **Reads** `ai/sessions/YYYY/MM/DD/index.json` (writer: `AISessionIndex`, gitignored, so a static deploy has no data until it is generated), the tick from `ai/index.jsonl` through `DashState` (writer: `Server/AIIndex.mjs`), and `ai/usage.json`.
- **State lives in the url:** `?day=YYYY-MM-DD&origin=cloud|code|servex|routine&live&find=&open=id,id`.
- **Origin** (`SessionTree.origin`): `cloud` = parent `voice-app` or a `cloud-voice*` folder; `code` = a transcript with no agent; `routine` = the cheap buckets from `AISessionBuckets.KINDS`; otherwise `servex`.

## Watch out

- `index.json` `parent` is an agent **name**, not a session id, and `children`/`tree_usd` are empty; the browser does the join and the roll-up here until `AISessionIndex` does (slice 2). Servex roots whose agent is a minion/reviewer/checker/voter count as "unattached" in the header line.
- `render()` runs before subclass fields exist: set state in `initialize()`, use getters for `classes`.
- Links to the Inbox use `target=_self` so the root page rebuilds.
