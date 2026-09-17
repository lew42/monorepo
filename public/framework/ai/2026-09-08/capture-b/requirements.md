# capture-b — shoot, scan, look at and tag 16 websites (Sonnet, group `websites`)

Three laws: less is more (ASAP); clear beats brief, by far — a `notes` paragraph is read by a new coder; prioritize. Length budget: per site, the hand half of one json (a `notes` paragraph of 3–5 sentences, 3–7 sections, 6–12 tags); your report ten plain lines.

Read first: `../mastermind-playwright/minion-rules.md` (every rule); `public/websites/readme.md`; `public/websites/doc/schema.md` (the two halves of a record — you write ONLY the hand half); `public/websites/doc/tools.md`; `public/websites/tools/readme.md`; `public/layouts/layouts.json` — the authority for every layout id and word (if a layout you see has no id there, use the nearest and add a tag that says what is different; log the gap as a `log` line — the encyclopedia author reads those). Look at one finished record to copy its voice: `public/websites/site/wikipedia-css.json`. Skills: `new-task` (this dir, group `websites`), `finish-task`.

## What the owner asked for, in their words

> have minions look at the screenshots at various resolutions, and make note of responsive strategy, technique, etc. focus on layout. scan the website's dom, and css, and figure out exactly what kind of CSS layout(s) they're using … the screenshots will likely indicate when a particular appearance can be styled (css) in multiple ways. try to compare the screenshots with the css, to understand the layout as much as possible. tag the site properly.

## Your sites — these 16 and no others (the name is the record's name; keep it)

| name | url | category | scout expected | embed |
|---|---|---|---|---|
| `gitlab-explore` | https://gitlab.com/explore | app | 2-sidebar | blocked |
| `reddit-home` | https://www.reddit.com/ | app | 3-holy-grail | blocked |
| `css-tricks-home` | https://css-tricks.com/ | blog | 2-sidebar | blocked |
| `overreacted-blog` | https://overreacted.io/ | blog | 1-centered | allowed |
| `django-docs-index` | https://docs.djangoproject.com/en/5.1/ | docs | 2-sidebar | blocked |
| `rust-book-intro` | https://doc.rust-lang.org/book/ch00-00-introduction.html | docs | 2-sidebar | allowed |
| `cctype-foundry` | https://cctype.com/ | gallery-find | 3-cards | allowed |
| `privy-home` | https://privy.io/ | gallery-find | 1-centered | allowed |
| `apple-home` | https://www.apple.com | marketing | 1-flow | blocked |
| `linear-home` | https://linear.app | marketing | 1-centered | blocked |
| `webflow-home` | https://webflow.com | marketing | 1-centered | blocked |
| `guardian-international` | https://www.theguardian.com/international | news | 3-cards | blocked |
| `allbirds-home` | https://www.allbirds.com/ | shop | 1-centered | blocked |
| `nike-home` | https://www.nike.com/ | shop | 1-flow | blocked |
| `gov-uk-home` | https://www.gov.uk/ | system | 1-centered | blocked |
| `shopify-polaris-home` | https://polaris.shopify.com/ | system | 2-sidebar | allowed |

## Per site, in this order, one site at a time (a polite crawl, never parallel)

1. `node public/websites/tools/shoot.mjs <url> <name>` then `node public/websites/tools/scan.mjs <url> <name>` from the repo root. Give each call `timeout: 300000`. A site that fails twice (bot wall, timeout, blank shot): log it with the reason, `rm -r` its partial `public/websites/site/<name>` dir and `<name>.json` if any, move on — never a third try.
2. **Look at the four shots** (`site/<name>/400.jpg 1280.jpg 1920.jpg 3440.jpg`) with the Read tool; the `long.jpg` too when the fold hides the body. Then read `scan` in the json: each landmark's computed `display`, grid tracks, `flex-direction`, rect and `side_by_side` at each width. The picture says what a person sees; the scan says what CSS did it. When they disagree, say so in the section's note — that disagreement is the owner's "an appearance can be styled in multiple ways".
3. **Write the hand half** — `category`, `layout` (the global id at 3440 / 1920 / 1280 / 400), `sections` (3–7 in reading order: `name`, `layout` id, `css` = the technique the scan shows, `note` one sentence), `tags`, `responsive.strategy` (one paragraph), `responsive.breakpoints` (the 2–4 widths that actually move something, read from `responsive.queries` and confirmed by the shots), `notes` (3–5 plain sentences explaining the page's layout and what it does as the window shrinks, like the reader is five). Write it through the tools' merge so the machine half survives: a small script in the scratchpad named `capture-b-write.mjs` that imports `read_record`/`write_record` from `public/websites/tools/lib.mjs` (read `lib.mjs` first for the exact names and paths). Never hand-rewrite the whole json.
4. **Tags**: every layout id you used; the technique as `<n> column flex` / `<n> column grid` / `float` / `table` / `multicol`; traits you can SEE — `sticky header`, `hamburger at <width>`, `max-width <px>`, `full-bleed`, `cards`, `left` / `right` (which side the narrow column is), `drawer`, `mega footer`, `toc`, `dark`; the category. Prefer a tag that already exists in `public/websites/site/index.json` `tags` over a new synonym; lowercase; a new word only when nothing fits, and log it.
5. `node public/websites/tools/index.mjs` after every site (it is cheap and siblings run it too; last writer wins and includes everyone).

At the end, one headless pass over all your sites' pages at 1280 (`http://localhost:8123/websites/<name>/`): zero console errors, the four pictures present. A 20-line probe in the scratchpad named `capture-b-check.mjs` (the Playwright import is in the rules).

## Fences and budget

Write ONLY `public/websites/site/<name>.json` and `public/websites/site/<name>/` for the names in YOUR table, `public/websites/site/index.json` through `index.mjs`, this dir, and scratch named `capture-b-*`. Never edit the tools, the pages, `layouts.json`, or a sibling's site. `:8123` serves the site; no server of your own. Budget ~350k tokens; if you reach 300k with sites left, land what is done and list the rest — a finished half beats a torn whole. Report in ≤ 10 plain lines: done / failed (with why), the three most interesting layouts with their urls, the tags you had to invent, where the scan and the picture disagreed.
