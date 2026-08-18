# `page.js`

This module's own doc page — a `Doc` with no `subject` (there is no class or
namespace to reflect on; `files()` is one function), documented entirely
through `notes:` and `files:`, plus two live variants in the Overview rail.

## Why no `subject`

`files()` doesn't hang extra properties off itself the way `md.file` or
`code.file` do, so there is nothing for `Doc.member()` to find on it — setting
`subject: files` would add an empty *API* tab. `notes: "about tree panels
fetched"` and `files: "files.js panels.js files.css page.js readme.md"` carry
the whole page, which is the shape the `documentation` skill calls out for "a
module of loose functions."

`panels.js` exports `panels()`, which is a second loose function and still not
a subject: it takes an already-parsed bag from `files()` and is not something a
call site is meant to reach. It is documented as a note and a file, which is
where an internal seam belongs.

## The Overview dogfoods `about`

The `content()` demo is the plain call, unchanged from before this page was a
`Doc`. The one added rail card, **With about**, points `about` at
`doc/file/<path>.md` for this module's *own* files — the same wiring
`ext/Doc`'s Files tab uses — so the hook is shown doing the exact job it was
built for, on the files a reader is already looking at.

The two demos now carry a second job as well: the plain call is a **two-region**
browser and the rail card is a **three-region** one, side by side on one page.
That is the clearest statement of what `about` does to the arrangement, and
neither demo had to say it.

## Improvements

1. **The "With about" card and this page's own Files tab now show the same
   five files rendered two different ways** (as a standalone demo, and as the
   page chrome around it). Slightly redundant on a page this small; harmless,
   and it's the cheapest possible proof the feature isn't just wired for
   `ext/Doc`. *(simple, speculative — a note, not a defect.)*
2. **Three panel workspaces mount on this page at once** — the two demos and
   the Files tab — each with its own `MemorySaver`. They share no document, so
   nothing races; they do each pull the Panel stack's stylesheets, which are
   deduped by `View.stylesheet`. Worth knowing before a fourth is added.
   *(simple, speculative)*
