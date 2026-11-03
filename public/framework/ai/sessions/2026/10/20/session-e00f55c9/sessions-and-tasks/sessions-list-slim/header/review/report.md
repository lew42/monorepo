verdict: fix
1. [fix] A doc is now stale: `ai/sessions/doc/live/grid-loading.md` line 5 still says "the window starts at the 1st of this month" and "moving the **From** box". The list now opens on Today, and the From box lives inside the range menu under "Custom…" (`pick_range`, diff line 94). `doc/views-plan.md` line 36 also points at the old `today` button (`:136`), which only v/classic draws now.
2. [note] The review shots in `shots/` are of `/sessions/v/` (the variants index) and `/sessions/v/classic/` (the old layout), not the page that changed. This is the second time: review.mjs picks the pages from the new files in the diff and misses `/framework/ai/sessions/`. The changed page is judged here from the minion's own shots in the task folder (`shot-390*.png`, `shot-1920*.png`), which cover the brief's widths and scroll states.
3. [note] The brief says the default range is Today (requirements, "Today ▾"). The code does default to Today (`fallback = Day.of(today)`, diff line 31), but every shot shows "This month ▾". The log calls the 199 px measurement "today-view", so it was taken in a different state from the shots. No shot shows the default.
4. [note] The brief asked for two row counts that differ when "show closed" is toggled. The log has 88 → 88 for show closed (no closed sessions in the data) and 88 → 388 for a routine-kind chip ("clarity check"), not a role chip. So show closed is not proven to still work.
5. [note] Smoke: FAIL on `/framework/ai/sessions/` in the worktree, 2× 404 on the generated `session-tree.json` and `session-index.json`. The log says the worktree lacks these generated files and there are no JS errors. Re-run smoke after the merge.
6. [note] The new constructor option `classic: true` and the `data_url` getter are not mentioned in `ai/AISession/readme.md`. `ai/sessions/readme.md` does name v/classic.
7. [note] At 1920 the search box stretches about 800 px between the two buttons (`shot-1920.png`, top band). The brief said "narrower". It is narrower at 390.
8. [note] Inside the Filters menu at 390, the routine and role chip rows run off the right edge ("$0.37" and the role chip are cut off; `shot-390-filters.png`, middle). These are the existing nowrap scroll rows, but nothing in the shot shows they scroll.

Widths given: review.mjs shot 400, 1200, 1920 and 3440 of `/sessions/v/` and `/sessions/v/classic/`. The changed page is judged from the minion's 390 and 1920 shots, unscrolled and scrolled, plus the 390 shot with Filters open.

