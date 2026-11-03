# Proof: past-work run on three real topics

Script step (`node Server/PastWork.mjs <topic>`): **1.2 to 1.4 s each, 7 to 8 KB of output (about 2,000 tokens)**. Full raw outputs are reproducible by running the command.

| Topic | Judge | Time | Cost / tokens |
| --- | --- | --- | --- |
| page templates | Haiku minion (Servex) | about 1 min | $0.42 |
| data grid | Haiku minion (Servex) | about 1 min | not reported |
| colour schemes | Haiku subagent (the Servex pool had no free worktree; the queued minion was stopped) | 48 s | 46k tokens, 9 tool uses |

All three stayed under the 60k-token cap and answered in under 25 lines.

## page templates
Nothing builds `Template` or `Property` yet. The nearest work: paging templates (2026-09-05, plain modules, not a `Page` subclass) and `core/Page/parts/` (2026-10-12). Advice: extend `core/Page`, reuse the parts classes, build `Property` as a small class after checking it against `Item`'s events.

## data grid
`ext/DataGrid` (2026-10-03) already does sort, resize, filter, windowing, table or cards, and is live. The Sessions list still uses its own CSS grid. Advice: extend, point the sessions list at `DataGrid`; do not build a new grid.

## colour schemes
Five hand-built and six generated themes exist as a study page (`styles/system/studies/themes/`) and `styles/doc/colour-schemes.md`; the 2026-10-12 style-system task made three colour tokens and four grounds. No site-wide switcher. Advice: reuse the theme definitions, build only the switcher with localStorage persistence.

## Caveats
- The judge reports were not independently re-verified beyond the minions' own Grep. The data-grid and templates answers match what this mastermind saw in the raw output.
- The index `ai/past-work-index.md` has 277 tags because tasks without a `group` are tagged by title prefix; coarse but useful as a scan.
- Worked in the main tree with explicit-pathspec commits instead of a worktree (the tree was shared and dirty).
