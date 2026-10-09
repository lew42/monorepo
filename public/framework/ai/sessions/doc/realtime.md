# Real time: the day-partitioned session index

When a session's transcript grows, its row on the Sessions grid changes within about a quarter of a second. This page says how, what is built, and what is not.

## The path, one line at a time

1. Claude appends a line to a transcript (`~/.claude/projects/c--code-lew42-*/<id>.jsonl`).
2. `Server/SessionTailer.mjs` is told by `fs.watch`. It reads only the new bytes through `Session.update`, which runs `Session.apply_line` per line.
3. If a field changed, it appends one **delta line** to today's day index (shape below). Nothing is ever rewritten.
4. The dev socket tails that file to the browser (`JSONL.live()`, the stream the whole site already uses).
5. `SessionLive.js` folds the line into a light `Session` (`Session.apply_delta`). The Session tells its subscribers, and the `SessionView` row for it redraws. One update, one row.

## Where the index lives: next to the data, by day

```
sessions/2026/index.json            months that exist + a roll-up each  (derived)
sessions/2026/10/index.json         days that exist + { count, usd, flagged } each  (derived)
sessions/2026/10/08/index.jsonl     the DAY index: delta lines. Only today's is tailed live.
```

- A session's **first line each day is a keyframe** (every field), so any one day file stands alone.
- The grid reads the year and month roll-ups to learn which day files its date filter needs, fetches only those, and folds them oldest-first. Long ranges can use the roll-ups alone.
- Month and year files are small and rebuildable. `node Server/SessionDays.mjs` rebuilds them; `--check` is the audit (it rebuilds in memory and names any file that differs).
- A day's `usd` in a roll-up is what its sessions spent that day (the sum of positive increases), not their lifetime total.

The delta line shape is in [record-spec.md](record-spec.md#the-day-index-line).

## What is real time now, and what is not

| | True now |
|---|---|
| A session's own cost, model, flags, active/idle, last activity | Real time, once the dev server's tailer runs. |
| A new session appearing on the grid | Real time. |
| A parent's `tree_usd` when a **child** changes | Not live. It moves at the next `--index` rebuild. |
| Tree, meta, closed, traces | Still read from the `session-index.json` snapshot. |
| Grid rows | Still built by `SessionRows.merge` from the snapshot, with live Sessions laid over them. |

**Planned, not built:** split the remaining snapshot into per-day pieces, nest child sessions in the parent's folder, and make grid rows fully Session-driven.

The tailer runs only on the **main checkout's** dev server (a worktree's `.git` is a file), and starts when that server restarts. `SESSION_TAIL=1` forces it on, `0` off.

## Measured latency

`node Server/session-latency.mjs` appends transcript lines to a scratch folder, then times a headless page's row change. Runs on 2026-10-08:

| Step | Result |
|---|---|
| Transcript append to feed line written | about 35 to 100 ms |
| Feed line to row redrawn (cost update) | about 65 to 115 ms typical |
| New session appears | about 200 to 250 ms (includes a 100 ms redraw debounce) |
| Slow tail | occasional 225 to 300 ms, rarely about 1 s; the time is in the dev socket, not the draw |

## Every transcript has a cache

`node Server/session-gap.mjs` counts transcripts with no `cache.jsonl`; `--fix` builds each missing one. Run it on the main tree (a worktree has no caches, so its count means nothing).

## Backfill

`node Server/session-summary.mjs --index` also writes one keyframe per session into the day of its last activity (skipping any already there), then rolls up. Older days therefore hold one line per session until they are live again.
