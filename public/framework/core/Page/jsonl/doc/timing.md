# When a line lands, and when you see it

Two different clocks matter here: when a line is WRITTEN, and when a reader's browser
actually SHOWS it.

## When a line is written

- A **file watcher** line (a file appeared, disappeared, or its folder is now a page) lands
  within about 60 ms of the real change — the watcher waits that long on purpose, so one save
  doesn't fire off five separate lines for the same edit. Detail:
  [`doc/writers.md`](/framework/core/Page/jsonl/md/doc/writers/).
- A **tool, card, or agent** line lands the instant the call returns — no debounce, no queue
  to wait behind (each writer appends to its own end of the file; see
  [`doc/caveats.md`](/framework/core/Page/jsonl/md/doc/caveats/) for what happens when two of
  them land close together).

## When a reader sees it

- **On localhost**, the page streams: [`ext/JSONL/live.js`](/framework/ext/JSONL/) watches the
  file, and the moment a new line lands it is run through `page.set(line)` — the same method
  every earlier line went through — and then `log_redraw()` empties just the log's own box and
  draws it again. The title, the sidebar, and the rest of the page never move; nothing reloads.
- **Off localhost** (the real, deployed site), the log is fetched once, when the page first
  loads, and that's it — nothing streams after that. A viewer has to reload the page to see a
  line written after they opened it.

Full mechanism: [`Log.js`](/framework/core/Page/doc/jsonl/) — the `attach()`, `changed()`, and
`log_redraw()` methods are the three places this actually happens.
