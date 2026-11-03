# Models and cost, per turn

**Rule:** a session can switch models mid-way, so accounting is kept **per turn at the model that ran it**, and "the model" shown on a card is only a pointer to the latest one.

- `AISession` records the model on each turn (`_entry`, `_store`). Dollars for a turn are priced at that turn's model, never re-priced at today's.
- `s.current` is the latest main turn; `current_model()` reads its model. The grid index carries it as `ix.model` (with `ix.effort`), rewritten every turn. The detail's header and chat box read `AISession.all.get(id).ix`, not the once-written `sessions.json`, so they follow a `/model` switch.
- The logged-cost list (`AISessionAudit.mjs` writes one `cost` line per turn into the session's `page.jsonl`) is shown in the **Cost** tab as one row per local hour, newest first, with the running total (`AISessionDetail.by_hour`). The **Models and tokens** tab holds the per-model split.
- No database: everything is computed from the session file and the JSONL logs (law 7).

Why tabs, not columns or a left nav: [detail-layout.md](../ui/detail-layout.md).
