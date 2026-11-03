# Audits — one line per audit we have run

`index.jsonl` is the list (append-only): `{"audit":{"at","path","verdict","followed_up","note"}}`. `path` is relative to `public/framework/ai/`.
- `verdict`: useful, stale, waste or not judged. `followed_up`: yes, no, partly or unknown.
- Moved here from the /live "Task audits" card on 2026-10-16: /live shows pointers, the data lives in the log.
- Add a line when you finish an audit; never edit old ones. The past-work mastermind made the first 11 from file heads and `git log`.
- This folder also holds `page.js`, `files.jsonl` and `paging/` (the framework-structure audits).
