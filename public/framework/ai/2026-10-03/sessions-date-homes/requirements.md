# Sessions: reconcile with the owner's decisions

The owner's own words (relayed via vscode-mastermind, 2026-10-03), reconciling the landed Sessions
tab (`sessions-grid-v2`, commits f5103369/6123a53c) with decisions made since:

1. **No duplicate data:** `ai/sessions/transcripts/` holds 110 copied transcripts (2.5 MB,
   git-ignored). Read transcripts in place through a dev-server route instead, and delete the copy
   folder once the route works.
2. **A session's home is its date path:** `ai/YYYY/MM/DD/<slug>-<uuid8>/page.jsonl` (see "A session
   is a page" in page-item-design.md), written by `@task-mastermind-prompt-refine`'s hooks. The
   Sessions tab lists from those pages (the day indexes) as they appear, and keeps `sessions.json`
   only as a computed cache for Servex agents that have no page yet. A click opens the session's
   date path.
3. Show the start time, stop time, duration and cost on every row.

"Don't wait on the owner."

## State checked before building (2026-10-03)

- No `<slug>-<uuid8>` session folders exist anywhere under `ai/<Y>/<M>/<D>/` yet — grepped the
  whole tree. `task-mastermind-prompt-refine`'s hooks that would write them haven't landed. So
  requirement 2's "list from day pages" has nothing real to list from today; built as a seam that
  activates itself the moment those pages start appearing (see decisions.md), not chased further.
- `public/framework/ext/AITask/replay.js` already fetches a session's raw transcript **in place**
  from `/ai-logs/<id>` (a loopback-guarded dev-server route, `Server/plugins/AILogs.js`) — this is
  the existing mechanism requirement 1 asks for; reused rather than building a second one.
- `find_session_page_dir(id)` already exists in `sessions/page.js` (built by a later session-costs
  task) — walks `directory.json` for a `<slug>-<id8>` folder. Reused/refactored into a cached index
  rather than duplicated.
- `GET /api/agents` (`Servex/agents/Agents.js` `card()`) does not expose `stopped_at`, though the
  live Agent object already carries it once stopped (`Agents.js:542`). One-line additive fix, not
  "major surgery" (no rename, no moved responsibility, every existing caller unaffected).

## Scope

In: the three items above, for the Sessions tab (`ai/sessions/`) and its Dashboard tile
(`ai/dashboard/`). Out: the Role/Cost/RAM/trace-chart/waste-flags system another task already
built on this page — untouched except where Stop/Duration columns need to sit beside it.
