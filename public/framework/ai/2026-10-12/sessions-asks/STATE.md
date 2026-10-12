# sessions-asks: state

Three of the four open points were already done (the cluster label was stale); the fourth now has a rule.

- ✅ Month/year roll-ups: built; `node public/framework/ai/AISession/AISessionIndex.mjs --check` prints "month and year totals match the day files".
- ✅ Red flags and mastermind tag: `AISessionFlags.js`, commit 0074f0578.
- ✅ Tasks migration: applied (7fa3d978b, f551c5fa5); doc `sessions/doc/data/tasks-in-sessions.md`.
- ✅ Tiered resumption rule: `Server/SessionResume.mjs --census` gives 144 warm / 2088 cold / 5908 fresh; doc `sessions/doc/data/resumption.md`.
- ⬜ Not tonight: show the tier on the row (no page change made, so no layout-check); tree/closed list still read `session-index.json`; 1,401 sessions lack `index.json` (run `--build` on the main tree).
