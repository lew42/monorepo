# Minion brief: the loading algorithm, documented on core/Page

Load the `minion` skill first, then `documentation`, `page`, `content`. Task dir (the whole conversation, the owner's raw words): `public/framework/ai/2026-09-29/page-system/`. Your source is `loading-study.md` there, sections 1 and 2. It quotes the owner verbatim; re-check any file:line it gives before you copy it.

The owner: "make sure we, in the documentation for the page, are making it clear how that loading algorithm works because that's foundational to understanding what goes where." And: "let's kind of compare the two [page.js and page.jsonl]. Anything that could be ported over to the JSON L system might be better … we might need the page.js system, so we don't want to get rid of it just yet."

**Fence:** `public/framework/core/Page/readme.md` (only a new top section), `public/framework/core/Page/doc/loading.md` (new), and the Doc tab listing for it if the Docs tab needs one. Plus one line in `core/Page/dynamic/doc/idea.md` linking to loading.md instead of restating the order. Nothing else.

## Deliverables
1. **`core/Page/doc/loading.md`**: "How a url becomes a page." Open with the order as a numbered list the reader takes in at a glance (memory → a declared page.jsonl → md/fs → route() → page.js → .md → not found), one plain sentence per step, each with a link to the code line. Then the two traps: a declared child skips route(); a page.jsonl is never looked for unless something declared it. Then **page.js or page.jsonl?**: a two-column table (what each one can do), then "what goes where": use page.jsonl for title, icon, placed content, file lines and data; page.js for a real layout, route(), or any logic. Neither is being removed. Say that a page.js folder keeps its own data in a separate file such as weight.jsonl, and why (the file watcher writes only to page.jsonl folders).
2. **Top of `core/Page/readme.md`**: a short section "How a page loads": the one-line order and a link to doc/loading.md. It goes above "The sub-systems". Don't touch the rest of the readme.
3. The Docs tab at `/framework/core/Page/doc/` lists loading.md (check it; add it the way the other docs are listed).

## Proof
Load `/framework/core/Page/` and `/framework/core/Page/doc/` (open loading.md from its tab) at 1920 with zero console errors, and shoot `shots/loading-1920.png` into the task dir. Commit only by exact path. Reply with the hash and three lines, then stop. Budget about $2. Every process you spawn sets `windowsHide: true`.
