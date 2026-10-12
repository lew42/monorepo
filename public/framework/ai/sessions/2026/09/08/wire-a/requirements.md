# wire-a — redraw 10 websites content-free, from the screenshots already on disk (Sonnet, group `websites`)

Three laws: less is more (ASAP); clear beats brief, by far; prioritize. Length budget: per site one `wire` object of 10–30 lines; your report eight plain lines.

⚠ **NO INTERNET. Do not load any external website, run `shoot.mjs`, `scan.mjs`, or any probe against the web.** The owner's connection dropped tonight during the crawl and every external load is paused. Everything you need is on disk: the pictures in `public/websites/site/<name>/` and the record in `public/websites/site/<name>.json`. The only server you touch is `http://localhost:8123`.

Read first: `../mastermind-playwright/minion-rules.md`; `../mastermind-playwright/requirements.md` §"The ask" — the sentence this task serves: *"you screenshot the site, and then try to recreate it, without any content, in pure layout form (section's bg color only? primarily? any layout-indicators could be visualized, like section dividers, especially if the section contributes to layout/responsiveness). the minimal recreation can be re-rendered multiple times (400, 1920, 3440)"*; `public/layouts/doc/wire.md` (the spec — roles, `dir`, `w`, `h`, `floor`; a wire is JSON drawn as real flex and grid); the three seed wires for the voice: `public/websites/site/wikipedia-css.json`, `mdn-css.json`, `stripe.json` (`wire` key); `public/websites/tools/lib.mjs` (`read_record` / `write_record` — the merge you write through). Skills: `new-task` (this dir, group `websites`), `finish-task`.

## Your sites — these 10 and no others

| name | title | layout at 1920 | at 400 | breakpoints |
|---|---|---|---|---|
| `alistapart-home` | A List Apart – For people who make websites | 1-centered | 1-flow | 600,984,1249 |
| `apple-home` | Apple | 1-flow | 1-flow | 834,1024,1441 |
| `css-tricks-home` | CSS-Tricks - Learning for front-end designers and  | 1-centered | 1-flow | 640,768,950 |
| `gitlab-explore` | Explore projects · GitLab | 2-sidebar | 1-flow | 768,1200 |
| `guardian-international` | Latest news, sport and opinion from the Guardian | 1-centered | 1-flow | 600,1280,1920 |
| `linear-home` | Linear – The system for product development | 1-centered | 1-flow | 768,1024,1280 |
| `notion-home` | The AI workspace that works for you. | Notion | 1-bands | 1-bands | 600,840,1080 |
| `privy-home` | Privy – Digital asset infrastructure for global fi | 1-bands | 1-flow | 400,1280 |
| `simon-willison-blog` | Simon Willison’s Weblog | 2-sidebar | 1-flow | 480,800,940 |
| `uswds-home` | USWDS: The United States Web Design System | U.S.  | 1-bands | 1-bands | 480,640,1024 |

## Per site

1. **Look** at `site/<name>/1920.jpg` and `site/<name>/400.jpg` with the Read tool (the `long.jpg` when the fold hides the body). Read the record's `layout`, `sections` and `responsive.breakpoints` — the sections list is your band list, in order.
2. **Write the wire**: `page` → the full-width bands top to bottom (header, hero, the sections, footer), each band with columns as `dir: "row"` kids, each kid a role from the fixed list, sized with `w` (a share or an `em` measurement) and `h`. Put `floor` on each row at the width where the real site stacks it (from `responsive.breakpoints`), so the 400 drawing stacks the way the 400 shot does. Only what decides the layout: no colour choices (the role paints), no decoration, nothing a stranger could not point to in the shot.
3. **Write it through the merge** — a scratchpad script `wire-a-write.mjs` that reads the record with `read_record`, sets `wire`, writes with `write_record`. Never rewrite another key; never hand-edit the json.
4. **Check the drawing**: load `http://localhost:8123/websites/<name>/` headless at 1920×1080 (a scratchpad probe `wire-a-check.mjs`; the Playwright import is in the rules), screenshot the page, Read it, and compare the three wires against the real shot above them. Adjust once if a stranger would not match them; then move on. Write one honest word per site in your log: `close`, `rough`, or `wrong` (with why).
5. Anything the spec could not express (a carousel wider than the page, a sticky rail, a layout switcher, an overlay) goes in your `task.jsonl` as a `log` line starting `wire gap:` — the encyclopedia author reads those.

At the end `node public/websites/tools/index.mjs` once.

## Fences and budget

Write ONLY the `wire` key of `public/websites/site/<name>.json` for the names in YOUR table (through the merge), this dir, scratch named `wire-a-*`. Never a sibling's site, never the tools, pages or `layouts.json`. Budget ~250k tokens; if you reach 220k with sites left, land what is done and list the rest. Report in ≤ 8 plain lines: done / left, the honest-word tally (close / rough / wrong), the two wires you are proudest of with their urls, the gaps the spec has.
