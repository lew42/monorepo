# LivePage cards on the phone: icons, title size, the dot, the corner chevron, code width

Budget: $4. Load the `minion` skill first, then `code` and `css`.

## Why

The owner looked at [/live/calibration/](/live/calibration/) on a phone (2026-11-09, relayed by voice-app) and asked for four small fixes. They apply to every LivePage card, not just this page. The code is `public/live/LivePage.js` and `public/live/LivePage.css`.

**Out of scope:** scroll behaviour. The owner wants to think it through first (the design note is on [/live/plan/fold/](/live/plan/fold/), card "Design note: auto scroll"). Don't touch scroll lock.

## The four fixes

1. **Icons: Material, not emoji.** Card titles carry emoji today (`"title": "🐛 Fix the page error…"`). Cards should show our Google Material icons instead: solid (filled), coloured by the colour scheme (`currentColor` or the card's accent, never a fixed colour). View already exports `icon` (`/framework/core/View/View.js`), and `LivePage.icon_name` (`LivePage.js:467`) already takes a Material name. Steps:
   - A `part-card` (and a `part-link`) with an `icon` field draws it as a Material icon before the title.
   - A title that **starts with an emoji** and has no `icon` field: draw the title without it, and map the emoji to a Material name with a small table (🐛 bug_report, 📄 description, 🎯 target, ✅ check_circle, ⚠️ warning, 💡 lightbulb, 🔧 build, 📌 push_pin… whatever the live pages use; `git grep` the `/live/` page.jsonl files for which emoji are in use). If an emoji is not in the table, keep it as it is. That's the "keep emoji only where the author asks" escape hatch, and it is also what an author does on purpose.
   - Write one line in `public/live/readme.md` (or the LivePage doc it links): give a card an icon with `icon: "<material name>"`, and don't put an emoji in its title.
2. **Card titles smaller than the page heading.** Today a card title is about as big as the H1. Make card titles clearly smaller than the page's H1 at every width. Use the existing type scale in `framework.css`, not a new number.
3. **Drop the storage dot on embedded cards.** The small circle that marks "stored inside its parent" (`LivePage.stored`, about `LivePage.js:473`) wastes a column on cards. Don't draw it on cards. The page header may keep its own icon.
4. **The chevron goes back to a small bottom-right corner mark, and code runs edge to edge.**
   - Today the › is vertically centred and the card reserves a full right column for it (`LivePage.css:140-147`, `LivePage.js:730-737`, `:914`). Make it a small chevron in the card's bottom-right corner, with **no reserved column**: text uses the full width, and only the last line keeps room for the mark.
   - An earlier attempt at this looked broken. Check yours at 400 and 1200 with headless shots before you call it done: the chevron must not overlap text and must not float outside the card.
   - The whole card stays one link (the stretched `::after`).
   - **Code blocks inside a card** get squeezed by page padding, card padding and the chevron, so they vanish on the right. Let a code block inside a card bleed to the card's edges (negative inline margin equal to the card's padding) and scroll sideways (`overflow-x: auto`), with no wrapping.

## Proof

- Before and after screenshots of `/live/calibration/` at **400 wide**, taken headless (Playwright with `file:///C:/…` imports, or the `site` MCP `shot` tool). Also a 1200-wide after shot. Save them in this task folder and commit them.
- Also shoot `/live/item-test/` (it has a code block and a card from its own file) and `/live/done/` (link cards), after only.
- `node public/live/LivePage.test.mjs` and `node public/live/design/PageUI.test.mjs` pass before and after.
- `node Server/smoke.mjs <worktree>` shows no FAIL.

## How

- Work in a worktree: `take_worktree` (or `node Server/worktree-up.mjs calibration-ui`). Commit by exact path.
- Another worker is changing `core/Page/` and `core/Plugin/` (fold step 2). **Don't edit those.** Don't edit `core/List/` or `Servex/agents/page_tools.js` either. This task is only `public/live/`.
- Don't edit the calibration page's own `page.jsonl`. The fix is in the renderer, so every page benefits.
- **Don't merge.** Log the branch, the commits, the shot paths and the test result as `log` lines on your task, then `close_task` with an outcome and evidence.
- Never: kill or restart the dev server or Servex, drive the owner's tabs, use git's stash, or delete recursively in the main tree.
