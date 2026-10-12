# Sessions: detail page layout, the footer, and stale fields (mastermind brief)

**Owner (2026-10-12, dictated while using `/framework/ai/sessions/` at 3440):** the layouts are bad and nobody has looked at them.
> "We need to take screenshots and try and figure out if things are getting truncated improperly, if things are wrapping improperly, if things are crammed in."

The list page (perf, columns, the two grids) belongs to @mastermind-sessions-grid; this brief is the **detail view**, the **footer**, and **stale fields**. Share one worktree with it only if you touch its files; otherwise coordinate by `send_to_agent`. Use the [style-system](../style-system/requirements.md) card/section words where they exist; don't invent new CSS.

## Done when (screenshots at 400/1200/1920/3440, before and after, in this folder)
- [ ] **Detail view header:** drop the "All sessions" back button (the close button does it) and the line repeating the id + `session-detail.js` link (the id is already the title).
- [ ] **Detail layout:** the 50/50 split with a ~300 px inner right column crams tables (input/cache/read/output columns at ~50 px, text broken over 3–4 lines). Decide: left nav or top tabs inside the detail (owner leans that way) vs columns; record the alternative. Nothing truncated, nothing crammed.
- [ ] **Chat area:** the same chat widget as everywhere (law 6); its own padding and background so it reads as a section; scrollbar on the outside edge; no empty "zombie" header space above it.
- [ ] **Logged cost:** newest first; condense the cent-by-cent rows (e.g. group per turn or per hour, with a running total), not a long granular list.
- [ ] **Footer** ("7 open tasks on this page and one below"): it spans the page, wastes space, has the page's own gray so the grid looks chopped into a "zombie area", isn't live, and shows stalled tasks that are no longer stalled. Decide whether it should exist at all; if it stays: own background, minimal padding, live (stream), plain wording ("one below" means nothing).
- [ ] **Stale fields:** find every field written once and never refreshed (model shows Sonnet 5.5 for a session now on Opus 5.5; stalled flags). Render from the source that updates. Add a `currentModel` pointer (from the latest turn) for display; **accounting stays per turn at the model that ran it** (a switch to Opus re-writes the whole cache at Opus prices: attribute that to Opus). Check whether each turn records its model; if not, say where to get it. Short `doc/models-and-cost.md` beside the sessions code. No database.
- [ ] Smoke clean; `hold.mjs` around live batches; commit each step; merge.

Sonnet 5.5. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open: keep going through all of it.
