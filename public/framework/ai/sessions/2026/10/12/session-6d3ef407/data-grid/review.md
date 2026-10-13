verdict: fix
1. [fix] In rail view, routine sessions can't be shown except by searching: sessions.css:499 now hides `.sessions-kinds`, together with the stats line that says "N routine hidden". The old bucket card was clickable in the rail. Keep the chips visible in rail view, or say in the rail that routine sessions are hidden.
2. [note] The diff deletes `ai/AISession/AISessionBucketView.js`. That conflicts with the brief's "never delete" and CLAUDE.md's "never destructive" rule. Git keeps the file and files.jsonl marks it `gone`, so this is acceptable, but an archive path would follow the rule.
3. [note] The tie-breaker (equal recency → costlier session first) differs between the two paths. The files path applies it to every row (AISessionRows.js:283). The node path applies it only to in-flight rows (AISessionSource.mjs:191), so two finished sessions with the same last_activity can come back in a different order in remote mode.
4. [note] A search ignores the date window and the other filters on both paths (AISessionsPage.js:333 and remote_spec). That is intended and both tooltips say so. But the files path searches only the days already loaded, so a session older than the window is not found until "show 30 more days" is clicked.
5. [note] files.jsonl:17–18 now lists `AISessionBucketView.js` twice: the old entry, then the appended `"gone":true` line. That is fine as an append-only log, as long as whatever reads it lets the last line win.
6. [note] The shots in this diff (`sessions-perf/find-400.png`, `find-3440.png`, `find-3440-search.png`) are on the branch and not in the main tree, so I could not view them. I judged the chips from `find.json`: 5 chips, "449 sessions listed (5,640 routine hidden)", search finds server-query, no page errors.

## Requirements
- Diff scope: this review covers the follow-up (routine buckets → chips, plus search) on top of the landed grid work. The grid tasks are checked against STATE.md.
- 1 "One grid" — yes — STATE.md: ui/datagrid and ui/table re-export ext/DataGrid; nothing deleted.
- 2 "Sessions on it without regression" — yes, except in rail view — routine kinds are reachable from the table, but in the rail only by search (finding 1). The perf numbers are in sessions-perf/results.jsonl and redraw.jsonl.
- 3 "Class architecture page first" — yes — ext/DataGrid/doc/architecture.md is linked from STATE.md.
- 4 "Two views as a setting" — yes — the `view` setting with a Table / Rail toggle; default in ai/sessions/settings.jsonl.
- 5 "Coordinate with the owners" — not checkable from the diff.
- 6 "Smoke clean; commit; merge" — yes — remote.txt and find.json show no errors; landed commits are named in STATE.md.

## Words
- content — yes — chip labels are plain ("short headless · 2,976 · $174"); the tooltips say what a click does.
- content — yes — doc/buckets.md records why the bucket rows became chips (the owner found them big and in the way), with a shot link.
- content — note — the OpenRouter line got shorter (AISessionsPage.js:300), and its caveats moved into the tooltip; that matches "detail one click down".

Simpler way: putting the chip state in `open_kinds`, the same set the bucket rows used, was the minimal change. Dropping the head rows also removed the `r.bucket` special cases throughout, which made the code simpler.
