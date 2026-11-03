# sessions-asks: state

Three of the four open points were already done (the cluster label was stale); the fourth now has a rule.

- ✅ Month/year roll-ups: built; `node public/framework/ai/AISession/AISessionIndex.mjs --check` prints "month and year totals match the day files".
- ✅ Red flags and mastermind tag: `AISessionFlags.js`, commit 0074f0578.
- ✅ Tasks migration: applied (7fa3d978b, f551c5fa5); doc `sessions/doc/data/tasks-in-sessions.md`.
- ✅ Tiered resumption rule: `Server/SessionResume.mjs --census` gives 144 warm / 2088 cold / 5908 fresh; doc `sessions/doc/data/resumption.md`.
- ✅ Resume tier on every Sessions row (warm/cold/fresh tag, hover gives the reason): 1920 screenshot checked; `layout-check` at 400/1200/1920/3440: no overflow (the 404s and empty-space notes were there before: none come from the tag).
- ✅ The 1,401 "without index.json": 1,400 are cache-only leftovers of renamed sessions whose real folder already has an index.json; nothing missing. `--check` now says so and exits clean. Left in place (never destructive).
- ⬜ Left: a button that applies the tier; the tree and closed list still read `session-index.json`.
