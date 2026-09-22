# JSONL — append-only `.jsonl` logs the AI blindly appends to, replayed back into object state; the task and day logs under `ai/`, for the dashboards that read them

## Use
One JSON object per line, one verb per key, the value carrying its own `at`. Verbs: `assign` (merge onto the object — the constructor's `Object.assign`, replayed), `log` and `action` (append to `logs`/`actions`); `TaskJSONL` adds `agent` (merged by `task` when the same agent lands), `ask` (one thing the owner asked for, merged by `id`), `decision` (one choice and the alternatives it was made over, merged by `id`), `verdict` (the owner approving or improving one), `rank` (the owner's order for one of those lists — the last line wins outright), `chat`, `shot`, `note` (a message from the orchestrator to a task's own board, merged by `id`).

```js
import { TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
const task = new TaskJSONL({ url: "/framework/ai/2026-08-14/jsonl/task.jsonl" });
await task.live(show);      // load() plus a dev-server subscription; off localhost it IS load()
if (task.loaded) show();    // .loaded unset = the file was missing, under either transport
```

Append with bash `printf '%s\n' '{"log": {"at": "…", "msg": "…"}}' >> task.jsonl` — PowerShell `>>` writes a BOM, and a BOM'd first line is not JSON.

## Watch out
- `load()`/`live()` never throw or reject — a missing file (the SPA fallback answers 200 html) just leaves `.loaded` unset; check it before rendering. [doc/decisions.md](./doc/decisions.md)
- A line that isn't JSON is dropped, counted in `unparsed`, warned once — a BOM, or a backslash before a backtick, costs that line silently (a landed task read as running for a day). [doc/decisions.md](./doc/decisions.md)
- `live()`'s `changed` fires for every batch after the first, outside any captor — redraw through `$view.empty(() => …)`. [doc/live.md](./doc/live.md)
- Build `url` as a bare pathname, or know that `import.meta.resolve()` works too now — both key the stream registry the same way since 2026-09-19; before that fix, the resolve() form silently streamed exactly once and then went deaf. [doc/live.md](./doc/live.md)
- `assign` is a raw `Object.assign`: `"agents": 10` in a landing line replaces the array and takes down every card that renders it. [doc/decisions.md](./doc/decisions.md)
- `ask` carries the owner's words verbatim plus the `uuid` of the message they said them in, so a reader can get back to the real sentence — [doc/task-jsonl.md](./doc/task-jsonl.md)
- `decision` + `verdict` are the feedback loop: the worker writes the choice, the owner presses Approve or Improve, and `judged()` merges the newest verdict onto the decision so the two can never disagree — [doc/task-jsonl.md](./doc/task-jsonl.md)
- `rank` replaces a whole order rather than merging — half an order is not an order — and `ranked(items, order, id)` is the reader half: anything the order does not name keeps its place BEHIND everything it does. [doc/task-jsonl.md](./doc/task-jsonl.md)
- `needs: {owner, minutes}` on an `ask` or a `decision` is "this one is waiting on you"; the off switch is `needs.done`, NEVER the ask's own `status` — a landed ask can still be waiting on a login. [doc/task-jsonl.md](./doc/task-jsonl.md)
- A subclass adding a verb must add it to `static verbs` and clear its array in `reset()` — a handler alone routes the line to `skip()`. [doc/task-jsonl.md](./doc/task-jsonl.md)
- An unknown verb warns once per verb per file, not once per line — `skipped` still counts every dropped line. [doc/task-jsonl.md](./doc/task-jsonl.md)

## More
- [Overview](/framework/ext/JSONL/) · [`doc/task-jsonl.md`](./doc/task-jsonl.md) the task manifest verbs · [`doc/live.md`](./doc/live.md) streaming, registry, resets · [`doc/decisions.md`](./doc/decisions.md) the record: verb format, deferred, who uses it
- Files that matter: `JSONL.js` (parse, replay, verbs), `live.js` (the socket half), `page.js` (the demos)
