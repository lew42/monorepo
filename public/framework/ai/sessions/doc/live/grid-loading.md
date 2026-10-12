# How the Sessions grid loads (2026-10-12)

**Rule:** open on the newest month; older days load only when asked.

The window starts at the 1st of this month (at least 7 days back). Every day has one small real file (`YYYY/MM/DD/index.json`, listed by the month and year roll-ups). Moving the **From** box, or pressing **show 30 more days** under the grid, fetches just the older day files. A day already read is never fetched twice (`AISessionLive.load`, `AISessionsPage.set_from`).

| Measured (headless, same worktree, 1200 and 400 wide) | Before | After |
|---|---|---|
| Whole page, bytes | 10,748 KB | 9,523 KB |
| Day files at first paint | 10 | 5 |
| Time to first row | 0.9 s | 0.85 s |

On the real data (30 days of day files, about 4.7 MB) the same cut removes September, about 1.2 MB. The first row never waited on day files; the saving is bytes and parse time.

## Still open (real blockers)
- **Apply-the-tier button:** needs a browser-to-Servex route that resumes or seeds a session. None exists, and starting agents from a button is the owner's call (`Servex/agents/Layers.js` is the nearest piece).
- **Tree and closed list** still read `session-index.json` (286 KB). They need the day snapshots to carry the `closed` mark and the parent link first.
- **Weight outside this page:** `session-flags.json` (1.4 MB) and `spend-tree.json` (0.9 MB) load on every visit, and `directory.json` (5.8 MB) is fetched about 35 times by the site shell. That last one dwarfs everything here and is not a Sessions file.
