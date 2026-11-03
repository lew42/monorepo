# Page system smallest slice: a page whose content is a streamed list of views (task mastermind brief)

**Why (owner, 2026-10-08 and 2026-10-10):** page content should not be only a markdown string; a page's views are a list loaded from the page's own JSONL, rendered in a loop (as chat messages and session files already are), and editing the list persists by itself because that is how streaming lists and pages work. Templates (toolbars, headers, sidebars) are saved as JSONL view data. Not yet proven.

## Do
1. **Inventory what exists (cheap, a script + readmes):** `core/Page` (`page.jsonl`, `live()` tail, `thing.page`/`page.thing` composition), `ext/Refine`, the session viewers (`ai/AISession/*`), streaming lists. Read `core/Page/doc/indexing-2026-10-08.md`, `ext/Chat/doc/panel-composition-2026-10-08.md`, `ai/doc/tooling-architecture-2026-10-08.md`, `ai/sessions/2026/10/08/task-system-design/task-system-design/`.
2. **Design the class architecture first** (CLAUDE.md "Design the class architecture before you build"): a short page naming each class, its job, what extends/composes what, and the orchestrator; show it where the owner can see it.
3. **Build the smallest slice that proves it:** one page whose body is a list of views stored in its `page.jsonl` (first line a snapshot is allowed, later lines deltas), rendered by one class, with at least three view kinds (heading, text/markdown, card) and add/move/remove through a tool or method that appends deltas; a reload and a second tab show the same state live. Smoke-test and layout-check it.
4. **Then use it once for real**: render one existing small page (a readme-like page) through it to show it is not a toy.
5. Record decisions and the alternative (e.g. `page.js` as today vs JSONL views; a snapshot line vs all deltas) in the module's `doc/`, linked from its readme and from the AI/page indexes.

## Fences
Worktree, commit each working step after a smoke test, review the diff, merge via `Server/merge.mjs`. Everything linked from the site. Do not change existing `core/Page` behaviour: add beside it (note what you need). One class per file; `Thing.View = ...` after the class. Sonnet 5.5; `node Server/usage-now.mjs` before spawns; Haiku only for reading under 60k tokens; no OpenRouter. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
