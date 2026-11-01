# Research: one folder per research project

Research is filed by date, `research/YYYY/MM/DD/<topic>/`, so no folder ever holds hundreds of projects; each date level is a small `page.jsonl` index (the same shape as the session store's dated folders). Each project folder holds its question, what was found, and the sources, with a `readme.md` that answers the question in its first lines. The [Research page](./) lists projects newest first. The older undated topics (`harness/`, `livereload/`) each have a `research.jsonl` log.

| Project | What it asked |
|---|---|
| [2026/10/29/persistence-sync/](2026/10/29/persistence-sync/) | Build or buy the save, sync and streaming layer? Answer: keep the Item / List / Page core and fix it. Start at its `readme.md`. |
| [harness/](harness/) | Should we build our own model-agnostic agent harness to replace the Claude Agent SDK inside Servex? |
| [livereload/](livereload/) | How does the dev server's live reload actually behave (.js, .css, .json, .jsonl, parallel sessions)? |
| [ai/](ai/) | The AI log for research runs. |

New project: `research/YYYY/MM/DD/<topic>/` with a `page.js` (links first) and a `readme.md`; add a line to each date level's `page.jsonl` (`{"file":"<topic>/page.js"}`) and to the Research page's list.

Code: `research/page.js` (uses `ext/Research`).
