# Tests — twenty-three layouts with a declared verdict, so the analyzer is scored against ground truth instead of scoring itself

## Use
```js
import cases from "/framework/ext/DesignTool/tests/cases.js";
// Each case declares what it IS: a "bad" case names the one rule it exists
// to trip, a "good" case claims to trip nothing. page.js runs every case
// through DesignTool.frame() at a chosen width and checks the claim held.
```

## Watch out
- Breakage is written inline in each case's `build()`, on purpose — a shared "broken" stylesheet would be one someone later copies by accident; the CSS that breaks the layout is the same few lines the reader is shown.
- A case's own `cards(n, style)` helper (`cases.js:24`) is a third, independent copy of the same shape `library/patterns.js` and `library/bad/traps.js` each write locally — see [`../library/`](../library/)'s Watch out for why that is not treated as a bug here.
- A case is measured at its own `.dt-case-body`, not the page — the live rail beside it is furniture, not part of the specimen.

## More
- Page: [/framework/ext/DesignTool/tests/](/framework/ext/DesignTool/tests/) · the catalog this scores against: [`../library/`](../library/) · the whole tool: [`../`](../)
- Files: `page.js` (loads each case in its own iframe, checks its claim) · `cases.js` (the twenty-three declared cases)
