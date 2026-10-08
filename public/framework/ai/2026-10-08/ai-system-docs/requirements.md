# AI system documentation — show the structure as classes

Owner (2026-10-08, after browsing `/framework/ai/` and `/framework/ai/system/`). You are a **system mastermind**: a fresh Sonnet 5.5 pointed at a directory, not a resumed session. Read `CLAUDE.md`, then the readme chain down to `public/framework/ai/` and `Servex/`. Budget **$5** total; run `node Server/usage-now.mjs` before each spawn; minions are Haiku 5.5 (Sonnet only for UI/OO code). Docs-first: additive edits and proposals; no API changes, no moves, nothing destructive. One-sentence chat replies.

## What the owner saw and wants
- The AI system page (`/framework/ai/system/`) is wide, words explain things the reader already knows (its first sentence adds nothing), and it lists assistants / masterminds / minions / agents / roles without showing anything tangible. Some linked pages (e.g. `AI/minions`) look stale. The mastermind-vs-minion line is not important and must not be treated as a hard boundary (CLAUDE.md "No hard fences").
- **Show structure, not prose.** The framework is object-oriented: where a thing is a class, show it as a **class card** (icon + class name + the core API, with the most important properties/methods picked by judgement; no weighting system) and show **live instances** where they exist (a running Servex and the agents it holds; Servex's classes such as Pool, Usage, Agents, Dispatcher, Heartbeat). Find the existing mechanism for class docs (the owner asked recently for a class-rendering template; search `ext/Doc` and the task/ask logs) and reuse/extend it; do not build a second.
- Systems and where they live must be clear at a glance: Servex (the always-on process), the Agent SDK, OpenRouter and local models, sessions, models (`/framework/ai/models`), the dashboard, the inbox, tasks. Include a short **SDK** section/page (how Servex spawns agents through the Agent SDK `query()`, how tools reach it via in-process MCP, how session files are written, `sdk-ts` vs `claude-vscode` entrypoints).
- **Every module readme is its memory**: short index (<100 lines), essence and guiding principles, links to `doc/` and an `architecture.md`-style doc of decisions that links the original prompts / refined prompts and summarises the idea. Create or refresh these for `ai/`, `ai/sessions/` (owned by minion-session-class: coordinate, don't fight), and the Servex docs.

## Deliverables (numbered)
1. A restructured `/framework/ai/system/` page that is mostly **cards of classes and live instances** with minimal words; four-width check; merge-gate (worktree, commit, diff review by you, smoke test, merge).
2. Readmes + `architecture.md` for `ai/` (and `Servex/` if its docs lack it), each linking the others; stale pages listed in `findings.md` and fixed where obviously safe.
3. `findings.md`: what you changed, what is stale or missing, which AI-system pieces are NOT yet classes and should be (a short list, no refactor now), and any `Note:` for the owner.
4. Reuse the other agents' outputs (read their reports, don't redo them): `2026-10-07/docs-vs-code-audit/report.md`, `2026-10-08/task-audit/`, `2026-10-07/token-accounting/`.

Commit with attribution; no loose files; land with `finish-task`.