## Requirements
- 1 "one full-width sticky header with an opaque background … above the card stack, then the list straight away": yes. `shot-390-scrolled.png`: the header row stays pinned and opaque, and no card shows through it. It spans the panel's width, not the screen edge (panel inset, ~16 px).
- 2 "Today ▾ … Today · Yesterday · Last 7 days · This month · Custom… (Custom shows the two existing date inputs)": yes in code (`RANGES`, `pick_range`, `show_custom`). The open menu is not shot.
- 3 "Default … then default to Today": not shown. The code says Today, but the shots show "This month" (note 3).
- 4 "search: the existing `.sessions-search` input, narrower": yes at 390, no at 1920 (note 7).
- 5 "Filters ▾: … EVERYTHING else … Move them, don't rewrite them: they must still work": yes. `shot-390-filters.png` shows the page links, Old layout, Table/Rail, the scope trail, show closed, needs attention with red-flag counts, in flight, the cache breakdown, the routine and role chips, the counts and "show 30 more days". `render_controls` now draws into `$filters_body`. The proof that they still work is partial (note 4).
- 6 count badge / totals line: n/a (cut, as the brief allows).
- 7 "No second heading on the page": yes. `shot-390.png`: no "Sessions" title; the SESSIONS tab names the page.
- 8 "Old layout" link plus `v/classic/page.js` with a constructor option, not a copy: yes. A 4-line page.js with `{ classic: true }`, linked from Filters (`shot-390-filters.png`, row 2) and from `v/page.js`.
- 9 "the header's `top` must sit under [the site's top tabs], not behind": yes. At 1920 (`shot-1920-scrolled.png`) the header pins directly under the AI tab bar. At 390 the tabs scroll away and the header pins at 0, with nothing behind it (`shot-390-scrolled.png`).
- 10 "first session card's top is within the first ~180 px under the site's tabs" at 390: yes. In `shot-390.png` the first card starts at about 205 px, about 105 px under the tabs (which end at about 98 px). The log measured 199 px; before the change it was 417 px (`before-390.png`).
- 11 Shots named per the brief, plus `before-390.png`: yes, all five are in the task folder.
- 12 readme "How data is read" gets one sentence: yes. Commit 0f3e03dfe adds "The header" bullet to `ai/sessions/readme.md`.
- 13 committed on the worktree branch, not merged, last log line names the branch, the measurement and the shots: yes. The branch is `worktree/sessions-header` (5 commits); see the session.jsonl log at 00:18:42.
- Class page: n/a (no new class; one option on AISessionsPage).
- Docs current / fresh agent can continue: no for `doc/live/grid-loading.md` (finding 1). Yes for continuing: session.jsonl names the branch, the worktree, the measurement and the reply to the last review.

## Page structure
- page 1 (says what it is): yes. `shot-1920.png`: the SESSIONS tab is on, and the list starts under the header row.
- page 2 (one title, no repeat): yes. There is no in-page title (`shot-390.png`).
- page 3 (most important first): yes. The list is the first thing under one control row at 390.

## Navigation
- navigation 1 (identify): tabs (site), a sidebar (the sessions left nav at 1920, hidden at 390), two popover menus (range, Filters).
- tabs stay one row: yes, tab_rows 1 at every width (`layout.json`, both pages).
- links in a menu are reachable on a phone: yes. The left nav and page links moved into Filters at 390 (`shot-390-filters.png`, top).
- the menu opens under its button and fits the screen: yes at 390 (`shot-390-filters.png`: inset .5rem each side, 80dvh cap).

## Layout
- the list is the main thing at every width: yes (`shot-390.png`, `shot-1920.png`).
- one control row: yes, three controls in one row at 390 and 1920.
- not measured for the changed page (no layout.json for `/framework/ai/sessions/`).

## Sizing
- buttons hug their label: yes (`.sessions-hbtn` flex: none, nowrap).
- the search fills the leftover space: yes at 390. At 1920 it is too wide (note 7).
- the header has a fixed 3.25rem height and the table heads stick under it: yes (`shot-1920-scrolled.png`: the State/Name/Cost heads sit under the header).

## Wrapping
- the header row never wraps: yes at 390 and 1920 (`shot-390.png`, top band).
- nothing overflows the page: yes. overflow_x false at every width (`layout.json`, v/classic). The chip rows inside Filters run off the edge (note 8).

## Spacing and padding
- padding even around the header row: yes (`shot-390.png`: about 8 px around the three controls, with a rule under them).
- space wasted above the list: no. About 25 px between the header rule and the first card at 390, which is fine.

## Colour and contrast
- header opaque on `--surface`: yes (`shot-390-scrolled.png`: no card text shows through).
- control text readable: yes. The "search" placeholder is grey on grey but readable (`shot-390.png`).

## Flow
- the list follows the header straight away: yes (`shot-390.png`).
- the Filters menu reads top-down: links → trail → filters → chips → counts: yes (`shot-390-filters.png`).

## Words
- labels are plain words: yes ("Today ▾", "Filters ▾", "Old layout").
- tooltips say what a control does: yes (`title` on both buttons and the search).
- docs match the page: no (`doc/live/grid-loading.md`, finding 1).
