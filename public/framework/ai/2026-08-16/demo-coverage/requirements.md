# demo-coverage

Dispatched by the mastermind run `mastermind-layout` (2026-08-16). Verbatim brief:

> `public/framework/ext/LayoutTool/readme.md` now opens a section titled "39% of
> what this tool audits, it never looked at" — read it first. In short:
> `probe.IGNORE` skips demo stages by policy (correct — a stage is a picture of
> another layout at another viewport, and measuring it as part of its host
> produced 460–500 false high findings per page), and the cost is that 132 of
> 336 audited page-widths are more skipped than read. Every `ui/*` component
> page, most `styles/elements/*`, and every `styles/layouts/*` gallery has been
> graded on its chrome since the tool existed.
>
> That same readme has always contained the fix and nobody has ever done it:
> "To audit a demo, point the tool at the demo's own render at its own width."
>
> Your job: do it for a sample, and report what it finds. This is a measurement
> and a proposal. Do not change `probe.IGNORE`, and do not change how the audit
> works — changing what the site's audit means is RULE#1 surgery and belongs to
> Mike.
>
> 1. Learn the stage (`ext/demo/stage.js` `simulate()`, `ext/demo/readme.md`,
>    `probe.js`'s `IGNORE` and `escale`).
> 2. Pick ~15 pages across `ui/*`, `styles/elements/*` and `styles/layouts/*`
>    flagged `mostly_picture` in `audit/taste.json` — don't hand-type the list.
> 3. For each, measure the stage's own render at the width it's simulating, via
>    `{ ignore: null }` pointed at the render element rather than `.app`. Get
>    both the findings score and the taste score.
> 4. Compare three numbers per page: chrome-only (current audit), the stage's
>    own render, and the difference. `window.$BLOCKRELOAD = true`. Retry once,
>    then record failure and move on — never stall the sweep.
>
> Answer: are the demos good; does measuring at a stage's own width produce
> sane numbers or trip false-positive classes (be specific); what would folding
> this in cost; should it be folded in (column / page / replace) — recommend
> one, weigh alternatives, verdict is Mike's.
>
> Write findings to `public/framework/ai/2026-08-16/demo-coverage/stages.md`,
> one to two screens, table first, prose after.

**Fence** — write only this task dir and the session scratchpad. Change no
source file: not `probe.js`, not `taste/**`, not `audit/**`, not any `page.js`,
and nothing under `public/framework/ext/Panel/` (owned by another session). A
bug found in the tool is reported, not fixed.

## Proposal / steps

1. Read `LayoutTool/readme.md`'s new section, `demo/stage.js`, `demo/readme.md`,
   `probe.js`'s `IGNORE`/`escale`, `taste/taste.js`, `LayoutTool.js`.
2. Pull the `mostly_picture` rows from `audit/pages.js`'s companion
   `audit/taste.json` (not hand-typed); pick ~15 across `ui/*` (none actually
   flagged — see findings), `styles/elements/*` and `styles/layouts/*`.
3. Write a headless-Playwright sweep (scratchpad only) that loads each page,
   sets `window.$BLOCKRELOAD = true`, locates the active page's own
   `.demo-render`, and runs `analyze()`/`rate()` on it with `{ ignore: null }`
   — compared against the same page's `.app`-rooted chrome numbers.
4. Run the sweep at 1280 and 3440, retry once on failure.
5. Write `stages.md`: table first (chrome vs stage vs diff, both tiers,
   `covered`%), then prose answering the four questions.
6. Land: log the headline numbers.
