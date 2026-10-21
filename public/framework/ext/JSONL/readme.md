# JSONL — append-only `.jsonl` logs the AI blindly appends to, replayed back into object state; the task and day logs under `ai/`, for the dashboards that read them

> **Converge:** how a `.jsonl` is written, read and indexed is one system: [core/Page/doc/jsonl.md](/framework/core/Page/doc/jsonl.md) ("The store"). Before adding file code here, read it.

## Use
One JSON object per line, one verb per key, the value carrying its own `at`. Verbs: `assign` (merge onto the object — the constructor's `Object.assign`, replayed), `log` and `action` (append to `logs`/`actions`); `TaskJSONL` adds `agent` (merged by `task` when the same agent lands), `ask` (one thing the owner asked for, merged by `id`), `decision` (one choice and the alternatives it was made over, merged by `id`), `verdict` (the owner approving or improving one), `rank` (the owner's order for one of those lists — the last line wins outright), `chat`, `shot`, `note` (a message from the orchestrator to a task's own board, merged by `id`), `experiment` (one thing tried — try, measure, result — joins `logs` as one line), `review` (a review pass's summary or one answer, same deal), and `Server/review.mjs`'s own `shots` (a page-shot batch) and `bands` (one audit round's findings) — same deal again.

A line with no verb at all — an old `{"at", "task", "msg"}` day-log line, or a pre-verb `{"type": "launch", …}` task line — still renders as a plain log line as long as it carries something to read (`msg`, `text` or `title`) beside a `type` or `at`; see [`static flat()`](./doc/decisions.md#flat-lines-render-as-a-plain-log-line-never-warn).

```js
import { TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
const task = new TaskJSONL({ url: "/framework/ai/sessions/2026/08/14/jsonl/task.jsonl" });
await task.live(show);      // load() plus a dev-server subscription; off localhost it IS load()
if (task.loaded) show();    // .loaded unset = the file was missing, under either transport
```

Append with the validated route only: `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` — write `lines.json` (an array of the new line objects) with the Write tool first. It stamps `at`, checks the shape, and re-parses the file; never a raw `printf`/`>>` or PowerShell's `Out-File`, which writes a BOM that breaks the first line's JSON.

## Watch out

- One socket, paused on navigation: a stream started while a page is active pauses when the Router leaves that page and resumes from its offset on return; no `unsubscribe()` call needed. Streams started with no page (dev bar, drawer) never pause. [doc/live.md](./doc/live.md)
- A record file is append only: never read-modify-write it, and never run a plain merge, pull, rebase or reset in the main tree (a merge parked other agents' appended lines in a hidden commit on 2026-10-13). [ai/sessions/doc/commit-rule.md](../../ai/sessions/doc/commit-rule.md)
- `load()`/`live()` never throw or reject — a missing file (the SPA fallback answers 200 html) just leaves `.loaded` unset; check it before rendering. [doc/decisions.md](./doc/decisions.md)
- A line that isn't JSON is dropped, counted in `unparsed`, warned once — a BOM, or a backslash before a backtick, costs that line silently (a landed task read as running for a day). [doc/decisions.md](./doc/decisions.md)
- One socket for every subscription (`Socket.singleton()`; a path read twice shares one server subscription), but nothing unsubscribes on navigation: `unsubscribe()` is manual, and on 2026-10-20 only 7 of 42 `live()` callers call it (in a page's `deactivated()`), so a page you leave keeps streaming into views nobody sees. Fix queued: [jsonl-unsubscribe](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/jsonl-unsubscribe/requirements.md).
- `live()`'s `changed` fires for every batch after the first, outside any captor — redraw through `$view.empty(() => …)`. [doc/live.md](./doc/live.md)
- Build `url` as a bare pathname, or know that `import.meta.resolve()` works too now — both key the stream registry the same way since 2026-09-19; before that fix, the resolve() form silently streamed exactly once and then went deaf. [doc/live.md](./doc/live.md)
- `assign` is a raw `Object.assign`: `"agents": 10` in a landing line replaces the array and takes down every card that renders it. [doc/decisions.md](./doc/decisions.md)
- `ask` carries the owner's words verbatim plus the `uuid` of the message they said them in, so a reader can get back to the real sentence — [doc/task-jsonl.md](./doc/task-jsonl.md)
- `decision` + `verdict` are the feedback loop: the worker writes the choice, the owner presses Approve or Improve, and `judged()` merges the newest verdict onto the decision so the two can never disagree — [doc/task-jsonl.md](./doc/task-jsonl.md)
- `rank` replaces a whole order rather than merging — half an order is not an order — and `ranked(items, order, id)` is the reader half: anything the order does not name keeps its place BEHIND everything it does. [doc/task-jsonl.md](./doc/task-jsonl.md)
- `needs: {owner, minutes}` on an `ask` or a `decision` is "this one is waiting on you"; the off switch is `needs.done`, NEVER the ask's own `status` — a landed ask can still be waiting on a login. [doc/task-jsonl.md](./doc/task-jsonl.md)
- A subclass adding a verb must add it to `static verbs` and clear its array in `reset()` — a handler alone routes the line to `skip()`. [doc/task-jsonl.md](./doc/task-jsonl.md)
- An unknown verb warns once per verb per file, not once per line — `skipped` still counts every dropped line. [doc/task-jsonl.md](./doc/task-jsonl.md)
- A flat line (no verb key at all) renders as a log line when it carries `msg`/`text`/`title`; with no readable text but a real `at`, it folds into `assign` instead; only a line with neither still warns, once per stray key. [doc/decisions.md](./doc/decisions.md)
- `experiment`, `review`, `shots` and `bands` don't grow their own array — they push a computed `msg` onto `logs`, the same line every other reader of this file already draws. [doc/task-jsonl.md](./doc/task-jsonl.md)

## Growth (2026-10-20)

A log only grows. Up to a few MB per file is fine to read and replay. The cost is loading many at once: a hundred logs opened together is a real processing load (every line is parsed and replayed), which is why `index.json` and the day stream exist. Auto-compaction is one strategy, but it rewrites history and loses deltas, so it breaks "append only, git is the undo". First step, not built: a size watch that notes any log past a few MB, so a human decides. Nothing is compacted today.

## More
- [`core/Page/doc/storage.md`](../../core/Page/doc/storage.md) — where page lines can be kept besides `.jsonl` files (Durable Object, D1, archive), and why JSONL stays the default and the reference
- [`doc/JSONL-notes.md`](./doc/JSONL-notes.md) — implementation details and schema notes
- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [Overview](/framework/ext/JSONL/) · [`doc/task-jsonl.md`](./doc/task-jsonl.md) the task manifest verbs · [`doc/live.md`](./doc/live.md) streaming, registry, resets · [`doc/decisions.md`](./doc/decisions.md) the record: verb format, deferred, who uses it
- Files that matter: `JSONL.js` (parse, replay, verbs), `live.js` (the socket half), `page.js` (the demos)
