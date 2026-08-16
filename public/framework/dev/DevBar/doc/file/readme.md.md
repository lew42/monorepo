The design record. Rewritten in this pass: three of its longest topics
(docking, sizing, the `ai` section's thread model) moved out to
`doc/*.md` notes, each left here as a one-paragraph pointer rather than the
full argument, per the `documentation` skill's rule that a section over two
paragraphs breaks out.

## What moved, and why here and not there

The three breakouts share a trait the rest of the readme's decisions don't:
each cites more than one file (`docking` spans `DevBar.js`, `devbar.css` and
`framework.css`; `sizing` spans `tools.js` and `settings.js`; `threads` spans
`ask.js` and the captor rule from `core/View`). A decision that lives in one
file's own logic (the `parts.js` import-cycle fix, the native `prompt()`)
stayed inline — it's already exactly where a reader looking at that file
would expect to find it.

## The "Who uses this" section is short because the module really has one caller

Not a gap — `public/app.js` mounting the rail once, on every page, is the
entire integration surface by design. A second caller would mean a second
rail, which is not a thing this module supports.

## Improvements

1. **No section names what `LocalStorageSaver` guarantees vs. what this
   module adds on top.** `settings.js`'s own file doc covers it, but a reader
   starting from the readme has no pointer there. *(simple, useful.)*
2. **"Open" and the Traps list both describe things a maintainer would
   discover by using the rail for a week** — resize-drops-focus, the socket
   row going stale. Neither has ever been reported as confusing in practice,
   which is itself worth a line if it stays true: *"known, watched, not yet a
   problem"* is a different claim than *"unresolved."* *(simple,
   speculative.)*
