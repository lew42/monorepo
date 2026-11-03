# design/ + code/ readme chain — docs check

Read: root readme → framework readme → design/{readme, layout, color, navigation, content, ui} →
code/{readme, patterns, dos-and-donts, objects, css}. Nothing else.

## Findings

1. No single worked example ties the two systems together. Each of the five design pages and four
   code pages is clear on its own, but nothing shows one page.js + its CSS built end to end using
   all of them — a reader has to trust the parts fit, not see it once. Worth one canonical demo
   linked from both root readmes.
2. `code/patterns` readme's own index promises "The blessed page shape" but the readme body never
   shows it — no snippet, unlike its other item (the assign-based constructor, which IS shown
   inline). A newcomer writing their first page.js must jump to doc/patterns.md immediately for
   the one thing the index calls out.
3. Styling one icon button is split three ways with no single entry point: design/ui says which
   states exist, design/color says how they're painted, code/css says where the rule and frame
   live. Each links to the others, so it's findable, but a first attempt bounces across three
   pages for one button.
4. design/readme.md's "Content kinds" table points at ux/Content modules (Tree, Filter, Concepts,
   Question/Decision/Quotation/Spend) that live outside design/ and code/ — nameable from here but
   not usable without leaving the assigned scope. Fine as a pointer, just flagging the seam.

## Verdict

Yes — a new page or a new class+CSS is buildable from these readmes alone: design/readme.md gives
an ordered five-question checklist with a link per question, and code/readme.md's four pages cover
shape, traps, state-view and CSS placement, each one click from full detail in doc/*.md. The gaps
above are rough edges (one worked example, one missing inline snippet, one three-way split), not
missing knowledge.
