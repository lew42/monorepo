The maintainer's document — what the tool measures, what it costs, and every
calibration decision with the reasoning kept, not just the verdict. Longer than
most readmes on this site because a layout analyzer accumulates exactly this
kind of hard-won, easy-to-relitigate knowledge — most of it moved to
`knowledge/*.md` already; what remains here is the module's own shape rather
than what it has learned about layout.

## Two breakouts landed in this pass

"What it costs" (the four-pass performance table) and "The address is a path,
not an index" (why every finding carries a `:nth-child()` chain) both moved to
`doc/cost.md` and `doc/addressing.md` — each now a real url, summarized here in
one paragraph and linked, per the six-artifact skill's readme rule. "Two
tiers, and why the second one caps" stayed inline: exactly two paragraphs, at
the line the skill draws.

## One new inline section, and it earned the space

"Content nobody can reach outranks everything" is the record of the tool's
central failure — a page hiding 4099px scoring 82/B — and the design that
answers it (weight the rule, not the severity), including the option that lost.
It sits inline rather than in `knowledge/` because it is a decision about *this
module's shape*, which is the line this readme draws; the numbers behind it live
in `knowledge/thresholds.md`.

## Improvements

1. **No `doc/file/readme.md.md` existed before this pass** — every other file
   in the module now has one; the readme itself is a file too. *(simple,
   important — done in this pass.)*
2. **"Three things that will bite you" duplicates content already in
   individual rule/file comments** (the `probe.IGNORE` policy note, the
   settle-timing warning) rather than only summarizing and linking to them.
   Harmless — the skill's own Traps category is meant to hold exactly this —
   but as the module grows, keeping the readme's Traps list a pure index
   (one line each, link to the fuller trap in the file that owns it) would
   resist drift better than two copies of the same warning. *(medium,
   speculative.)*
