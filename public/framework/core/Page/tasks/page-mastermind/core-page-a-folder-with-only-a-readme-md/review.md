verdict: fix
1. [fix] Ask 2 says a readme page's `.md` siblings are "reachable through the `md` tab" and to "check that tab shows"; it does not. The page is a plain `Page`, so it has no tab strip, and `md/` works only if you type the url (`doc/subpages.md` last paragraph admits this; shots/after-framework-core-Events-1920.png has no tab and no link). Smallest fix: when the folder holds other `.md` files, add one link to `<url>md/` under the readme in `child_readme()` (`Page.class.js:418-426`). Or, if a tab is wanted, open the readme page as a `Doc` so `md_tab()` runs.
2. [note] The after shots predate the last commit, c8e8558 (the sidebar label fix). shots/after-framework-core-Events-1920.png still shows the sidebar entry as "Events — \`on\` / \`off\` …" with raw backticks. The code at HEAD should give "Events", but no shot proves it.
3. [note] The brief put the readme step *after* the `page.js` probe misses. The diff runs it *before* that probe (`Page.class.js:408`) and trusts the listing's `kind` to rule `page.js` out. That saves a 404 request, but if `files.jsonl` is stale (a `page.js` was just added and the listing is not rewritten yet), the readme wins over the new `page.js` until the listing updates. With no listing at all (production), `child_readme` returns null and the old probe runs, so production is unchanged.
4. [note] `child_readme` fetches the readme as soon as the child is asked for (`Page.file`, `Page.class.js:424`). When a parent loads its children several levels deep, every readme-only folder below it is fetched too. That is fine for 10 folders, but worth knowing if it spreads.
5. [note] The label regex `/\s+[—–-]\s+/` (`Page.class.js:425`) also splits on a plain spaced hyphen. A heading like "Pre - flight checks" would become "Pre". Splitting on em and en dashes only would be safer.

Widths given: no review shots were taken for this pass. I judged from the minion's own shots/ (400 and 1920, before and after).

## Requirements
- 1 "Shoot before" — yes — shots/before-framework-core-Events-{400,1920}.png and before-framework-log-*.png show the 404 "Page Load Error"
- 2 "child folder's own readme.md … opens as a page … titled from the readme's first heading" — yes — shots/after-framework-core-Events-1920.png shows the readme as the page, with the heading as its title
- 2 "use the listing to decide, so a folder without a readme makes no extra request" — yes — `child_readme` returns early on `!listing?.folder(name)` and on a listing with no `readme.md`
- 2 "`.md` siblings reachable through the md tab; check that tab shows" — no — no tab and no link (finding 1)
- 2 "keep the change small and in core/Page" — yes — one 11-line method in Page.class.js, no new class
- 3 "Shoot after … plus one more; prove page.js and page.jsonl pages unchanged" — yes — after-framework-ext-CSSDoc-*, after-framework-core-Page-*, after-framework-core-Page-parts-types-* are present
- 4 "one paragraph in subpages.md; flip the ⬜ line" — yes — the paragraph was added; `core/Page/readme.md` has no ⬜ line for this, so there was nothing to flip
- Prove "smoke counts, test counts, ready line" — yes — session.jsonl: smoke went from 3 FAIL (Events, log, CSSDoc) to those three passing; tests 2/0 before and after; ready at e5b6e2d2a (HEAD is now c8e8558)
- Class with live instances — n/a — no new class

## Navigation
- techniques — the sidebar. The new page appears there as a child of Core (after-framework-core-Events-1920.png). It has no tabs, which is the gap in finding 1.

## Words
- content — yes — the subpages.md paragraph is plain and says what the step does, what it skips, and its limit. It is one long paragraph that could split after "…this step is skipped."
