# Review — restart outside tree

**Verdict: fix.** 8 findings, all resolved before landing.

| # | Kind | Finding | Fix |
|---|------|---------|-----|
| 1 | fix | Detached restart has no console — "back as pid" and every refusal reason vanished. | `console.log` → `note()` inside `restart()`, so it always reaches `sustain.log`. |
| 2 | fix | Same cause as #1: a caller couldn't tell a refusal from a success. | Covered by the #1 fix. |
| 3 | note | `API` was hardcoded to `127.0.0.1:8090`, so the private proof's checks likely hit the real Servex. | Added `SERVEX_API_PORT`, pinned through the WMI relaunch like `SERVEX_HOME`. |
| 4 | note | First proof run restarted the real Servex (same leak as #3). | Both env vars now pinned on the relaunch command line; re-run confirmed private. |
| 5 | note | A `HOME` or port value containing `&`, `%`, or `^` would corrupt the `cmd.exe` relaunch line. | `relaunch_detached` now refuses to relaunch if either value has one of those characters. |
| 6 | note | Brief wanted one line in `Servex/doc/`; landed had a 38-line page plus a readme edit outside the fence. | Trimmed to 27 lines; kept the readme pointer. |
| 7 | note | Nothing was landed at review time — the review gate was stuck in a retry loop. | Resolved by finishing the merge and finish-task afterward. |
| 8 | note | Requirement 3 (`kill()` verification) and requirement 2 (`ops.js` already using `windowsHide`) both already matched the brief. | No simpler approach found — no change. |
