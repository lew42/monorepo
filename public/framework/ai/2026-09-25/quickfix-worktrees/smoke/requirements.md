# Minion: Server/smoke.mjs, Server/merge.mjs, and the skill lines

Load the `minion` skill first. Card with the owner's raw words: `public/framework/ai/2026/09/25/quick-fix-worktrees-smoke-test-then-merg/` (page.jsonl). Parent brief: `public/framework/ai/2026-09-25/quickfix-worktrees/requirements.md`. Read it all.

**Work only in the worktree** `C:/Code/lew42/worktrees/quickfix-worktrees` (branch `worktree/quickfix-worktrees`, its dev server on http://127.0.0.1:65447). Commit there. Do not merge; the task mastermind merges.

**Owner's words:** "for every new task a work tree where the changes get tested and smoke tested, at least for loading errors ... As long as the page doesn't throw any errors, you could assume it's at least a viable merge. We don't want the page or the website to just crash."

## Deliverables

1. `Server/smoke.mjs`: `node Server/smoke.mjs <worktree dir> [paths…]`.
   - Finds the worktree's server port from `.worktrees.json` at the main repo root (the entry whose `path` matches the dir; compare case-insensitively with slashes normalised), or from `--port N` or `--base URL`.
   - Loads `/framework/`, `/framework/ai2/` and every given path, headless, with Playwright imported exactly as `Server/layout-check.mjs` does (`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`). One browser, `waitUntil: "load"`, then a ~1.5 s settle.
   - Counts console `error` messages, `pageerror`s and failed requests (`requestfailed`, plus any response of 400 or more for a script, module, stylesheet or document). Ignore `/favicon.ico` and EventSource/long-poll aborts (`net::ERR_ABORTED` on `text/event-stream`, or on requests still pending at page close).
   - Prints one line per page (`ok   /framework/` or `FAIL /x/  2 errors`), then each error with its URL. Exit 0 when all are clean, 1 on any error, 2 on bad usage or no server. Under ~120 lines; the top comment says what and why in plain sentences.
   - Prove it both ways, with output saved in the task dir at `C:/Code/lew42/monorepo/public/framework/ai/2026-09-25/quickfix-worktrees/smoke/proof/`: (a) a clean run on the quickfix-worktrees worktree, exit 0; (b) add a deliberately broken import to a page in that worktree (e.g. a page.js importing `./nope.js`), run, and get exit 1 with the error named. Then revert it; never commit the break.
2. `Server/merge.mjs`: `node Server/merge.mjs <worktree dir> [paths…]`, the one serialized way to land a worktree.
   - Takes a lock: `.merge.lock` at the main repo root, created with `fs.openSync(..., "wx")`, holding `{pid, dir, at}`. A lock older than 5 minutes, or whose pid is dead, is stale and is taken over. It waits up to 2 minutes, polling every 500 ms, then gives up with exit 3.
   - Refuses if the worktree has uncommitted changes. Runs smoke.mjs on it (same paths); a failure stops here with exit 1.
   - In the main repo root (which must be on branch `michael/dev`, else refuse), runs `node Server/hold.mjs on "merge <branch>"`, then `git merge --no-ff --no-edit <branch>`, then `hold.mjs off`. On a merge conflict: `git merge --abort`, release the hold and the lock, print the conflicting files, exit 4. Never reset, stash, force or rewrite.
   - Always releases the lock (in a `finally`). Every child process gets `windowsHide: true`.
   - Prove it: from the MAIN repo root `C:/Code/lew42/monorepo`, create a throwaway worktree (`node Server/worktree-up.mjs smoke-proof`), commit a harmless file in it at `public/framework/ai/2026-09-25/quickfix-worktrees/smoke/proof/merged.txt`, run merge.mjs on it, put `git log michael/dev -1` in the proof, then `node Server/worktree-down.mjs smoke-proof`.
3. Skill lines. Use ONE node script (never the Edit tool on a SKILL.md) on the worktree's copies of `.claude/skills/minion/SKILL.md` and `.claude/skills/sub-mastermind/SKILL.md`:
   - One line right after the title: **Nothing merges into michael/dev without a smoke test.** `node Server/merge.mjs <worktree> [pages]` loads the pages you touched, plus `/framework/` and `/framework/ai2/`, on the worktree's own server, and merges only with zero console errors, page errors and failed module requests. A full UI test is not needed to merge.
   - A short section `## Quick fixes: take, write, smoke-test, merge, return` (about five lines): call the Servex MCP tool `take_worktree()`, which gives `{id, path, branch, url}`; write into `path` and commit there; run `node Server/merge.mjs <path> <pages you touched>` (smoke test plus serialized merge; on a failure, fix and rerun); call `return_worktree(id)` when done or unused. Servex always keeps one ready, so don't start your own worktree for a small fix.
   - In sub-mastermind the existing "Merge carefully" bullets stay; add one bullet saying the merge itself is `node Server/merge.mjs`.
4. Commit in the worktree (the message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), log to `smoke/task.jsonl`, and write `smoke/report.md`: one screen with what exists, the two proof outputs, and the exit codes.

Fence: `Server/smoke.mjs`, `Server/merge.mjs`, the two SKILL.md files (worktree copies), and `smoke/` in the task dir. Nothing else. No new npm dependency. No visible windows.
