# patterns — what emerged from 47 websites: the most common layouts, and the best (Opus, group `websites`)

Three laws: less is more (ASAP); clear beats brief, by far — a new coder reads this page and can say what the web mostly does; prioritize. Length budget: ONE screen above the fold (the headline sentence, the counts shown as bars, the way in); the judgments one click down, one sentence each; your report eight plain lines.

⚠ **NO INTERNET.** Do not load any external website (the owner's connection dropped during the crawl; every external load is paused). Everything is on disk; the only server is `http://localhost:8123`.

Read first: `../mastermind-playwright/minion-rules.md`; `../mastermind-playwright/requirements.md` §"The ask" — the sentence this serves: *"we want to identify any useful layouts. the most common patterns should emerge, and identify the best layouts. again, similar but different techniques can be used to achieve the same result"*; `public/websites/readme.md`, `doc/schema.md`; `public/websites/site/index.json` (47 sites: each with `layout` per width, `tags`, `category`; plus `tags` → names and `sections` → names); `public/layouts/layouts.json` (the ids and words); `public/layouts/page.js` (the tree page — the shape to match). Skills: `new-task` (this dir, group `websites`), `code`, `layout`, `new-page`, `css` (before any CSS), `new-css-class`, `documentation`, `finish-task`. Four sibling minions are writing the `wire` key of site records right now — read records freely, never write one.

## The page — `/websites/patterns/`

**Every number on it is computed live from `site/index.json` when the page renders** — so it stays true as the corpus grows; you write no number into prose. Level 1, one screen:

1. The headline: one sentence the code fills in — "Of N sites, A are one column at 1920, B two, C three, D more; at 400 all but E are `1-flow`." (the letters come from the data).
2. **The counts, shown**: a row per layout id, its count at 1920 and at 400 as two bars (plain divs with a width, the number beside; no chart library), each id linking to `/layouts/<id>/` and the count linking to `/websites/tag/<id>/`. Then the same for *section* layouts (`sections` in the index), then the ten most common tags.
3. **How layouts collapse**: a small table of the transitions from 1920 to 400 (`3-holy-grail → 1-flow: N sites`, `2-sidebar → 1-flow: N`, `1-centered → 1-flow: N`, … and any that do NOT collapse), computed.
4. The way in: "The best of each kind" — one click down (a second section below the fold, or a child page `/websites/patterns/best/`, your call — say why in the log).

**The judgments** (yours, prose, in an `.md` beside the page): for each category in the corpus (docs, marketing, news, blog, app, shop, system, gallery-find) name the ONE site that handles its layout best across the four widths and say why in two plain sentences — what it does at 3440 that others waste, what it does at 400 that others break — with a link to the site's page and its 1920 shot inline. Then "three layouts to copy": the three ids the corpus argues for, one sentence each on when. Then "three to avoid", with the evidence. Look at the shots with the Read tool before you judge; a claim you did not look at is not a judgment. Every claim carries a link.

Register the page: add `patterns` to `public/websites/page.js` `children:` (it has its own `page.js`, so it is declared), one link line on the `/websites/` front ("What emerged →"), and one link line on `/layouts/` (`public/layouts/page.js`) pointing here ("What 47 real sites do →"). Docs: a `readme.md` in `patterns/` (index shape), and the decision of where the judgments live.

## Proof

`http://localhost:8123/websites/patterns/` at 400 and 1920, screenshots into this dir, zero console errors; the headline's numbers agree with a count you run yourself in Node over `site/index.json` (print both in your log).

## Fences and budget

Write ONLY `public/websites/patterns/**`, one name in `public/websites/page.js` `children:` plus one link line on its front, one link line in `public/layouts/page.js`, this dir, scratch named `patterns-*`. Never a site record, never `layouts.json`, never the tools. Budget ~250k tokens. Report in ≤ 8 plain lines: the url, the headline sentence as rendered, the most common layout at 1920 and at 400 with counts, the best site in two categories with why, what you would change in the encyclopedia after seeing the numbers.
