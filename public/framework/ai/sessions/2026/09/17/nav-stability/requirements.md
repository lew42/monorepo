# nav-stability — measure how much the navigation jumps when a column opens, then show a row that never jumps

**Three laws.** Less is more (ASAP: fastest working version, then improve; show, don't tell). Clear beats brief by far (a newcomer says what the page is for in ten seconds; full plain sentences, basics first). Prioritize.
**Length budget:** the lab page's level 1 is one screen: two rows side by side, one button, two numbers. The proposal is one page. Your landing report is one screen of plain sentences with links and the two decisive numbers.
**The reader is the overwhelmed newcomer.** Shown, not told. Detail nests one click down.

## The owner's words (2026-09-17)

> We need a way to focus on navigation. If there's going to be two or more columns in these large layouts, how do they work? How does the persistent navigation — we don't want, we have too many, with our column based pages, they jump around. The widths of them jump around. When they're fluid pages and we're adding another column and everything reflows, then you lose that sense of navigation. If the navigation reflows and jumps a hundred or 300 pixels down the page, you don't even know that's the same thing. It's just like, whoa, everything jumped and now you got to re-scan everything. And on 3440 pixels, that's a lot of content.

> we need a better system to get a small number of robust layouts. [...] We need different size layouts. We need small mobile layouts. [...] Practice with big layouts that span 3440. That are also responsive. We need more of them. We need better ones.

The full prompt: `../mastermind-layout-browser/requirements.md`.

## Deliverables (each ticked against the sentences above at harvest)

1. **The measurement.** Headless, at 1280 / 1920 / 3440, on four columns pages — `/imagine/`, `/framework/core/Page/overview/columns/finder/`, `/framework/core/Page/overview/columns/uses/docs/`, `/framework/core/Page/overview/columns/uses/workbench/` — open a child column by clicking a nav link, and record for every column that was already open: its `x`, its `width`, and the `y` of its first five nav links, before and after. The finding is a table in your log: per page per width, the largest shift in px of an already-open column's x, of its width, and of a nav link's y. Then the same when a THIRD column opens. Raw numbers as a json file in your task dir. That quantifies "it jumps a hundred or 300 pixels".
2. **The rule, stated in one sentence and demonstrated:** *a column that is already open never changes x or width when a column opens to its right; the new column takes only the leftover, and when there is no leftover the row scrolls sideways (the Finder way) instead of squeezing what is open.* Build it as a lab at `/imagine/design/navigation/` (the page exists with `page.js` and `shots/` — read it first and extend it; keep what is there unless it contradicts this): the same three-level tree twice, side by side — **today's row** (core's columns as they are) and **the stable row** (your CSS, scoped to the lab with a `dn-` prefix or whatever `new-css-class` allows) — one button opens the same column in both, and under each row a live readout: "nav moved N px, widths changed by N px". The stable row reads 0 and 0. Prove it with the same headless measurement at the three widths.
3. **The proposal for core:** `proposal.md` in your task dir — the exact CSS the stable row uses, which core rule in `core/Page/Page.css` (or wherever the column width words live — find it, name the file and lines) it would replace, what the six width words become under it, and the before/after table from deliverable 1. You do not edit core; the mastermind carries the proposal.
4. **Small screens:** at 400 the row already pages one column at a time. Measure whether the crumb strip and the rail stay put when you page, say so in one line with the number, and include 400 in the lab's readout.

## Rules

- Load `code`, `layout` (read "Q1 under a COLUMNS host" and the `fill`/`large` traps; `/imagine/` is a columns host), `css`, `new-css-class`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/nav-stability/`; write its `task.jsonl` launch line); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/imagine/design/navigation/**` and your own task dir. Nothing else — not core, not `/imagine/page.js`, not framework.css. Other minions are editing `ext/AITask`, `ext/Ask`, `/layouts/browse/`, `/imagine/design/color/` and the layout skill right now; none of those is on your measurement list, and you do not touch them.
- **Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`.** The owner's server (port 80) is NOT running; start your own: `PORT=8096 node server.js` from the repo root, in the background; kill it when you land. `ui-test` has the headless recipe (Playwright import `file:///C:/…`; `page.routeWebSocket(/.*/)`); `.page.active-page` is `display: contents` and measures 0×0 — measure `.page-column-body` children (layout skill caveats). A hidden tab does not lay out.
- Two numbers that must agree: the readout on the page and your headless table for the same click.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock; never Out-File for jsonl.
- Landing: `outcome` = a headline with the two decisive numbers (today's largest shift, the stable row's), links (the lab, the proposal), one screenshot of the lab at 1920, what was left and why. One screen.
