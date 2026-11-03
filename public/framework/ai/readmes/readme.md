# Readmes `ai/readmes/`

A page at `/framework/ai/readmes/`: for every folder with a readme, how many tokens of readmes an agent working there is given (the *readme chain*: every readme from the repo root down to that folder, each whole, from `Servex/agents/readme-chain.js`). Type a folder path in the box to filter; click a folder to see its chain, each readme a link with its tokens; the chosen folder is in the URL (`?path=Servex/agents`) and the chain sits beside the table at wide widths. The concept page that used to own this url is now `/framework/ai/readme-system/`. Tokens are an estimate (characters / 4). The audit columns say how far each readme is from the documentation rule.

| Piece | Job |
|---|---|
| `chains.json` | one row per folder `{dir, levels, tokens, own, chain:[{path, tokens}]}`, biggest chain first; committed, never hand-edited |
| `Server/ReadmeChains.mjs` (`class ReadmeChains`) | the writer: `node Server/ReadmeChains.mjs` walks the repo (skips dated session folders), calls `readme_chain()`, writes `chains.json` |
| `audit.jsonl` | one line per readme (see [readme-system.md](/framework/ai/doc/readme-system.md), "A readme audit"): computed checks plus Haiku's `shape`, `history`, `note`; append-only, latest per path wins |
| `Server/ReadmeAudit.mjs` (`class ReadmeAudit`) | the writer: `--computed`, `--haiku [--limit N]`, `--path <readme>`; same walk as `ReadmeChains`, link check from `Server/doc-check.mjs`, orphans from `ReadmeOrphans`; test `Server/ReadmeAudit.test.mjs` |
| `ReadmesView.js` (`ReadmesView extends View`) | the reader: fetches `chains.json` and `audit.jsonl` (columns Words, Unnamed, Dead, Shape; the note is the row's tooltip and the detail panel shows it), a filter box, an [ext/DataGrid](/framework/ext/DataGrid/), and the chain panel |
| `page.js`, `ReadmesView.css` | the page and its `rm-` rules |

Re-run the script after readmes change; the JSON is deterministic, so `git diff` shows only real changes.

## Notes from your asks

- A readme stays brief: it states the core architectural decisions and why, and links to architecture.md for the rest. ([your words](/framework/ai/sessions/730e8a7b-4cbf-4d09-90bd-d61d2bf9384a/?tab=coverage#p424), 2026-10-13)
- architecture.md keeps only conclusive decisions with why, alternatives and trade-offs, never the history of reversals. ([your words](/framework/ai/sessions/730e8a7b-4cbf-4d09-90bd-d61d2bf9384a/?tab=coverage#p424), 2026-10-13)
