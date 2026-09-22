# A file READ used to look like a live edit — fixed 2026-09-19

**Fixed.** Loading a page would sometimes reload itself immediately, for no
reason anyone changed. The cause: this machine has Windows' last-access
tracking on (`fsutil behavior query DisableLastAccess` → 2), so the first
*read* of a file whose access time is over an hour stale touches that
timestamp, and `fs.watch` reports that exactly like a write — same "change"
event, same file. Serving a page reads every file it needs, so loading a page
fired a "change" for each one, and `LiveReload` forwarded every one of them
straight into a `reload()`. The *second* load of the same page was quiet
because the access time was now fresh — which is why this looked random and
took a while to name.

**Measured** on the mastermind's own server (port 8123): a plain `grep -r`
over `core/` — nothing written — produced one 471-path "Changed" batch.
chokidar (the watcher before [`doc/spin.md`](./spin.md)) never had this
problem because it diffed `mtime` before telling anyone; the raw `fs.watch`
that replaced it does not, on its own.

**The fix:** [`../MtimeFilter.js`](../MtimeFilter.js) — a small class that
keeps a `Map` of file → last known `mtimeMs` and only lets a "change" event
through when the mtime actually moved. A file it has never seen passes only
if its mtime is very fresh (within 10 seconds) — that is a real write racing
it, not a stale read. `rename` (Windows' name for create/delete/rename alike)
always passes and refreshes the map, so a real edit is never held back. One
`stat` per event, no `readdir`. [`../watch.js`](../watch.js) uses one instance
for `public/`.

**Proved** on a private `PORT=8131 node server.js`: 20 files with
`LastAccessTime` over an hour stale, read with `cat` → **zero** "Changed"
lines named any of them (confirmed their access time really did move — the
old bug's exact trigger). A write of a new file → one "Changed" line with its
path. Create, then delete → both pass. An editor-style atomic save (write
`x.tmp`, rename over the target) → passes. A headless Playwright load of
`/framework/core/Page/` captured 366 real resource files, forced them all
2 hours stale, reloaded on a fresh tab and socket → **exactly one** `load`
event in a 3-second window, and the server log named none of the 366 files.

## The server now restarts itself, too

`node server.js` stays the command. It now starts as a small supervisor: it
forks the real server ([`../run.js`](../run.js)) as a child process — your
terminal's log is unchanged, the child's output is inherited straight
through — and watches `server.js` and `Server/**` with the *same*
`MtimeFilter`, so a read (an `rg`, a `cat`, an editor's syntax check) never
restarts it either. On a real change it waits 500ms in case more are coming,
runs `node --check` on the changed file, and only kills and re-forks the
child if that passes — a syntax error just logs one line and leaves the
running server alone. A child that crashes right after a restart is logged
once, plainly, rather than respawned in a loop. `NO_SUPERVISE=1 node
server.js` skips all of this and runs the server bare, exactly as before.

**Why not `node --watch`?** It restarts on a plain file *access*, not just a
write — the identical trap this page just fixed, and Node has no `mtime`
filter of its own. It would restart the dev server every time the server
served itself a page.

**Why not just point everyone at the mastermind's always-on server (port
8123) instead?** That already exists and helps — several servers can run at
once because each opens its own watch handle, and the watcher ignores `.json`
writes, so they don't fight over `directory.json`. But it's a different
origin (`localStorage` differs) and does nothing for the owner's own `:80`
server, which still needs a human at the keyboard to restart it today. The
supervisor fixes that directly.

**Proved** on the same private `:8131`: editing a harmless comment in
`Server/run.js` while a headless tab sat on a page with a live socket →
the supervisor logged one restart, the child rebooted within about two
seconds, and the *same* tab reconnected on its own (`Socket.js`'s existing
backoff — [`/framework/dev/Socket/doc/backoff.md`](/framework/dev/Socket/doc/backoff.md) —
already exists for exactly this) rather than reloading; a deliberately broken
temp file under `Server/` → one plain "syntax error, not restarting" log
line, child untouched; reading all 26 files under `Server/` (forced 2 hours
stale first) → zero restarts.

⚠ **The owner's own server (port 80) is still running the old code** and
only picks any of this up at their next restart — the last one they should
ever need to do by hand.

## It boot-tests a change before it ever swaps the live child (2026-09-19)

**The outage this closes.** The paragraphs above describe the supervisor as it
was written on 2026-09-19 — and a few hours later, on the same day, it took
the owner's live site down for four minutes: a `Server/` file that *parsed*
but *threw the moment it actually ran* was saved into this tree. `node --check`
passed it (that only proves a file parses), the supervisor killed the healthy
child and started the broken one, and when the fix arrived `restart()` waited
forever for an `exit` event from a child that was already dead — it never
came back on its own. Full incident:
[`public/framework/ai/2026-09-19/incident-site-down/`](/framework/ai/2026-09-19/incident-site-down/).

**The fix, in `server.js`.** On a real change, before the live child is ever
touched, the supervisor forks a CANDIDATE on a spare port it asks the OS for,
with `BOOT_TEST=1` in its environment, and polls the candidate's own `/` for
a real HTTP 200 (deadline 8s, `BOOT_TEST_DEADLINE_MS` overridable for a proof
run). **Pass:** kill the candidate, then restart the live child exactly as
before — the live gap is only ever the swap itself. **Fail** (the candidate
exits, throws, or never answers): kill the candidate, leave the live child
running **untouched**, print the candidate's last output, and write
`.server-boot-failed.json` at the repo root — `{at, files, error}`,
git-ignored, deleted on the next pass — so an agent or the owner's own tools
can see *why* without the site needing to be up at all.

A candidate must never do anything a normal boot does that only makes sense
for the one real server — so `BOOT_TEST=1` is a second flag, alongside the
spare `PORT`, that a few side-effecting plugins check for with **one line
each**: [`Directory.js`](../plugins/Directory.js) skips rebuilding the two
`directory.json` files, and [`LiveReload.js`](../plugins/SocketServer/LiveReload.js)
skips ever polling or writing the shared reload-hold lock.
[`Whisper.js`](../plugins/Whisper.js) needed no change — it already only
starts for the owner-facing server (no `PORT`, or `PORT=80`), so a candidate
on a spare port was already excluded.

**Never wedge — the second half of the fix.** Every kill (`kill_and_wait()`)
is bounded by a deadline (`SUPERVISOR_KILL_DEADLINE_MS`, default 3s): an
`exit` event is the fast path, a hard `taskkill /PID <pid> /T /F` is the
escalation if the child (or anything it spawned) is still there past the
deadline — nothing in this file can ever wait forever again, which is exactly
what wedged the site the second time on 2026-09-19. A live child that dies
after it had genuinely booted (killed, crashed at runtime) is respawned
immediately; one that dies within its own first second is treated as "never
really booted" — logged once, not respawned on a timer (that would just
crash-loop a broken tree) — and the supervisor waits for a real change before
trying again. A backstop timer (every few seconds) boots a live child anyway
if nothing is running and nothing is in flight, in case some path above ever
fails to notice on its own. A change that lands mid-boot-test cancels that
candidate and starts a fresh one on the new files, rather than running two
tests at once.

**Cold start into an already-broken tree.** `node server.js`'s very first
spawn is direct, not boot-tested — there is no healthy child yet to protect,
so testing first would only add latency for nothing. If that first boot fails,
the supervisor prints the error once, **stays up**, and waits for a change
that makes the tree bootable — it does not exit, and it does not retry on a
timer (that would be exactly the "spin" this whole file exists to avoid).

**Proved** on a private `PORT=8143`, using a test-only extra watched
directory and module (`TEST_EXTRA_WATCH_DIR`/`TEST_EXTRA_MODULE`, never set
in normal use — a proof run points them at its own task dir's scratch file,
never a real `Server/` file) so no real file ever had to be broken to prove
this — the mastermind's `:8123` and the owner's `:80` were polled throughout
and never dipped:

| case | result |
| --- | --- |
| (a) a module that throws at import | live answered 200 on every one of ~5-6 polls (every 200ms) across the whole episode — zero failures; `.server-boot-failed.json` written; the block printed |
| (b) fix it | one boot test, one clean swap, downtime ≈160ms, failure file gone |
| (c) a module that hangs at boot (never listens) | the real 8s deadline fires (proved directly; most runs used an override for speed) — reason logged as "no HTTP 200 within Nms"; live untouched |
| (d) kill the live child by its real PID while idle | back on its own, downtime ≈230ms |
| (e) kill the live child, then save a change — the incident's exact state | a server came back within ~1.1s; no wedge |
| (f) three saves 100ms apart | one boot test, one swap |
| (g) cold start into a broken scratch module | stays up, the "did not boot" line logs exactly once (not spamming); boots ~1-1.1s after the fix lands |
| (h) Ctrl+C mid-boot-test | zero node processes left — proved with a *real* Windows console Ctrl+C event (`GenerateConsoleCtrlEvent`), because `child.kill("SIGINT")` sent from a separate Node process does **not** invoke a target's `process.on("SIGINT")` handler on Windows — it just force-terminates it, confirmed on a bare test child before trusting any result from it |

`public/framework/ai/2026-09-19/server-boot-test/` has the task log and the
scratch harness. ⚠ **Saving `server.js` does not change a supervisor already
running** — the owner's and the mastermind's each keep their own in-memory
copy of this file until restarted by hand (a `Server/` save still restarts
their *child*, same as always) — restart by hand only once this exact file
has been boot-tested, which is the whole point of this page.

## A hold, so a batch of writes reloads once, not once per file

`Server/hold.mjs` (`node Server/hold.mjs on|off`, `../README.md` has the full shape) pauses
`LiveReload`'s broadcast — queued, deduped, nothing sent — until the last hold comes off, then
one reload for the whole batch. Its lock is one file OUTSIDE `public/`, so this supervisor's own
watcher never sees it; `LiveReload` polls it every 500ms instead (a hold also expires on a timer
with no file write at all, so one mechanism covers both jobs, cheaper than a second watch handle
plus a separate expiry timer would be).

⚠ **The first poll must wait for `"listening"`, not run in `initialize()`.** `LiveReload.setup()`
is called from `DevSocket`'s static `"new"` event, which `Events.js` fires BEFORE the emitting
instance's own `initialize()` — so at that moment the `SocketServer` that will own `sockets` has
not built it yet. A poll that finds a live hold and tries to broadcast over `this.socket_server.
sockets` throws `TypeError: … is not iterable` and crashes the child — on 2026-09-19 this took
the mastermind's own supervised `:8123` down while a hold happened to be on disk at boot.
`node --check` never catches this class of bug (it only proves the file parses); the fix and the
proof (three fresh private-port boots — no hold, a live hold, an expired hold — each reaching
exactly one "Server listening" line) are in `ai/2026-09-19/reload-hold/`.

**The expiry above is deliberate, but it used to be silent.** An agent that took a hold, stepped
away, and came back believed it was still protected — the hold had lapsed with nothing to say so,
and a real write once went out unheld. `../../.claude/hooks/hold-guard.mjs` fixes the silence, not
the expiry: on an agent's own next write, it notices a hold that agent took has since lapsed and
renews it, printing one line so the agent knows. Story and proof:
[`/framework/ai/2026-09-19/hold-guard/`](/framework/ai/2026-09-19/hold-guard/).
