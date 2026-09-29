# `page.js`

This module's own doc page — a `Doc` with no `subject` (there is no class or
namespace to reflect on; `files()` is one function), documented entirely
through `notes:` and `files:`, plus three live variants in the Overview rail.

## Why no `subject`

`files()` doesn't hang extra properties off itself the way `md.file` or
`code.file` do, so there is nothing for `Doc.member()` to find on it — setting
`subject: files` would add an empty *API* tab. `notes: "about tree fetched
columns"` and `files: "files.js files.css page.js readme.md"` carry the whole
page, which is the shape the `documentation` skill calls out for "a module of
loose functions."

Until 2026-09-28 `panels.js` exported a second loose function, `panels()`,
documented the same way. That file is deleted — the arrangement it held now
builds inline in `files.js` — so this page's `files:` list dropped it.

## The Overview dogfoods `about`, and now `open` too

The `content()` demo is the plain call. **With about** points `about` at
`doc/file/<path>.md` for this module's *own* files — the same wiring
`ext/Doc`'s Files tab uses — so the hook is shown doing the exact job it was
built for, on the files a reader is already looking at. **Folders open and
close**, added 2026-09-28, passes `open: 1` on the same nested example set the
main demo uses, so a reader sees the collapse behaviour work on files they
already recognise from the page above it.

The three demos now carry a second job each: the plain call is a
**two-column** browser, the "With about" card is **three columns**, and
"Folders open and close" shows the same two-column shape with one folder
starting closed. That is the clearest statement of what each option does, and
none of the demos had to say it in words.

## Improvements

1. **The "With about" card and this page's own Files tab now show the same
   files rendered two different ways** (as a standalone demo, and as the page
   chrome around it). Slightly redundant on a page this small; harmless, and
   it's the cheapest possible proof the feature isn't just wired for
   `ext/Doc`. *(simple, speculative — a note, not a defect.)*
2. **Three `files()` calls mount on this page at once** — two demos and the
   Files tab — each with its own url-query claim logic (`owns()` in
   `files.js`). Only the first one drawn ever wins the claim; the other two
   keep their own selection private rather than racing for `?file=`.
   *(simple, informational — this is the intended behaviour, not a defect)*
