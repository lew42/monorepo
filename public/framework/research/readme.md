# Research: one folder per research project

Each folder under here is one research project: its question, what was found, and the sources. A folder with a `research.jsonl` is listed live on the [Research page](./) (its first line names the topic).

| Project | What it asked |
|---|---|
| [2026-10-29-persistence-sync/](2026-10-29-persistence-sync/) | Build or buy the save, sync and streaming layer? Answer: keep the Item / List / Page core and fix it. Start at its `readme.md`. |
| [harness/](harness/) | Should we build our own model-agnostic agent harness to replace the Claude Agent SDK inside Servex? |
| [livereload/](livereload/) | How does the dev server's live reload actually behave (.js, .css, .json, .jsonl, parallel sessions)? |
| [ai/](ai/) | The AI log for research runs. |

New projects: name the folder `YYYY-MM-DD-topic` and give it a `readme.md` that answers the question in its first lines.

Code: `research/page.js` (uses `ext/Research`).
