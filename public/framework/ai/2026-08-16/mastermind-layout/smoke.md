# Smoke test — closing verification, 2026-08-16

Dev server on `localhost:80` (not restarted). Driven with headless Playwright
(`chromium.launch()`, global install), `window.$BLOCKRELOAD = true` set via
`addInitScript` before every navigation. Scripts and raw JSON live in the
session scratchpad (`crawl.mjs`, `shots.mjs`, `interactive.mjs`,
`validate-jsonl.mjs`, `dashboard.mjs`, `diag-taste.mjs` +
`*-results.json`/`*.log`), not committed.

## 1. Every page loads — full site crawl (168 urls, from `audit/pages.js`)

1280×900, `networkidle`, console `error` + `pageerror` collected, `.app`
existence and rendered-text length checked (guards against the "blank page,
no console error" case). **167 pass, 1 flagged — and the flag is a deliberate
demo fixture, not a break** (detail below). No page rendered blank or
near-empty: the shortest `.app` text on the whole site is `/notes/` at 378
characters, a legitimately small page, not a failure.

| url | status | .app text chars |
|---|---|---|
| / | pass | 494 |
| /framework/ | pass | 5610 |
| /framework/ai/ | pass | 62658 |
| /framework/audit/ | pass | 4468 |
| /framework/audit/overview/organization/ | pass | 5404 |
| /framework/audit/overview/priorities/ | pass | 7416 |
| /framework/core/ | pass | 3762 |
| /framework/core/App/ | pass | 2749 |
| /framework/core/Item/ | pass | 3873 |
| /framework/core/List/ | pass | 3392 |
| /framework/core/Page/ | pass | 8096 |
| /framework/core/Page/children/ | pass | 6326 |
| /framework/core/Page/flow/ | pass | 5233 |
| /framework/core/Page/nav/ | pass | 5812 |
| /framework/core/Page/overview/add/ | pass | 5556 |
| /framework/core/Page/overview/catalog/ | pass | 5493 |
| /framework/core/Page/overview/children/ | pass | 5487 |
| /framework/core/Page/overview/dashboard/ | pass | 5943 |
| /framework/core/Page/overview/deep/ | pass | 5581 |
| /framework/core/Page/overview/docs/ | pass | 6236 |
| /framework/core/Page/overview/labels/ | pass | 6088 |
| /framework/core/Page/overview/landing/ | pass | 6005 |
| /framework/core/Page/overview/page/ | pass | 5082 |
| /framework/core/Page/overview/route/ | pass | 5416 |
| /framework/core/Page/overview/shapes/ | pass | 5882 |
| /framework/core/Page/overview/site/ | pass | 6714 |
| /framework/core/Page/overview/strip/ | pass | 5513 |
| /framework/core/Page/overview/wall/ | pass | 5358 |
| /framework/core/Page/previews/ | pass | 5859 |
| /framework/core/Page/shell/ | pass | 4958 |
| /framework/core/Router/ | pass | 2741 |
| /framework/core/Sidebar/ | pass | 3508 |
| /framework/core/View/ | pass | 3141 |
| /framework/dev/ | pass | 2137 |
| /framework/dev/Claim/ | pass | 1857 |
| /framework/dev/DevBar/ | pass | 5534 |
| /framework/dev/Socket/ | pass | 2743 |
| /framework/ext/ | pass | 3689 |
| /framework/ext/AITask/ | pass | 2203 |
| /framework/ext/Ask/ | pass | 3458 |
| /framework/ext/Draggable/ | pass | 2929 |
| /framework/ext/JSONL/ | pass | 2845 |
| /framework/ext/LayoutTool/ | pass | 5095 |
| /framework/ext/LayoutTool/audit/ | pass | 21035 |
| /framework/ext/LayoutTool/audit/taste/ | pass | 16858 |
| /framework/ext/LayoutTool/knowledge/ | pass | 2594 |
| /framework/ext/LayoutTool/library/ | pass | 9034 |
| /framework/ext/LayoutTool/library/bad/ | pass | 7815 |
| /framework/ext/LayoutTool/taste/ | pass | 8491 |
| /framework/ext/LayoutTool/taste/corpus/ | pass | 3031 |
| /framework/ext/LayoutTool/tests/ | pass | 4893 |
| /framework/ext/LayoutTool/widths/ | pass | 1386 |
| /framework/ext/Panel/ | pass | 24367 |
| /framework/ext/Saver/ | pass | 3185 |
| /framework/ext/Timeline/ | pass | 3777 |
| /framework/ext/catalog/ | pass | 4109 |
| /framework/ext/demo/ | pass | 10926 |
| /framework/ext/Doc/ | pass | 6013 |
| /framework/ext/Doc/overview/urls/ | pass | 2264 |
| /framework/ext/drawer/ | pass | 2503 |
| /framework/ext/editor/ | pass | 4626 |
| /framework/ext/files/ | pass | 3921 |
| /framework/ext/highlight/ | pass | 5384 |
| /framework/ext/layout/ | pass | 5801 |
| /framework/ext/markdown/ | **FLAG (expected)** | 3971 |
| /framework/ext/tabs/ | pass | 5804 |
| /framework/ext/toc/ | pass | 3408 |
| /framework/faq/ | pass | 9889 |
| /framework/start/ | pass | 3592 |
| /framework/start/example/ | pass | 886 |
| /framework/start/example/about/ | pass | 917 |
| /framework/start/example/about/team/ | pass | 923 |
| /framework/styles/ | pass | 5848 |
| /framework/styles/elements/ | pass | 4044 |
| /framework/styles/elements/code/ | pass | 2295 |
| /framework/styles/elements/forms/ | pass | 2340 |
| /framework/styles/elements/lists/ | pass | 1317 |
| /framework/styles/elements/media/ | pass | 1112 |
| /framework/styles/elements/misc/ | pass | 3051 |
| /framework/styles/elements/table/ | pass | 1727 |
| /framework/styles/elements/text/ | pass | 2420 |
| /framework/styles/layers/ | pass | 2891 |
| /framework/styles/layers/base/ | pass | 5887 |
| /framework/styles/layers/site/ | pass | 3231 |
| /framework/styles/layers/theme/ | pass | 8783 |
| /framework/styles/layers/theme/guide/ | pass | 5772 |
| /framework/styles/layers/theme/lew42/ | pass | 4740 |
| /framework/styles/layers/util/ | pass | 8530 |
| /framework/styles/layouts/ | pass | 39296 |
| /framework/styles/layouts/400/ | pass | 8534 |
| /framework/styles/layouts/carousel/ | pass | 7101 |
| /framework/styles/layouts/chat/ | pass | 4223 |
| /framework/styles/layouts/dashboard/ | pass | 2634 |
| /framework/styles/layouts/docs/ | pass | 4084 |
| /framework/styles/layouts/document/ | pass | 3566 |
| /framework/styles/layouts/feed/ | pass | 3624 |
| /framework/styles/layouts/fit/ | pass | 6280 |
| /framework/styles/layouts/flex/ | pass | 3869 |
| /framework/styles/layouts/gallery/ | pass | 2166 |
| /framework/styles/layouts/grid/ | pass | 4436 |
| /framework/styles/layouts/hero/ | pass | 4400 |
| /framework/styles/layouts/landing/ | pass | 3584 |
| /framework/styles/layouts/mail/ | pass | 4163 |
| /framework/styles/layouts/masonry/ | pass | 13489 |
| /framework/styles/layouts/masonry/packed/ | pass | 8196 |
| /framework/styles/layouts/model/ | pass | 7224 |
| /framework/styles/layouts/overlay/ | pass | 4629 |
| /framework/styles/layouts/pricing/ | pass | 6479 |
| /framework/styles/layouts/shell/ | pass | 3775 |
| /framework/styles/layouts/sidebar/ | pass | 6591 |
| /framework/styles/layouts/space/ | pass | 61154 |
| /framework/styles/layouts/space/compose/ | pass | 3797 |
| /framework/styles/layouts/space/hunt/ | pass | 1494 |
| /framework/styles/layouts/space/words/ | pass | 12712 |
| /framework/styles/layouts/split/ | pass | 3677 |
| /framework/styles/layouts/stack/ | pass | 4911 |
| /framework/styles/rules/ | pass | 2118 |
| /framework/styles/sections/ | pass | 10978 |
| /framework/ui/ | pass | 4511 |
| /framework/ui/accordion/ | pass | 3366 |
| /framework/ui/alert/ | pass | 2575 |
| /framework/ui/avatar/ | pass | 2390 |
| /framework/ui/badge/ | pass | 3281 |
| /framework/ui/card/ | pass | 2883 |
| /framework/ui/crumbs/ | pass | 2653 |
| /framework/ui/dialog/ | pass | 3409 |
| /framework/ui/field/ | pass | 2576 |
| /framework/ui/kbd/ | pass | 2323 |
| /framework/ui/menu/ | pass | 3713 |
| /framework/ui/pagination/ | pass | 2659 |
| /framework/ui/panel/ | pass | 3239 |
| /framework/ui/progress/ | pass | 2617 |
| /framework/ui/stats/ | pass | 2620 |
| /framework/ui/table/ | pass | 2257 |
| /framework/ui/tags/ | pass | 2925 |
| /framework/ui/timeline/ | pass | 3427 |
| /framework/ui/toolbar/ | pass | 2633 |
| /framework/ui/tooltip/ | pass | 4974 |
| /framework/util/ | pass | 1775 |
| /framework/util/is/ | pass | 1932 |
| /framework/util/markup/ | pass | 2725 |
| /framework/util/source/ | pass | 1846 |
| /framework/versus/ | pass | 7637 |
| /notes/ | pass | 378 |
| /notes/auth/ | pass | 11011 |
| /notes/git-branch-names/ | pass | 860 |
| /notes/team-note/ | pass | 2044 |
| /web/ | pass | 822 |
| /web/layout/ | pass | 3838 |
| /web/layout/flex/ | pass | 6868 |
| /web/layout/flow/ | pass | 6273 |
| /web/layout/grid/ | pass | 6163 |
| /web/layout/measure/ | pass | 7014 |
| /web/layout/respond/ | pass | 7258 |
| /web/layout/screens/ | pass | 8238 |
| /web/layout/tracks/ | pass | 5341 |
| /web/nav/ | pass | 4481 |
| /web/nav/bar/ | pass | 5981 |
| /web/nav/crumbs/ | pass | 5827 |
| /web/nav/drawer/ | pass | 6721 |
| /web/nav/drill/ | pass | 11482 |
| /web/nav/footer/ | pass | 5282 |
| /web/nav/jumps/ | pass | 9351 |
| /web/nav/links/ | pass | 5208 |
| /web/nav/rail/ | pass | 5006 |
| /web/nav/sidebar/ | pass | 6590 |
| /web/nav/tabs/ | pass | 7827 |
| /web/nav/wall/ | pass | 6513 |

## 2. Changed/created pages — 1280 and 3440, screenshotted

20 pages × 2 widths = 40 checks, full-page screenshot each. **40/40 pass** —
no nav error, no console error, no page error, `.app` present with real
content at both widths. Screenshots are viewport-height (900px) captures, not
true full-page: this site's scroll region is an inner `.pages > .default`
under a `height:100%` shell, not `document.body`, so Playwright's
`fullPage: true` (which measures `document.body.scrollHeight`) only captured
what fit at 900px tall. Good enough to confirm each page paints correctly at
both widths; not a full record of everything below the fold. All files are
under `…/scratchpad/shots/<slug>__<width>.png`:

| url | 1280 | 3440 |
|---|---|---|
| /framework/ | pass — `shots/framework__1280.png` | pass — `shots/framework__3440.png` |
| /framework/audit/ | pass — `shots/framework_audit__1280.png` | pass — `shots/framework_audit__3440.png` |
| /framework/audit/browsable/ | pass — `shots/framework_audit_browsable__1280.png` | pass — `shots/framework_audit_browsable__3440.png` |
| /framework/dev/Claim/ | pass — `shots/framework_dev_Claim__1280.png` | pass — `shots/framework_dev_Claim__3440.png` |
| /framework/ext/LayoutTool/taste/ | pass — `shots/framework_ext_LayoutTool_taste__1280.png` | pass — `shots/framework_ext_LayoutTool_taste__3440.png` |
| /framework/ext/LayoutTool/taste/corpus/ | pass — `shots/framework_ext_LayoutTool_taste_corpus__1280.png` | pass — `shots/framework_ext_LayoutTool_taste_corpus__3440.png` |
| /framework/ext/LayoutTool/audit/taste/ | pass — `shots/framework_ext_LayoutTool_audit_taste__1280.png` | pass — `shots/framework_ext_LayoutTool_audit_taste__3440.png` |
| /framework/styles/layouts/space/ | pass — `shots/framework_styles_layouts_space__1280.png` | pass — `shots/framework_styles_layouts_space__3440.png` |
| /framework/styles/layouts/space/hunt/ | pass — `shots/framework_styles_layouts_space_hunt__1280.png` | pass — `shots/framework_styles_layouts_space_hunt__3440.png` |
| /framework/styles/layouts/space/compose/ | pass — `shots/framework_styles_layouts_space_compose__1280.png` | pass — `shots/framework_styles_layouts_space_compose__3440.png` |
| /framework/styles/elements/text/ | pass — `shots/framework_styles_elements_text__1280.png` | pass — `shots/framework_styles_elements_text__3440.png` |
| /framework/styles/elements/lists/ | pass — `shots/framework_styles_elements_lists__1280.png` | pass — `shots/framework_styles_elements_lists__3440.png` |
| /framework/styles/elements/code/ | pass — `shots/framework_styles_elements_code__1280.png` | pass — `shots/framework_styles_elements_code__3440.png` |
| /framework/styles/elements/media/ | pass — `shots/framework_styles_elements_media__1280.png` | pass — `shots/framework_styles_elements_media__3440.png` |
| /framework/styles/elements/misc/ | pass — `shots/framework_styles_elements_misc__1280.png` | pass — `shots/framework_styles_elements_misc__3440.png` |
| /framework/styles/elements/table/ | pass — `shots/framework_styles_elements_table__1280.png` | pass — `shots/framework_styles_elements_table__3440.png` |
| /framework/styles/elements/code/tokens/ (sample child) | pass — `shots/framework_styles_elements_code_tokens__1280.png` | pass — `shots/framework_styles_elements_code_tokens__3440.png` |
| /framework/styles/elements/media/svg/ (sample child) | pass — `shots/framework_styles_elements_media_svg__1280.png` | pass — `shots/framework_styles_elements_media_svg__3440.png` |
| /framework/styles/elements/misc/focus/ (sample child) | pass — `shots/framework_styles_elements_misc_focus__1280.png` | pass — `shots/framework_styles_elements_misc_focus__3440.png` |
| /framework/styles/elements/table/scroll/ (sample child) | pass — `shots/framework_styles_elements_table_scroll__1280.png` | pass — `shots/framework_styles_elements_table_scroll__3440.png` |

The six element parents' `page.js` diffs show every `demo.page(...)` child as
new in the working tree, so rather than screenshot all ~35 children I sampled
one per four of the six categories (`code`, `media`, `misc`, `table`) as a
spot check; `lists` and `text` were checked via their parent's `catalog()`
rail only, visible in the parent screenshots above.

Screenshot directory:
`C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\c6315543-dde2-46c6-b052-c819794f42e8\scratchpad\shots\`

## 3. Interactive controls

All three **pass**, confirmed by DOM state before/after, not just "clicked and moved on":

| control | observed |
|---|---|
| `/framework/styles/layouts/space/` — depth slider | Set `input.space-depth[0]` (depth) to 8 via `input` event → `.space-text` textarea value changed from `full fill flex v\n  > topbar\n  pad flow measure --measure:52e…` to `full fill flex v --pad:0.68em --gap:1.86em\n  tone --tone:var…`. Spec regenerated. |
| `/framework/styles/layouts/space/` — chaos slider | Set the second `input.space-depth` (chaos) to 90 → textarea value changed again, to `full fill flex v --pad:0.13em --gap:2.86em\n  tone --tone:var…`. Spec regenerated a second time. |
| `/framework/ext/LayoutTool/taste/corpus/` — case table | Waited out the "measuring…" note; it resolved to **"29 agree · 1 disagree · 12 not applicable"** with **42** `.space-mark` rows rendered (29+1+12=42, consistent). Table populates. |
| `/framework/ext/LayoutTool/audit/taste/` — ranked table | **168** rows on load (`.lt-out table tbody tr`, matches the 168-page corpus). Clicked the `measure` sort button: `h2` text changed from *"168 pages at 1280px, sorted by taste score — worst first"* to *"…sorted by measure…"*, and the top row changed from `/framework/styles/layouts/overlay/` to `/framework/`. Sort control re-ranks live. |

**Methodology note, not a site bug:** this page (`/framework/ext/LayoutTool/audit/taste/`) is a declared child of `/framework/ext/LayoutTool/audit/`, and the Router keeps the **parent mounted in the DOM as a hidden `.active-ancestor`** (rect 0×0, `display` collapsed) while the child is `.active-page` — both reuse the classes `.lt-page`/`.lt-run`/`.lt-out`. An unscoped `page.locator(".lt-out table tbody tr")` silently counts the hidden parent's 205 rows *plus* the child's 168 (373 total) and grabs the parent's `h2`/buttons first. First pass here hit exactly that and produced a false read (`clickedButton: null`, `sortRespond: false`); rescoped to `.page.active-page …` it passes cleanly, and confirmed the parent's own audit table (`/framework/ext/LayoutTool/audit/`) is unaffected in either view.

## 4. JSONL logs — `2026-08-16/`

24 files (23 `task.jsonl` + `day.jsonl`), every line parsed with `JSON.parse`,
byte-checked for a leading UTF-8 BOM. **24/24 pass — zero bad lines, zero
BOMs.**

| file | lines | BOM | bad lines |
|---|---|---|---|
| ai-dashboard-dated-list/task.jsonl | 21 | no | 0 |
| browsable-page/task.jsonl | 6 | no | 0 |
| browse-grids/task.jsonl | 41 | no | 0 |
| dashboard-agents-fix/task.jsonl | 6 | no | 0 |
| day.jsonl | 42 | no | 0 |
| demo-coverage/task.jsonl | 7 | no | 0 |
| devbar-blockreload/task.jsonl | 9 | no | 0 |
| devbar-grip-offscreen/task.jsonl | 14 | no | 0 |
| devbar-grip-scrollbar/task.jsonl | 16 | no | 0 |
| element-pages/task.jsonl | 14 | no | 0 |
| files-panels/task.jsonl | 26 | no | 0 |
| improve-space-page/task.jsonl | 29 | no | 0 |
| layout-generator-rules/task.jsonl | 123 | no | 0 |
| layout-tool-live/task.jsonl | 39 | no | 0 |
| mastermind-layout/task.jsonl | 56 | no | 0 |
| mastermind-run/task.jsonl | 46 | no | 0 |
| measure-token-proposal/task.jsonl | 11 | no | 0 |
| panel-icon-buttons/task.jsonl | 92 | no | 0 |
| panel-swiss-army/task.jsonl | 49 | no | 0 |
| space-depth-panels/task.jsonl | 5 | no | 0 |
| taste-audit/task.jsonl | 8 | no | 0 |
| taste-corpus/task.jsonl | 5 | no | 0 |
| ui-wall-masonry/task.jsonl | 11 | no | 0 |
| web-prose-variety/task.jsonl | 10 | no | 0 |

## 5. AI dashboard

| url | console errors | task cards |
|---|---|---|
| `/framework/ai/` | 0 | 89 |
| `/framework/ai/2026-08-16/` | 0 | 112 (today's 23 + a history list reaching back to 2026-08-12) |

**All 23 of today's task dirs appear as cards on the day dashboard — 0
missing.** Checked by extracting every `.ai-card-title` `href` and matching
against the 23 `2026-08-16/*/task.jsonl` dirs on disk: `ai-dashboard-dated-list`,
`browsable-page`, `browse-grids`, `dashboard-agents-fix`, `demo-coverage`,
`devbar-blockreload`, `devbar-grip-offscreen`, `devbar-grip-scrollbar`,
`element-pages`, `files-panels`, `improve-space-page`, `layout-generator-rules`,
`layout-tool-live`, `mastermind-layout`, `mastermind-run`,
`measure-token-proposal`, `panel-icon-buttons`, `panel-swiss-army`,
`space-depth-panels`, `taste-audit`, `taste-corpus`, `ui-wall-masonry`,
`web-prose-variety` — all present, all linked.

## Failures, ranked by visibility

**None.** Every check in every section passed. The single item flagged by the
automated crawl is not a break:

1. **`/framework/ext/markdown/` — console 404 on `does-not-exist.md` (cosmetic, by design, lowest possible visibility).**
   `page.js:44` calls `md.file(import.meta, "does-not-exist.md")` on purpose —
   it's the page's own demo of what a missing-file reference looks like. The
   page renders fully (3971 chars of `.app` text) and the 404 is the intended
   behavior of the demo, not a defect. No action needed.

No page rendered blank without a console error — the dangerous case the task
called out specifically didn't occur anywhere in the 168-page crawl or the 40
changed-page screenshots.

## Verdict

**Ship it** — 168/168 pages load clean (1 expected demo-fixture 404, not a
bug), 40/40 changed-page screenshots pass at 1280 and 3440, all three
interactive controls (space sliders, corpus case table, audit/taste sort)
confirmed working by DOM state, all 24 JSONL files parse clean with no BOM,
and both AI dashboard views render with zero console errors and all 23
today's tasks present.
