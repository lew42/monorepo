# page.js

The reader's introduction — a `Doc`. `subject: Timeline` drives the API tab;
`overview:` holds two rail cards ("Orientation & lanes", "Windows & nested
children") beside the Overview's own default + zoom demos, so six demo
scenarios stay browsable rather than stacking into one scroll.

Rewritten from a plain `Page` during the 2026-08-15 documentation pass — the
prior version held all six demos in one `content()`, a wall the
`documentation` skill's "browsable, not a wall" rule flags directly.

## Improvements

1. **The "Named lanes" and "Windows & nested children" cards each bundle two
   demos under one `md("## …")` sub-heading**, the same pattern
   `core/Sidebar/page.js` uses inside a single `content()`. It's a deliberate
   middle ground between "one demo per rail card" (six cards for six fairly
   small scenarios) and "one wall" — worth reconsidering if a seventh demo
   ever gets added to either card. *(simple, speculative)*
