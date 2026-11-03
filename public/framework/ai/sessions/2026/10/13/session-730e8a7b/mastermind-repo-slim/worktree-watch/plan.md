# worktree-watch: the plan, one screen

**What it is.** When an agent edits a page inside a pool worktree and the page breaks, the agent hears within a minute: one line from Servex, naming the page, the width, the measurement and a screenshot path.

```
class WorktreeWatch              Servex/WorktreeWatch.js  (beside Pool.js)
  constructor({ id, path, port, owner, send, log, shots })
  start()  stop()                one per taken pool slot
  static pages_for(rel_file)     changed file -> page urls
  static judge(layout_json)      -> breaks[]   (pure, unit-tested)
```

## How it runs

1. `Pool.take` / `take_sync` start one (`Pool.page_watch(slot, caller)`); `give_back`, `remove` stop it; `adopt` restarts it for slots still taken after a Servex restart.
2. It opens a WebSocket to the slot's own dev server (`ws://127.0.0.1:<port>/`) and listens for the `changed` frame the server already sends its browser tabs. No second `fs.watch`: the dev server's `MtimeFilter` and reload hold already decide what counts as a write.
3. Template files only (`.js .mjs .css .html`; data never breaks a page). Each maps to a page the way `Server/health.mjs` does: nearest folder up with a `page.js`; a shared module (`core/ ext/ ui/ ux/`, `app.js`, `framework.css`) adds the `/framework/` canary. At most 3 pages per batch.
4. Debounce 2 s, then one `node Server/layout-check.mjs <urls> --widths 400,1200,1920,3440` run in the slot (child process, one at a time; a change during a run queues one more run).
5. `judge()` reads each page's `layout.json`. A break is: a console or page error (a same-origin 404 shows as one), `overflow_x` at any width, or `empty` over 0.6 at 1920 or 3440 (the same 0.6 `on-landing.mjs` uses).
6. On a break: if the page has not been messaged in 10 minutes, `send(owner, line)` and one log line in the owner's task log; the failing width's png is copied to `<task dir>/shots/` (git-ignored). On recovery: one `clear` log line, no message.

The line: `worktree-watch: /framework/x/ breaks at 400 px: overflow_x true. Shot: <path>. (qf-7, 9 s after your save)`

## Decisions

- **Home: the pool (Servex), not the worktree's dev server.** The dev server does not know its owner, is a separate process that may be killed any time, and cannot call `send_to_agent`. The pool already knows `taken_by` and starts and stops the slot's other helper (the health watcher). Rejected: riding `worktree-up.mjs`, which also serves worktrees nobody took.
- **Subscribe, don't watch.** The `changed` WebSocket frame instead of a second `fs.watch`.
- **Rejected: a timer that re-checks every minute.** It polls (CLAUDE.md: stream, don't poll), loads pages nobody touched, and is slower than 2 s.
- **Next to `health.mjs`, not instead of it.** `health.mjs` keeps writing the day log and the line the editing agent reads at its next write (`health-guard.mjs`, main tree). This adds the live push and the four widths. Not merged into one yet: `health.mjs` is not importable (it starts a watcher on import) and is outside this fence; extracting its `pages_for` is the follow-up.
- **Shots go through `/tmp`, then to the task dir.** `layout-check` only writes inside its own repo or the OS temp dir, and the task dir lives in the main repo.
