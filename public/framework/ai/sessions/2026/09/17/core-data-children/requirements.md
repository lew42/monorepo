# core-data-children — apply Seam 1: `children` may be a function that returns a promise

**Three laws.** Less is more (ASAP; the proposal already has the diff — apply it, don't redesign it). Clear beats brief by far. Prioritize.
**Length budget:** ~22 lines into core, ~63 net out of the two callers, as the proposal counted. Your landing report is one screen of plain sentences with links and the crawl numbers.

## The owner's words (2026-09-17)

> this is really the page system, right? So I believe I was giving you instructions to try and make the page system as the core template data structure. And so pages are everything and they don't have to be real paths, although they can be. And then even if they don't have a real path slash page.js, they can still use this if they can pretend as if they did and use a directory, create a directory at that path that reflects data for that item if we want to have dynamic items.

The full prompt: `../mastermind-layout-browser/requirements.md`. The proposal this applies: `public/framework/core/Page/doc/data-children.md` (2026-09-13, "Seam 1 recommended, Seam 2 refuted"). The owner's sentence above is read by the mastermind as the reaffirmation the proposal was waiting for; the report to the owner says so in one line, and the change is additive so it is one revert away.

## Deliverables

1. **Core.** Apply Seam 1 exactly as `data-children.md` diffs it, in `public/framework/core/Page/Page.class.js`: `declare(list = this.children ?? [])` with the function branch (`child_source`), `source_children()` memoised on `this.sourcing`, `child()` awaiting it, `load_all_children()` awaiting it with the guard above the await. Nothing at import; a string, array, object or Page-object `children:` behaves byte-for-byte as before. Seam 2 (`redraw()`) stays refuted — do not add it.
2. **The two callers.** `/imagine/paging/make/` (`page.js`, `made.js` — read its ⚠ about `grow()` first) and `/imagine/cms/json/` drop their `child()` / `load_all_children()` overrides and the copied guard, and declare `children(){ … }` returning the same list. The proposal counted 79 lines out and 16 back; report your two numbers.
3. **Proof.** The 18 urls the proposal names (Make + its made pages, JSON pages + its data nodes + the editor) answer with their h1 rendered, headless, BEFORE your change and AFTER — the same list, the same h1s; the raw pairs as a json file in your task dir. Then the site crawl the repo already has (`check.mjs` at the root — read it; the memory rule is crawl `/framework/` and `/notes/`, sandbox dirs error by design) with zero new failures against a run you take before you touch anything. Two numbers that must agree: urls before, urls after.
4. **Docs.** `data-children.md` gets a dated line at the top: applied 2026-09-17, on the owner's sentence, with the numbers; `core/Page/readme.md` gets the one Use line (`children(){ return promise }`); `core/Page/doc/decisions.md` gets the record entry (the house rule says a new name on `Page` is proposed before it is written — it was, on 2026-09-13; cite it). `api/` if the readme's index points there for method docs.

## Rules

- Load `code` (parts as static subclasses, every method a seam), `documentation`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/core-data-children/`; write its `task.jsonl` launch line); `finish-task` at the end; `skill-improvement` for any skill that misled you.
- **Fence:** `public/framework/core/Page/**`, `public/imagine/paging/make/**` and `public/imagine/cms/json/**` (only the override removal and the new `children()`), your task dir. Nothing else.
- **Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`.** The owner's server (port 80) is NOT running; start your own: `PORT=8095 node server.js` from the repo root, in the background; kill it when you land. `ui-test` has the headless recipe. A hidden tab does not lay out.
- ⚠ Core is shared by every page and every other minion's private server: make the core edit in ONE write, syntax-checked first (`node --check` will not parse an ES module with `/app.js` imports — instead load the file in the headless browser and read the console), and never leave `Page.class.js` broken between two edits.
- Imports flow down; a parent↔child import cycle breaks only on deep reload — test one cold deep link to a made page (`/imagine/paging/make/<something>/`) with the cache disabled.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock; never Out-File for jsonl.
- Landing: `outcome` = a headline (the seam is in core, N lines in, N out), the links (the proposal doc, Make, JSON pages), the crawl numbers before/after, the 18-url table's verdict in one line, what was left and why. One screen.
