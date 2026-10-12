# Minion D — two smoke-test failures blocking the merge

Load the `minion` skill first, then `code`. Parent task: `public/framework/ai/2026-09-28/dictation-playground/`. Work in the worktree `C:/Code/lew42/worktrees/qf-3` and commit there. Never `git stash` / `reset` / `checkout --`; never restart a server.

`node Server/merge.mjs C:/Code/lew42/worktrees/qf-3 /framework/ux/Dictate/playground/` (run from `C:/Code/lew42/monorepo`) refuses on two pages:

1. **`/playground/` 404** — `public/framework/ux/Dictate/page.js` has a relative markdown link `[playground](playground/)`, which resolves against the site root. Make it absolute: `/framework/ux/Dictate/playground/`. Grep `public/framework/ux/Dictate/playground/**` for any other relative link and fix it the same way.
2. **`/framework/ux/Dictate/words/` — `TypeError: url.split is not a function` at `file_link` in `public/framework/ext/demo/demo.js:193`**. This is PRE-EXISTING: the live site fails the same way. Find what `demo.page(...)` hands `source_block(label, body, file)` as `file` (probably a URL object or `import.meta`), and fix it at the root in `ext/demo/demo.js` so `file_link` always gets a string path. Keep the change to a few lines; don't restructure demo.js. Then check two other pages that use `demo.page` and that you did not touch still load (grep for `demo.page(`).

Fence: `public/framework/ux/Dictate/page.js`, `public/framework/ux/Dictate/playground/**`, `public/framework/ext/demo/demo.js`.

Prove it: `node Server/smoke.mjs C:/Code/lew42/worktrees/qf-3 /framework/ux/Dictate/ /framework/ux/Dictate/words/ /framework/ux/Dictate/playground/ <two other demo.page pages>` (run from `C:/Code/lew42/monorepo`) shows no FAIL. Do NOT run merge.mjs — the mastermind merges.

Log to `public/framework/ai/2026-09-28/dictation-playground/smoke-fix/task.jsonl` in the MAIN tree (`node .claude/hooks/append.mjs`, `group: "dictate"`). Reply in one line: commit hash and the smoke result.
