# `--measure` token — proposal, measured

Dispatched by the mastermind run `mastermind-layout`
(`public/framework/ai/2026-08-16/mastermind-layout/requirements.md`, queue
item 1): `--measure: 52em` runs ~117 characters a line at 3440. A site-wide
token change is RULE#1 surgery — this task produces a written proposal with
measurements, never an autonomous edit to the token.

## The ask, verbatim

> Read first: `ext/LayoutTool/taste/ranges.js` and `taste/read.js` (the
> `measure` band and `AUTHOR.measure`), `knowledge/characters-per-line.md`,
> and grep the repo for `--measure` to find every declaration and every
> override. The inventory of who sets it and to what is half the proposal.
>
> With headless Playwright against the running dev server on port 80, for at
> least 12 real prose pages across `/framework/core/`, `/framework/ext/`,
> `/framework/styles/`, `/web/` and `/framework/ai/`, at 1280, 1920 and 3440,
> record for each page: characters per line and the `analyze()` grade+score;
> the same after overriding `--measure` in-page to 34em, 40em, 46em (a live
> override via `page.addStyleTag`, never a file edit); and what the change
> costs elsewhere — `width-used` and `dead-space`.
>
> Write `public/framework/styles/doc/measure.md` — the proposal, one to two
> screens: the finding in one table (medians per width per candidate), what
> it costs (width-used before/after, honest about the trade), the options
> weighed (leave it / lower the em / `ch`-based / clamp) with a pick, and who
> would break (the grep inventory). Add one pointer line to
> `public/framework/styles/readme.md` and make sure `styles/page.js` reaches
> it via the existing mechanism.

## File ownership

Write only: this task dir, `public/framework/styles/doc/measure.md`, the one
pointer line in `public/framework/styles/readme.md` (+ minimal `page.js`
change if needed to reach it — turned out not to be needed, see below).

**Do not touch:** `framework.css`, `Page.css`, any `--measure` declaration
anywhere, `ext/LayoutTool/**`, `styles/layouts/space/**`, `ext/Panel/**`.

## Steps

1. Read the taste-tier source and knowledge file; grep the full `--measure` inventory
2. Set up headless Playwright against the port-80 dev server
3. Measure 12+ prose pages × 3 widths × 4 measure values (current + 34/40/46em)
4. Also record `width-used` and `dead-space` cost at each candidate
5. Write `styles/doc/measure.md` — finding table, cost, options, blast radius
6. Add pointer line to `styles/readme.md`
7. Verify the doc page loads and the pointer resolves
8. Land — report path, recommendation, blast radius, single most surprising number
