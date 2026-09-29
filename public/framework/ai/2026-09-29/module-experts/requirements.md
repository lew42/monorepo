# Module experts: requirements (the Page mastermind first)

The owner's words are in `owner-words.md`; read them in full, since more may follow. The idea: for any module, a ready "expert" agent already loaded with exactly what it needs, so a question about that module goes to the expert, which answers fast and accurately, instead of a generalist reading files cold.

## Asks (tick each against the owner's words)

1. **A recipe per module:** what an expert for this module loads. The default: the readme chain from root down to the module (task readme-chain builds `readme_chain(dir)` and `first_prompt(dir, extras)`; reuse it), plus the module's own readme, its docs, and its key source files IN FULL. Plus a list of what it can load on demand. The recipe is a small file in the module, e.g. `core/Page/expert.json` or a section of its readme.
2. **A "read me" verb:** `readme <module> [module…]` loads everything needed about those modules, the iceberg way (the important things briefly, the rest on demand). It serves spawning a new mastermind for one module or several ("the server and three of its plugins").
3. **A checkpoint:** run the recipe once into a session, and keep its session id as the module's BASE checkpoint. A question FORKS the checkpoint (resume with fork), so the base stays clean and the cache can hit. Derived checkpoints are allowed (a base plus more files).
4. **Freshness:** a checkpoint records the files it loaded and their hashes or mtimes. After a major change (a refactor, a restructure), it's stale and gets rebuilt. Rebuild it automatically, or flag it, when its files change.
5. **Discovery:** an index of which modules have experts (e.g. `Servex/experts.json`, or rows in the registry), and a tool, `ask_expert(module, question)` over MCP, that forks the checkpoint and returns the answer. Add one line to the mastermind, sub-mastermind and every-prompt skills: "a question about one module goes to its expert, if one exists". Several modules at once: spawn a cross-module mastermind with `readme a b`.
6. **The first expert: the PAGE mastermind.** It covers the Page class, and pages as a concept (URLs, paths, routing, page.js and page.jsonl, layouts, children). It lives in /framework/core/Page/. Build its recipe and checkpoint, and prove it: ask it 5 real page questions (e.g. "how does a page.jsonl card route its children?", "what does display: contents do in column pages?"). Compare its answers, speed and cost with a cold agent asked the same, as a table.
7. **Model level:** chosen per expert or per question (the fast assistant uses a cheap base; deep questions use Opus).

## Rules
Keep it SDK-agnostic where cheap (the harness plan may swap providers). Work in a pool worktree; prove Servex changes on a private Servex, then restart the live one once. Budget about $10, with at most 3 minions. Post progress on card 2026/09/29/module-experts-a-ready-page-mastermind-t. Architect: mastermind-servex-4.
