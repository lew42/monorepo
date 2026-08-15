# board-start — start work from the browser

## The ask, verbatim

> lets try to move to 100% web-based ui?

## The reading

Ambiguous between two things, and this increment serves both:

1. **Drive the AI from the browser** rather than the VS Code terminal.
2. **Edit the site from the browser** rather than an editor.

Either way the same thing is missing. The bridge already covers most of it —
[`ext/Ask`](/framework/ext/Ask/) talks to an *existing* task's session from its
page, with screenshots, and files the exchange in that task's log; `dev-toolbar`
gives a site-wide control surface; the board shows everything that happened. The
one thing you still need a terminal for is **starting work**.

So: `rpc:start`. Type an ask into the board, get a task.

## The design

- **`Server/plugins/Start.js`** — scaffolds `ai/<date>/<slug>/` (requirements.md
  + an opened task.jsonl, exactly what the `new-task` skill writes by hand) and
  spawns `claude -p` to work it.
- **Returns immediately.** Unlike `rpc:ask`, this does not await the turn: a task
  runs for an hour. The task's own log is the progress channel and live-reload
  carries it to the board — which is the whole reason the log exists.
- **`--session-id` is generated up front** and written into the launch `assign`,
  so the transcript is joined from the first line rather than discovered later.
- **`acceptEdits`, not `bypassPermissions`.** A text box on a web page should be
  able to write files, not to run anything at all.
- **`ext/AITask/compose.js`** — the box: ask, optional name, effort, model.
  Absent off localhost rather than broken, the same as the rest of the bridge.

## Steps

1. `Start.js` — scaffold + spawn, returning as soon as the process is away
2. `start()` beside `ask()` in ext/Ask; `compose.js` on the board
3. Smoke-test end to end in Chromium — a real spawned session that lands
4. Fix what the test finds
5. Document: ext/AITask readme + the Ask readme's table
6. Verify at 1280 / 1920 / 3440, land
