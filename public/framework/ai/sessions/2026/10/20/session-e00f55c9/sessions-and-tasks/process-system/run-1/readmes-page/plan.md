# Readmes page: plan

Brief: [requirements.md](requirements.md) · facts: [investigation.md](investigation.md)

## Classes

- `class ReadmeChains` in `Server/ReadmeChains.mjs` (moved with `git mv` from `.../agent-context/chain-sizes.mjs`).
  - `static rows()` walks the repo (same skip rule), calls `readme_chain(dir)` and returns `{dir, levels, tokens, own, chain:[{path, tokens}]}`, biggest chain first.
  - `static write()` writes `public/framework/ai/readmes/chains.json`.
  - Run directly (`node Server/ReadmeChains.mjs`) it writes and prints a one-line summary.
- `class ReadmesView extends View` in `public/framework/ai/readmes/ReadmesView.js`: a one-line intro, a filter input, a `DataGrid` (columns: folder, readmes, chain tokens, own tokens; `type:"number"` sorting; default sort by chain tokens descending), and a chain panel under it.
  - `filter(text)` calls `grid.set_rows(rows.filter(by path))`.
  - `show(row)` fills the panel with each chain readme as a link to the file, with its tokens and a sum line.
  - The row click comes from the grid's `row(row)` or `cells(row)` hook. I never pass `href`, because it navigates away.
  - The JSON is loaded with `fetch(new URL("./chains.json", import.meta.url))`.
- `page.js`: `new Page({meta: import.meta, title:"Readmes", description, icon, content(){ new ReadmesView(); }})`.

## Files

- Moved and edited: `Server/ReadmeChains.mjs`.
- New: `public/framework/ai/readmes/{page.js, ReadmesView.js, readme.md, chains.json}`.
- Edited: `public/framework/ai/readme.md` (one line in "Classes and folders that draw them"). The parent link goes through `ai/page.js` or `page.jsonl`, in whatever way `now/` is reached.
- Branch `task/readmes-page` in a worktree.

## Steps (commit after each)

1. `git mv`, fix the import to `../Servex/agents/readme-chain.js`, make it a class that adds `chain`, run it. Check: JSON has about 400 rows; no `sessions/YYYY/` dated folder is in `dir`; `Servex` is about 8k+ tokens as in the old run. If dated folders still show, fix the skip rule.
2. Write `readme.md` (what the page is, on-disk structure, who writes `chains.json`, who reads it) and `page.js` with a bare table. Check: page loads, no console errors (`check_page`).
3. Add the filter, the chain panel and the default sort.
4. Link the page from `ai/readme.md` and the parent. Run `node Server/ReadmeOrphans.mjs`. Check the link from `/framework/ai/` works.
5. Prove it: `shot` at 400 and 1200; type `Servex` in the filter and see the rows drop; click a row and compare the panel's token sum with the row's chain tokens; re-run the script and confirm `git diff` on the JSON is empty (deterministic). A short review report goes beside the task.

## Does the plan cover the owner's words?

- "What gets injected must be visible": yes, the numbers come from `readme_chain()`, the same code agents get.
- "Type a path": yes, the filter box. A full path typed into it narrows the table to that folder.
- "See every readme an agent there gets": yes, the chain panel lists each path as a link.
- "Its tokens": yes, per row and per readme, marked as an estimate (chars/4).
- "What is in each": not in this slice; the link opens the file.
- "In layers": this is layer one (the chain only); links followed from each readme are a later slice.
- The brief's other asks (git mv to a class, committed JSON, DataGrid, linked from `ai/readme.md` and the parent, 400 and 1200): yes, steps 1–5.

## Improved

- **Parent link made concrete:** `ai/page.js` line 38 has `children: "now tasks classes …"`; add `readmes` to that string (the page then has its `page.js`, so no 404). Check whether line 91 (`name === "now"` → `card_page`) is only for the card rail; `readmes` needs no such branch because it has its own `page.js`.
- **Skip rule settled:** the regex `[\/]sessions[\/]\d{4}[\/]` already skips dated session folders (the old JSON just predates it). Keep it, and keep step 1's check that no dated `dir` appears. No redesign.
- **Smaller:** the row click uses the grid's `row(row)` hook, drawn once; no `href` and no second table. Keep `ReadmesView` in its own file (one class per file) but write it small. If DataGrid's built-in column filter already filters the folder column, the extra text box is still kept, because the brief asks for one: it just calls `set_rows`.
- **Cut:** the "short review report" in step 5 is not a build step. `Server/review.mjs` writes it, so only the shots and the determinism check stay.
- **Brief gap noted, unchanged:** "what is in each" stays out of this slice, as the brief says.
