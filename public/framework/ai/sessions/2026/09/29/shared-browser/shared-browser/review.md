verdict: fix
1. [fix] Server/plugins/Shot.js:28 calls `launcher.launch()` with no channel — opens a stray window on every MCP `shot` call. The guard caught it but it stayed "out of fence"; move it onto browser.mjs.
2. [fix] DesignTool/vision/run.mjs:133 has the same bare `.launch()`, and its execSync at :59 has no windowsHide. It's a live tool, not scratch — move it onto browser.mjs too.
3. [note] Deliverable 4's headless-shell proof used `headless:false`, which only proves the path gate, not that a real chrome-headless-shell window gets caught. One more launch with default options would close that.
4. [note] Deliverable 4 also asked to watch the pool *start* a worktree; the proof watched three already-running ones. A fresh pool start is the stronger proof.
5. [note] The guard regex misses `launchPersistentContext(`/`launchServer(` — widen to `\.launch(PersistentContext|Server)?\s*\(`.
6. [note] Server/README.md:64 names the wrong check: it's `browser_guard`, not `hidden_guard`.
7. [note] Server/browser.mjs:104 runs `npm root -g` per process start (~0.5s) — same as old health.mjs, not a regression; caching the path would help short scripts.
8. [note] health.mjs's fix (210-218) goes beyond the brief with a waitForFunction poll, explained and proven on core/Page/. Looks right.

