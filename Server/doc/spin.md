# The dev server pinned a core — fixed 2026-09-06

**Fixed.** For a year the dev server would, every few days, start burning ~130% of a
core while still serving normally. The cause is named below, the fix is in
[`Server/watch.js`](../watch.js), and a fresh server now idles at **0.1%**.

A server started before 2026-09-06 is still running the old code. **Restart it** —
the fix arrives no other way.

## The cause, in one sentence

**On Windows, an `fs.watch` handle whose directory is deleted underneath it never
closes and never goes quiet — it fires `change` events in a tight loop, for ever,
at about 6,400 a second — and chokidar opened one such handle for every one of the
1,865 directories under `public/`.**

So the moment anything deleted a directory under `public/` while the server was
running — a scratch dir, a sandbox, a `rm -rf` of some temp tree — that directory's
handle was stranded, and the server spun until it was killed.

## The measurement

Reproduced on demand: 12 directories created and deleted under `public/` (400 ms
apart) took a server from **2.9% to 134%**, where it stayed after the churn stopped.
Probing that live process through its own inspector — a hook on every `FSWatcher`'s
`onchange` — counted:

```
191,058 change events in 5 seconds        =  38,212 events/s
    ...of which six handles produced 31,842 each
    ...and all six watched directories that had already been deleted
8,532 FSWatcher handles in the process
```

The CPU profile is the same one taken on 2026-08-19, now explained: 36%
`FSWatcher._handle.onchange` → chokidar `handleEvent` → `fsWatchBroadcast` → 33%
`_handleRead` → `path.join`, `readdirp`, and `handleErrorFromBinding` — a `readdir`
of a directory that is not there.

**Why five earlier hunts failed to name it.** `watchspy.mjs` starts a *fresh*
chokidar with the server's exact options and saw 0–7 events/s while three servers
beside it burned 120% each. A new watcher never watched the deleted directory, so
it cannot see the flood. Everything else in the old notes follows from the same
fact: the source "died with the process" because the handle did; it "came back
every few days" because that is how often something deletes a directory under
`public/`; and the cost was doubled because `Directory.js` and `LiveReload.js` each
opened their own chokidar over the same tree.

## The fix

[`Server/watch.js`](../watch.js) — **one** recursive `fs.watch` handle on `public/`
itself, shared by both consumers:

```js
fs.watch(PUBLIC, { recursive: true }, (event, name) => …)
```

`public/` is never deleted, so there is nothing to strand. `Directory.js` and
`LiveReload.js` both subscribe to it; chokidar is gone from `Server/`.

Windows reports create/delete/rename as `"rename"` and a write into an existing
file as `"change"`, which is exactly the split the two consumers needed:
`Directory` rebuilds `directory.json` only on `"rename"` (a `"change"` leaves it
byte-identical and the rebuild costs ~110 ms of blocking walk), with a 100 ms
trailing debounce and a 1 s ceiling. `LiveReload` takes both.

| | before | after |
|---|---|---|
| idle CPU | 0.1% → **134%** after 12 dir deletions, permanently | **0.1%**, and **1.9%** after 20 |
| `fs.watch` handles | 8,532 | **1** (262 process handles, was 8,726) |
| memory | 224 → 480 MB | 125 MB |

Still verified working on the fixed server: an edit under `public/` reloads in
**326 ms**; a new directory reaches `directory.json` in **542 ms**; an appended
`ai/…/task.jsonl` line reaches a subscriber in **2 ms**; `/framework/` serves 200.

**Bonus:** renaming a directory under `public/` no longer fails with `EPERM`. Only
`public/` itself carries a handle now. (Any *other* old server still running keeps
its own 8,532 locks until it too is restarted.)

## What is left

**Rebuilding `directory.json` is now the server's biggest cost — ~110 ms of
blocking walk per structural change.** Idle that is nothing. With six agents
writing files at once it was measured at 69 rebuilds in 221 s, which is why the
same server reads **0.1% alone and ~5% under that load**. Making it incremental
instead of a full double walk of `public/` is the next win, and a bigger change
than this one. (The two walks overlap almost entirely — `public/framework/`'s
listing is the `framework` subtree of `public/`'s, apart from a stale `path` value
of `./framework/` instead of `framework` on its 19 top entries. Deriving one from
the other changes a file the site reads, so it wants its own task.)

Windows' `ReadDirectoryChangesW` has a fixed buffer, so a burst bigger than it — a
`git checkout` that rewrites thousands of files at once — can overflow and drop
events. chokidar's per-directory `readdir` diffing was more thorough about that,
and cost a core to be so. If a page ever looks stale after a huge tree operation,
reload it.

`chokidar` is still in `package.json`: nothing in `Server/` imports it any more, but
the `fans` skill's `watchspy.mjs` loads it from `node_modules` to reproduce what the
old watcher saw. Three mentions of it in `public/framework/dev/` (`page.js:30`,
`doc/decisions.md:13`, `Socket/doc/wire.md:307`) are now stale.

## Reset (unchanged)

`pkill -f "node server.js"` matches nothing on Windows. Kill by pid, and start it
again yourself **in a terminal you keep open**:

```powershell
Stop-Process -Id <pid> -Force
node server.js          # in your terminal — not -WindowStyle Hidden, not nohup
```

Cumulative `CPU` in `Get-Process` is misleading — only a delta shows who burns *now*:

```powershell
$p = @(Get-Process node); $a = $p | % CPU; sleep 4; $p | % Refresh
$p | % { $_.Id, [int](($_.CPU - $a[$p.IndexOf($_)]) / 4 * 100), $_.StartTime -join "  " }
```

## The other thing that fires events on this box

Last-access updates are on (`fsutil behavior query DisableLastAccess` → 2, system
managed): the first *read* of a file whose atime is over an hour stale fires **two**
`change` events. So a `grep -r`, a page being served, a `cat` — any sweep after a
quiet hour hands the watcher a burst of 2 × files-touched. A burst, not a sustain,
and the 300 ms debounce in `LiveReload` absorbs it. `fsutil behavior set
DisableLastAccess 1` (admin) removes the class outright — ask first.
