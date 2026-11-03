# Task pages: draw old screenshot paths without a 403

Budget: $1 (the deputy, by hand). Logged in [ai/todo.md](/framework/ai/todo.md), 2026-10-24 02:40.

Old task logs record a `shot` with a `path` inside `public/` or relative to the task's own folder. The task page (`ai/AITask/shots.js`) sent every `path` through `/screenshot`, which only serves the OS temp folder, so these drew a grey swatch and a 403, and every merge smoke seeded near them failed (`sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/catalog/`, `dictate-sheet/`).

The change: `shot_src(s, base)` draws a `public/` path, or one relative to the task folder, as a site url, but only when the folder's listing (`core/Router/listing.js` `names`) has the file, since screenshots under `ai/` are gitignored and missing in worktrees; otherwise the missing swatch with no request. Temp-folder paths still go through `/screenshot`.

Check: both pages make no 4xx on a worktree; on the main tree, where the PNGs exist, they show the image.
