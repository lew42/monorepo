# Research — a question dug by several minions into append-only files, rendered live: conclusions first, every claim a card that opens forever, and how sure anyone is never left to the reader to guess

Two shapes, one module. A **topic** is one question argued to a verdict, then closed. A **program** is several subjects dug continuously and never closed — [`doc/program.md`](./doc/program.md).

## Use
```
# a topic — a tree, argued to a verdict
node public/framework/ext/Research/research.mjs open <slug> --title T --question Q --minions 5
node public/framework/ext/Research/research.mjs say <slug> --by scout --kind claim --text "…"
node public/framework/ext/Research/research.mjs outline <slug>   # what a minion reads — never the file

# a program — a flat stream per topic, one file each
node public/framework/ext/Research/entry.mjs <topic>/log.jsonl --kind finding \
  --title "…" --summary "…" --url https://… --credence contested
node public/framework/ext/Research/entry.mjs <topic>/log.jsonl --check
```
The pages: `/framework/research/<slug>/` for a topic; a `Program({ topics: "a b c" })` page for a program. `--help` on either writer lists every flag and the quoting rules.

## Watch out
- **Credence is the point of the program shape** — four words, three visual channels, and the page never upgrades one: [`doc/program.md`](./doc/program.md)
- Every line is validated in code, not in a prompt — an unknown kind, 241 chars, a `dissent` without `--why`: [`doc/verbs.md`](./doc/verbs.md)
- The reader is deliberately tolerant where the writer is strict: an off-schema line is SHOWN with its reason, so entries + unreadable = the file's line count: [`doc/program.md`](./doc/program.md)
- Minions read `outline`, fenced to a subtree; reading the whole file each round is the context pollution the design exists to avoid: [`doc/process.md`](./doc/process.md)
- `icon` is a Material **Icons** name, not Symbols — `mode_fan` renders as its word and falls back to the kind's icon: [`doc/render.md`](./doc/render.md)
- Only the orchestrator writes `verdict` and `summary`; nothing is deleted — a low score sinks, `parked` says when it would rise: [`doc/decisions.md`](./doc/decisions.md)
- A `Page` subclass here may not name a method `card()` or `topics()` — core reads the first, the config field overwrites the second, and neither throws where you are looking: [`doc/program.md`](./doc/program.md)
- No owner input box yet: the only browser write RPC rewrites whole files, which would clobber concurrent appends: [`doc/decisions.md`](./doc/decisions.md)

## More
- [Overview](/framework/ext/Research/) · [`doc/program.md`](./doc/program.md) the program · [`doc/decisions.md`](./doc/decisions.md) the record · [`doc/process.md`](./doc/process.md) the rounds · [`doc/verbs.md`](./doc/verbs.md) the topic schema · [`doc/writers.md`](./doc/writers.md) CLI + MCP · [`doc/render.md`](./doc/render.md) the page
- How an agent runs a round, and grades what it finds: the **`research` skill**.
- Live: [Ancient technology](/imagine/research/) — 4 topics, streaming, 2026-08-30 · [LiveReload](/framework/research/livereload/) — 52 nodes, 7 minions, 2026-08-18
- Files that matter: `verbs.js` / `entries.js` (the two schemas, browser + Node), `store.mjs` (read/write/outline), `research.mjs` / `entry.mjs` (the writers), `Research.js` / `Program.js` (readers + pages), `Server/plugins/Research.js` (MCP tools)
