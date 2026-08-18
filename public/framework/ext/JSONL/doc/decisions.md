# JSONL — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Append-only `.jsonl` logs the AI can blindly append to, assembled back into
object state by replaying verbs. `TaskJSONL` is the task manifest as a log:
`ai/<date>/<task>/task.jsonl` supersedes `session.json` — the dashboard and
AITask read either, new tasks write the log. `ai/<date>/day.jsonl` is the
day's blind-append log, read fine by base `JSONL`.

## One verb per key, value self-contained

Considered sibling metadata (`{"at": …, "log": "msg"}`) with handlers taking
`(value, entry)`. Rejected: the `assign` verb dispatches to the house
`assign(...args)`, and a second argument would merge the whole entry onto the
instance. So one key is the verb and its value carries its own `at`/`task`.
Multiple verbs in one line still work; an unknown verb warns and lands in
`skipped` — a typo stays visible instead of vanishing.

## `assign` replays construction

`{"assign": {…}}` runs the same `Object.assign` the constructor runs, so the
assembled object reads exactly like the POJO it replaced — `dashboard.js` and
`AITask.js` read `m.landed_at`, `m.tokens`, `m.agents` unchanged, JSON or
log. Accepted risk: a log line can shadow a method; log files sit at the same
trust level as the site's own modules.

## `live()` — the same log, streamed

`load()` fetches once; `live(changed)` subscribes to the file on the dev server,
replays each appended batch through the same `read()`, and calls `changed` — so a
board follows a running task with no reload. It is **opt-in by name**, and off
localhost (no socket) it *is* `load()`: fetch stays the static-hosting path and
nothing on the site depends on the server. The server sends a byte `offset` with
every batch; the client only ever hands it back, never computes one, and
re-subscribes from it when `node server.js` restarts — but only for streams that
have already answered, since a subscribe parked on `Socket.ready` flushes at that
same reconnect and re-sending it replays every file twice. `jsonl_reset` (a file it
had streamed shrank, was rewritten, or vanished) clears the replay and starts
over; a file missing at subscribe time is answered with an empty batch and a
standing subscription, so it streams the moment it exists — and `unsubscribe()`
is how a reader says that moment is never coming.
Full record — the registry, the several-readers case, the reset loop it avoids:
[live](./live.md).

## `TaskJSONL` — the task manifest as a log

`TaskJSONL extends JSONL`, adding `agent` (appended at dispatch, merged by
`task` when the same agent lands with its outcome), `chat` (one browser
turn, appended by `Server/plugins/Ask.js`), and `shot` (one screenshot taken
outside the repo) — plus a step outline carried as two plain `assign` fields,
never a verb. Full record, including the subclassing trap the static `verbs`
list sets: [task-jsonl](./task-jsonl.md).

## `shot` — a screenshot taken outside the repo, logged in place

```json
{"shot": {"at": "2026-08-17T11:02:00-05:00", "path": "C:\\Users\\mike\\AppData\\Local\\Temp\\ask-shot-1234.png", "url": "http://localhost/framework/ai/", "width": 1400, "label": "AI dashboard, default width"}}
```

Screenshots are scratch (RULE#12) — they live wherever the shot was taken
(the session scratchpad, or wherever `Server/plugins/Shot.js` / an ad hoc
Playwright script wrote the file), never in the repo, so the log line is the
only record of where one landed. Minimum shape: `path` (absolute, so the
dev-only `/screenshot` route — `Server/plugins/Screenshots.js` — can find it
again), `url` (what was shot), `width` (the viewport), `label` (what a human
should call it). `at` follows every other verb's convention.

**Deliberately just a dict.** A `scores` object (layout/contrast/density
ratings) is the obvious next field, and needs no shape change to arrive —
it's one more key on the same object, the way `cost_usd` arrived on `chat`
without touching `chat`'s contract. Nothing here reserves a slot for it in
advance; there's nothing to reserve.

`shots[]` replays in `TaskJSONL`; `ext/AITask`'s `shot_wall()` (`shots.js`)
renders it as a lazy-loaded thumbnail wall, clickable to full size — degrading
to a plain label off the dev server, where `/screenshot` doesn't exist.

## Traps

- **⚠ `load()`'s only failure signal is `.loaded` staying unset — nothing throws
  and nothing rejects.** The SPA fallback answers a miss with `index.html`, so
  `load()` treats a 200 with an `html` content-type the same as a network
  failure: it returns `this` either way. A caller that skips the `.loaded` check
  renders an empty object as if the file had loaded clean. `live()` resolves on
  the same contract — a missing file answers with an empty batch and leaves
  `.loaded` unset — so the check is identical under both transports.
- **⚠ A line that isn't JSON is dropped — the whole point, and the whole danger.**
  A torn append must cost one line, never the file, so `parse()` catches and moves
  on. It also counts: `unparsed` on the instance, one console warning per file
  carrying the offending text, and "N unparsed lines" beside the checklist on a
  task page. The failure has no other symptom — a landing line that put a
  backslash before a backtick, which JSON does not allow, read as a task still
  running for a day.
- **⚠ `live()`'s `changed` callback fires for every batch except the first**, and
  it runs outside any captor. Await the promise, render, then redraw from the
  callback through `$view.empty(() => …)` — a factory call made straight from the
  callback lands wherever the captor last was.
- **⚠ An `assign` must never write a scalar to a key the assembler builds as an
  array (`agents`).** The plain `assign` verb runs a raw `Object.assign` with no
  shape check, so a landing line's `"agents": 10` silently replaces the array
  `agent` lines built — and `card.js`'s `m.agents?.filter(...)` throws on the
  number, taking down the task's card and every dashboard page that renders it.

## Deferred

- **DayJSONL / PageJSONL** — no renderer wants them yet.
- **Dual json + jsonl** (condense the log into a snapshot, keep the log as the
  heavy record) — skipped by request, 2026-08-14.
- **Browser-side append** — the dev server appends `chat` lines on the browser's
  behalf (`ext/Ask`); a *direct* browser append would still go through
  ext/Saver's RPC. Everything else is appended by Claude, with file tools.
- **`unsubscribe` on navigation** — `unsubscribe()` exists and `ext/AITask`'s
  legacy probe calls it, but navigating away still leaves a stream registered,
  redrawing a detached element. That costs nothing and accumulates nothing
  (re-registering a path replaces the entry), so it waits for a page teardown
  hook to call the method that is now written — `Page.deactivate()`.
- **Migrating 08-08…08-13 session.json files** — the fallback makes migration
  optional; decide when the AITask redesign lands.

## Who uses it

- [`ext/AITask`](/framework/ext/AITask/) — `AITask.js` and `dashboard.js` both
  read a task's `TaskJSONL` through `live()`, falling back to legacy
  `session.json` when there's no `task.jsonl` yet. Renders every task page under
  `/framework/ai/<date>/<task>/` and the day/board views at `/framework/ai/`. The
  index rail's effort groups (`all_tasks()`) deliberately stay on `load()` — one
  page there holds every task of every day; only its Active strip subscribes,
  and only to the few tasks that are running.
- [`ext/Timeline`](/framework/ext/Timeline/) — `ai.js` loads each task's
  `TaskJSONL` for its `logs`/`actions`, drawn as dots inside the task's bar.
  Renders at `/framework/ext/Timeline/`.
- [`dev/DevBar`](/framework/dev/DevBar/) — `ask.js` loads the active page's
  task log before a chat turn from the dev rail appends to it. Renders on
  every page of the site, behind `Ctrl+\`.
