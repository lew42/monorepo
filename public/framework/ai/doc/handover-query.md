# Handover as a query — a plan, not yet built

**Status: plan only.** Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query](/framework/ai/sessions/2026/10/16/voice-20261016/handover-query/).

> handover must not be a hand-written file. One source of truth: session/task logs already hold what happened, landed, and is open.

The idea: `handover.md` stops being something an agent remembers to write. "Handover" becomes a **question asked at read time** of the `task.jsonl` logs that already exist. Five steps, one question each. Steps 2 to 5 are added as they are settled.

---

## Step 1 — Why is the index stale, and what rebuilds it?

**Answer: there are three "indexes", and only one of them has any safety net.** Which one showed 6 days is not yet measured (see the check at the end of this step); the three causes below are all real in the code.

| # | What | Written by | What triggers a rebuild today | Gap |
|---|---|---|---|---|
| 1 | The live **tasks index** (in memory) — [`Server/SessionIndex.mjs`](/Server/SessionIndex.mjs), the `tasks` source of [ext/Query](/framework/ext/Query/) | the dev server | `fs.watch` on `ai/`, 50 ms debounce, appended bytes only | **No safety net.** One `fs.watch` with no `error` listener, no periodic re-check, no staleness test. A dropped or dead Windows watch (a renamed folder, a flood of events) leaves it silently stale until the dev server restarts. |
| 2 | **`past-work-index.md`** — [`Server/PastWork.mjs --index`](/Server/PastWork.mjs) | whoever runs it by hand | Nothing. No timer, no hook. Last commit that touched it (2026-10-14) was a rename script, not a rebuild. | **Never rebuilt on a schedule.** This is the likeliest "6 days". |
| 3 | **`doc/follow-up.md`** — [`Server/FollowUp.mjs --write`](/Server/FollowUp.mjs) | `TaskLoop.follow_up_daily()` | Once per local day, inside the 5-minute tick ([task-loop.md](/Servex/doc/task-loop.md)) | Fine for a daily list, but a *handover* needs minutes, not a day. |

The contrast is the finding: the live session index ([`AISessionIndex.mjs`](/framework/ai/AISession/AISessionIndex.mjs)) has `SWEEP_MS = 5000`, "a safety net for a missed watch event". The tasks index (#1) has no such sweep. That asymmetry is the bug.

### The smallest fail-proof fix

**Make the tasks index rebuild-on-read, so it cannot be stale when asked.** Two small changes, both in `class SessionIndex`:

```js
// 1. a cheap staleness check at the top of query(): one directory walk of stat() calls, no parsing
query(spec) { this.refresh(); /* ...as today... */ }

// 2. refresh(): re-read any task.jsonl whose size changed since we last saw it; add new files; drop gone ones
refresh() { if (Date.now() - this.checked < 30_000) return; this.checked = Date.now(); for (const f of this.walk(this.root)) this.read(f, true); }
```

- `read()` already ignores a file whose size has not changed, so the walk costs only `stat` calls (about 1,500 files).
- The watcher stays, so pages still stream in about 100 ms; `refresh()` is only the **backstop** for the case where the watcher missed something.
- Add `this.watcher.on("error", …)` that re-creates the watch, and set `unload` on the `tasks` source so the 24-hour idle unload actually reloads.
- **Alternative considered:** a `setInterval` rebuild. Rejected: CLAUDE.md says stream, don't poll, and a timer rebuilds even when nobody asks. Rebuild-on-read costs nothing when nobody reads.

For #2 and #3 the same rule applies: **a generated file is never trusted to be fresh; the query is.** Steps 2 and 4 replace both with live queries over index #1, so they stop being files that can go stale.

### Check before building (one command)

`node Server/SessionIndex.mjs --check` prints the newest `last` time in the index; compare with the newest `task.jsonl` mtime on disk. A gap means the watcher missed events (cause #1). No gap and an old `past-work-index.md` means cause #2. This session could not run it (no shell approval), so it goes to the owner's build step as the first line of its test.
