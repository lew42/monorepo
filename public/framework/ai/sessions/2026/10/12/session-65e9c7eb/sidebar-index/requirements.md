# Sidebar filter: why `/framework/ui/card/` is missing, and which "card" page is main

**Owner (2026-10-12):** typing "card" in the sidebar filter lists 13 pages, none clearly the main one, and `/framework/ui/card/` is not among them, so however that UI page is structured it isn't indexed the same way. How big is the index now?

## Done when (tick each with proof)
- [ ] Root cause of the missing `/framework/ui/card/` (and any other `ui/` pages), fixed in the index code (one system, see [sidebar-search](../../session-687c6f45/sidebar-search)), with a node check that lists pages reachable by `children:` but absent from the index (count before → after).
- [ ] Index size reported (pages, bytes, load time) in the module's `doc/`.
- [ ] Results rank the main page first (e.g. exact name / shallowest path / module page over demos); show it with "card".
- [ ] Smoke clean; commit each step; merge. Coordinate with @mastermind-style-system, which decides the one card home.

Sonnet 5.5. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`.
