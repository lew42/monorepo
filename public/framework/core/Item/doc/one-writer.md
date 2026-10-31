# One writer: every record line goes through one entry point

**What it is.** Every line written to a record file (`session.jsonl`, `task.jsonl`, `page.jsonl`, `improvements.jsonl`) goes through one function, `record_lines` (raw lines) or `run_item` (item-tool verbs), both in `Servex/agents/page_tools.js`. It applies the line to the file's live root first, then appends it. So the live root never goes stale, and the next `item()` call replays nothing. Asked by the owner (ask 41): "one data path, whether it's AI driven or UI driven… that needs to be our data backbone." Plan step 1d of [data-shapes](/framework/core/Session/tasks/data-shapes/plan.md).

## Who writes, and how

| Writer | Today | Its fallback when the entry point is down |
|---|---|---|
| A tab (`Item.Store.flush`) | by default (`Store.channel = "item_api"`) `RecordWriter.post`: a page's lines raw, a task's or session's as verbs; the lines Servex did not take go over the dev socket, numbered and acked ([transport.md](transport.md)); with `"socket"` all of them do | `FsFile.send` to the dev server's `Append.js`, which skips a line already in the file |
| An agent (`item`, `page_set`…) | `run_item` in Servex (in-process) | none needed |
| `LogLine` in Servex (the `log` tool, `dir_log`) | `LogLine.writer` = `record_lines`, synchronous | none needed |
| Servex's own lines (context alerts, landing nags, a handoff refusal, a worktree's `assign`, `WorktreeWatch`'s log) | `LogLine.raw` → `record_lines` | none needed |
| `append.mjs` (CLI) | `LogLine.prepare`, then `RecordWriter.write` | `RecordWriter.append_once` |
| Hooks `ledger.mjs`, `naming-guard.mjs` | `RecordWriter.write` (ledger awaits `pending` before it exits) | `RecordWriter.append_once` |

- **The door:** `POST /api/item` on Servex (`Servex.js` → `serve_item`). The body is `{path, delta, ts?}` (one verb) or `{path, lines}` (raw lines). Loopback only.
- **The caller's side:** [`RecordWriter.js`](../RecordWriter.js), one class for the browser and node.
- **Not routed yet:**
  - a hook's line 1 that creates a new session record (`session-page.mjs`, `prompt-relay.mjs`): no live root exists yet;
  - about 20 other Servex and Server files that still `appendFileSync` a record in-process (`Agents.open_task`, `SessionRecord.add_ref`, `ChildLinks`, `Sessions`, `Promote`, `Subpages`, `AIIndex`…). Nothing is lost: the next `item()` call on that file replays it once. Filed as the core/Item improvement "Route Servex's own raw record writers through record_lines" (`core/Item/improvements.jsonl`), with the cheaper guard beside it (replay only the appended bytes when a file only grew).
  - Files that are not records (`inbox.jsonl`, `board.jsonl`, `day.jsonl`) still append directly.

## No twin, in either order

Each line carries its own `ts`, made by the caller (`RecordWriter.stamp()`, unique per writer). A line whose `by` and `ts` are already in the file's last 64 KB is not written again. The entry point checks this, and so does every fallback.

- A slow entry point is waited on (15 s for a tab, 3 s for a hook). The browser no longer appends blind after 5 s.
- If the entry point writes after the caller gave up, the fallback finds the line and writes nothing.
- If the fallback wrote first, the late post is answered `{already: true}` (a verb) or counted as `skipped` (raw lines).
- Two limits remain, both rare:
  - two writers using the same `by` and the same millisecond `ts` would look like one line. `stamp()` prevents that within one writer; across two tabs it needs the same millisecond and a fallback.
  - a twin can still happen if the entry point has passed its tail check and is writing at the very moment a tab's 15 s fallback reaches `Append.js`: both read a tail without the line. It needs Servex to stall for 15 s between its check and its write, which is one synchronous step.
- A hook waits at most 3 s for the entry point (`RecordWriter.write`'s timeout), and only when it has a record line to write; a held Servex event loop costs each such hook up to 3 s. Normal cost is one loopback post.
- A verb is always stamped `by: "owner"` at the door (`serve_item`): only a tab posts verbs today. A node caller that needs its own `by` posts raw lines.

## Refused, skipped, stubbed

- `record_lines` refuses a line that would not replay on the warm root (it would make the log unreadable), and a page line its schema refuses (what `Append.js` always refused). The caller gets `ok: false` and nothing is written.
- **Stubbed:** a worktree page's post, or a node caller whose `root` is another checkout. The caller then appends to its own file, once. Nothing lands in the wrong tree.
- An older Servex answers raw lines with 400. Any non-2xx answer counts as "cannot take it", so the caller falls back.

## Moving it to the dev server (F1, ask first)

The [F1 study](/framework/core/Session/tasks/data-shapes/build/backbone/f1-live-instance.md) recommends that each project's dev server own the live root. The move keeps every caller as it is:

1. Lift `record_lines`, `serve_item`, `run_item` and `live_root` into a module the dev server also imports (a `Server/plugins/Item.js` that serves `POST /api/item`).
2. Change `RecordWriter.entry()`, one line: the page's own origin in the browser, and the project's port in node.

`LogLine.writer` is set by whichever process holds the live roots.

## Measured (2026-10-28)

The next `item()` call after a hook's write, on copies of real records (median of 5):

| Record | Lines | After a raw append (today) | After a one-writer append |
|---|---|---|---|
| voice session `v-sq8y7db` | 8,383 | 164 ms (replays the whole file) | 16.5 ms |
| `session-e00f55c9` | 1,099 | 69 ms | 25 ms |

The script: [measure-real.mjs](/framework/core/Session/tasks/data-shapes/build/one-writer/proof/measure-real.mjs).

## Tests

- `node Servex/agents/one-writer.test.mjs` (19 checks):
  - two writers at once (a tab's 20 posts and an agent's 20 calls on one file): 40 lines, no twin, live root = fresh replay;
  - a hook write: 1 full replay before, 0 after, through `RecordWriter.write`, `ledger.append_checked`, `LogLine.append` and `LogLine.raw`;
  - the fallback writes once: down, slow, stubbed, late post in either order, and `Append.js`.
- `node public/framework/core/Item/RecordWriter.test.mjs` (9 checks): stamps, the twin check, `append_once`.
