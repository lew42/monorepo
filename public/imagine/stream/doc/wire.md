# The wire — what carried it, and the one thing missing

## The path an edit takes

```
a control in the editor window
  -> Stream.push()            one {at, op, path, value} line per op
  -> rpc:append               Server/plugins/SocketServer/Append.js
  -> fs.appendFileSync        opened with "a" — the line, not the file
  -> chokidar "change"
  -> LiveReload.changed()     .jsonl -> Tail, BEFORE the reload path exists
  -> Tail.changed()           reads from the byte offset, sends only new lines
  -> Socket.prototype.jsonl   ext/JSONL/live.js, for every subscribed window
  -> Stream.apply()           set / del / append onto the state
  -> the page redraws         one region, emptied and refilled
```

**Almost nothing on that path was written for this.** `LiveReload`, `Tail` and `ext/JSONL` are
the AI board (verified 2026-08-18, `/framework/research/livereload/`); `rpc:write` is the CMS
slice. The only new code is `stream.js`, which teaches `ext/JSONL` three verbs — and
`Append.js`, the one server-side gap, which landed 2026-08-31.

**A `.jsonl` never reloads a tab.** `LiveReload.changed()`'s first line hands every `.jsonl`
to `Tail` and returns. That single line is why a page's state can live in a watched file at
all — any other extension would reload every window on every keystroke.

## Measured

Two headless windows on one machine, private dev server on :8098, 2026-08-31 — the first run
with `Append.js` wired.

| | |
|---|---|
| append → the **other** window's DOM updated | **9 ms median** of 12, 10 ms worst (`/imagine/stream/wire/`) |
| one typed edit, harness wall clock | 75 ms — Playwright's poll interval, not the wire |
| two windows × 15 edits **at the same time**, over `rpc:append` | **30 of 30 lines survived** |
| the same, forced onto the whole-file fallback | **11 of 30** — 19 lines lost |
| one edit's cost in the log | exactly one line per op; `wire.json` byte-identical throughout |
| navigation events in the viewer while streaming | **0** |
| console errors across every cms + stream page, 400 / 1920 / 3440 | 0 |
| reload mid-stream | lands on the current state, snapshot + replay |

The in-page number is measured *after* the streamed region has been rebuilt, from the `at`
the editor stamped on the line — both windows share one wall clock, so it is honest. It does
not include paint. The 6 ms of 2026-08-30 and the 9 ms here are the same wire; the older run
wrote the whole file, this one appends, and the difference is inside the noise.

## The append landed, and here is what it removed

`rpc:write` used to be the only writer the dev server had, so **an append was a whole-file
write**. Three things followed, and the concurrency row above is the second one, measured.

1. **The writer's own lines come back.** A window that writes is also a subscriber, so the
   server echoes its line to it. Adding that echo to the local copy of the file writes it
   twice on the next edit — and the copy doubles every time. *Three edits produced seven
   blocks* before this was found. `Stream` splits its copy into `confirmed` (echoed by the
   server) and `pending` (written, not yet seen), and an echoed line **leaves** pending.
2. **Two windows writing at once lose each other**, because each sends its own copy of the
   whole file. 19 of 30 lines, measured above.
3. **It is O(file) per keystroke.** Fine at 10 KB. Wrong for a document.

`Server/plugins/SocketServer/Append.js` takes one line and `fs.appendFileSync`s it — opened
with `"a"`, so two writers interleave *between* lines and never inside one. It is wired in
`server.js` beside `Tail`.

**The fallback stays, and so does `confirmed`/`pending`.** `Stream.send()` tries `rpc:append`
first and falls back to the whole-file write, because a dev server started before the plugin
landed still has to work. ⚠ Such a server does not answer at all, and `async_rpc` waits
forever for a reply that is not coming — so the append is raced against a 2-second timeout
and the verdict is remembered on the instance. Exactly one edit ever pays for the probe.

## Compaction: the log folds into the snapshot

`clear()` throws the log away and falls back to whatever the `.json` says — every streamed
edit with it. `compact()` is the version that keeps them: the replayed state is written to
the `.json`, and **only then** is the `.jsonl` truncated.

⚠ That order is the whole safety property. Truncate first and a window reloading in the gap
gets the old snapshot with no deltas left to replay — every edit since the last fold is gone.

⚠ And a window seeing the truncation must **re-fetch** the snapshot, not reuse the one it
loaded with (`Stream.reset()`, `cache: "no-cache"`). Reusing it silently rolls every folded
edit back out in that window while the file on disk is correct.

Measured on the button, 2026-08-31: `wire.jsonl` **59 lines / 4616 B → 0 / 0**, folded into a
`wire.json` of 145 B; the headline survived in the compacting window *and* in a second window
that cold-reloaded afterwards. On `/imagine/cms/json/`: **4 lines / 651 B → 0 / 0**, snapshot
4473 → 4909 B, the edited title in it and the three child pages intact.

## Traps this hit

- **A torn half-line kills every reader**, so an append is one write of one `\n`-terminated
  string. `Tail`'s offset always lands just past a `\n` for the same reason, which is what
  makes a half-written trailing line simply unread instead of fatal.
- **`.json` is not watched at all** — chokidar's `ignored` excludes it. That is why the
  snapshot is a `.json` and the log is a `.jsonl`: writing the snapshot can never reload a
  window, and appending to the log can never do anything *but* stream.
- **`clear()` truncates**, the file becomes smaller than the offset, `Tail` answers
  `jsonl_reset`, and every window resets to the snapshot and re-subscribes from zero. That is
  the path `compact()` rides, after it has moved the snapshot.
- **A hidden tab gets no `rAF`.** Playwright's `waitForFunction` polls on rAF by default, so
  the moment the harness *clicks* the editor window the viewer goes to the background and the
  wait never fires — while the page underneath is working perfectly. Pass `{ polling: 100 }`.
  (Cost an hour, 2026-08-30. Same family as the MCP hidden-tab trap.)
