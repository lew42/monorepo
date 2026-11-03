# /framework/ home: fill the voids, widen the columns, fix the gap

You are a minion. Load the `minion` skill first. Work in the worktree at
`C:\Code\lew42\worktrees\framework-home-grids` (branch `worktree/framework-home-grids`,
already running its own dev server — ask your parent for the port/url if you need it, or
check `C:\Code\lew42\worktrees\framework-home-grids\.worktree-info.json` if one exists,
or just grep `worktree-up.mjs` output your parent has). Hold reloads on the MAIN tree while
you write (`node Server/hold.mjs on "grid-fill — Page.css/page.js"`) is not needed since you
work in a separate worktree with its own server — just write normally there.

Parent task dir (read the full ask and its screenshots there first):
`public/framework/ai/sessions/2026/10/03/framework-home-grids/framework-home-grids/` — `requirements.md` has the owner's
verbatim words. Log your own steps in
`public/framework/ai/sessions/2026/10/03/framework-home-grids/framework-home-grids/grid-fill/task.jsonl` (create it; see
`new-task`/minion skill for the line shape) in BOTH the worktree copy and nowhere else —
your parent reads the worktree's copy before merge.

## The owner's words (condensed, verbatim bits kept)

> There's a lot of space in these grids where items have different heights. Core classes:
> View has two lines of preview, Page has a class architecture, Router, App and Sidebar have
> nothing, so there's a void under them. Equal content is the wrong restriction; masonry is
> the alternative. And all these items are really narrow: five columns for styles/UX plus
> five for core on my screen. The spacing between the styles column and the core column needs
> fixing. Using a grid class is better than baking the grid into some complex selector.
> `.wall, .page-previews:where(:not(.page))` adds display grid; that's fine, but
> `.page-previews` should also wear the `grid` class, redundant or not, because the class on
> the element tells you what layout it is.

## What exists — read these first, use them, don't rebuild them (law 6)

- `public/framework/framework.css` ~line 1023: `.masonry` (CSS columns) and `.packed`
  (real grid rows, measured by JS) — the comment block right above line 1047 explains both.
  `.packed` needs `styles/layouts/masonry/masonry.js`'s `pack($wall)` to size the row-spans;
  call pattern: `pack(div.c("packed", () => { ...cards... }))`.
- `public/framework/ext/sprawl/sprawl.js` — already used by the home page to balance the
  big sections (AI, Core, Styles, UX, …) into 1-3 TALL columns by height. That part is fine
  and already landed (2026-10-02). What's broken is INSIDE each section: the group of module
  cards in one section is a plain CSS grid (`.wall`/`.page-previews`), so a short card
  (Router, App, Sidebar — icon+name only) leaves a dead rectangle under it next to a tall
  card (View, Page — which show a 2-line preview or an architecture excerpt).
- `public/framework/core/Page/Page.css` ~line 1123-1229: the `.wall`/`.page-previews` grid
  rules (`--column: 14em`), and the `.page-previews > .page-previews-group` rule for a
  group heading inside a wall.
- `public/framework/page.js` — the home page. `home_sections(root)` (near the bottom) builds
  one `div.c("page-wall flex v gap", …)` per sidebar section, and inside it one
  `div.c("page-previews bleed", …)` holding `module_card()` calls — THIS inner div is what
  needs to stop being a plain equal-row grid.
- Screenshots of the CURRENT (before) state, at 1920 and 3440, are the task's own first two
  lines — read `public/framework/ai/sessions/2026/10/03/framework-home-grids/framework-home-grids/task.jsonl` for their
  paths, or re-shoot `http://monorepo.localhost/framework/` yourself with a headless tool
  (never drive the owner's live tabs — use Playwright headless or the worktree's own server
  at its port, never `mcp__site__eval`/`claim`/`pages` on a connected tab).

## Do

1. **Fill the voids.** Change the per-section card group (`.page-previews bleed` inside
   `home_sections()`) to use `.packed` (`pack()`), so short cards (Router, App, Sidebar,
   Shell, Search, Layout, Section, Task, …) don't leave a hole next to a tall one — cards
   pack densely, left-to-right reading order preserved (this is why `.packed`, not plain
   `.masonry`: `.masonry` reorders by column, and a reader scanning "View, Page, Router,
   App…" left to right matters here). A `leaf: true` section's own one-card box doesn't need
   packing (nothing to pack) — leave single-card sections as they are, or pack them too if
   it's not extra code either way.
2. **Widen the columns.** The owner's complaint: "five columns ... really narrow." Cards are
   icon+name (small) or icon+name+body (`.big`, for weight ≥ 10 — View, Page, Item, List
   today). Give the wall a bigger minimum column width than today's `--column: 14em` so 3440
   shows noticeably fewer, wider columns — pick a width by actually screenshotting at 1920
   and 3440 and eyeballing it (a `.big` card's body text is the thing that should decide the
   floor: it should not wrap into a ransom-note column). Try something in the 16-20em range
   first, screenshot, adjust. This value lives in Page.css (`--column: 14em` today) — change
   it there, not per-call-site, unless a call site has a real reason to differ.
3. **Fix the Styles/Core gap.** Screenshot at 1920 and 3440, look at the gap between the
   Core sprawl-column and the Styles sprawl-column vs. the gap between any other two
   sprawl-columns (e.g. Styles/audio). If they really differ, find why (candidates: a
   section's own `h2.page-wall-title` margin, the `.sprawl` grid's own `gap`, an
   uneven-width `1fr` track because one section's content is wider) and fix the ROOT CAUSE —
   not a one-off margin hack on this one page. If you screenshot carefully and the gap is
   actually even and the owner was reacting to something else (e.g. the whole wall's edge
   padding vs. the sidebar), say what you found instead of inventing a fix for a problem that
   isn't there.
4. **Explicit layout classes.** Every container using `.wall`/`.page-previews` (which is
   grid), `.masonry`, or `.packed` wears that literal class name in its own `classList` —
   `.page-previews` should ALSO have `.grid` on it (redundant with the `.wall,
   .page-previews:where(:not(.page))` CSS selector — that's fine, the owner asked for the
   redundancy on purpose: "the class on the element tells you what layout it is"). Don't
   remove the existing selectors — add the class alongside them. Do this everywhere in
   `public/framework/page.js`'s own markup that this task touches; you don't need to sweep
   the whole site for this (that's a bigger, separate task).

## Prove it

Screenshot `http://monorepo.localhost/framework/` (or your worktree's own port) at
400, 1200, 1920 and 3440 AFTER your change, headless. Look at them yourself: is there still
a visible dead rectangle under a short card next to a tall one? Are the columns still
needle-narrow at 3440? Is the Core/Styles gap now even with its neighbours? Write what you
saw, one line per width, in your task.jsonl.

## Fence

Write only: `public/framework/page.js`, `public/framework/core/Page/Page.css`. If the gap
turns out to be `ext/sprawl/sprawl.css`'s fault, you may touch that too, but then you must
screenshot TWO OTHER pages that use `sprawl()` (grep for `from "/framework/ext/sprawl` to
find them) before and after, to prove you didn't break them — shared CSS needs that proof
(sub-mastermind skill). Don't touch anything else. Commit in the worktree when it works.
Budget: small — this is most of the task's value, spend the care here.
