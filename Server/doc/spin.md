# The dev server pins a core

Every few days `node server.js` starts burning ~130% of a core while still serving
normally — the fans come on, nothing else looks wrong. Seen 2026-08-08, -12, -16, -18.
Always this process; never the other `node.exe`s (playwright MCP, Adobe) and not the
idle `claude.exe` sessions, which sit at 0–4%.

## Cause — not confirmed

The one lead is the watcher: `LiveReload.js` and `Directory.js` each run a chokidar
watch over all of `public/` (~1000 dirs, one `fs.watch` handle each), and a watcher
that wedges into a readdir/ENOENT retry loop looks exactly like an idle one. Both got
`error` handlers for that on 2026-07-28 — but every spinning server so far ran with
its console hidden or long gone, so nobody has read what they print, and each was
killed before anyone profiled it. Run it in a terminal you keep; read that terminal.

**Next time, profile before killing** — this is what would settle it:

```powershell
node -e "process._debugProcess(<pid>)"      # opens the inspector on the running server
# then chrome://inspect → the target → Profiler → 5s. (idle) 100% = not busy in JS.
```

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
node server.js          # in your terminal — not Start-Process -WindowStyle Hidden
```

A hidden restart (2026-08-18) is one nobody can find, and it throws away the one thing
that would explain the spin: the watcher `error` output. If an agent must start it: a
visible window (`Start-Process node server.js`, no `-WindowStyle Hidden`), and say the pid.

That is a reset, not a cure — it has come back within four days every time. If the
server simply *vanished* overnight, it probably spun: on the dev machine a scheduled
watchdog kills any node/claude process >12h old sustaining >90% across two 15-minute
samples (not part of this repo — the machine-level `fans` skill knows it).
