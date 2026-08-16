A three-line markdown file whose only job is to be fetched by `page.js`'s
"From a file" demo — `md.file(import.meta, "example.md")` — so a reader sees
a real network fetch and parse, not a hand-authored example string sitting
inline in `page.js`.

## Why it exists as a separate file at all

The content is a claim about itself ("this block is a file, fetched and
parsed at render time") — a fact that's only demonstrable if it really is a
separate file on disk, fetched over the network, not a string literal that
merely looks like one.

## Improvements

1. **None.** Three lines, one job, done. *(n/a)*.
