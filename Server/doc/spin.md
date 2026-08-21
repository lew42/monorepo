# The dev server pins a core

Every few days `node server.js` starts burning ~130–140% of a core while still serving
normally — the fans come on, nothing else looks wrong. Seen 2026-08-08, -12, -16, -18, -19.
Always this process; never the other `node.exe`s (playwright MCP, Adobe) and not the
idle `claude.exe` sessions, which sit at 0–4%.

## What it is doing — profiled 2026-08-19

First profile of a spinning server (pid 29784, 5 s, 3308 samples). **It is not idle and
not wedged in a retry loop** — the watchers are being flooded:

```
 36%  (idle)
 30%  FSWatcher._handle.onchange  →  chokidar handleEvent  →  path.join / fsWatchBroadcast
 29%  chokidar _handleRead  →  readdirp  →  fs.promises.readdir / lstat     (threadpool)
  4%  handleErrorFromBinding                                  (readdir of a vanished dir)
```

Read: raw `fs.watch` change notifications are arriving by the tens of thousands per second;
each one costs a `handleEvent` on the main thread and, once per second per directory, a
re-`readdir` of that directory (chokidar re-reads *again* when events arrived during the
throttle window — "one more time in case changes came in extremely quickly"). Two watchers
cover all of `public/` (`Directory.js`, `LiveReload.js` — 1142 dirs, 3337 files each), so
everything is doubled. Main thread ~60% + threadpool readdir/lstat = the 130–140%.

## What feeds it — measured the same day

- **Data reads fire change events on this machine.** Last-access updates are on
  (`fsutil behavior query DisableLastAccess` → 2, system managed). The first *read* of a file
  whose atime is >1 h stale fires **two** `change` events; a second read within the hour fires
  none; `stat`-only walks (`find`, `-type d`) fire none. So any sweep that reads `public/` after
  a quiet hour — a `grep -r`, the server serving a page, a Claude `Read`, `cat` — hands the
  watchers a burst of 2 × files-touched events and a readdir of every touched dir. A burst, not
  a sustain.
- **Deleting a watched dir** — 23 events, then quiet. Harmless.
- **Renaming a watched dir — `EPERM`.** The watch handle locks it; a `mv` under `public/` fails
  while the server runs. Stop the server (or rename by copy + delete).
- **Normal write churn** (5–16 files/min across every Claude session) is three orders of
  magnitude too small to be the flood.
- The server started 2026-08-19 13:31 was idle at 13:33 and at 141% by 14:03; killed and
  relaunched, the new one sat at 2% with the same tabs and sessions active. **The sustained
  source died with the process and is still unnamed.** Best candidates: a browser tab in a
  save/reload loop through the server (Saver RPC → file → LiveReload → save …), or a
  reader/writer in a loop under `public/data/`.

## Next time — name it, then kill

Both take ten seconds and neither touches the server:

```powershell
cd c:\Code\lew42\monorepo
node ~/.claude/skills/fans/watchspy.mjs 10     # raw events/s + the top paths — the flood, by name
node ~/.claude/skills/fans/profile.mjs <pid> 5 # the CPU profile, if it looks different from the above
```

`watchspy` runs the same chokidar with the same options as the server; if its counter is in
the thousands per second, the listed paths *are* the cause. Paste them here.

## Find it

Cumulative `CPU` in `Get-Process` is misleading — only a delta shows who burns *now*:

```powershell
$p = @(Get-Process node); $a = $p | % CPU; sleep 4; $p | % Refresh
$p | % { $_.Id, [int](($_.CPU - $a[$p.IndexOf($_)]) / 4 * 100), $_.StartTime -join "  " }
```

Or just: `Get-NetTCPConnection -LocalPort 80 -State Listen | % OwningProcess`.

## Reset

`pkill -f "node server.js"` matches nothing on Windows. Kill by pid — then start it
again yourself, **in a terminal you keep open**, where you can see it:

```powershell
Stop-Process -Id <pid> -Force
node server.js          # in your terminal — not Start-Process -WindowStyle Hidden, not nohup
```

A hidden restart (2026-08-18; twice on 2026-08-19 via `nohup node server.js` from a shell that
then exited, no `nohup.out` anywhere) is one nobody can find, and it throws away the watcher
`error` output. If an agent must start it: a visible window (`Start-Process node server.js`,
no `-WindowStyle Hidden`), and say the pid.

That is a reset, not a cure — it has come back within four days every time. If the
server simply *vanished* overnight, it probably spun: on the dev machine a scheduled
watchdog kills any node/claude process >12h old sustaining >90% across two 15-minute
samples (not part of this repo — the machine-level `fans` skill knows it).

## Cheap mitigations, not yet done

Ask before any of these — each changes server behaviour.
- One watcher instead of two (`Directory.js` could subscribe to `LiveReload`'s).
- `ignored` already skips `.json`; the ai logs are `.jsonl` and are not skipped.
- `fsutil behavior set DisableLastAccess 1` (admin) removes the read-fires-events class outright.
