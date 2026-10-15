# Page: server-side Page instances, and one app(path, delta) tool (design only)

Owner directive: voice dfa4d219, logged in [../task.jsonl](../task.jsonl). **Write the design and evaluate it. Build nothing.**

> Tools must not append to page.jsonl directly. The correct shape: the server holds a cached Page instance per path, loaded on demand (never all pages), with eventual garbage collection. A tool calls page.set(delta) on that instance. The instance stamps ts/by, saves to whatever store it owns (jsonl today, durable objects later), and notifies connected clients itself. The file-tail watcher becomes an implementation detail, not the primary update channel. Direct append may coexist during the transition, but tools use only the instance path.
> Bigger idea to evaluate: instantiate the whole App server-side (no render) and expose ONE generic tool, e.g. app(path, delta). The path is a dot-separated app path resembling the filesystem path, resolved by app.get (a deep get), and then set is applied. set can assign fields and call methods, so one tool replaces many.

## Answer these, from the code
1. How do deltas address nested data today? Nested objects (`{"content":{"add":…}}`) or dot paths? Cite the code: core/Page set/apply, the Servex page tools (`Servex/agents/tools.js` and whatever page_set calls), `core/Page/doc/ai-api.md`, `jsonl-pages.md`, `content-census.mjs`.
2. How would dot paths map onto nested-object deltas? Does `app.get` (or a deep get) already exist?
3. Does a server-side Page/App keep static-site compatibility? (Production is static, there is no server at runtime, the static site reads the same files.)
4. What breaks or changes: the live() tail, /live polling off localhost, the page inbox, the review gate.

## Deliver
- `public/framework/core/Page/doc/server-instance.md`. Lead with the plain answer, then: class architecture (names, one-line jobs, what extends and composes what), the smallest first slice, the transition (direct append coexisting), the tradeoffs and alternatives. Link it from `core/Page/readme.md` (or the doc index), and link this brief.
- Sonnet. Docs only, so commit straight to michael/dev (one doc and one readme line). No Servex restart.
- Report to mastermind-voice-20261015 in about 5 sentences: the answers to 1 to 3, and the recommended slice. Post one card on /live/ (page_add path "/live/").
