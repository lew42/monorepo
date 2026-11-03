# Concept tile links 404

Owner's ask, verbatim:

> The bug: the concept tiles on the System design card link to
> /framework/ai/2026/09/24/system-design/servex/ (and hooks/, tiers/, and so on),
> and every one of those 404s. The same pages load at
> /framework/ai2/2026/09/24/system-design/<slug>/. Cause: ux/Content/Concepts/Concepts.js
> line 27, `href()`, builds the link from `this.page.folder_url()` (where the files live,
> under /framework/ai/) instead of the page's ADDRESS (`this.page.url`, see
> core/Page/Log.js `log_folder()`). Fix href() so it uses the address the page is being
> viewed at. Keep `it.href` winning.
>
> Proof before merging: headless Playwright
> (file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs).
> Load /framework/ai2/2026/09/24/system-design/, collect every tile href, then load
> EACH one and require no "Page Load Error" and no console errors. Also click one tile,
> not just load its URL. Screenshot one concept page at 1920. Then post one line with
> the result on card 2026/09/24/system-design via POST
> http://127.0.0.1:8090/card/append?id=2026/09/24/system-design, using node fetch.

## Deliverables

1. `ux/Content/Concepts/Concepts.js` `href()` uses `this.page.url` (the address the
   page is viewed at), not `this.page.folder_url()` (where its files live). `it.href`
   still wins when a concept item names its own href.
2. Proof run: headless Playwright loads `/framework/ai2/2026/09/24/system-design/`,
   collects every tile href, loads each one with zero page errors / console errors,
   clicks one tile, screenshots one concept page at 1920 wide.
3. One line posted to card `2026/09/24/system-design` with the result.

## Note on file state

`public/framework/ux/Content/Concepts/Concepts.js` is uncommitted (untracked) in the
main tree — it has no git history at all, so the worktree-merge path (`Server/merge.mjs`)
can't three-way-merge it (empty base + a whole new file on both sides always conflicts).
Edited directly in the main tree instead, under a `Server/hold.mjs` fence scoped to this
file's path, per the minion skill's "quick fixes … main tree" fallback.
