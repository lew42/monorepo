# smoke-uncommitted — minion brief

Load the `minion` skill first. Parent: task-mastermind-node-reliability-2. Log in this dir's task.jsonl.

## The owner's words
"smoke.mjs (run by merge.mjs) follows links from /framework/ai2/ into card dirs that exist only UNCOMMITTED in the main tree, so every worktree merge fails on them with "Page Load Error" (mastermind-page, today). Make smoke report such a target as "skipped: exists uncommitted in the main tree" instead of failing, and while you are there make merge.mjs refuse a Git-Bash-mangled page path (one containing "Program Files/Git/") with a message naming MSYS_NO_PATHCONV=1."

## Fence
Work ONLY in the worktree `C:/Code/lew42/worktrees/node-reliability` (branch `worktree/node-reliability`). Files: `Server/smoke.mjs`, `Server/merge.mjs`, and `Server/doc/` lines about them. Nothing else. Never edit the main tree C:/Code/lew42/monorepo.

## Deliverables
1. `smoke.mjs`: when a loaded url fails (any error), map its pathname to a dir under `public/` (e.g. `/framework/ai/2026-09-28/x/` → `public/framework/ai/2026-09-28/x/`). If that dir (or its page.js / page.jsonl) does NOT exist in the worktree but DOES exist in the MAIN tree (the repo that holds smoke.mjs: `path.resolve(here, "..")`) as untracked or modified there (`git -C <main> status --porcelain -- <that dir>` non-empty), print `skip <url>  (skipped: exists uncommitted in the main tree)` and do not count its errors. Apply it to followed links and canaries alike. Keep it cheap: one git call per failing url only.
2. `merge.mjs`: before anything else (before taking the lock), if any path argument contains `Program Files/Git/` (either slash), exit 1 with: `refused: "<arg>" was rewritten by Git Bash. Rerun as MSYS_NO_PATHCONV=1 node Server/merge.mjs ...`. (smoke.mjs's own strip stays.)
3. Proof in `proof.txt` here: (a) smoke run against a url whose dir is uncommitted in the main tree only, e.g. one of `git -C C:/Code/lew42/monorepo status --short | grep '^??' | grep framework/ai/` dirs that has a page.js → shows `skip`; (b) a url that truly 404s still FAILs; (c) `node Server/merge.mjs C:/Code/lew42/worktrees/node-reliability "C:/Program Files/Git/framework/ai2/" --dry-run` → refused message. Run smoke against the worktree's own dev server: start it DETACHED with windowsHide (`node Server/worktree-up.mjs`'s start logic, or `PORT=61687 node server.js` from the worktree root, backgrounded) and KILL it when done. Use `MSYS_NO_PATHCONV=1` for every Git Bash call that passes a /path.
4. Update the header comments of both files (one short paragraph each). Commit in the worktree by exact path. Do not merge; report done to your parent.

Budget: $3. Sonnet. No new npm deps. Every process you spawn: windowsHide.

