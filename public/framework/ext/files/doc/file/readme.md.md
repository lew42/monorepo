# `readme.md`

The design record for this module: what `files()` is, the four ideas worth
remembering (fetched not literal, a tree not tabs, the regions as panels,
`about` beside the source), and the traps that don't throw. Longer arguments
live in `doc/fetched.md`, `doc/tree.md`, `doc/panels.md` and `doc/about.md`;
this file stays to one screen and links out.

## Why it used to be the whole record, in one file

Before this pass, `readme.md` **was** the full "question → options →
weighing → verdict" record for every decision this module has made — six
sections, one file, titled "files — design record." That is the shape
`doc/fetched.md` and `doc/tree.md` now carry; the readme kept the verdicts and
the one-paragraph summaries, per the `documentation` skill's rule that a
section over two paragraphs breaks out and gets linked.

## Improvements

1. **None outstanding in the file itself** — it is new as of this pass. The
   real open question is upstream: whether every `ext/` module's readme should
   read this way (conceptual overview, short sections, Decisions/Traps/Open),
   which is a call for the framework as a whole, not for this file alone.
   *(large, speculative — a convention question, not a code change.)*
