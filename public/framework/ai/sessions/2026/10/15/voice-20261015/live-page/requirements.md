# /live: a clean-slate page for voice-driven work

Owner ask: voice a98d6231, logged in [../task.jsonl](../task.jsonl).

## Build
- A page at the web root, `public/live/`, served at `/live/`. Link it from the root framework page (`public/framework/page.js` children or its readme index), and from the root `public/page.js` too if the site root lists children.
- **Minimal chrome.** The owner finds the ai/ pages have too many layers (a mobile header, top tabs, a subheading) and too much padding. /live shows a title line and then the log, nothing else stacked above it, with tight padding at every width (400, 1200, 1920, 3440).
- **A page.js + page.jsonl hybrid, if the system supports both in one folder:** page.js loads first and draws the page, then page.jsonl streams in as a live tail. `public/` itself has both files, so check how that works (`core/Page/doc/jsonl-pages.md`: `child(name)` tries jsonl first). If both can't live in one folder, say so in `doc/notes.md`, pick whichever works, and note the tradeoff.
- The voice mastermind writes to it through `page_log` / `page_set` / `page_add` with `path: "/live/"`. Make sure those tools work against this page: post one test line and check it shows up live.
- Give it a `readme.md` (one short screen) saying what it is: the owner's live voice-work feed, where each dictation's summary and its results land.

## Rules
- Fastest working version first. Sonnet. Work in a worktree, run check_page at 400 and 1200, then merge (`main site is production`).
- Commit each working step. Do not restart Servex: the voice tunnel runs through it.
- When it is live, message mastermind-voice-20261015 with the URL and one line on hybrid vs single-file.
