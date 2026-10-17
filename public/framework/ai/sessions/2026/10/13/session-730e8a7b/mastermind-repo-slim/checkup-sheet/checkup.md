# Checkup: the AI sheet (2026-10-17)

The AI sheet is the one AI surface for phone and desktop ([`ext/drawer`](/framework/ext/drawer/), `class Sheet extends View`). The open question is decided: the sheet is routed at **`<path>/ai/`**. Steps 2 to 4 are being built by one Sonnet minion; steps 5 to 10 are queued as briefs.

| Task | State | What is open | Decision | Next |
|---|---|---|---|---|
| [sheet](/framework/ai/sessions/2026/10/16/voice-20261016/sheet/) (mastermind-sheet) | Step 1 landed on dev (58270f2e3, `rail.js` → `Sheet.js`); audit, proposal and five variants committed; stray shots ignored and records committed (1ac400fc1) | Steps 2 to 10 | Route `<path>/ai/`; layout pick stands | Handed the go; its turn ran 40 min with no edits, so steps 2 to 4 moved to a minion |
| [sheet-steps-2-4](sheet-steps-2-4/requirements.md) | ⬜ minion-sheet-steps, queued behind Servex's working limit | One class (`Sheet.Panel`), ☰ = navigation, three sizes | One minion, three commits | Each step merged and checked at 400 and 1200 |
| [sheet-route](sheet-route/requirements.md) · step 5 | ⬜ queued, $6 | `AIPage` at `<path>/ai/`, the hook in `Page.child()` | A real `ai` child wins | After step 4 |
| [sheet-dock](sheet-dock/requirements.md) · step 6 | ⬜ queued, $4 | Desktop sidebar, open at 1920+ | | After step 5 |
| [sheet-feed](sheet-feed/requirements.md) · step 7 | ⬜ queued, $5 | `AIFeed`: chat + page events, streamed | No All/Chat/Live switch yet | After step 5 |
| [sheet-handoff](sheet-handoff/requirements.md) · step 8 | ⬜ queued, $4 | "File a task / ask this page's expert" → the page's `Layers` pair | One global conversation | After step 7 |
| [sheet-cleanup](sheet-cleanup/requirements.md) · step 9 | ⬜ queued, $2 | `hides-nav` markup; `VoiceStrip` | Decided inside the step | After step 7 |
| [sheet-dictation-mocks](sheet-dictation-mocks/requirements.md) · step 10 | ⬜ queued, $4 | Five dictation control mocks, then a pick | | Any time |

## Decisions made for the owner

- **The sheet is routed at `<path>/ai/`** (decision `d-sheet-route` in [task.jsonl](task.jsonl); record in [owner-2026-10-16-sheet.md](/framework/ext/drawer/doc/owner-2026-10-16-sheet.md)). It is your own word; every page already gets `md/`, `fs/` and `inbox/` the same way, where a real child of that name wins; and each page's chat is already saved at `<page>ai/chat.jsonl`. The alternatives were keeping `?drawer=`/`?sheet=` (not a route) and `<path>/~ai/` (never collides, but not your word). The one cost: on `/framework/` and `/framework/core/Page/`, which have a real `ai` child, the sheet opens without its own url.
- **The layout pick stands:** A's short head (title, path, ✕) with E's live feed, and A's strip showing the last line said. The alternative was B's labelled head, about 70 px taller on a phone.
- **Steps 2 to 4 moved to a Sonnet minion** after mastermind-sheet spent a 40-minute, $7.5 turn reading without an edit. The alternative was waiting on it again.

## Needs the owner

Nothing.
