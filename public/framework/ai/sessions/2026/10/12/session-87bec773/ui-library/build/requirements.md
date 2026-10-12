# Build the UI library slice (minion brief)

Budget: $15

Read first: [../plan.md](../plan.md) (the class architecture and decisions 1–8 — build to them), [../requirements.md](../requirements.md) (the owner's brief). Load the `code`, `layout`, `css` and `new-page` skills before writing.

## Work in a worktree
Call `take_worktree()`; write everything in its `path`; smoke there (`node Server/smoke.mjs <path> /framework/library/ /framework/ui/ /framework/ui/card/`); commit each working step with clear messages. Do NOT merge — report the branch and commits to your parent (mastermind-ui-library), who reviews and merges.

## Deliverables
1. `public/framework/library/` — `Library.js` (`class Library extends Page`, parts as statics: `Library.Collection`, `Library.Item`, `Library.Rail`, `Library.Stage`, each its own file named for the class), `page.js` (tiny: instantiate), `library.css` (every rule in a layer), `readme.md` (short index), `doc/tree.md` (decision 8 from the plan, plus what the slimmed `Page` holds now — read `core/Page/Page.class.js`, one short list), `doc/decisions.md` (decisions 1–7 with alternatives). Declare `library` in `public/framework/page.js`'s children and index it in `public/framework/readme.md` and `public/framework/ui/readme.md` (one line each).
2. **Three columns:** left rail = the items of the chosen collection (with a collection filter row on top: ui · figma); centre = the active item at 100% with width chips 400 · 1000 · 1920 · 3440 and zoom-to-fit when wider than the column (CSS `zoom`, never transform; reuse `ext/demo/stage.js` helpers if they fit); right rail = its variants (its page's `children`), then "related" by a simple rule (same collection band — `ui/page.js` BANDS). Clicking a right-rail card makes it active: left gets its siblings, centre it, right its own variants. Every view has a URL: `?at=ui/card/media` (reload and back land in the same place; use history.pushState + popstate, and mark the active card).
3. **Collections:** `ui` — the children of `/framework/ui/` (import the ui `page.js`, walk `children`; lazy child pages resolve by importing `<name>/page.js`); `figma` — the rebuilt Figma pages (`ext/Figma/palette/`, `ext/Figma/colors/`, `ext/Figma/autolayout/` and their children), optimalWidth 1920. Mobile first: ui items default `optimalWidth: 400`.
4. **`specimen`:** in `ext/demo/exhibit.js` `demo.page()` add `specimen: fn` (one additive line). For the top-level `ui/*` pages that keep their component function in a local const (card, toolbar, badge…), add `specimen: <thatFn>` to the page object — additive only, do as many as are one-liners; Item.render() falls back to the page's `preview()` thumb with its `zoom-*` class neutralised for the rest. Figma pages: render their `content()` into the stage box if that works cleanly; otherwise show the preview thumb and say so in the readme.
5. **Previews:** rail cards lay out the item at its `optimalWidth` and scale with `zoom = card width ÷ optimalWidth` (≤1), height capped. Use `.card` and the site's tokens; no new colours.
6. **Padding contract:** `public/framework/library/PaddingContract.js` (`class PaddingContract`, `static check(root)`): any element with `data-needs-parent-padding` whose parent's computed padding is 0 on the side it touches gets `.padding-misuse` (red shading, in `library.css`, util layer) and one `console.error("[padding] <item>: needs_parent_padding inside an unpadded box — add padding to the parent or a background to the item")`. Items carry `needs_parent_padding` / `no_parent_padding`; the Stage sets the data attribute. Add a deliberately-broken demo to the library's readme/doc only as a screenshot, NOT on the live page (the live page must smoke clean). Prove the check fires with a tiny node or headless test in your scratchpad, and log the result as an `experiment` line.
7. Hold reloads (`node Server/hold.mjs on/off`) only if you touch the main tree (you shouldn't).

## Proof (put in `../build/shots/`)
Screenshots of `/framework/library/?at=ui/card` at 400, 1200, 1920 and 3440 (`mcp__site__shot` against your worktree's url), plus one at `?at=ui/card/media`. Smoke output clean.

## Log
Log steps to your task.jsonl. Post a line at least every ~5 minutes. When done, report to the parent: branch, commits, shots, and anything left.
