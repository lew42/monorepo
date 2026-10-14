# Page report: Sessions (/framework/ai/sessions/) at 1200

Self-reviewed screenshot (layout-check, 1200): tab bar on one row, grid, chips and rows render as before; the diff only repoints three import/path lines and moves eight pure re-export shims aside. Smoke: Sessions, DataGrid and AI pages ok. `/framework/ai/classes/Session/` fails identically on main (`SessionLive.load_days`, `public/` file link) — not caused by this change.
