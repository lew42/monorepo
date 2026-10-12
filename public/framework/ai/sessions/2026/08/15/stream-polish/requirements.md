# stream-polish

## The ask

Post-landing polish on the `ai-server` streaming stack — the ranked small items
from `live-streaming`'s integrated verification (its task.jsonl carries the
full list, 18:20 log line). Keep every change small and visible; this is
tightening, not redesign.

## The items (in order; skip none silently — a deferral is a logged finding)

1. **Double-subscribe on connect.** `ext/JSONL/live.js` chain-patches
   `Socket.prototype.open` to re-subscribe every registered stream; but
   subscribes parked on `Socket.ready` flush at the same `open()`, so every
   board load replays all files twice. Fix: the chained `open()` skips streams
   that have not yet received their first frame (offset still unset/0 and the
   first-frame promise unsettled) — those already have a subscribe in flight.
   Verify with the server console or a ws tap: one replay per file per connect.
2. **Blind probes leave forever-standing subscriptions.**
   `ext/AITask` `AITask.session()` probes `task.jsonl` via `live()`; a legacy
   `session.json` task has no such file, and the empty-frame answer leaves a
   dead subscription standing. When the probe comes back empty (`.loaded`
   unset) and the code falls back to legacy, send
   `{"method":"unsubscribe","args":[path]}` and unregister. Do NOT change the
   detail-page case where the file is legitimately expected to appear later
   (a just-scaffolded task) — only the legacy-fallback path unsubscribes.
3. **Quiet-task staleness, client-side only.** A running card (no `landed_at`)
   whose newest line's `at` is older than ~30 minutes renders a quiet marker —
   reuse the card's existing figure style, e.g. "quiet 2h" — computed entirely
   from data the card already has. No server change, no new file. Threshold as
   a named constant, not an option.
4. **Unparsed lines must be visible.** `JSONL.parse` silently drops a line
   that fails `JSON.parse` — that silence cost a day of "stuck at 5/6" until
   verification found the illegal escape. Count drops on the instance
   (`unparsed`), and AITask's detail page shows "N unparsed lines" near the
   checklist when nonzero. Console-warn once per file with the first bad line's
   text so the fix is greppable.
5. **`hello` on SPA navigation.** `core/Router` announces the new pathname at
   the point a route commits — one visible `Socket.singleton().rpc("hello",
   pathname)`-shaped line (match how Router already reaches shared services; if
   Router has no socket access today, import the singleton the way app.js
   consumers do — visible at the call site, no black magic). Off-localhost the
   socket is disabled and `rpc` no-ops — verify that stays true.
6. **The brand-new-dir chokidar race (investigate, then fix-or-document).**
   Verification saw 1-of-4 runs where a file created in a never-existed dir
   streamed its creation but not its next append (watcher wedged for that dir).
   Timebox the investigation; if the fix is not small and certain, document the
   trap in `dev/Socket/doc/wire.md` + `Server`-side comment instead, with the
   observed reproduction. An honest trap note beats a speculative fix.

## Files you may touch

`public/framework/ext/JSONL/live.js` (+ its doc files), `public/framework/ext/AITask/**`,
`public/framework/core/Router/**` (the one hello line + doc note),
`Server/plugins/SocketServer/Tail.js` / `LiveReload.js` ONLY if item 6 yields a
small certain fix, and this task's log. Update every doc artifact your change
touches (documentation skill) — the six-artifact rule applies.

## Verification bar

`node --check` everything edited. Live against :80 (server may be restarted
carefully ONCE if item 6 changes server code — netstat PID, taskkill //F //PID,
relaunch detached, NEVER pkill): item 1 by observing single replay per file;
item 2 by loading a legacy-task day page (2026-08-08..13 have session.json
tasks) and confirming unsubscribes; item 3 with a fabricated old `at`; item 4
with a scratch bad line in a SCRATCH file (never a real log); item 5 by SPA-
navigating and checking the server's socket.page via the mcp pages tool or a ws
tap. All probes reverted; scratch only in the scratchpad.

## House rules

CLAUDE.md rules. code-architecture skill before JS. Comments = traps only.
Log milestones to public/framework/ai/2026-08-15/stream-polish/task.jsonl;
land with the full assign + day.jsonl line.
