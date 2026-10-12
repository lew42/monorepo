# Minion C — the Review questions page fills a wide screen

Load the `minion` skill, then `layout` and `css`. Parent: task-mastermind-review. Task: `public/framework/ai/2026-09-30/review/requirements.md`.

**Work ONLY in the worktree `C:/Code/lew42/worktrees/review`** (its server http://localhost:64869/). Fence: `public/framework/ai/review/page.js` only (and its readme/doc if a sentence there becomes wrong).

## The problem (measured)
`/framework/ai/review/` shows 81 questions in ONE narrow column: at 1920 the page is 74% empty, at 3440 83% empty, and the question list is 10–13 screens tall (layout.json: `C:/Code/lew42/monorepo/public/framework/ai/2026-09-30/review/shots/localhost-64869-framework-ai-review/`). That fails layout question 1 on the page that lists it.

## Deliverable
The system sections sit in a wall that fills the width: the sections container takes the page's `wide` track word (or `bleed` + `.pad` if `wide` doesn't reach — the layout skill's step on track words says how to check), and uses the existing `.masonry` class (framework.css: CSS columns on `--column`, zero JS). Each system is one framed box, `card pad flow`, with its h2 inside. No new CSS class, no page CSS. Tiles and the intro line stay on top as they are.

Check: `node C:/Code/lew42/monorepo/Server/layout-check.mjs http://localhost:64869/framework/ai/review/ --bands --out C:/Code/lew42/monorepo/public/framework/ai/2026-09-30/review/page-wide/shots` — look at the sheet: at 1920, three or more columns of cards; at 400, one column with no stacked padding over 3em (`left_stack.total` in layout.json). Zero console errors. Commit by exact path; reply one line with the before/after `empty` at 1920 and 3440 and the sheet path; stop.
