# Minion brief: module experts, built and proven on the Page module

Load the `minion` skill first. Task dir (read `owner-words.md` and `requirements.md` there, in full, first):
`public/framework/ai/2026-09-29/module-experts/`. Log in that dir's `task.jsonl` as you go (`node .claude/hooks/append.mjs`).

**Work ONLY in the worktree `C:\Code\lew42\worktrees\module-experts`** (branch `worktree/module-experts`, its own site at http://localhost:62087/). Commit there by exact path. Do not merge; your mastermind does that.

## What an expert is

An expert is a Claude session that has already read one module. We start it once, feed it the module's recipe, and keep its session id as the module's **base checkpoint**. Each question **forks** that checkpoint (`host.fork({question, session_id, model, cwd})` in `Servex/agents/Agents.js` already does this, and the fork reuses the prompt cache when its tools match). The base is never touched, so every question starts from the same clean, cached context.

## Deliverables (the numbers match requirements.md)

1. **Recipe file: `public/framework/core/Page/expert.json`.**
   ```json
   {"module":"core/Page","title":"Page expert","covers":"the Page class and pages as a concept: urls, paths, routing, page.js / page.jsonl, children, layouts, columns",
    "chain": true,
    "load": ["readme.md", "doc/declaring.md", "Page.class.js", "…"],
    "also": ["../Router/readme.md", "…"],
    "on_demand": ["doc/columns.md", "doc/css.md", "doc/decisions.md", "…"],
    "model": "claude-sonnet-5", "deep_model": "claude-opus-5-5"}
   ```
   `chain` = the readme chain from the root down to this module comes first. `load` is read in full (paths relative to the module). `also` holds sibling modules' files that pages cannot be understood without. `on_demand` is listed by path and one-line purpose, not loaded. Pick the files by reading the module. Aim for about 40–60k tokens loaded, and put anything bigger on demand. Page.class.js, words.js, Frame.js and the docs about declaring, data-children, jsonl, open/routing, roles and layout are likely in `load`. Include how Router and `display: contents` columns work, since the proof asks about them.

2. **`Servex/agents/experts.js`**: plain functions, no provider types leaking out (keep it SDK-agnostic: the only SDK call is through `host.spawn`/`host.fork`).
   - `recipe(module)` reads `<module>/expert.json` (module = a path under `public/framework/`, e.g. `core/Page`).
   - `readme(modules[])` is **the "read me" verb** (ask 2). It returns one prompt text for one or several modules: for each module, the readme chain (import `readme_chain` from `./readme-chain.js`, built by the sibling task readme-chain; if that file isn't on your branch yet, run `git merge worktree/readme-chain` in your worktree, and if that branch hasn't committed it yet, write a 15-line local fallback and flag it in your log), deduplicated across modules, then each `load` file IN FULL under a `### <path>` heading, then an "On demand" list. The iceberg: the important things in full, the rest named. A module with no expert.json falls back to its readme plus its `doc/*.md` names. Also export a CLI: `node Servex/agents/experts.js readme core/Page Servex` prints it.
   - `build(host, module, {model})` spawns a one-shot agent (`role:"expert"`, cwd = the repo, `permission_mode:"bypassPermissions"`, so that forks later inherit the same posture). Its prompt is `readme([module])` plus "You are the <title>. Read nothing else now. Reply only: READY." It waits until the agent is idle, then records the checkpoint (ask 3).
   - **Index: `Servex/experts.json`** (ask 5): one row per checkpoint, `{module, kind:"base"|"derived", base?, session_id, model, cwd, built_at, files:[{path, sha1}], tokens?, cost}`. Derived checkpoints (ask 3): `build(host, module, {extra:[paths], from: <base session>})` resumes the base with a fork, feeds the extra files, and records a `derived` row.
   - `fresh(module)` (ask 4) re-hashes the recorded files and returns `{fresh, changed:[…]}`. `ask(host, module, question, {model, deep})` checks freshness first. If the checkpoint is stale, it rebuilds, then forks it. It returns `{answer, ms, cost, stale_rebuilt, cache_read}`. `deep:true` uses the recipe's `deep_model` (ask 7). The model must match the checkpoint's for the cache, so a deep question on a Sonnet base builds (or reuses) an Opus base. Record `model` per row.
3. **MCP tools** in `Servex/agents/tools.js`: `ask_expert({module, question, deep?})` returns the answer text plus a one-line footer (model, seconds, cost, cached tokens, "rebuilt: stale" if it was). `list_experts()` returns the index with fresh or stale per row. `readme_modules({modules})` returns the read-me text, so a new mastermind can load several modules at once. Add the tool names to `tools.js`'s description comment and anywhere a tool count is stated. If `policy.js` gates tools by role, allow these for everyone.
4. **Prove it on a PRIVATE host, never the live Servex.** Write `Servex/agents/experts-proof.mjs` (model it on `fork-proof.mjs`: its own `registry_dir` in os.tmpdir, and its own experts index path via an env var or an option). It builds the Page checkpoint, then asks these 5 questions, each twice: once to the expert (a fork) and once to a **cold** agent (a fresh spawn, same model, cwd the repo, the plain question plus "Answer from the repo; read what you need.").
   1. How does a page.jsonl page route its children?
   2. What does `display: contents` do in column pages?
   3. How does a url nobody declared get resolved (route() and child())?
   4. What makes a folder with a page.js exist as a page, and why does a declared child with no page.js 404?
   5. How does `swap_link` keep a doc routed?
   Write `public/framework/ai/2026-09-29/module-experts/proof.json` (rows: q, who, model, ms, cost, cache_read, answer) and `proof.md`: a table of question × {expert s, $, cold s, $}, then each answer pair. Judge correctness yourself against the source, one word per answer (right / partly / wrong) with a one-line reason. Include the checkpoint's one-time build cost. Also run one freshness test: touch a recorded file's content in a temp copy (or change the index's hash), confirm `fresh()` says stale, and show that `ask` rebuilds.
5. **Docs.** `Servex/agents/doc/experts.md` (one screen: what an expert is, the recipe, the verbs, freshness, and the proof table linked). One line in `Servex/agents/readme.md`'s Files list and a short section. `core/Page/readme.md`: one line under Read next saying "This module has an expert: `ask_expert core/Page …`". Also add one line to each of `.claude/skills/mastermind/SKILL.md`, `.claude/skills/sub-mastermind/SKILL.md` and `.claude/skills/every-prompt/SKILL.md` (in the worktree): "A question about one module goes to its expert if `list_experts` has one (`ask_expert`). For several modules, spawn a mastermind with `readme_modules`."

## Rules
- Never restart or touch the live Servex. Every node spawn sets `windowsHide: true`.
- Budget: about $6 total for you, the proof included. Use Sonnet for the expert and cold runs, and no Opus runs in the proof except one deep question if you have room.
- Stay out of `readme-chain.js`, `Agents.js` and `Layers.js` (the sibling owns them). If you truly need a hook in Agents.js, say so in your final message instead.
- Finish with a final message: what's built, the proof table, and anything left. Start with `BLOCKED` if you are stuck.
