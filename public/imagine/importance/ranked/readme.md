# Ranked — a threaded ranked list, paged in columns

One night's run, read out of its own `task.jsonl` and walked as columns: **topics →
asks → the tasks serving them**. Each column is a ranked list, every row numbered
with its place in the order the log asks for. It is the demo the ranking system was
built against, and it is **read-only**.

## Use

Nothing to call — open it:

[`/imagine/importance/ranked/`](/imagine/importance/ranked/)

The data verbs and the drag that writes an order live in
[`ext/AITask/doc/ranking.md`](/framework/ext/AITask/doc/ranking/).

## Watch out

- **It reads the mastermind's own log and never writes to it.** Ordering belongs on
  a task's own Asks tab, where the log belongs to the page showing it.
- **`columns({ even: true })` here is honoured only standing alone.**
  `Page.column_host()` is `chain().find(page => page.columnar)` — root-first — and
  `/imagine/` became a host first, so this row is /imagine/'s and runs its elastic
  mode. A nested host is a core change and the owner's call.
  [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/)
- **Every level's children are a function**, resolved once on the first ask —
  `children(){ return topics(); }` and the same one level down.
  [`core/Page/doc/data-children.md`](/framework/core/Page/doc/data-children/)
- **`ranked_column` is a `function`, not an arrow**: it is assigned onto a page as a
  method, so it takes `this` from the page it is called on. It is core's own
  `column()` with two lines added (the number, the one-line description), copied the
  way [`/imagine/page.js`](/imagine/) copies it — if core's `column()` changes shape,
  this drifts with it.

## More

- [`ext/AITask/doc/ranking.md`](/framework/ext/AITask/doc/ranking/) — the strip, the
  `rank` line, what threaded means, and why this is a drag and not pairwise
- [`/imagine/importance/`](/imagine/importance/) — the other way to rank: two things,
  "which matters more?", over and over
- Files: `page.js` (the host and its one sentence), `ranked.js` (the three levels and
  the numbered column), `ranked.css` (the row grid and the rank number)
