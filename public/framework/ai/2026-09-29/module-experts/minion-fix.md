# Minion brief: review fixes for module-experts

Load the `minion` skill first. Task dir: `public/framework/ai/2026-09-29/module-experts/` (the review findings are in `review.md` there). Work ONLY in `C:\Code\lew42\worktrees\module-experts` (its site: http://localhost:62087/). Commit by exact path and don't merge. Every node spawn sets `windowsHide: true`.

## Fix these (the numbers are the review's)
1. **Double title on `core/Page/make/readme-page/`.** The page title, then the readme's own `# …` line. Fix it in `make/readme-page/page.js`, not by deleting the readme's H1, because every readme has one and other pages will copy this pattern: when a page's content is its readme, the readme's first H1 must not repeat the page title. Pick the smallest way, for example removing the rendered first `h1` when its text equals the page title, or not printing the page's own heading. Do the same on `core/Page/layout/`. Screenshot both at 1920 afterwards and look at them.
2. **The Layout hub says everything twice.** Keep the icon sections, and cut `core/Page/layout/readme.md` to what the widgets don't already show: how to choose one, plus the word-collision note. The readme must still work as a standalone index for an AI reading it, so keep one short line per link, in a list, with no table that repeats the shapes. (After this merge, task-mastermind-page-system owns this page, so keep it tidy and make no other changes.)
3. **One pattern.** Where a page is only its readme, use `content(){ return md.file(import.meta, "readme.md"); }`. Use the `div().append(...)` wrapper only when JS follows it, and say that in one comment line. Make `make/page.js`'s example and `make/readme-page/readme.md` match what the pages actually do.
6. **Freshness is too wide.** `Servex/agents/experts.js` hashes every chain readme, so an edit to the root readme would make every expert stale. Hash only the recipe's `load` and `also` files, and keep chain readmes out of the freshness set. Say so in one line in `Servex/agents/doc/experts.md`.
8. **The root readme may be in the checkpoint twice.** `Agents.js` may prepend `first_prompt(dir)` to a spawn (lines ~95-110). Check whether `build()`'s spawn (role `expert`, cwd the repo) gets it. If it does, use an existing opt-out in the spawn spec if there is one. If there isn't, drop the chain from `build()`'s bundle, since Agents already adds it, and note it. Don't edit Agents.js. Prove it by printing the built prompt's `### ` headings once, with no model call if you can.
10. **The doc names the default.** In `Servex/agents/doc/experts.md`, `ask_expert` is the default. `load_module` is the exception, for starting a long-lived mastermind that will work on the module: it lands about 78k tokens in the caller's context. Cite proof.md's table.

Then run `node Servex/agents/readme-chain.test.mjs` and any experts test you have. Load `/framework/core/Page/`, `/framework/core/Page/layout/`, `/framework/core/Page/make/` and `/framework/core/Page/make/readme-page/` headless on http://localhost:62087 and confirm zero console errors.

## Finish
Sonnet, about $1.50. Your final message: one line per fix (fixed, or why not), plus the two screenshot paths.
