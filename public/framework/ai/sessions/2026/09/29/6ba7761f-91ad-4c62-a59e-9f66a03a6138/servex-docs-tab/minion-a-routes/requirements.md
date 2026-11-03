# Servex Docs tab — backend routes (minion A)

Load the `minion` skill first. Your card/task directory (read the whole thread there, not
just this file): `public/framework/ai/sessions/2026/09/29/6ba7761f-91ad-4c62-a59e-9f66a03a6138/servex-docs-tab/` — parent card
`2026/09/29/openrouter-brain-a-knowledge-base-that-o`.

**Owner's ask (verbatim, from requirements.md one level up):** "the Servex dashboard gets a
Docs tab. It lists every module under `Servex/` and `Server/` that has a `readme.md` (e.g.
Servex/ext/openrouter, Servex/agents, Server/…). Clicking one renders its readme, its
`doc/*.md`, and a `demo.js` if one exists... Every view has its own URL (`/docs/<path>`)."

Your slice is step 1 only: **read-only HTTP routes on Servex that a frontend (built by a
sibling minion, in parallel, in `Servex/public/**`) will fetch from.** You do not touch the UI.

## Work in this worktree only

`C:/Code/lew42/worktrees/servex-docs-tab` (branch `worktree/servex-docs-tab`, already has a
`node_modules` junction wired up). Do **not** touch the main tree
(`C:/Code/lew42/monorepo`) — a sibling minion is editing `Servex/public/**` there at the same
time in the SAME worktree (you're both in `.../worktrees/servex-docs-tab`, different files).

## Fence — exactly these

- `Servex/pages.js` — add your functions here (below the existing `page_tools()` export;
  don't touch `page_tools()` or its helpers).
- `Servex/Servex.js` — ONLY add: an import line for your new functions, and two new
  `router.get(...)` lines inside `routes()`. Do not touch anything else in that file — it is
  live infrastructure and a stray edit breaks every other agent's Servex.

## What to build

Two read-only endpoints, loopback-only (the router's existing `guard()` already refuses
non-loopback callers — you add nothing extra for that).

**`GET /api/docs`** → JSON array, one entry per module under `Servex/` or `Server/` that has
a `readme.md` directly in it (recurse into subdirectories too — `Servex/ext/openrouter` is a
module, `Servex/agents` is a module, `Server/` itself is a module if it has its own
`readme.md`). Each entry:

```json
{ "path": "Servex/ext/openrouter", "readme": true, "docs": ["decisions.md", "snapshot.md"], "demo": false }
```

- `path` — POSIX-style, forward slashes, rooted at the repo (`Servex/...` or `Server/...`).
- `docs` — the `.md` filenames directly inside that module's `doc/` folder, if it has one,
  sorted. (Note: `snapshot.md` in the example above lives at the module's own root, not in
  `doc/` — only list files that are actually inside `doc/`; don't invent one.)
- `demo` — `true` only if `demo.js` sits directly in that module's folder.
- Sort the array by `path`.
- Skip `node_modules`, dotfiles/dirs, and `Servex/public` (it's the dashboard's own static
  root, never a documented module).
- Wrap the whole scan in try/catch per-directory (a permissions hiccup on one folder must not
  kill the whole list).

**`GET /api/docs/file?path=<module path>&file=<name>`** → the raw text of one file, as
`text/plain` (or a Buffer for `demo.js`, `text/javascript` is fine too — plain text either
way, the browser doesn't need special handling here). `file` is one of exactly:
`readme.md`, `demo.js`, or `doc/<name>.md` (name = `[\w.-]+\.md`, no further nesting).

Refuse (HTTP 400, `{ "error": "<one plain sentence>" }`) unless **all** of:
1. `path`'s first segment is exactly `Servex` or `Server` (nothing else).
2. Neither `path` nor `file` contains `..` or a backslash.
3. `file` matches one of the three allowed shapes above.
4. The resolved absolute path, after `path.resolve()`, is still inside that root directory
   (belt-and-suspenders against a symlink or a clever `path` — compare with `path.sep`
   appended so `Servex-evil` can't pass a `startsWith("Servex")` check).

A file that doesn't exist is a 404 with the same `{ "error": ... }` shape.

## How to test it yourself before handing off — a PRIVATE Servex

Never touch the live Servex (port 8090/80) or restart it. Boot your own copy on private
ports, from your worktree, in the background, with every side-effect subsystem off — nobody
sees a window (Node already sets `windowsHide: true` internally; running `node` directly in
your own shell shows nothing to the owner either way):

```bash
cd C:/Code/lew42/worktrees/servex-docs-tab
SERVEX_PORT=18190 SERVEX_PROXY_PORT=18180 SERVEX_NO_GATE=1 SERVEX_NO_ASSISTANT=1 \
SERVEX_NO_LAYERS=1 SERVEX_NO_POOL=1 SERVEX_NO_MONITOR=1 SERVEX_NO_USAGE=1 \
node Servex/index.js &
```
(pick a port in the 18100-18299 range that isn't already yours if a sibling agent is also
running one — check with `curl -s http://127.0.0.1:<port>/api/projects` first; empty/refused
means free.)

Then:
```bash
curl -s http://127.0.0.1:18190/api/docs | head -c 2000
curl -s "http://127.0.0.1:18190/api/docs/file?path=Servex/ext/openrouter&file=readme.md" | head -c 500
curl -s "http://127.0.0.1:18190/api/docs/file?path=../../etc&file=readme.md"   # must be a clean 400, not a file
```
Confirm `Servex/ext/openrouter` appears with `readme: true` and its real `doc/` files (check
`ls Servex/ext/openrouter Servex/ext/openrouter/doc` yourself first so you know what's true).
Kill your private Servex when done (`taskkill` the pid, or just let the worktree get torn
down later — it's not the live one).

## Land

Commit your two files' changes on the worktree's existing branch (`worktree/servex-docs-tab`)
with a plain message. Append a `log` line to
`public/framework/ai/sessions/2026/09/29/6ba7761f-91ad-4c62-a59e-9f66a03a6138/servex-docs-tab/minion-a-routes/task.jsonl` (create it,
`new-task` shape, one line is enough for a task this small) saying what you built and the
exact curl output that proved it. Then send me (your parent) one short message: done, the two
file paths, and the curl proof. Do not restart or touch the live Servex. Do not merge —
I merge once both minions land.

