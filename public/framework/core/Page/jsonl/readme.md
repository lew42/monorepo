# jsonl — the page.jsonl SYSTEM, not just the format

## What

A folder can hold a `page.jsonl` instead of a `page.js`: one JSON object per line, read top
to bottom, no code to write. But `page.jsonl` is more than a file format — it's a whole
system with rules of its own: who is allowed to add a line, when each writer's line actually
shows up, what happens when two lines collide, and how big these files are let to get. This
page is itself a `page.jsonl` page, so it demonstrates the format while it explains the
system around it.

## Use

Five things, each one click away:

- **Format** — one line = one JSON object = one method call; line 1 builds the page. Full
  doc: [`doc/jsonl.md`](/framework/core/Page/doc/jsonl/).
- **Who writes** — the dev server's file watcher, the page tools, cards, the reference
  tracker, a weight adjustment, an agent by hand, or a person editing on disk. Each page.jsonl
  lists its own files: the file watcher appends `{"file": name}` and
  `{"file": name, "gone": true}`; [`task-mastermind-page-files-log`](/framework/ai/2026-09-29/page-files-log/)
  owns that system. Full doc: [`doc/writers.md`](/framework/core/Page/jsonl/md/doc/writers/).
- **Timing** — when a line is written vs. when a reader's browser actually shows it (streamed
  live on localhost; fetched once everywhere else).
  [`doc/timing.md`](/framework/core/Page/jsonl/md/doc/timing/).
- **Caveats** — appending is safe, read-modify-write loses almost everything; duplicate lines
  are harmless; a live server's lines can land in someone else's commit.
  [`doc/caveats.md`](/framework/core/Page/jsonl/md/doc/caveats/).
- **Size** — 484 of these files exist today, one is over 100 KB, and a purge plan is proposed
  but not built. [`doc/size.md`](/framework/core/Page/jsonl/md/doc/size/).

The smallest real case is this page's own first two lines: `{"title": "Notes", …}` then
`{"place": "note.md"}`. [`full/`](./full/) has every line the format knows — files that exist
but aren't shown, a linked child page, a file marked gone.

## Watch out

⚠ The dev server keeps a `page.jsonl`'s `file` lines synced to what is really in its folder —
delete a file on disk and a `"gone": true` line appears for it on its own. That's why this
page's own file can show more lines than the two above: the extra ones are the watcher's
bookkeeping, not something anyone typed. Never `git add -A`/`commit -a` a shared worktree's
`page.jsonl` for the same reason — commit it by exact path, always
([`doc/caveats.md`](/framework/core/Page/jsonl/md/doc/caveats/) has the full list).

## More

The code: [`Log.js`](/framework/core/Page/doc/jsonl/) (`Page extends PageLog`), beside
`Page.class.js`. The measured concurrency numbers behind the caveats:
[`ai/2026-09-19/model-latency/`](/framework/ai/2026-09-19/model-latency/).
