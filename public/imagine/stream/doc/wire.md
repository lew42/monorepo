# The wire — what carried it, and the one thing missing

## The path an edit takes

```
a control in the editor window
  -> Stream.push()            one {at, op, path, value} line per op
  -> rpc:write                the socket the CMS slice already had
  -> fs.writeFileSync         Server/plugins/SocketServer/Runtime.js
  -> chokidar "change"
  -> LiveReload.changed()     .jsonl -> Tail, BEFORE the reload path exists
  -> Tail.changed()           reads from the byte offset, sends only new lines
  -> Socket.prototype.jsonl   ext/JSONL/live.js, for every subscribed window
  -> Stream.apply()           set / del / append onto the state
  -> the page redraws         one region, emptied and refilled
```

**Nothing on that path was written for this.** `LiveReload`, `Tail` and `ext/JSONL` are the
AI board (verified 2026-08-18, `/framework/research/livereload/`); `rpc:write` is the CMS
slice. The only new code is `stream.js`, which teaches `ext/JSONL` three verbs.

**A `.jsonl` never reloads a tab.** `LiveReload.changed()`'s first line hands every `.jsonl`
to `Tail` and returns. That single line is why a page's state can live in a watched file at
all — any other extension would reload every window on every keystroke.

## Measured

Two headless windows on one machine, dev server on :8095, 2026-08-30.

| | |
|---|---|
| append → the **other** window's DOM updated | **6 ms median** of 10 (`/imagine/stream/wire/`) |
| the same, on the deck | 4 ms |
| the harness's own wall clock | 21 ms median — Playwright's `waitForFunction` polls on rAF |
| navigation events in the viewer while streaming | **0** |
| console errors, 404s, at 400 / 1280 / 1920 / 3440 | 0 |
| reload mid-stream | lands on the current state, snapshot + replay |

The in-page number is measured *after* the streamed region has been rebuilt, from the `at`
the editor stamped on the line — both windows share one wall clock, so it is honest. It does
not include paint.

## The one thing missing: an append

`rpc:write` is the only writer the dev server has, so **an append is a whole-file write**.
Three things follow.

1. **The writer's own lines come back.** A window that writes is also a subscriber, so the
   server echoes its line to it. Adding that echo to the local copy of the file writes it
   twice on the next edit — and the copy doubles every time. *Three edits produced seven
   blocks* before this was found. `Stream` now splits its copy into `confirmed` (echoed by
   the server) and `pending` (written, not yet seen), and an echoed line **leaves** pending.
   That whole mechanism exists only because there is no append.
2. **Two windows writing at once lose each other**, because each sends its own copy of the
   whole file.
3. **It is O(file) per keystroke.** Fine at 10 KB. Wrong for a document.

**The fix is written and unwired**: `Server/plugins/SocketServer/Append.js`. It takes one
line, `fs.appendFileSync`s it (which opens with `"a"`, so two writers interleave *between*
lines and never inside one), and answers. Two lines land it, in `server.js`:

```js /server.js
import Append from "./Server/plugins/SocketServer/Append.js";
DevSocket.Socket.use(Append);        // beside DevSocket.Socket.use(Tail)
```

and a dev-server restart. **Proposed, not applied** — `Server/` is the owner's. With it,
`Stream.push()` sends the line alone and `confirmed`/`pending` disappear.

## Traps this hit

- **A torn half-line kills every reader**, so an append is one write of one `\n`-terminated
  string. `Tail`'s offset always lands just past a `\n` for the same reason, which is what
  makes a half-written trailing line simply unread instead of fatal.
- **`.json` is not watched at all** — chokidar's `ignored` excludes it. That is why the
  snapshot is a `.json` and the log is a `.jsonl`: writing the snapshot can never reload a
  window, and appending to the log can never do anything *but* stream.
- **`clear()` truncates**, the file becomes smaller than the offset, `Tail` answers
  `jsonl_reset`, and every window resets to the snapshot and re-subscribes from zero. That is
  the compaction path, exercised by the button.
- **A hidden tab gets no `rAF`.** Playwright's `waitForFunction` polls on rAF by default, so
  the moment the harness *clicks* the editor window the viewer goes to the background and the
  wait never fires — while the page underneath is working perfectly. Pass `{ polling: 100 }`.
  (Cost an hour, 2026-08-30. Same family as the MCP hidden-tab trap.)
