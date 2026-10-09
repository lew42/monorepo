# ai/rail: the list on the left, and the data behind it

Moved here from `ai2/` on 2026-10-09 (the old paths are one-line shims). `AIRail` is the one rail the AI page's Inbox and Log tabs and the old `/framework/ai2/` address all draw.

- `rail.js`, `rail.css`: `AIRail`, the rail itself.
- `inbox.js`: `CardList`, `Board`, `Day`: where the cards come from (board, day logs, asks).
- `groups.js`, `groups.json`: task groups.
- `needs.js`, `needs-rule.js`: what waits on you, and the rule that ranks it.
- `live.js`, `processes.js`, `processes.css`: the Live card and the process list.
- `log.js`, `overview.js`, `overview/overview.json`: the Log and Overview screens (the JSON is built by `Server/ai2-overview.mjs`).

What a card looks like is in [cards/](../cards/readme.md). Old docs (decisions, owner asks) are in [doc/ai2/history.md](../doc/ai2/history.md).
