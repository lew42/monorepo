# layout-analysis — why it is so hard to get a page to look right here, and the one rule that would fix it

Minion: Opus, effort high. Session id `380d3a56-336a-4811-9fb8-971b2c8fd164`. You are IN A
WORKTREE (the launcher says where; your server's port). Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `layout`, `css`.
This is an ANALYSIS with a proposal; the only code you write is the probe, and the fix goes in
only if it is one rule (see 4). `padding-law` (running beside you) is fixing the 3440 gutter
loss and writing a `padding-check`; read its task log and reuse its probe if it has landed.

## The owner's words (2026-09-22 18:28, verbatim)

> we need to do a strong analysis of our page layouts and why it's so hard to get the right
> look on each page. Like, getting things butting up against the sidebar with no padding, or we
> add padding and then double padding, or I don't know, it's just, it's not right.

And through today: "the law of padding that should never be broken"; "the default spacing is
massive, the compact padding is not nearly enough"; "the toolbar needs to move up a bit";
"200px of dead space at the top"; "buttons with border radius butting up against the edge of
the device preview".

## What exists — the spacing model as written

`public/framework/framework.css` (the utility vocabulary; the size standard: one `--size` knob,
pad/gap/flow derived in container units — commit `96b5671f`), `core/Page/Page.css` (the page
shell: `--gutter-x`, `--pad-y`, `.page.full`, `.flow` rhythm, `.bleed`, the catalog grid, the
"old shell words" aliases at ~1055), `styles/system/` (the seven lengths), `ext/catalog/catalog.css`
(cards), `ai/v/3/v3.css` (zeroes the gutter for the board: `.page:has(> .v3)`), `ext/Doc`'s
`.doc-page`, `toc.css`. Past studies: `ai/2026-09-01/` (spacing clamp), `ai/2026-09-05/`
(spacing at 3440), `ai/2026-09-19/padding-audit/`, `ai/2026-09-20/ai-padding/` (four missing
tokens zeroed padding across eleven files), `ai/2026-09-17/` layout browser, memory
"silent render traps" (framework.css's `max-width:100%` and util-layer `:first-child` beat
component CSS).

## Deliverables — one page, `ai/2026-09-22/layout-analysis/page.js`

1. **Where padding comes from, on one diagram.** For one ordinary page (`/framework/styles/`),
   the board (`/framework/ai/days/`), a doc page, and the UX index: every box between the rail
   and the first text, with the rule and file that gives each its padding/margin/gap
   (`getComputedStyle` + the matched rules — `ext/CSSDoc`/`cssdoc()` exists for exactly this,
   `ai/2026-08-18/`). Show where two rules both pay (double padding) and where none does (zero).
2. **The contradictions, counted.** From the probe over every top-level page and one level
   below at 400/1280/1920/3440: how many pages have text < 1 rung from the rail; how many have
   > 2× the gutter (double); how many shells (`full`, `fill`, `topic`, `doc-page`, `columns`,
   the `:has(> .v3)` override…) exist and how many pages each is used by; how many places set
   `--gutter-x` or `padding-inline` on a page-level box. Two numbers that must agree: pages
   probed and pages listed.
3. **Why it is hard — in five plain sentences**, from the evidence: e.g. the gutter is a page
   property that several shells zero for their own reasons, so content inside them must pay it
   back and forgets; the rhythm rule treats hidden siblings as present; container units change
   with width so a fix at 1280 is wrong at 3440; three generations of spacing words coexist.
   Name the real ones you found, not these guesses.
4. **The one rule, and the fix if it is one rule.** Propose the single model that would make
   "text never at 0 from an edge, never double" true by construction — e.g. the page shell
   ALWAYS pays the gutter and a bleed is the only opt-out, applied to a child, never to the
   page; or the gutter is a padding on the region, not the page, so no shell can zero it. Say
   the alternative and its cost. If the fix is one rule change in `Page.css` (plus deleting the
   overrides it makes unnecessary — list them), make it in your worktree, re-run the probe, and
   show zero violations and the number of override lines deleted; if it is more than one rule,
   write it as the brief for the next minion and do not apply it.
5. **The check that keeps it true:** what `padding-check.mjs` (padding-law's) must assert so
   this never regresses, and where in the landing flow it runs.

## Fence

Your task dir, `ai/2026-09-22/page.js` `children:`, and — only under deliverable 4's one-rule
condition — `public/framework/core/Page/Page.css` plus the override lines it retires (each named
in the log). Nothing else. Land by the launcher's patch.

## Length

Page: one screen (the diagram, the five sentences, the rule); the counts one click down.
Landing report: six sentences.
