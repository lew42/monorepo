# Readmes page: investigation

Each fact is marked **checked** (seen in the code or on disk) or **guess**.

## Questions, ranked

1. **Does the old script work as a class from `Server/`?** Its import is a 10-level relative path to `Servex/agents/readme-chain.js`; from `Server/` it becomes `../Servex/agents/readme-chain.js`. Checked: the script is 22 lines, and `readme_chain(dir)` and `REPO` are both exported.
2. **Where are the per-row chain paths?** Checked: `readme_chain(dir)` returns `[{path, text, truncated}]`, root to leaf. Tokens are `text.length/4`. The old script keeps only the sums. The new one must also keep `chain: [{path, tokens}]` per row. Per-readme tokens are needed for the click-through.
3. **Does it fit DataGrid?** Checked: `new DataGrid({columns:[{key,label,type:"number",sort,filter}], rows})`, and `href(row)` makes a row a link. Guess: its built-in column filter may cover the path filter, so the text box may be unnecessary. If it does not, add a plain input and call `grid.set_rows(filtered)`. Checked: `set_rows` keeps sort and view. Click-to-show-chain needs a detail view (below the grid, or `row(row)`). Guess: a click handler through `cells(row)` or `row(row)`, since `href` navigates away.
4. **Row count and size.** Checked: the old JSON has 403 rows, so it is small and there is no windowing concern. Guess: the single-line JSON with chains grows to roughly 100 KB or less.
5. **Does the skip rule hold?** Checked: the regex is `/[\/]sessions[\/]\d{4}[\/]/`, so dated session folders are skipped. But the old JSON's top row is `.../ai/sessions/2026/08/12/apps`, so the saved JSON predates the regex or the regex is imperfect. Guess: re-run and count; if dated folders still appear, fix the skip.
6. **Is `chains.json` loaded the right way?** Guess: `fetch(new URL("./chains.json", import.meta.url))`, as the rules say to resolve against `import.meta`.

## Sketches

- `class ReadmeChains` in `Server/ReadmeChains.mjs`. Static `walk()` builds the rows `{dir, levels, tokens, own, chain:[{path, tokens}]}`. Static `write()` writes `public/framework/ai/readmes/chains.json`. The CLI entry runs it when the file is run directly, and prints the old summary. Move it with `git mv` from `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-context/chain-sizes.mjs`.
- `page.js`: `export default new Page({meta: import.meta, title: "Readmes", icon, content(){…}})`. Checked: the shape matches `ai/now/page.js`, which has `meta`, `title`, `description`, `icon`, `content()`.
- Named parts (guess): `ReadmesView` (a DataGrid plus a filter input plus a chain panel). Keep it inside `page.js` unless it passes about 100 lines. The "one class per file" rule then puts a class in its own file.

## Reuse

- `Servex/agents/readme-chain.js`: the real injection logic. Reuse it so the numbers match what agents get.
- `ext/DataGrid`: the table, with sort and filter.
- `ai/now/page.js` and `AINow.js`: the page pattern, with `.href` links.
- Run `node Server/PastWork.mjs "readme chain"` before the build. Guess: nothing else computes chain sizes, since the old script is the only one found.

## Linking

- Checked: `ai/readme.md` has a "Classes and folders that draw them" paragraph with one line per page (`now/`, `AIDay/`). Add a `readmes/` line there, and make sure the tokens count there is stated.
- Checked: `ai/page.js` and `ai/page.jsonl` exist. Guess: the parent page lists children by declaration, so check how `now/` is reached and mirror it. Also the memory trap: a declared child without `page.js` gives a 404.
- Needs `readmes/readme.md` too (the brief asks for it); also add the `chains.json` writer to it (rule 9).

## Risks

- The first-row skip regex (above) may give rows that no agent will ever use.
- Tokens are `chars/4`, an estimate. Say so on the page.
- `Server/` changes need a dev-server restart only for server routes; this script is run by hand, so none.
- Rule: a build run needs a smoke test at 400 and 1200 and a review report before `merge.mjs`.
- Do not use `fs` from the page; the JSON is committed and the page is static.
