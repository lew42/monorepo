# core/Page: trace the page.js → page.jsonl handoff

Budget: $2. Load the `minion` skill first. Read-only: you write only `answers/trace/out.md` and this folder's `task.jsonl` (through `node .claude/hooks/append.mjs`, run from `C:/Code/lew42/monorepo`). The owner's words are in section A of `../../../ask-ea3d4c58.md` (questions 1 and 2).

Start from `public/framework/core/Page/doc/loading.md` and `Page.class.js:361-397` (`child()`); `Jsonl.js` is the jsonl loader.

**Q1, the handoff.** Answer each with one file:line you opened:
1. A `page.js` parent has a child folder holding only `page.jsonl`. How does the url walk reach it? Does the parent name it (`children:`, a `file` line), or does the code pick by which file exists (`files.jsonl` listing)?
2. Where is the Page instance for a jsonl page created (the `new` or `Page.from`-style call), and which function reads the file and replays its lines into it?
3. Does it recurse: can a `page.jsonl` page have `page.jsonl` and `page.js` children, and by what code?
4. Who calls `child()`: name the `core/Router` function (`public/framework/core/Router/`).

**Q2, an example.** Find a real, short `page.jsonl` (under ~12 lines) that uses line 1, a property change, a `tab` line and a list `add`/`move` (grep `public/framework`, prefer `core/Page/jsonl/` or `ai/sessions/`). Copy it (shortened if needed) and explain each line in one sentence: what it changes, and whether its order matters on replay.

**Output** `out.md`, under 60 lines: Q1 as a numbered list (answer + file:line), then a code block showing the call chain as `Router.x() → page.child(name) → … → new Page(...)`, then Q2: the example in a ```jsonl block and a line-by-line table. Prove before you say something is missing (grep). Never kill or restart the dev server, never drive the owner's tabs, never stash. Do not commit.
