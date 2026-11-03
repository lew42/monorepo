# Retired: the old sessions list of AIDashboard

These five files drew the previous `/framework/ai/` page (one day's sessions, nested by who spawned whom). When `/framework/ai/` became the dashboard of what matters most ([AIDashboard](../../../AIDashboard/readme.md)), the page stopped importing them (only each other did), so they moved here with `git mv` on 2026-10-24, task `ai-dashboard`. Nothing was deleted; git history has them at their old paths.

| Old path (`ai/AIDashboard/`) | New path (here) |
|---|---|
| `SessionStore.js` | `SessionStore.js` |
| `SessionTree.js` | `SessionTree.js` |
| `SessionRow.js` | `SessionRow.js` |
| `DayStrip.js` | `DayStrip.js` |
| `OriginChips.js` | `OriginChips.js` |

The sessions list itself lives on at `/framework/ai/sessions/` (`ai/AISession/`). These files import each other by `./`, which still works in this folder; none reaches outside it.
