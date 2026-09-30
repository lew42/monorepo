# Design audit in bands: nine main pages

Each screenshot in the folders beside this file was read top to bottom, one horizontal band at a time. For every band that looked wrong, the cause was measured on the live site (headless, `getComputedStyle` up the ancestor chain) and traced to the rule that sets it. Bands that looked fine are not listed. Three of the "obvious" rows are fixed and merged; the rest need a decision or belong to another module.

Ranked by how much fixing it would improve the main pages: how many pages share the cause, times how bad it looks.

| # | What you see | Pages | Width | Cause | Fix | Obvious? |
|---|---|---|---|---|---|---|
| 1 | On a phone, text sits 24 to 28px in from each edge (a card inside adds 14px more, so 42px). Three different side gutters are in use at 400: 28px, 24px, and 11 to 14px on the app pages. | `/layouts/` `/notes/` `/framework/core/Layout/` `/framework/core/Page/` (28px) · `/` `/framework/` (24px) | 400 | [`core/Page/Page.css:173`](/framework/core/Page/) `--gutter-x: clamp(2em, 4%, 5em)`: 4% of 400 is 16px, so the 2em floor (28px) wins. The `.default` page uses another formula, `Page.css:95` `clamp(0px, 6%, 5em)`. | Lower the floor to about `1.25em` (17px at 400) and make `.default` read the same `--gutter-x`. One token, every page. | No: picks a new site-wide number |
| 2 | The seven loading-step tiles ran off the right edge of a phone; four were cut off. | `/framework/core/Page/` | 400 | `core/Page/page.js:213` `div.c("wide flex gap-25")`: a flex row with no wrap. | Add `wrap`. | **Fixed**: 4 cut off → 0 |
| 3 | The Doc page's top tabs stack into 6 rows on a phone (161px, a sixth of the screen), 3 rows at 1200, 2 at 1920. | `/framework/core/Page/` and every Doc page | 400–1920 | [`ext/Doc/Doc.css:66`](/framework/ext/Doc/) `.page.doc-page > .tabs > .tab-bar { flex-wrap: wrap }`. | Its own feature: a "more ▾" menu or grouped tabs. Not touched here, by the brief. | No: a feature |
| 4 | The gap under a page's title is bigger than the gap between sections: 42px at 400, 68px at 3440. | `/layouts/` `/notes/` `/framework/core/Layout/` | all | [`framework.css:1116`](/framework/styles/) `.page-title + * { margin-block-start: calc(var(--flow) * 1.5) }`. | `var(--flow)` (1×). | No: reverses a written choice |
| 5 | On a phone the Layout page shows 28 filter buttons, one per line, before the first layout: the first picture starts 1.4 screens down. | `/framework/core/Layout/` | 400 | [`core/Page/Page.css:1035`](/framework/core/Page/) turns a narrow `.rail` into a full-width column; [`ext/catalog/browse.js:195`](/framework/ext/catalog/) stacks its rows with `flex v`. | Below 38em, lay a faceted rail's rows out as wrapping chips (`flex-direction: row; flex-wrap: wrap`), or fold each facet into a select. | No: the rail's doc says controls stack on purpose |
| 6 | The AI page opens with every agent that ever ran (80+, almost all "gone") as a cloud of links: 2.7 screens at 400, ~560px at 1920, before today's work. Wrapped entries centre their second line. | `/framework/ai/` | all | [`ai/v/3/agents.js:27`](/framework/ai/) renders all agents; the centring is the button default, not overridden in `ai/v/3/v3.css:172`. | Show the working ones and a "N finished" link; add `text-align: start` to `.v3-agents-row`. | Half: the alignment is; what to list is a choice |
| 7 | The five number tiles on /framework/ left the fifth alone on a second row at 1920 and 3440. | `/framework/` | 1920, 3440 | `public/styles.css:268` capped the row at a flat `50em`, but the gap between tiles grows with the screen (43px at 3440), so five tiles needed 982px of 900. | `max-width: calc(45em + var(--gap) * 4)`. | **Fixed**: 2 rows → 1 at 1920 and 3440 |
| 8 | The Page field card (.title, .url, .parent …) is half air: rows stand 88px apart at 3440. | `/framework/core/Page/` | all | `core/Page/page.js:230` `div.c("card pad flow")`: `flow` puts a paragraph gap between rows that already have padding. | `card pad flex v`. | **Fixed**: 517 → 292px tall at 3440, 367 → 227 at 400 |
| 9 | The live clock band on /framework/ is 300px tall on a phone, a third of the screen. | `/framework/` | 400 | [`framework/page.js:53`](/framework/) `--panel-height: clamp(13em, 30vh, 30em)`. | A smaller floor on narrow screens, e.g. `clamp(8em, 22vh, 30em)`. | Nearly: one number |
| 10 | At 3440 /imagine/ shows its Start column, then about 2000px of empty grey column stripes. | `/imagine/` | 3440 | [`core/Page/Page.css:376`](/framework/core/Page/) paints guide stripes every 14em across the whole columns row. | Let the last open column take the leftover, or stop the stripes after the last column. | No: the columns design |
| 11 | The homepage title breaks into 4 lines at 1200, with "step" alone on the last. | `/` | 1200 | `public/styles.css:185` gives the hero column `minmax(16em, 24em)` while the theme sets `h1` to 3em. | Size the hero `h1` to its column (`font-size: clamp(…, 5cqi, …)`), or widen the column at this width. | No: type choice |
| 12 | AI 2 is 73% empty at 3440 (ink 0.28 in its main band). | `/framework/ai2/` | 3440 | Recorded only: other agents are building `ai2/`. | — | — |

**Not problems (tool noise).** `layout-check --bands` flags the phone drawer's "✦ AI" and "⋯ More" buttons as wrapped (3.2 lines): that is the icon above its label, on purpose. It flags `brightness_auto` as wrapped: that is an icon font's ligature text measured as words.

**Before and after** (measured headless, the live site against the worktree, zero page errors on both):

| | 400 | 1200 | 1920 | 3440 |
|---|---|---|---|---|
| Page step tiles cut off | 4 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| Page field card height, px | 367 → 227 | 391 → 242 | 458 → 260 | 517 → 292 |
| /framework/ stat tile rows | 3 → 3 | 1 → 1 | 2 → 1 | 2 → 1 |
