# Smoke test and serialized merge

**What exists** (branch `worktree/quickfix-worktrees`, not yet merged):
- `Server/smoke.mjs <dir> [paths]` loads `/framework/`, `/framework/ai2/` and your pages headless on the worktree's own server. It fails on console errors, page errors and same-origin script/stylesheet/document failures; other-origin failures (Servex on :8090) only warn.
- `Server/merge.mjs <dir> [paths]` takes `.merge.lock`, refuses uncommitted work, smoke-tests, then merges into `michael/dev` with the reload hold on. Conflict aborts cleanly (exit 4).
- One line plus a "Quick fixes" section in the `minion` and `sub-mastermind` skills.

**Proof** (`proof/`): `clean.txt` exit 0; `broken.txt` (a page importing `./nope.js`) exit 1 naming `.../nope.js` 404, reverted and never committed; `merge.txt` exit 0, merge commit 7d593d39 on `michael/dev`.

Note: merge ignores modified `.jsonl` files, because the running site appends to them in every worktree.
