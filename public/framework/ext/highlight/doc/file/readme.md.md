The maintainer's document — every decision behind *why highlight.js*, why the
API is a namespace bolted onto `code` rather than a new top-level word, and
the sharp edge that costs the most support time. Three sections are broken
out to their own url because they run well past two paragraphs:
`doc/choice.md` (the highlighter comparison), `doc/hooks.md`
(block-awareness and the FOUC timing argument), `doc/chaining.md` (the
argument-position sharp edge, with the workarounds).

Served twice, same as every module's readme: cited by a maintainer reading
the directory, and collapsed at the bottom of the Overview tab via
`md.details(import.meta, "readme.md")`.
