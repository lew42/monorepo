# nav-stability — study + build brief (Opus)

Read first: the repo's `CLAUDE.md` (law 2 and the Presentation section), `../mastermind-day/requirements.md` (decision 5 is yours; the owner's brief verbatim — the paragraphs on jumping, stable vs dynamic, "unless you have a left sidebar nav?"), `../../2026-09-04/mastermind-platform/minion-rules.md`, `public/framework/core/Page/doc/columns.md`, `public/imagine/paging/doc/mechanisms.md` + `decisions.md`, `public/imagine/shells/` (the persistent-rail shells), `public/imagine/screens/`. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `new-page`, `css` + `new-css-class` (prefix `paging-`) if a class is born, `ui-test`, `documentation`, `finish-task`.

## The owner's words

> a lot of links launch 2 columns at once? … it's quite "jarring". we need to create more stable navigation systems. there's horizontal jumping (adding columns, the whole column reflows), and there's vertical jumping (swapping content or active tab can cause the vertical space to jump). we want to avoid jumpy nav, or at least categorize navigation systems as either stable (persistent?), or dynamic?
> how to get stable navigation that doesn't jump, going from a full-screen page down to sub pages. I'm not sure that's even possible, unless you have a left sidebar nav?

## Deliverables (numbered)

1. **Measure the jump.** For every navigation mechanism the site has — a child column opening, `full` takeover, a tab switch (`ext/tabs`), expand (accordion), the sidebar rail, the drawer, the crumb strip, a toolbar page-switch, a swap on a stage — drive it headless at 1280 and 3440 and record two numbers: **horizontal reflow** (how many pixels the content you were reading moved sideways) and **vertical jump** (how much the height under your eye changed). Two numbers per mechanism per width, in a table in your log with the plan that produced each. This is the finding; the words come after.
2. **The two words, defined so a newcomer gets them.** *Stable*: what you were looking at does not move — a persistent rail, columns with fixed widths, a stage with a reserved height. *Dynamic*: something moves — a column appears and the row reflows, a page takes over, a panel grows. Write the definition in one sentence each and put the measured mechanisms under them.
3. **Build the stable set** (as pieces `paging-v3` can use — it is building the realm's persistent left rail at the same time; coordinate by fence, and message it through your log): (a) **fixed-width columns**: when a column is added the row does not reflow — existing columns keep their width and the row scrolls horizontally instead (a word or a class on the columns host; measure that content moved 0px); (b) **reserved stage height**: a swap stage whose height is the tallest panel, so switching never jumps (measure 0px); (c) **tabs with a reserved panel** (same); (d) **from full screen down to sub pages without a jump**: a full page with its own persistent left rail whose sub pages swap the centre — the answer to the owner's question, proven with the two numbers.
4. **`/imagine/paging/navigation/`** — the page: opens with the two definitions side by side as two live miniatures (a jumpy one and a stable one, same content, click both), then the measured table as a nav grid of stills (each links to the mechanism's demo), then the stable set with its four demos. No blockquotes, no statements that are conclusions; every section is something to click.
5. **The rule** for the paging realm in its `doc/decisions.md` (append) and a core proposal in your log with the diff for whatever needs to live in `core/Page/Page.css` (fixed-width columns probably does).

## Prove it

`ui-test` for every mechanism (the plans are the evidence), screenshots at 1280 and 3440, zero console errors, the three invariants. The four stable demos each measure 0px on both numbers.

## Fences and budget

Write only `public/imagine/paging/navigation/` (new), `public/imagine/paging/doc/decisions.md` (append), `css-scopes.txt` via the skill, this task dir. Never `core/`, `ext/` — proposals with the diff. Budget ~400k tokens. Report in ≤ 10 plain lines: the two definitions, the biggest measured jump and the smallest, the four stable demos with their numbers, the page url.
