# Organization system: decisions (2026-10-12)

- **Heartbeat is a script, not a Servex change.** `Servex/Heartbeat.js` and `TaskLoop.js` watch open tasks every few minutes; an hourly systems wake is a different job. Alternative: add a timer in `Servex.js`. Rejected for now: it needs a restart and the brief says batch it; the script is the unit either way, so Servex can call `Systems.run()` later.
- **Report only, no fixes yet.** `heal()` exists on `System`, no subclass implements it. Orphans and broken links need judgment; add safe fixes one at a time.
- **System is isomorphic; subclasses are node-only.** The page imports the base without fs; the checks read files.
- **Navigation check is lenient**: a page counts as linked if any file in the parent dir mentions its folder name. Alternative: parse `children:`. Stricter later.
- **Known gap:** ReadmeSystem's first run found readmes over 100 lines; not fixed here.
- **Wake is a session cron** (hourly at :17, 2026-10-12): it dies with the session and after 7 days, so the mastermind re-arms it. Durable alternative: a Servex timer calling `Systems.run()` (needs a restart; next step).
