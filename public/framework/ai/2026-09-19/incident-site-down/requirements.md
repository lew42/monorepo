# incident-site-down — the live site went down for about four minutes; why, and what stops it

The owner, relayed at 15:52: *"The site is down. First get it back up. Then find who or what broke
it, file a report, and run an audit of why it broke and how to stop it happening again."* The
mastermind had it back up at ~15:56; this task is the rest.

Run by the **auditor** (`.claude/skills/auditor/`). Time box 40 minutes, one screen.

## The incident, with the evidence handed over

1. `ai/2026-09-19/reload-hold/` (Sonnet) saved a `Server/plugins/SocketServer/LiveReload.js` whose
   `initialize()` called `poll_hold()`, which iterated `this.socket_server.sockets` before the
   socket server had built that list — `TypeError: … is not iterable` at every boot. **It parses**,
   so the syntax-guard hook and the supervisor's own `node --check` both passed it.
2. ~15:50 the mastermind's supervised server (8123) went down from it; noticed at 15:51 only
   because a screenshot failed. The "do NOT restart yet" warning at 15:51:43 was posted on the dev
   bar — on the site that was down. The owner, asked four times that day to restart once, restarted
   then, and their port-80 server crashed at boot the same way.
3. The minion saved its fix at 15:52:40. Both supervisors logged `[supervisor] restarting —
   changed: LiveReload.js` and then nothing: `server.js`'s `restart()` did
   `old.once("exit", respawn); old.kill()` on a child that had already exited, so `restarting`
   stayed true for ever. That supervisor was written the same day by `ai/2026-09-19/server-self/`,
   whose proofs covered a healthy restart, a syntax error and a read — never "the child is already
   dead when the fix arrives", the exact case a supervisor exists for.
4. Seven minions in flight, three of them saving under `Server/` the same afternoon, into the one
   tree both live servers watch.

## What the audit must produce

What each agent had in front of it and why it was not enough; at most five changes ranked by
**outages prevented per line**, with mechanisms looked at first — (a) the supervisor boot-tests a
changed tree on a spare port and keeps the healthy child if it fails; (b) whether the owner's
server should follow `Server/` changes automatically at all; (c) an alarm that does not depend on
the site being up. Fail-safe skill edits applied; anything that changes what a skill or the server
**decides** is a `decision` line.

## Rules

- `Server/**` and `server.js` are **read-only** here — name the task that should change them.
- One-screen `page.js` in this dir; findings logged as they are found; one line to the owner's log
  at the start and at the landing (`node .claude/skills/assistant/say.mjs`).
