# Dawn check — closing verification, 2026-08-17

Final pass before Mike wakes, run *after* the catalog CSS work (5 changes),
the LayoutTool `cut` guard + taste/corpus churn, the `ai.css` mobile-rail
scope, the six `styles/elements/*` conversions, the new pages, and the
Server loopback guards — everything the earlier same-day
[`smoke.md`](./smoke.md) (237 checks, 0 failures) ran *before*.

**Method**: dev server on `:80`, not restarted (per the brief — its process
predates tonight's `Server/` loopback guards, expected, Mike's restart to
do). Headless Playwright, global install, `window.$BLOCKRELOAD = true` via
`addInitScript`. `LayoutTool.js` imported in its own `page.evaluate()`,
separate from the `analyze()` call. Browser context recycled every 38
navigations (`readme.md`'s measured ceiling is ~85–110; halved for margin).
**398 checks total, 0 navigations lost to the renderer wedge.** Scripts and
raw JSON: session scratchpad (`dawn-verify.mjs`, `jsonl-check.mjs` +
`*-results.json`), not committed. Catalog callers were found **empirically,
not from a list** — every `.page-catalog` under `.active-page`, excluding
any nested inside a demo sandbox (`[data-layout-ignore]`, `.demo-stage`,
`.demo-app`) — because trusting a named list is the exact mistake
`catalog/doc/decisions.md` records biting this module twice already. That
walk found **50 catalog callers**, not the 16 the readme names by hand (it
predates the six `styles/elements/*` conversions and doesn't count every
`Doc` page).

## What was checked

| # | check | scope | result |
|---|---|---|---|
| 1 | every url in `audit/pages.js`, console/pageerror + `.app` content length | 168 pages @ 1280 | **168/168 pass** |
| 2 | every catalog() caller — `analyze()` for `unreachable`/`zero-size`/`gutter`, plus scroll geometry | 50 urls × 4 widths (390/720/1280/3440) = 200 | **200/200 pass** — 0 `unreachable`, 0 `zero-size`, 0 scroll problems anywhere |
| 3 | new + changed pages, screenshotted | 17 urls × 2 widths (1280/3440) = 34 | **34/34 pass**, 34 screenshots saved |
| 4 | interactive: space depth/chaos sliders, corpus case table, taste sort control | 3 pages | **3/3 pass**, confirmed by DOM state |
| 5 | every `task.jsonl` under `ai/2026-08-16/` + `ai/2026-08-17/`, both `day.jsonl` — parses, no BOM | 40 files | **39/40 pass** — 1 file has one malformed line (detail below); 0 BOMs |
| 6 | dashboards render a card per task dir | `/framework/ai/`, `/framework/ai/2026-08-16/`, `/framework/ai/2026-08-17/` | **3/3 pass**, card counts match the filesystem exactly |
| — | `LayoutTool/probe.js`'s new `cut` guard, spot-checked on the deepest page on the site | `/framework/ext/Panel/` @ 390/720/1280/3440 | **pass** — `analyze()` completes, 0 crashes, 0 `unreachable`/`zero-size`/`gutter` |
| — | previously-documented mobile bug (`ai.css`, task nobody had fixed yet) | `/framework/ai/2026-08-16/mastermind-layout/` @ 390, routed | **now fixed** — see Notable, below |

**No page rendered blank without a console error** — the dangerous case the
brief called out. Shortest `.app` text site-wide is `/notes/` at 378
characters, a legitimately small page (same as the prior smoke check).

**Every catalog-caller content region that overflows scrolls.** All 200
width-checks: where `.page-catalog-pages`'s `scrollHeight > clientHeight`,
`overflow-y` was `auto` and `clientHeight > 0` in every case — nothing
clipped, nothing collapsed to 0×0.

## Notable — a bug fixed, not found

`ext/AITask/ai.css`'s Open item ("`/framework/ai/<day>/` is unreachable at
`<64em` while routed," pre-dating tonight, out of catalog's fence) is
**closed**. Direct check, `/framework/ai/2026-08-16/mastermind-layout/` @
390px: `.page-catalog-pages` now reads `scrollHeight 7956 / clientHeight
362 / overflow-y: auto` — reachable by scroll, where it used to clip to
`clientHeight: 0` with nothing routed. Tonight's routed/unrouted scope on
the mobile rail is the fix landing.

## Failures, ranked by visibility

**None are from tonight's catalog/LayoutTool/ai.css/styles-elements work.**
Four items surfaced, all low-visibility or out of fence:

1. **`/framework/styles/layouts/` — `gutter: high`, text 0px from `div.pages`'s edge (1280, not a catalog page).**
   Most visible of the four (a real edge-flush text run), but this page
   left `catalog()` for `ext/Panel` earlier today (per its own readme) and
   `after.md` already logged its score drop as Panel's regression, not
   catalog's — confirmed again here, unrelated to tonight's five catalog
   CSS changes. `ext/Panel/` is explicitly out of this check's fence.

2. **Eight low-severity `gutter` findings, all the same shape: table text 3–4px from a `<table>` edge**, on `/framework/core/Page/`, `/framework/ext/Ask/`, `/framework/ext/LayoutTool/`, `/framework/ext/demo/`, `/framework/ext/highlight/`, `/framework/ext/layout/`, plus two low table-gutter hits on `/framework/faq/`, `/framework/ui/dialog/`, `/framework/versus/` at 1280. Barely visible (3–4px), all `low` severity, and spread across pages that aren't catalog callers at all (`faq/`, `versus/`, `ui/dialog/`) — a shared `ui.table()` characteristic, not a catalog regression.

3. **`public/framework/ai/2026-08-16/mastermind-layout/task.jsonl` line 154 — malformed JSON, one line.**
   `"outcome": "...compliance\mike..."` — a literal `\m` is not a valid JSON
   escape. Invisible on the rendered site: `JSONL.js` already catches a bad
   line per-entry (`bad.push(line)`) rather than failing the whole parse,
   so this one action's outcome text is silently dropped from the log and
   the dashboard — nothing crashes, nothing errors, the task still shows
   correctly. Confirmed by direct `JSON.parse` against every line of all 40
   files; this is the only failure in that set.

4. **`ext/LayoutTool/audit/pages.js` (the 168-url corpus) is stale — missing at least `/framework/audit/browsable/`,** a real, working, declared page (confirmed: has a `page.js`, is a declared child of `/framework/audit/`, renders cleanly, screenshot below). Zero visitor impact — it's a generated list that hasn't been re-walked since this page landed, so item 1's 168-page sweep didn't include it, though item 3's dedicated check did. Tooling lag, not a site bug.

## Screenshots

`…/scratchpad/screenshots/` (34 files, 1280 + 3440 for each):

`framework_ext_LayoutTool_taste__{1280,3440}.png` ·
`framework_ext_LayoutTool_taste_corpus__{1280,3440}.png` ·
`framework_ext_LayoutTool_audit_taste__{1280,3440}.png` ·
`framework_audit_browsable__{1280,3440}.png` ·
`framework_dev_Claim__{1280,3440}.png` ·
`framework_styles_layouts_space_hunt__{1280,3440}.png` ·
`framework_ai_2026-08-16__{1280,3440}.png` ·
`framework_ai_2026-08-16_mastermind-layout__{1280,3440}.png` ·
`framework_styles_elements_{text,lists,code,media,misc,table}__{1280,3440}.png` ·
`framework_styles_elements_text_scale__{1280,3440}.png` ·
`framework_styles_elements_lists_basics__{1280,3440}.png` ·
`framework_styles_elements_code_basics__{1280,3440}.png`

Full path prefix:
`C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\c6315543-dde2-46c6-b052-c819794f42e8\scratchpad\screenshots\`

Spot-checked visually (not just file-size-checked): the two `ai/2026-08-16/`
pages, `taste/corpus/`, `dev/Claim/`, `space/hunt/`, `styles/elements/misc/`
@3440, and `audit/taste/` @3440 — all show real, correctly-laid-out content,
no visual breakage, no dead space or clipping.

## Verdict

**Ship it.** 168/168 pages load clean, 200/200 catalog-caller width-checks
pass with zero `unreachable`/`zero-size`/scroll problems (the exact class of
bug five CSS changes landed to fix or avoid tonight), 34/34 new-page
screenshots pass at 1280 and 3440, all three interactive controls confirmed
working by DOM state, 39/40 JSONL files parse clean with zero BOMs (the one
failure drops silently and invisibly, by design, in existing code), all
three dashboards render every task dir as a card, the `cut` guard doesn't
crash `analyze()` on the site's deepest page, and a previously-documented,
pre-existing mobile bug is now closed. Nothing found traces to tonight's
catalog, LayoutTool, `ai.css`, or `styles/elements` work.
