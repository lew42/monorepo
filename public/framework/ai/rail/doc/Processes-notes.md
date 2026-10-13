# Processes snapshot and visualization

## Overview

The Processes section displays `/framework/ai2/live/`'s "Processes" block, showing memory and CPU usage snapshots from Servex.

## Data source

One fetch of `GET <servex_base()>/api/processes`; documented at `Servex/doc/processes.md`. If Servex has not restarted onto this endpoint, it answers 404 and the section draws nothing (same as `poll_pool` when `/api/worktrees` is missing).

### Snapshot shape

- **ours / other**: `{n, mb, cpu}`, plus `free_mb` and `total_mb`
- **commit_mb / commit_limit_mb**: machine's commit charge (RAM + pagefile); reveals pressure that free RAM alone hides
- **groups[]**: one row per task, agent kind, or system bucket: `{key, kind, label, n, mb, cpu, pids, agents?}`; `kind: "session"` carries `stale`, `idle_h`
- **sessions**: `{n, stale, stale_mb, stale_h}` — VS Code conversation staleness
- **orphans[] / reaped[]**: flagged leftovers and cleaned-up ones
- **games_closed[]**: every game Games.js closed or would have, newest last
- **running[]**: `{id, state, pid, mb, lost}` — one per live agent, the real process or why there isn't one
- **worktrees**: `{total, pool, in_use, open, uncommitted, finished, removed_today}`
- **history[]**: up to 360 points: `{at, cpu, ours_mb, other_mb, free_mb, groups: {key: [mb, cpu]}}`

## Design decisions

### Graph layout: shared time axis

Both RAM and CPU charts share one time axis (`history[]`, left to right, oldest to newest), so one crosshair driven by pointer position serves both — the owner glancing at a CPU spike can read the RAM underneath it at the same instant. Inline SVG with `viewBox` only (no build step); `preserveAspectRatio="none"` lets CSS give each chart its own fixed height while width fills the column, exactly like every other fluid chart on the site.

### RAM visualization

Two stacked-area fills: ours from the baseline up, everything else stacked above it. "Ours" is always the band touching the floor. The space above both, up to the top of the chart, IS total RAM (nothing drawn there, so it reads as free).

### CPU visualization

Two thin lines on the same 0–100 scale: everything on the machine (muted — the context), ours alone (accent — the one the fan noise asks about). Same accent-vs-muted pairing as the RAM chart, so one legend explains both.

### Hover tooltip

One small line under the cursor: the point's own time, then both charts' numbers. A plain positioned box (not SVG text) because the numbers need to stay legible at any zoom and wrap freely at 400px.

### Headline and pressure indicators

The headline line answers "how much of the machine is ours right now" in one sentence. Commit charge rides along: free RAM alone can look fine while the pagefile is nearly full, and commit is the number that actually explains that.

### Stale VS Code conversations

Displayed right on the row so it is seen without opening anything. The owner's own words: "close them in VS Code" (never closed here; a VS Code conversation is the owner's to close).

### Group collapse behavior

Groups are sorted biggest first, and only the top few are OPEN on the page by default. A machine with two dozen "Claude Code session" groups used to draw two dozen closed rows before the details-collapse fix, still a long scroll for what is mostly noise. The rest fold behind one "N more" row, same shape as the others.

### Worktrees box layout

A plain box, not `.ai2-live-item` — that class's 4-column grid puts `.ai2-live-line` (column 3) ~100px in from the left edge, when worktrees is two whole lines of text (not a name + line beside a badge). Worktrees' siblings (Orphans) start flush left; this does too.

## Architecture

Two jobs: `create_processes` polls the snapshot, `processes_section` draws it. `live.js` owns the Live card itself and only wires the two together.

### Poller pattern

Same shape as `live.js`'s other pollers (`poll_pool`): fetch, skip while the tab is hidden, catch up the moment it is looked at again. `changed` is the Live card's own repaint signal.

### Process state indicator

One place knows "is this agent really running" — shared by this file's group-agent rows and by `live.js`'s "Running now" list, so the three words (running, lost, dormant) never drift apart. Real: "pid 47356 · 248 MB". Working with no process: "no process" (`running[].lost`). Dormant on purpose: "dormant, no process" (`Servex/doc/dormant.md`). Unknown (older Servex or id not in snapshot): empty string.
