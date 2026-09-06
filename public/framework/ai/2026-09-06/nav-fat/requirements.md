# nav-fat — the homepage nav items got fat; find the cause in the spacing system and fix it once (Opus)

The owner, 2026-09-06 11:12: *"the homepage nav items got way too fat… our sizing skill/system is off."*

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; `/imagine/design/spacing/decision.md` (the 09-05 decision — read its **control rule**: chips, buttons, tabs, nav items hug their content in their own em and never ride the page ramp); `../spacing-constants/task.jsonl` (this morning's pass: 421 `page.js` constants converted to the ramps, 6 control paddings reverted — the suspect); `../size-standard/task.jsonl` (the size study's verdict, not yet applied); the homepage `public/page.js` and whatever draws its nav (`core/Sidebar`, `core/App`, `app.js`, the homepage's own css); the `css` and `layout` skills' spacing sections. Skills: `new-task` (this dir, group `layout`), `css`, `layout`, `finish-task`.

## The work

1. **Measure before you read.** On the shared server, screenshot `/` at 1280, 1920 and 3440 and measure the nav items (height, padding, font-size, gap) — then check out yesterday's tree in the scratchpad (`git worktree add <scratchpad>/nav-fat/before 2beff8d~8` or the commit before the spacing pass, `8137aec~1`; serve it on a port of your own, `PORT=8090`, kill it by pid) and measure the same. The delta is the fact; write it as a table.
2. **Name the cause once.** Expect one of: (a) the spacing pass converted a nav item's padding/gap to a page ramp (a control riding the page ramp — the exact thing the control rule forbids); (b) a component rule from the 09-05 components pass did the same to `.sidebar` / nav items; (c) the page-level ramp doubling at 3440 reached a control through inheritance. Cite file:line.
3. **Fix it at the cause, not the page.** If controls are riding a page ramp anywhere, the fix is the control rule applied where controls are styled (one rule, one place), and a census: every `padding`/`gap` the spacing pass converted that sits on a control-ish element (nav item, button, chip, tab, badge, menu item, toolbar) — list them, revert them to the control rule, count them. If the cause is a component rule, fix that rule.
4. **Say what is wrong with the system**, in one paragraph on the spacing decision page (`/imagine/design/spacing/decision.md`, a dated addendum): what the ramp is for (space BETWEEN and AROUND content) and what it is never for (the size OF a control), so the next pass does not do it again — and add the same as one line in the `css` skill's spacing section and the `layout` skill's "Spacing and bleed" section.

## Prove it

The nav at 1280 / 1920 / 3440 after = yesterday's measurements within 2px (table in the log; screenshots in the task dir); the census count of reverted controls; a crawl of `/`, `/framework/`, `/imagine/`, `/notes/`, `/blog/` at four widths, zero console errors; pixel-diff of `/imagine/` before/after your fix (should change only if it carried a fat control, say so).

## Fences and budget

Write: the files that carry the cause (name them), `page.js` files only for reverting converted control paddings, `/imagine/design/spacing/decision.md` (an addendum), `.claude/skills/css/SKILL.md` and `.claude/skills/layout/SKILL.md` (one line each), this task dir. Never `core/Page/**` (another minion is in it), never `framework.css` `:root` tokens (the size standard lands later), never `public/notes/**`. Shared server `http://localhost:8123/` for the after; your own worktree server on `PORT=8090` for the before (kill by pid). Never `find /`; never spawn agents; never `git stash`/`checkout` in the main tree/commit (a worktree in the scratchpad is fine — remove it when done: `git worktree remove`). Budget ~200k tokens. Report in ≤ 8 plain lines: the delta table in one line, the cause with file:line, the fix in one line, the census count, what you wrote into the decision and the skills.
