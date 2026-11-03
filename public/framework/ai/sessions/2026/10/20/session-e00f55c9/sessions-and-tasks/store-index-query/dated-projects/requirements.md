# Slice 1 of the store/index/query plan: `Dated` + `DatedFiles` for projects only

Budget: $6. Sonnet, medium effort. Parent: `vscode-mastermind` (the owner's VS Code tab), who tails your `session.jsonl`: log there with the `log` tool, not chat. Work in your own worktree (branch `worktree/dated-projects`); commit each working step; merge with `node Server/merge.mjs`; do not restart Servex (say if a restart is needed).

## The plan is the brief

Read [core/Item/doc/store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md) first: section 2 is the class architecture (`Dated`, `Dated.Index`, `DatedFiles`, on `Item.Store`), the decision `d-dated-home` puts `Dated.js` in `core/Item/` and `DatedFiles.mjs` in `Server/`; section 4 row 1 is this slice; section 5 is the doc home. Build exactly that slice, for the **projects** collection only (`<module>/projects/YYYY/MM/DD/<slug>/`, `project.jsonl`); sessions come in slice 2.

## Do

1. `core/Item/Dated.js` (`class Dated`, with `Dated.Index` as a static member class if the plan says so) and `Server/DatedFiles.mjs` (`class DatedFiles`): `create`, `move` (the body of `Server/ProjectMove.mjs` moves in; `ProjectMove.mjs` becomes a thin caller, never a second copy), `query`, `check`. Names and signatures as the plan writes them; if you must deviate, log a `decision` line with the alternative.
2. The tool and the socket route call the same three methods (`DatedFiles.tools()`, `DatedFiles.socket()`), per the plan. Reuse the existing `move_project` door; never add a second one.
3. `core/Item/Dated.test.mjs` (plain node, like `Item.test.mjs`): create → index row → query finds it → move → rows on both days + manifest line → `check()` ok.
4. A page `/framework/core/Item/Dated/` (a `page.js` that instantiates the class; show the projects query and watch it update when a project is created). Check it with `check_page`.
5. Doc home (plan section 5): a short "The store" section at the top of `core/Page/doc/jsonl.md`; `core/Item/readme.md` and `ext/JSONL/readme.md` get their one pointer line; `core/Item/readme.md` lists `Dated` in its class list; `Server/doc/` gets `dated-files.md` (what it is, exact on-disk structure, which tool writes, which class reads). Tick the slice in the plan's table.

## Done when

- [ ] `node public/framework/core/Item/Dated.test.mjs` and the other `core/*/*.test.mjs` pass.
- [ ] The page renders at 400 and 1200 (`check_page`).
- [ ] Docs as above, verified against the code.
- [ ] Merged; `finish-task` in your own `session.jsonl`, one screen, check marks.
