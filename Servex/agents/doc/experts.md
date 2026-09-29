# Module experts — ask the agent that has already read it

An **expert** is a Claude session that has read one module, once: the readmes from the repo root
down to it, its key files in full, and a list of the rest. Its session id is kept as that module's
**checkpoint**. A question **forks** the checkpoint: a new session that starts with all that reading
already in it, answers once, and stops. The checkpoint itself is never written to, so every question
starts from the same clean context, and the prompt cache makes it cheap.

```
ask_expert({ module: "core/Page", question: "How does swap_link keep a doc routed?" })
```

## The recipe — `expert.json` beside the module

[`core/Page/expert.json`](../../../public/framework/core/Page/expert.json) is the first one:

| key | what it is |
|---|---|
| `chain` | `true`: the readme chain (root → module, first screens) comes first |
| `load` | files read IN FULL, relative to the module |
| `also` | a sibling module's files the module can't be understood without (`../Router/Router.js`) |
| `on_demand` | named with a one-line purpose, not loaded; the expert opens one with Read when it must |
| `model`, `deep_model` | the fast model, and the one `deep: true` uses |

A module with no `expert.json` still works: its readme in full, its `doc/*.md` on demand.
Size the `load` list by real tokens: this repo's code and markdown run about **2.25 characters per
token**, not 4 (core/Page: 169k characters is ~75k tokens).

## The verbs — `experts.js`, plain functions

| verb | does |
|---|---|
| `load_module(modules)` | the reading, as data: chain (deduplicated across modules), files, on-demand list, hashes |
| `readme(modules)` | the same, formatted as one prompt text — the "read me" verb |
| `build(host, module, {model})` | runs the reading into a session, records a **base** row |
| `build(host, module, {extra, from})` | forks a base, feeds more files, records a **derived** row |
| `fresh(module)` | re-hashes every recorded file: `{fresh, changed}` |
| `ask(host, module, question, {deep})` | stale? rebuild; then fork and answer |

MCP tools (in `tools.js`): `ask_expert`, `list_experts`, `load_module`, `readme_modules`.
CLI: `node Servex/agents/experts.js readme core/Page Servex` · `tokens core/Page` · `list` · `fresh core/Page`.

## Freshness

Each row of `Servex/experts.json` records every file it read and its sha1 (the recipe too). When one
changes, or the recipe grows a file, the row reads **stale** and the next `ask` rebuilds it first
(the answer's footer says `rebuilt: stale`). `list_experts` shows fresh or stale per row.

## Watch out

- **The cache needs the same posture.** A fork copies the row's model, effort, cwd, permission mode and
  `setting_sources: []` exactly; a different model is a different checkpoint (so `deep` has its own).
- **A fork's reported cost includes its base's.** `total_cost_usd` is cumulative across a resume, so
  `ask` subtracts the checkpoint's `session_cost`.
- **A checkpoint built in one host and asked in another** (the proof's private host, then live
  Servex) has a different tool list, so the first question there misses the cache once.
- **`load_module` output is large.** Claude Code refuses MCP output over 25k tokens unless
  `MAX_MCP_OUTPUT_TOKENS` is raised; the proof sets 150000.

## Measured

| way (Sonnet, 5 page questions) | first answer | cost a question | judge score /3 |
|---|---|---|---|
| **fork the checkpoint** | 3.1 s | $0.03 | 2.6 |
| `load_module` tool, then answer | 25.5 s | $0.20 | 2.6 |
| bundle preloaded in the first prompt | 2.8 s | $0.38 | 3.0 |
| cold: reads the repo itself | 13.4 s | $0.16 | 2.2 |

The checkpoint costs about $0.32–0.45 once. A preload cannot cache across sessions (the question shares
its message with the bundle), so it pays the whole bundle every time; a fork does not.

[The four-way proof](/framework/ai/2026-09-29/module-experts/proof.md) — fork vs `load_module` vs a
preloaded prompt vs a cold agent, five page questions, a blind Opus judge. Run it:
`node Servex/agents/experts-proof.mjs` (private host, own index in the temp dir).
