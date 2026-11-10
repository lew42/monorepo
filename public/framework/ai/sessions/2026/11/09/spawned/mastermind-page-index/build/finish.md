# Finish the page-index MVP: prove the browser half or turn it off

Budget: $5. Load the `minion` skill first. Model: Sonnet.

The owner's ask: session pages are heavy (about 1,300 requests, tens of MB, about 18 s to settle). The plan is [doc/index-jsonl.md](/framework/core/Page/doc/index-jsonl.md). The earlier build log is [build/session.jsonl](session.jsonl) and its brief is [build/requirements.md](requirements.md).

## Where things stand

- Worktree `C:\Code\lew42\worktrees\page-index`, branch `worktree/page-index`, server on port 53305 (URL from `take_worktree` / `.worktrees.json`).
- Committed there:
  - c31987ae9: `Server/PageNav.mjs` (nav on files.jsonl lines).
  - 5269d0a50: `Server/plugins/PageIndex.js` (`GET /api/index`).
  - 2447f1e58: the browser side (`core/Page/Listing.js` navs, `core/Page/Index.js`, `nav_held`/`nav_for`/`nav_check`, `?index=0`, `ux/Tree/Tree.js`).
  - 9131e0eee: the `ai/index.jsonl` fix, done by the mastermind; leave it alone.
- **Unproven:** /framework/ in the worktree loaded 403 requests both with and without `?index=0`. So either the browser half does nothing, or the worktree's baseline simply differs from the main site's (1,078).

## Do, in order

1. Find out whether the switch takes effect. Read `core/Page/Index.js` and where `Page.from_index` is read (`git diff c31987ae9~1..2447f1e58 -- public/`). Count `page.js` requests on `/framework/` and on one session page, `/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/`, with and without `?index=0`. Use headless Playwright against the worktree URL; `measure.mjs` in this task's folder is the existing measurer.
2. If the index path loads clearly fewer `page.js` files than `?index=0`, and the page looks the same in a 1200 px shot of each, it works. Fix only small bugs on the way.
3. If you cannot make it work within about $3, turn it off by default: `Page.from_index = false`, with `?index=1` to opt in. Say so in the doc's Status. The server half and the `ai/index.jsonl` fix still land.
4. Add one nav assertion to `core/Page/Listing.test.mjs`, then run it and `node Server/PageNav.test.mjs`.
5. Update `doc/index-jsonl.md`'s Status section, plus one Map row each for `Index.js` and `PageIndex.js` in `core/Page/readme.md` / `Server/readme.md`. Do it in the same commit.
6. Before your last commit, revert every generated `files.jsonl` / `page.jsonl` change in the worktree with `git checkout -- <paths>`. Commit only source, tests and docs, by exact path.

## Deliverable

`log` lines in [build/session.jsonl](session.jsonl) with:

- the request, MB and page.js counts for both pages, index on vs `?index=0`;
- the shot paths;
- the commit hashes.

The two counts for one page must come from the same run. End with a `complete` line.

## Never

- Kill or restart any server (ask the mastermind; it calls `restart_server`).
- Drive the owner's tabs.
- `git stash`.
- Push.
- Merge (the mastermind merges).
- Touch `Server/AIIndex.mjs`.
