# core/Page: three opinions (class split, storage, delta log)

Budget: $4. Load the `minion` skill first. Read-only: you write only `answers/opinion/out.md` and this folder's `task.jsonl` (through `node .claude/hooks/append.mjs`, run from `C:/Code/lew42/monorepo`). The owner's words are section A of `../../../ask-ea3d4c58.md` (questions 2, 3, 4). Read first: `public/framework/core/Page/doc/classes.md` (the 23 files), `doc/split-plan.md`, `doc/storage.md`, `doc/composition.md`. Then read `Page.class.js` method names only (`rg -n "^\t(static )?[a-z_]+\(" Page.class.js`), not bodies.

**Q3, the Page class.** The owner believes `Page.class.js` is thousands of lines; check the real count. Write:
1. A code block of `class Page extends Item` with its main API grouped by job (identity: name/url/path; children: `pages`, `children`, `add`, `child`; loading; rendering; links/nav; persistence), 4-8 groups, each a comment line and the method names. Say plainly whether `pages` is an alias of Item's own items, and what `page.children` is (cite file:line).
2. A **proposal only, no edits**: which groups could leave the file as composed sub-instances (`page.loader`, `page.nav` …) or static parts (the way `Page.Jsonl`, `Page.Listing` already did), what it would buy in clarity, its risk (caller count: `rg -c`), and the order to do it. Name one alternative (leave it) and when that wins.

**Q4, storage permutations.** `page.js`, `page.json`, `page.jsonl`, a subpage embedded in a parent's jsonl (a `tab` line), and dynamic pages (`route()`, `generator/`, `dynamic/`). One table: form · what it is good for · how it is found · real count (`git ls-files | rg -c`). Then an opinion in 3-5 sentences: should a page/item declare its own storage (a `store`/backend field), or is the file name the declaration? Is the current setup right?

**Q2, the delta log, opinion only.** The owner: a `page.jsonl` stores data less efficiently but buys real-time updates and full history; undecided. Give a verdict in 3-5 sentences with the one or two costs that really bite (replay time, file growth, compaction/snapshot) and what already exists for them (`doc/storage.md`, `doc/architecture.md`).

**Output** `out.md`, under ~90 lines, short code blocks, plain sentences (CLAUDE.md "Clear beats brief"). Every file:line must be one you opened. Never kill or restart the dev server, never drive the owner's tabs, never stash. Do not commit.
