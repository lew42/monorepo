# The readme page, slice zero: see what every agent is given to read

Budget: $8. This task is the first real run of the **build** process ([core/Task/doc/process.md](/framework/core/Task/doc/process.md)): node runs each phase, so do only your phase and record it with the item tool line your prompt ends with.

## What to build

A page at **`/framework/ai/readmes/`** that shows, for every folder with a readme, how many tokens of readmes an agent working there is given (the *readme chain*: every readme from the repo root down to that folder, given whole by `Servex/agents/readme-chain.js`).

- **Data, computed by node:** move the measuring script `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-context/chain-sizes.mjs` to `Server/ReadmeChains.mjs` (a class, `class ReadmeChains`, one file; `git mv` then edit) and have it write `public/framework/ai/readmes/chains.json`: one row per folder `{dir, levels, tokens, own}` plus, per row, the list of readme paths in its chain. Run it once and commit the JSON.
- **The page:** `public/framework/ai/readmes/page.js` (+ `readme.md`): a short line saying what the page is, then a sortable table of the rows (folder, readmes in the chain, chain tokens, own tokens), biggest chain first; a text box that filters by folder path. Clicking a folder shows its chain: each readme path (a link to the file) with its tokens. Use the existing table component the sessions page uses ([ext/DataGrid](/framework/ext/DataGrid/)) if it fits; do not build a new table.
- **Linked:** the page is listed in `public/framework/ai/readme.md` (one line) and reachable from its parent page.

## The owner's words

From the 2026-10-22 dictation ([readme-system.md](/framework/ai/doc/readme-system.md), "The owner's direction"): "What gets injected must be visible. A readme page: type a path, see every readme an agent there gets, what is in each, and its tokens, in layers." This slice is the first layer only (the chain); links followed from each readme are a later slice.

## Done when

- `node Server/ReadmeChains.mjs` writes `chains.json`; the page loads at `/framework/ai/readmes/` with no console errors, at 400 and 1200 px wide; the work is on its own branch, reviewed, ready to merge.
