Budget: $5

# core/Page: the loading statics move out of Page.class.js (a narrower Page, step 2 of 3)

Load the `minion` skill first, then `code`. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`).

**Why:** plan step 7, [plan.md (c) "A narrower Page"](../plan.md), step 2. Step 1 (each helper made once per page, `_helper(name)`) is on `michael/dev`. `Page.class.js` is 786 lines; this step moves two groups of static methods into the files that already hold their kind, and leaves a one-line static forwarder on `Page` for each, so **no caller changes** (about 80 call sites use `Page.load`, `Page.from`, `Page.listing` and the rest). Words, activate/deactivate and retiring the forwarders (step 3, major surgery) are NOT part of this brief.

## The two moves

| Methods (in `Page.class.js` today) | Go to | As |
|---|---|---|
| `listing`, `fetch_listing`, `page_listing`, `loaded_listing` (around lines 219–267) | `core/Page/Listing.js` (class `PageListing`, already `Page.Listing`) | statics that take the page class as their first argument |
| `file`, `load`, `read_json`, `from`, `props`, `missing`, `slug` (around lines 494–563) | a NEW file `core/Page/Load.js`, `export default class PageLoad`, attached as `Page.Load = PageLoad` beside `Page.Listing = PageListing` (around line 764) | the same |

Stay on `Page`: `static UNLOGGED`, `static views` and `of(el)` (fields and a 3-line lookup), `jsonl`, `log_class`, the `md_*` statics (already forwarders).

**⚠ `Page` versus `this` must not change.** Some of these say `Page.` (the base class, on purpose: `Page.listings`, `Page.loaded_listings` and `Page.log_pages` are ONE memo shared by every subclass, and `load` checks `instanceof Page`); others say `this` (`from` builds `new this(...)`, so a subclass gets its own kind). Each moved method takes the class as its first parameter, and its forwarder passes exactly what the body used: `static listing(url, fresh){ return Page.Listing.listing(Page, url, fresh); }` for a `Page` body, `static from(source, adopt){ return this.Load.from(this, source, adopt); }` for a `this` body. Read every moved body and log which one each uses. A body that calls another moved method calls it through the class it was given (`P.read_json(...)`), so a subclass override still wins.

**No import cycle:** `Load.js` and `Listing.js` must not import `Page.class.js`; the class arrives as the argument. `fetch_listing` needs `names` from `../Router/listing.js`. `file()` imports `../../ext/markdown/md.js`, which resolves the same from `Load.js` since both sit in `core/Page/`.

## Do, one commit each

1. **Before:** `node public/framework/core/Page/doc/split-measure.mjs` (log the total line); `node public/framework/core/Test/TestRunner.mjs public/framework/core/Page` and `... public/framework/core/Item` (log both counts); smoke from the main tree, `MSYS_NO_PATHCONV=1 node Server/smoke.mjs <your worktree> /framework/core/Page/ /framework/core/Page/parts/types/ /framework/ai/sessions/ /framework/core/Events/ /framework/core/Page/overview/columns/` (log FAIL count). And the static surface: a headless `page.evaluate` on your worktree that imports `/framework/core/Page/Page.class.js` and returns `Object.getOwnPropertyNames(Page).sort()`; save it as `statics-before.json` here.
2. **Move, by script:** write `public/framework/core/Page/doc/split-statics.mjs` (the pattern: `doc/split-extract-2.mjs`, the 2026-10-12 split). It cuts each method by name, rewrites it as a static taking the class, writes the forwarder, and with `--dry` only prints the manifest. Run `--dry`, save the manifest as `manifest.json` here (method, old lines, new file, `Page` or `this`), then run it for real. Hand-fix only what the script cannot, and log each hand fix.
3. **Prove nothing changed:**
   - `node --check` every changed file.
   - The same tests and smoke as step 1, after; the counts must match.
   - `statics-after.json` the same way; it must equal `statics-before.json` plus `Load` (log the diff).
   - In the same evaluate, call `Page.slug("A b")`, `await Page.read_json("/framework/core/Page/page.json")` (null or an object), `await Page.load("/framework/core/Page/")` (a Page), `await Page.listing("/framework/core/Page/")`, before and after; log both rows.
   - `split-measure.mjs` total after. Two numbers that must agree: lines removed from `Page.class.js` minus forwarder lines added, against the lines added in `Load.js` and `Listing.js` minus their headers.
4. **Doc:** one row in `core/Page/doc/architecture.md` (beside the step 1 helpers row): the loading statics live in `Load.js` and `Listing.js`, `Page` keeps one-line forwarders, and why `Page` versus `this` is kept per method. If `core/Page/readme.md` lists the files in the folder, add `Load.js`.

Log `ready: <branch> at <sha> <Page.class.js lines before → after; statics equal; tests and smoke before/after>`.

## How

- Work in the worktree named in the message that hands you this brief. Commit after each step.
- Never kill or restart the dev server or Servex. Headless only, never the owner's tabs. Never stash (diff, don't stash). If `files.jsonl` churn shows in `git status`, leave it and commit only your files.
- **Resolve, don't park.** A method you leave on `Page` gets a log line with the reason. If you run short, cut step 4 first, then land the Listing.js move alone.
