# jsonl — a page made from log lines, not a `page.js`

The smallest real case: `{"title": "Notes"}` then `{"place": "note.md"}` — two lines, this page. [`full`](./full/) has every line the format knows: files that exist but aren't shown, a linked child page, a file marked gone. Full doc: [`doc/jsonl.md`](/framework/core/Page/doc/jsonl/).

⚠ The dev server keeps a `page.jsonl`'s `file` lines synced to what is really in its folder — delete a file on disk and a `"gone": true` line appears for it on its own. That is why this file may show more lines than the two above: the extra ones are the watcher's bookkeeping, not something you write by hand.
