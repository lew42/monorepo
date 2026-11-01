# LogLine — the one writer of a JSONL log line

`Server/LogLine.mjs` (`class LogLine`) takes a path and one or more lines and writes them: followed through moved paths, sent to `session.jsonl` or `task.jsonl`, `"NOW"` and `at` filled by node, checked against `.claude/hooks/jsonl-schema.mjs`, appended, the file re-parsed. It returns `{file, appended, at, bad, total, notes, landing}` or throws the schema's reason (`error.code` 3, nothing written).

```js
LogLine.append("<session folder>/session.jsonl", { task: { title: "build it", state: "open" } }, { by: "minion-x", session: "<uuid>", origin: "/framework/ai/..." });
// -> {"task":{"at":"…","title":"build it","state":"open"},"by":"minion-x","session":"<uuid>","origin":"/framework/ai/..."}
```

**A record file is not appended here directly** (data-shapes 1d, [one-writer.md](/framework/core/Item/doc/one-writer.md)). `append` is `prepare` (path, fill, schema check), then the write, then `report`. In Servex, `LogLine.writer` is `record_lines`, so a `session`, `task`, `page` or `improvements.jsonl` line is applied to the file's live root, then appended. `append.mjs` runs `prepare` and posts the lines through `RecordWriter.write`; only when Servex is down does it append, once. Other files, and a process with no writer set, use `LogLine.write`.

`by`, `session` and `origin` (strings) land beside the verb. The schema ignores string-valued `by`/`session`/`origin` keys; `session` as an object is still a verb.

## The three doors

| Door | Who | Notes |
|---|---|---|
| `log` MCP tool (`Servex/agents/tools.js`) | agents | `log({path, line or lines, origin?})`. `by` is the caller, `session` its `session_id` (or the external tab's registered one). `path` is a repo file, a folder (its record file) or a site url. Returns `{ok, file, at}` or `{ok:false, why}`. |
| `node .claude/hooks/append.mjs <file> <lines.json>` | hooks, scripts without MCP | Thin CLI over `LogLine.append`; exit 2 usage, 3 refused, 1 bad line; prints the landing checklist. |
| `dir_log`, `snooze_task`, `kill_task`, `reprioritise_task` | Servex internals | Call `LogLine.append` directly. |

A task is a line in its session's log: `{"task":{"title","state"}}` is accepted on `session.jsonl` ([sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md)).

## page.jsonl is stamped `ts`, not `at`

A `page.jsonl` line is an Item delta, and `Item.apply` reads a top-level `at` as the old path key (the browser warns "no at target" and drops the line). So for that basename LogLine puts a top-level `ts` on the line and never touches `at`. Every other target keeps the `at` stamping above.

## What it does not replace

`item` (an Item's own delta log), `page_set` (page deltas that the page folds) and `append_log` (Servex's own named event logs) keep their jobs: each writes a different shape than a verb line. `AISession.log` also stays, because it runs in the browser too and cannot import node code.

Test: `node Servex/agents/log-tool.test.mjs` (private fake host; also diffs the old and new CLI on a `session.jsonl`, `task.jsonl` and `day.jsonl`).
