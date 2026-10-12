# websites-db — `/websites/`: the corpus, its class, its json, its tools (Opus, group `websites`)

Three laws: less is more (ASAP); clear beats brief, by far — explain it like I'm five; prioritize. Length budget: the index page is ONE screen (two sentences, then the wall); a site's page is ONE screen above the fold (the four screenshots, then the tags, then the way in to the detail); the readme is the index shape (what · Use · Watch out · More); `doc/*.md` may breathe.

Read first: the repo's `CLAUDE.md`; `../mastermind-playwright/requirements.md` (the owner's words and the decisions already made — do not reopen them); `../mastermind-playwright/minion-rules.md` (every rule). Skills: `new-task` (this dir, group `websites`), `code`, `layout`, `new-page`, `css` (before any CSS), `new-css-class` (before any class name), `documentation`, `finish-task`.

## What this is, in the owner's words

> create a little database of websites, tagged by any applicable layout, design, responsiveness, etc... maybe we create a dir: /websites/ … create a class to display/manage a website. and then create sub dir (websites/site/<name>.json?) … we could try to render the site in a resizable iframe, while zoomed out, to then test the responsiveness. some sites block iframe, so we could test this via a simple screenshot (or maybe you can tell via api) … maybe i just want to be able to click through these tags, and see other layouts that fit that tag

## Build

1. **The record.** One file per site, `public/websites/site/<name>.json`, plus its pictures in `public/websites/site/<name>/` (`400.jpg 1280.jpg 1920.jpg 3440.jpg long.jpg`). The seed shape — refine it, then write it down in `doc/schema.md` so a cold Sonnet can fill one by hand:

```json
{
  "name": "stripe", "url": "https://stripe.com/", "title": "Stripe", "category": "marketing",
  "captured_at": "2026-09-08T01:00:00-05:00",
  "embed": "blocked",
  "shots": { "400": "site/stripe/400.jpg", "1280": "…", "1920": "…", "3440": "…", "long": "…" },
  "layout": { "3440": "1-centered", "1920": "1-centered", "1280": "1-centered", "400": "1-flow" },
  "sections": [
    { "name": "header", "layout": "1-flow", "css": "flex", "note": "logo left, links centre, buttons right; collapses to a hamburger at 940" },
    { "name": "hero", "layout": "2-equal", "css": "grid", "note": "copy beside a product picture; stacks at 940" },
    { "name": "features", "layout": "3-cards", "css": "grid", "note": "auto-fit minmax(280px, 1fr)" }
  ],
  "tags": ["1-centered", "2-equal", "3-cards", "2 column grid", "sticky header", "hamburger at 940", "max-width 1080"],
  "responsive": { "strategy": "one centred measure that narrows; sections stack below 940", "breakpoints": [640, 940, 1300], "queries": ["(min-width:940px)", "(max-width:939px)"] },
  "scan": { "…": "what tools/scan.mjs measured — landmarks with computed display / grid-template-columns / flex-direction / position and their boxes at each width; stylesheet count and bytes; media and container queries found" },
  "notes": "one paragraph a newcomer can read: what the layout is and what it does when the window shrinks"
}
```

   `layout` (the global layout at each width) and `sections[].layout` use the `N-name` ids from the rules; `tags` is flat and free — everything clickable comes from it. `scan` is machine-written and never hand-edited; everything above it is what a minion writes after LOOKING at the shots.

