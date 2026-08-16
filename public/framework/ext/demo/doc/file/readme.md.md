The maintainer's document: the four doors, the sugar over them, the files, the
traps, who calls it. The reader's document is `page.js` — a live tour built out
of the same doors, not a description of them.

## What it carries that `page.js` deliberately doesn't

A one-screen conceptual map (the door table, the file table), the traps that
would otherwise bite silently, and — new in this pass — a "Who uses it" count.
The full twenty-section design record (every reversal, every measurement) lives
in `doc/record.md`, cited here in one paragraph rather than repeated; `page.js`
cites the same file a second time, at the bottom of its Overview, via
`md.details()`.

## Improvements

1. **"Two soft dependencies, and why they stay soft" partially duplicates
   `doc/record.md` §3** — the readme's version is the trimmed summary, which
   is the intended relationship, but the two have drifted slightly in wording
   (the readme doesn't mention the captor detail the record does). Not wrong,
   worth a pass to make sure the readme's summary still matches if §3 is ever
   edited again. *(simple, useful.)*
2. **No explicit `## Decisions` / `## Traps` / `## Open` headings** — the
   content exists (the "bite you" list is Traps in substance) but under
   evocative names rather than the skill's own vocabulary, unlike
   `ext/doc/readme.md`, written the same day. Left as-is in this pass: the
   existing headings are more informative than the generic three, and
   renaming them for consistency alone touches text that doesn't need to
   change. Worth a project-wide call on whether audited readmes should share
   literal heading names. *(simple, speculative.)*
