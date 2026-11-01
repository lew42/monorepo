# Research: one folder per research project

Research is filed by date, `research/YYYY/MM/DD/<topic>/`, so no folder ever holds hundreds of projects; each date level (`2026/`, `2026/10/`, `2026/10/29/`) is a small `page.js` that lists what's under it as links, newest first (a `page.jsonl` level showed a file explorer, too wide on a phone). Each project folder holds its question, what was found, and the sources, with a `readme.md` that answers the question in its first lines. The [Research page](./) lists projects newest first. The older undated topics (`harness/`, `livereload/`) each have a `research.jsonl` log.

| Project | What it asked |
|---|---|
| [2026/10/29/persistence-sync/](2026/10/29/persistence-sync/) | Build or buy the save, sync and streaming layer? Answer: keep the Item / List / Page core and fix it. Start at its `readme.md`. |
| [harness/](harness/) | Should we build our own model-agnostic agent harness to replace the Claude Agent SDK inside Servex? |
| [livereload/](livereload/) | How does the dev server's live reload actually behave (.js, .css, .json, .jsonl, parallel sessions)? |
| [ai/](ai/) | The AI log for research runs. |

New project: `research/YYYY/MM/DD/<topic>/` with a `page.js` (links first) and a `readme.md`; add a link line to each date level's `page.js` (and its `children:`), and one to the Research page's list. Listing them automatically is a [framework task](../tasks/readme.md).

Code: `research/page.js` (uses `ext/Research`).
