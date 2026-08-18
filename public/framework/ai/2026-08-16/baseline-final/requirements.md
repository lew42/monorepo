# baseline-final

Dispatched by the mastermind run `mastermind-layout` (2026-08-16 -> 2026-08-17).
Verbatim brief:

> The baseline predates a fix that removed false findings from eight rows. A
> three-line guard landed in `ext/LayoutTool/probe.js` an hour ago (the
> `depth = 20` cull now records `nodes[parent].cut = true`, `read_text()` skips
> a cut node — see `ai/2026-08-16/mastermind-layout/gutter.md` and
> `ext/LayoutTool/knowledge/false-positives.md`'s first entry). Regenerate
> `audit/findings.json` and `audit/taste.json` with the recipe in
> `LayoutTool/readme.md`: hoist the `import()` into its own `page.evaluate()`,
> recycle the browser context every ~40 navigations, `waitUntil: "load"` plus a
> fixed settle, never `networkidle`. Match each file's existing `format`/`tier`
> contract exactly. Recompute the tier fingerprint (it WILL change — `probe.js`
> is one of the five files it hashes). Both files must come back 336/336 with
> zero error rows. Confirm the eight rows land where `gutter.md` says, and
> report any row that moved which is not on that list. Verify both audit pages
> render at 1280 via `mcp__site__shot` (scoped to `.active-page`, never an
> existing tab). Report: 336/336, new tier fingerprint, worst five, how many
> pages carry a `high` finding, any unexpected mover.

**Fence** — may write only: `public/framework/ext/LayoutTool/audit/findings.json`,
`public/framework/ext/LayoutTool/audit/taste.json`, and this task dir. Never
touch `probe.js` or any source file, `audit/page.js`, `audit/readme.md`,
`taste/**`, or anything under `public/framework/ext/Panel/` (owned by another
session). Data regeneration only, no behaviour change.

## Steps

1. Read `gutter.md` and `false-positives.md`'s first entry (the analysis is
   done; don't redo it) plus `LayoutTool/readme.md`'s regen recipe and the
   prior regen tasks (`audit-baseline`, the taste regen notes) for the exact
   contract each file states in its own header field.
2. Write a headless Playwright sweep (scratchpad, RULE#12) driving
   `probe()` + `analyze()` + `rate()` off one shared model per page x width,
   168 pages x [1280, 3440] from `audit/pages.js`.
3. Run it in the foreground, 336/336, verify 0 errors.
4. Assemble `findings.json` (`{generated_at, format, rows}`) and `taste.json`
   (`{note, tier, generated_at, rows}`), recompute the tier fingerprint
   (sha256[0:16] of `probe.js` + `taste/{read,ranges,taste}.js` + `score.js`
   + `rules.js`), row order matching the existing convention (width outer,
   `pages.js` order inner).
5. Diff against the committed baseline: confirm the eight `gutter.md` rows,
   flag and explain any other mover.
6. Verify both audit pages at 1280 via `mcp__site__shot` scoped to
   `.active-page`.
7. Land: report 336/336, new tier fingerprint, worst five, high-finding page
   count, unexpected movers.
