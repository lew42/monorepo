## What this file is

The maintainer's document for the module — now restructured (this pass) to a
one-screen conceptual overview plus short, linked sections, with the long-form
decision record broken out to `doc/vocabulary.md`, `doc/drawer.md` and
`doc/selection.md`. Before this pass it was one continuous ~170-line "Decisions"
section covering nine unrelated design questions in a single scroll — accurate,
but past the point where a maintainer could find one answer without reading all
of it.

## What moved, and why here specifically

Each breakout kept its original reasoning verbatim where it still held, cut
where it had gone stale (`layout.page()` referenced as if still live is now past
tense, since it was already deleted per the file's own record), and gained one
cross-reference back to whichever other doc file it now touches — the drawer
note links to DevBar's, the vocabulary note links to `ext/editor` and
`ext/Panel` as the two modules that lean on the registry. Nothing in the
original was dropped for space; it was relocated to the file whose url a reader
actually lands on when the question is "how does the drawer push."

## Improvements

1. **This file (the readme) is itself now listed in `files:`, per `ext/doc`'s
   own convention** (`ext/doc/page.js` lists `readme.md` too) — worth confirming
   that convention is intentional framework-wide and not accidental, since the
   `documentation` skill's own worked example (`View`'s `page.js`) does **not**
   include `readme.md` in its `files:` sample. Flagged as skill feedback in the
   audit file rather than resolved here. *(simple, important)*
2. **The three breakout notes (`vocabulary.md`, `drawer.md`, `selection.md`)
   are each close to a full screen themselves** — accurate to their subject, but
   worth revisiting if any one of them grows a fourth or fifth heading; the
   readme's own "one screen" rule arguably applies recursively to a note that
   becomes a small readme of its own. *(medium, speculative)*
