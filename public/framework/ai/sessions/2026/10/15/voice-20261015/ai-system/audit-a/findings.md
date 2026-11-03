# Readme audit: public/framework/ai/ — findings

| file:line | problem | evidence | fix |
|-----------|---------|----------|-----|
| readme.md:33 | broken link to missing file | `[Servex/doc/echo.md](/framework/servex/doc/echo.md)` — target `/framework/servex/doc/echo.md` does not exist; real file is at `Servex/doc/echo.md` | change href to `../../../Servex/doc/echo.md` |
| readme.md:20 | broken link to missing file | `[/framework/servex/doc/budget.md]` — no such file in `/framework/servex/doc/` | remove link or verify correct path |
| readme.md:47 | broken absolute path | `[Servex/doc/module-inbox.md](/Servex/doc/module-inbox.md)` — href `/Servex/...` is absolute from browser root; file is in repo root | change to `../../../Servex/doc/module-inbox.md` (matches line 49 pattern) |
| readme.md:93 | stale count | claims "167 unreferenced candidates judged" but `doc/unreferenced-verdicts.md` (updated 2026-10-14) says count fixed to "161 suspects → 0" | change "167" to "161" |
