The generated baseline — one row per page × width from a headless Playwright
run through this same module, committed so `audit/page.js` has something to
show the instant it opens rather than forcing a two-minute live re-measure
first.

## It is data, produced, never hand-edited

`readme.md` documents exactly how: `page.evaluate()` importing
`LayoutTool.js` and calling `analyze()` inside a real Chromium instance. This
file is downstream of `pages.js`'s url list and of the site's own current
state — regenerating it is a one-command re-run, not an edit.

## Only rows worth opening carry their issue list

A row scoring ≥ 80 keeps its summary (score, grade, counts, metrics) but drops
`issues` entirely; `audit/page.js`'s `open()` re-measures those live instead.
Keeping issues for all 232 runs produced an 854KB file the page downloaded
just to draw a table — this is the fix.

## Improvements

1. **This baseline is stale relative to today's `ext/doc` rename.** It was
   generated on 2026-08-14, before `ext/classdoc` became `ext/doc`, and still
   carries 14 references to the two old `/framework/ext/classdoc/...` urls —
   confirmed by grep. `pages.js`'s url list has since been corrected, but this
   generated file was not regenerated to match, so the audit table currently
   shows two rows pointing at pages that no longer exist (and is missing any
   row for `/framework/ext/doc/`, which never got measured under its new
   name). **This is the exact case the module's own comment on `pages.js`
   warns about** — a rename is silent here until a human notices a 404.
   *(simple, important — a one-command regeneration; see the audit report's
   top recommendation, which covers both halves of this fix.)*
2. **No timestamp check surfaces the staleness to a reader.** `audit/page.js`
   prints `all.find(r => r.at)?.at ?? "generated headlessly"` as a caption, but
   nothing compares that date against "now" to warn that two weeks (or, here,
   one rename) have passed. A simple "N days old" caption would have made the
   classdoc drift visible without needing to grep for it. *(simple,
   useful.)*
