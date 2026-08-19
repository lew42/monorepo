# Research — a question argued by several minions into one append-only file, rendered live: conclusions first, every claim a card that opens forever, the minions visible while they dig

## Use
```
node public/framework/ext/Research/research.mjs open <slug> --title T --question Q --minions 5 --minutes 30
node public/framework/ext/Research/research.mjs say <slug> --by scout --kind claim --text "…" --refs "file:line" --importance 4
node public/framework/ext/Research/research.mjs outline <slug>      # what a minion reads — never the file
node public/framework/ext/Research/research.mjs --help              # every verb, the quoting rules
```
The page: `/framework/research/<slug>/`. The same verbs as MCP tools (`research_say` …) once the dev server restarts — [`doc/writers.md`](./doc/writers.md). The rounds — scouts, skeptic, builder, verdicts — [`doc/process.md`](./doc/process.md).

## Watch out
- Every line is validated in code, not in a prompt: an unknown kind, 241 chars, a `dissent` without `--why`, a missing parent — refused, exit 1, nothing written: [`doc/verbs.md`](./doc/verbs.md)
- Minions read `outline`, fenced to a subtree; reading the whole file each round is the context pollution the design exists to avoid: [`doc/process.md`](./doc/process.md)
- `icon` is a Material **Icons** name, not Symbols — `mode_fan` renders as its word and falls back to the kind's icon: [`doc/render.md`](./doc/render.md)
- Only the orchestrator writes `verdict` and `summary`; nothing is deleted — a low score sinks, `parked` says when it would rise: [`doc/decisions.md`](./doc/decisions.md)
- No owner input box yet: the only browser write RPC rewrites whole files, which would clobber concurrent appends: [`doc/decisions.md`](./doc/decisions.md)

## More
- [Overview](/framework/ext/Research/) · [`doc/decisions.md`](./doc/decisions.md) the record · [`doc/process.md`](./doc/process.md) the rounds · [`doc/verbs.md`](./doc/verbs.md) the schema · [`doc/writers.md`](./doc/writers.md) CLI + MCP · [`doc/render.md`](./doc/render.md) the page
- First run: [LiveReload](/framework/research/livereload/) — 52 nodes, 7 minions, 2026-08-18
- Files that matter: `verbs.js` (the schema, browser + Node), `store.mjs` (read/write/outline), `research.mjs` (CLI), `Research.js` (reader + page), `Server/plugins/Research.js` (MCP tools)
