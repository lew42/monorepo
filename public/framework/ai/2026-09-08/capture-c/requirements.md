# capture-c — shoot, scan, look at and tag 16 websites (Sonnet, group `websites`)

Three laws: less is more (ASAP); clear beats brief, by far — a `notes` paragraph is read by a new coder; prioritize. Length budget: per site, the hand half of one json (a `notes` paragraph of 3–5 sentences, 3–7 sections, 6–12 tags); your report ten plain lines.

Read first: `../mastermind-playwright/minion-rules.md` (every rule); `public/websites/readme.md`; `public/websites/doc/schema.md` (the two halves of a record — you write ONLY the hand half); `public/websites/doc/tools.md`; `public/websites/tools/readme.md`; `public/layouts/layouts.json` — the authority for every layout id and word (if a layout you see has no id there, use the nearest and add a tag that says what is different; log the gap as a `log` line — the encyclopedia author reads those). Look at one finished record to copy its voice: `public/websites/site/wikipedia-css.json`. Skills: `new-task` (this dir, group `websites`), `finish-task`.

## What the owner asked for, in their words

> have minions look at the screenshots at various resolutions, and make note of responsive strategy, technique, etc. focus on layout. scan the website's dom, and css, and figure out exactly what kind of CSS layout(s) they're using … the screenshots will likely indicate when a particular appearance can be styled (css) in multiple ways. try to compare the screenshots with the css, to understand the layout as much as possible. tag the site properly.

## Your sites — these 16 and no others (the name is the record's name; keep it)

| name | url | category | scout expected | embed |
|---|---|---|---|---|
| `grafana-play-home` | https://play.grafana.org/ | app | 2-sidebar | blocked |
| `alistapart-home` | https://alistapart.com/ | blog | 1-centered | blocked |
| `josh-comeau-blog` | https://www.joshwcomeau.com/ | blog | 1-centered | allowed |
| `simon-willison-blog` | https://simonwillison.net/ | blog | 2-sidebar | allowed |
| `kubernetes-docs-home` | https://kubernetes.io/docs/home/ | docs | 3-holy-grail | allowed |
| `svelte-docs-overview` | https://svelte.dev/docs/svelte | docs | 3-holy-grail | allowed |
| `designmill-home` | https://designmill.in/ | gallery-find | 3-cards | allowed |
| `susanne-kaufmann-home` | https://susannekaufmann.com/ | gallery-find | 1-centered | blocked |
| `figma-home` | https://www.figma.com | marketing | 1-centered | blocked |
| `notion-home` | https://www.notion.so | marketing | 1-centered | blocked |
| `arstechnica-home` | https://arstechnica.com | news | 2-sidebar | blocked |
| `nytimes-home` | https://www.nytimes.com | news | 2-sidebar | blocked |
| `amazon-kindle-product` | https://www.amazon.com/dp/B0CX23V2ZK | shop | 2-sidebar | allowed |
| `target-home` | https://www.target.com/ | shop | 3-cards | blocked |
| `material3-home` | https://m3.material.io/ | system | 2-sidebar | allowed |
| `uswds-home` | https://designsystem.digital.gov/ | system | 1-centered | blocked |

## Per site, in this order, one site at a time (a polite crawl, never parallel)

1. `node public/websites/tools/shoot.mjs <url> <name>` then `node public/websites/tools/scan.mjs <url> <name>` from the repo root. Give each call `timeout: 300000`. A site that fails twice (bot wall, timeout, blank shot): log it with the reason, `rm -r` its partial `public/websites/site/<name>` dir and `<name>.json` if any, move on — never a third try.
2. **Look at the four shots** (`site/<name>/400.jpg 1280.jpg 1920.jpg 3440.jpg`) with the Read tool; the `long.jpg` too when the fold hides the body. Then read `scan` in the json: each landmark's computed `display`, grid tracks, `flex-direction`, rect and `side_by_side` at each width. The picture says what a person sees; the scan says what CSS did it. When they disagree, say so in the section's note — that disagreement is the owner's "an appearance can be styled in multiple ways".
3. **Write the hand half** — `category`, `layout` (the global id at 3440 / 1920 / 1280 / 400), `sections` (3–7 in reading order: `name`, `layout` id, `css` = the technique the scan shows, `note` one sentence), `tags`, `responsive.strategy` (one paragraph), `responsive.breakpoints` (the 2–4 widths that actually move something, read from `responsive.queries` and confirmed by the shots), `notes` (3–5 plain sentences explaining the page's layout and what it does as the window shrinks, like the reader is five). Write it through the tools' merge so the machine half survives: a small script in the scratchpad named `capture-c-write.mjs` that imports `read_record`/`write_record` from `public/websites/tools/lib.mjs` (read `lib.mjs` first for the exact names and paths). Never hand-rewrite the whole json.
4. **Tags**: every layout id you used; the technique as `<n> column flex` / `<n> column grid` / `float` / `table` / `multicol`; traits you can SEE — `sticky header`, `hamburger at <width>`, `max-width <px>`, `full-bleed`, `cards`, `left` / `right` (which side the narrow column is), `drawer`, `mega footer`, `toc`, `dark`; the category. Prefer a tag that already exists in `public/websites/site/index.json` `tags` over a new synonym; lowercase; a new word only when nothing fits, and log it.
5. `node public/websites/tools/index.mjs` after every site (it is cheap and siblings run it too; last writer wins and includes everyone).

At the end, one headless pass over all your sites' pages at 1280 (`http://localhost:8123/websites/<name>/`): zero console errors, the four pictures present. A 20-line probe in the scratchpad named `capture-c-check.mjs` (the Playwright import is in the rules).

## Fences and budget

Write ONLY `public/websites/site/<name>.json` and `public/websites/site/<name>/` for the names in YOUR table, `public/websites/site/index.json` through `index.mjs`, this dir, and scratch named `capture-c-*`. Never edit the tools, the pages, `layouts.json`, or a sibling's site. `:8123` serves the site; no server of your own. Budget ~350k tokens; if you reach 300k with sites left, land what is done and list the rest — a finished half beats a torn whole. Report in ≤ 10 plain lines: done / failed (with why), the three most interesting layouts with their urls, the tags you had to invent, where the scan and the picture disagreed.
