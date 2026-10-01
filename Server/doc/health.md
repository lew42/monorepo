# The page monitor — `Server/health.mjs`

The main branch is production: the owner browses it live, so it must never crash or throw.
`health.mjs` is the monitor that watches it. Every time a **template** file under `public/` changes,
it loads the pages that file could have broken in a hidden browser, writes down what went wrong,
and tells two people: the agent that made the edit, and the owner (on that agent's task card).

## Run it

```sh
node Server/health-supervisor.mjs        # the normal way: keeps health.mjs alive, restarts it if it dies
HEALTH_BASE=http://localhost:62566 node Server/health.mjs   # by hand, against another server; prints to this terminal
```

- `HEALTH_BASE` is the server whose pages get loaded. The default is the owner's site, `http://monorepo.localhost`.
- **One per tree.** Each checkout (the main tree, each worktree) can run one supervisor and one
  `health.mjs`. A second copy started in the same tree finds the first one's lock in the OS temp
  dir (`lew42-health-<tree>.lock`, `lew42-health-supervisor-<tree>.lock`) and exits quietly.
  A supervisor that finds a hand-started `health.mjs` already watching checks back every 30 s
  and takes over when it is gone.
- To stop it, kill the supervisor's process tree: `taskkill /PID <supervisor_pid> /T /F`.
  The pid is in `public/framework/ai/health/heartbeat.json`.
- Editing `health.mjs` restarts the watcher by itself (the supervisor watches the file).
  Editing `health-supervisor.mjs` does not: restart the supervisor by hand.

## What triggers a check

| A change to | Does |
|---|---|
| `.js`, `.mjs` (including `page.js`), `.css`, `.html` under `public/` | a check of the pages it could break |
| `.jsonl`, `.json`, `.md` and anything else | nothing. It is data, drawn by templates already tested. The console says `data only, no check` |

Which pages: a `page.js` → its own page; any other file → the page whose folder holds it; a
shared module (`framework/core/`, `ui/`, `ux/`, `ext/`, `framework.css`, `app.js`) → its own
page plus five canary pages. At most 8 pages per batch; changes within 1.5 s are one batch.

## What each check looks at

1. **Console errors, page errors, failed requests and 404s**, and a blank page (nothing over 50 px tall).
2. **Stalls.** Any long task over 2 s is an error, and so is a page whose main thread is still
   busy 10 s after navigation starts. (`/framework/ai2/` once blocked for 13 s and the owner's tab "crashed".)
3. **A screenshot**, 1920 × 1080, at `public/framework/ai/health/shots/<date>/<page>.png`.
   Each page's shot is overwritten, and day folders older than 7 days are deleted. They are gitignored.
4. **`JSONL: unknown verb` warnings**, counted as one warning finding that names the verbs and files.
5. Two spacing lints and the padding law at 1280 and 3440. These are warnings only.

A layout scan is not part of it yet.

## Where it reports

- **To the editor:** every finding goes to `public/framework/ai/health/<date>.jsonl` as an
  `error`, `warning` or `ok` line. At the agent's next write, `.claude/hooks/health-guard.mjs`
  blocks it with "you broke <page>" if one of its own files caused an error. A page that
  starts failing also posts a `needs-you` card through `say.mjs`.
- **To the dashboard:** one line per checked page goes into the task of the agent that made the
  edit, written through `.claude/hooks/append.mjs` (the validated route):
  `{"log":{"at":…,"msg":"health: /page/ — 0 console errors, stall 3.0 s, shot /framework/ai/health/shots/…png"}}`.
  The task is found the way the ledger hook records it. A file inside a task folder belongs to
  that task. Otherwise it is the newest unlanded task whose `action` lines list the file. Today's
  and yesterday's day folders are searched first. If they have no match, every task under `ai/` is
  searched, so a task opened days ago still gets its line. Each task log is re-read only when it
  changes. When no task is known (a merge, or a hand edit), the same line goes to the health day
  log as a `log` line instead.

## Proof (2026-09-30)

Run in the `proposal-flow` worktree against its own server. The files are in
[`proposal-flow/monitor/proof/`](/framework/ai/2026-09-30/proposal-flow/monitor/proof/).

- A 3 s busy loop on a test page was flagged as a 3.0 s stall, with a shot, and the line landed in the test task.
- A `throw` in `ai/health/page.js` gave "3 console errors". The editor's next write was blocked
  by health-guard. Restoring the file gave "0 console errors" and an `ok` line.
- An append to a task.jsonl caused no check. The console said `data only, no check — 1 file`.
- Two supervisors were started 4 s apart. The second exited with code 0, and one supervisor with one `health.mjs` child kept running ([console](/framework/ai/2026-09-30/proposal-flow/monitor/proof/supervisor-twice.log)).
- A file edited by a task opened five days earlier found that task, not a newer landed one ([output](/framework/ai/2026-09-30/proposal-flow/monitor/proof/task-lookup.log)).

## Watch out

- **A worktree's monitor also posts cards and writes logs in that worktree** (`board.jsonl`,
  the health day log). Don't commit those after a proof.
- **The old machine-wide lock** (`lew42-health.lock`) is no longer read. A `health.mjs` started
  by hand from older code keeps running beside a new one until it is killed.
- `Servex/Pool.js` still gives each slot its own `TEMP` to dodge the old lock. That is harmless now, but no longer needed.
