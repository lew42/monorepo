# ai/rail: the list on the left, and the data behind it

Moved here from `ai2/` on 2026-10-09 (the old paths are one-line shims). `AIRail` is the one rail the AI page's Inbox and Log tabs and the old `/framework/ai2/` address all draw.

- `rail.js`, `rail.css`: `AIRail`, the rail itself.
- `inbox.js`: `CardList`, `Board`, `Day`: where the cards come from (board, day logs, asks).
- `groups.js`, `groups.json`: task groups.
- `Needs.js`, `NeedsRule.js`: what waits on you, and the rule that ranks it.
- `live.js`, `Processes.js`, `processes.css`: the Live card and the process list.
- `Log.js`, `Overview.js`, `overview/overview.json`: the Log and Overview screens (the JSON is built by `Server/Ai2Overview.mjs`).

What a card looks like is in [cards/](../cards/readme.md). Old docs (decisions, owner asks) are in [doc/ai2/history.md](../doc/ai2/history.md).

Comments pruned from `inbox.js`, verbatim: [doc/notes.md](./doc/notes.md). Comments pruned from `live.js`, verbatim: [doc/live-notes.md](./doc/live-notes.md). Comments pruned from `NeedsRule.js`, verbatim: [doc/NeedsRule-notes.md](./doc/NeedsRule-notes.md).

- Notes: [doc/Processes-notes.md](doc/Processes-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/groups-notes.md](doc/groups-notes.md) — history and lessons moved out of the code comments.

## Notes from your asks

- Architecture cards stay out of the AI inbox list. ([your words](/framework/ai/sessions/730e8a7b-4cbf-4d09-90bd-d61d2bf9384a/?tab=coverage#p1023), 2026-10-13)