2. **The tools**, Node scripts in `public/websites/tools/`, run from the repo root, never in the browser:
   - `shoot.mjs <url> <name>` — the five jpeg shots into `site/<name>/`, and it creates or merges `site/<name>.json` with `url`, `title`, `captured_at`, `shots`, `embed` (from `x-frame-options` and CSP `frame-ancestors`). The recipe in the rules; the mastermind's `mm-external-probe.mjs` is a working start.
   - `scan.mjs <url> <name>` — merges `scan` and `responsive.queries` into the json: at each of the four widths, every `header nav main aside footer section article [role]` plus the five largest boxes by area — tag, id/class (first two classes), computed `display`, `grid-template-columns`, `grid-template-rows` (first 60 chars), `flex-direction`, `flex-wrap`, `position`, `columns`, `float`, and its rect; the count of direct children laid side by side (children whose rects share a top within 8px) — that number IS the column count a human would see; the stylesheets (count, bytes) and every `@media` / `@container` query string found in the captured CSS (deduplicated, sorted). `mm-scan-probe.mjs` in the scratchpad already does most of this on one width.
   - `index.mjs` — reads every `site/*.json` and writes `site/index.json`: `{ "sites": [ { name, title, url, category, layout, tags, shot: "site/<name>/1280.jpg" } ], "tags": { "<tag>": ["<name>", …] }, "generated_at" }`. The pages read THIS, never the directory — production is static and nothing crawls (`/blog/posts.js` made the same call, for the same reason).
   - `readme.md` in `tools/`: one line per tool, the command, what it writes.

3. **The class** — `public/websites/Site.js`. A `Site` page renders one record: the four viewport shots side by side at a common height (400 / 1280 / 1920 / 3440 — the responsive story reads at a glance), the global layout ids under each, the `long` shot one click down; the tag chips (each links to `/websites/tag/<tag>/`); the sections table (name · layout · css · note); the responsive sentence and the breakpoints; **the viewer**: when `embed` is `allowed`, an `iframe` of the live site with a width slider (400 → 3440) and a zoom-out (`transform: scale()` on the frame so a 3440-wide frame fits the page; container queries cannot restyle themselves — the wrapper sets the size) ; when `blocked`, the screenshot strip stands in and one sentence says why; the link out; the raw json one click down. Sites route from the json — read how `public/framework/ai/2026-09-06/page.js` `route(name)` builds an `AITask` from a file, and do the same from `site/<name>.json`; the index reads `site/index.json`.

4. **The pages** — `public/websites/page.js`: two sentences, then the wall: one card per site (its 1280 shot as the picture, the title, its layout ids at 1920 and 400 as chips, three tags); a tag filter row above the wall (click a tag, the wall narrows; nothing persists). `/websites/tag/<tag>/` — every site carrying the tag, same cards, and a link to `/layouts/<tag>/` when the tag is a layout id (that page may not exist yet tonight — `/layouts/` is being built beside you; link it anyway). Register `/websites/` and `/layouts/` in `public/page.js` the way `/web/` and `/imagine/` are registered (read that file and `nav.js` first; keep the edit to the two names).

5. **Seed three sites** through the real tools so every page has something to show: `https://developer.mozilla.org/en-US/docs/Web/CSS`, `https://en.wikipedia.org/wiki/CSS`, `https://stripe.com/`. Look at the shots with the Read tool, fill `layout`, `sections`, `tags`, `responsive.strategy`, `notes` by hand, run `index.mjs`, and open every page you made on `http://localhost:8123/websites/` — the index, a site, a tag — and screenshot each at 400 and 1920 into your task dir as proof.

6. **Docs**: `readme.md` (index shape), `doc/schema.md` (the contract), `doc/tools.md`, `doc/decisions.md` (why a manifest, why jpeg, why the CSSOM is not read, why the viewer scales rather than resizes the page).

## Fences and budget

Write ONLY `public/websites/**`, two names in `public/page.js`, and this dir. Read anything. The mastermind's server on :8123 serves the tree — look there; do not start one unless :8123 cannot show you something (then `PORT=8094`, kill your pid at landing). `/layouts/` is being written by a sibling in parallel — never write there; the layout ids are the seed words in the rules. Budget ~450k tokens. Report in ≤ 10 plain lines: the three urls a reader opens first, the json shape in one sentence, what the tools measure, what the viewer does when a site blocks iframes, what you left and why.
