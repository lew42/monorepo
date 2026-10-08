verdict: fix
1. [fix] The new cost cell (the preview row) is not visible in any shot. Every row shown has an empty Cost column (only the old `$0.02` on a Servex echo row), so ask 3 is unproven at the list level. Evidence: shots/…sessions/1920.png, rows band, Cost column. The index did load (its defect banner draws), so the rows on screen are just not in `session-index.json`. Either index the sessions the grid shows, or show "not measured" instead of a blank. The detail view was never shot.
2. [fix] At 1200 and below, the Cost column (the one this task changed) sits off-screen to the right. 1200.png cuts the grid off at Model. The Cost column grew from 5rem to 12rem, at the far end of an 11-column grid. Ask 3's "check at the four widths" shows it at 1920 and 3440 only.
3. [fix] The filter row has no gaps: "SHOW CLOSED☐ NEEDS ATTENTIONfrom" runs together (1200.png and 1920.png, filter band). `gap-100` does not seem to apply between the labels and the date range.
4. [fix] Addendum: the "needs attention" filter is a checkbox on `alerts` being present. Nothing sorts by alert priority (`level`), and the table does not sort by tag either. The owner asked for "prioritized" and "filters/sorts by tag".
5. [fix] The diff commits about 22,500 generated lines in `sessions/files.jsonl` (it repeats `spend-tree.json`/`week.json` "gone" lines) and about 120 new `sessions/<uuid>/files.jsonl` files. Each new file lists only a gitignored `cache.jsonl`, so the static site will list folders whose content is not in git. This is a directory manifest of machine state. It should be reverted out of the commit, or the watcher kept away from gitignored files.
6. [note] The defect banner "⚠ 810 spawned agents with no recorded parent … minion-fence-proof, minion-count-demo, …" is the widest text on the page (layout.json widest_text_sample at 1200/1920/3440). It sits on level 1 as raw ids. It belongs one click down, or as one short line with a link.
7. [note] Ask 4 says the cache goes in `session.jsonl`. The build splits it into `cache.jsonl` (gitignored, rebuildable) and `session.jsonl` (the tracked record). The reason is stated in doc/session-class.md and it is sound: the alternative is the owner's literal shape. This is acceptable, but the owner should see it on the card.
8. [note] `doc/record-spec.md` tells writers to run `C:/Code/lew42/worktrees/session-class/Server/session-summary.mjs` with `SESSIONS_ROOT`. That path goes stale the moment the branch merges.
9. [note] The Audit and Close buttons are `span role=button`, not `<button>` (ui questions). The Close block's indentation in SessionView.js is off by one level.
10. [note] layout.json lists one 404 per width. It is likely an old file such as `week.json`. The four week tiles all show "—" (1920.png, top band). This was stale before this change (findings §7), but the tiles still show no "as of".

Widths given: 400, 1200, 1920, 3440 (one page: /framework/ai/sessions/).

## Requirements
- 1 "Account for every message and every tool call … Claude and OpenRouter kept separate; first check whether the SDK already does its own real-time accounting" — yes — findings.md §1: the SDK `total_cost_usd`/`usage` is the evidence, dedupe by message id, OpenRouter never summed in
- 2 "A Session class, usable on the server AND the client … loads the raw file in code … breakdown … subagent rollups" — yes — `public/framework/ai/sessions/Session.js`, imported by Server/session-summary.mjs and SessionView.js; the subagents are summed in `cost_of_session`; `Session.rollup` builds the tree
- 2b "node test … checks its total against session-cost.mjs (gap reported, target 0)" — yes — Server/session-summary.test.mjs; findings §2 reports gaps of $0.000012 to $0.000075
- 3 "a preview row for the data grid and a detailed view (click-through)" — no — the code exists (`cost_lines`, `detail_section`), but no shot shows a filled cost cell or the detail view (finding 1)
- 4 "Never reprocess a huge raw file on load … read only new lines, skipping any message id already counted" — yes — byte cursor plus a ring of message ids; test step 2 "second update reads 0 new lines"; stored in cache.jsonl, not session.jsonl (note 7)
- 4b "measure the bytes and requests … before and after, and report both" — yes — findings §3: 839 requests / 16.8 MB before, 840 / 16.9 MB after
- 5 "Per-session folder … session.jsonl beside page.jsonl; agents never hand-write JSONL; a Servex tool writes each line" — yes — `log_session` and `audit_session` tools in Servex/agents/tools.js, stamped by `Session.log`
- 5b "Use live-not-polling's stream; don't build another" — no — `--watch` is a 20 s rebuild loop and the page still "polls every 20s"; findings §12 plans the `live()` tail but it is not built
- D4 "`Server/session-summary.mjs <session-id|file>` printing the same summary" — yes — in the diff
- D5 "Docs: sessions/doc/ note … linked from the readme" — yes — doc/session-class.md and doc/record-spec.md, both linked from readme.md
- Addendum "tags and alerts … log tool … table filters/sorts by tag … needs-attention filter, prioritized" — no — there is a tag filter and an attention checkbox, but no sort by tag or priority (finding 4)

## Page structure
- page 1 what it is, shown — yes — 1920.png: the "Sessions" title, then tiles, then the grid
- level 1 above the fold — no — 1920.png: tiles, filters, a banner and a role row push the grid to y≈590; the defect banner is detail on level 1 (note 6)
- detail one click down — yes — the detail_section is on the session page (not shot)

## Navigation
- identify — tabs (the AI tab bar), a sidebar (the site tree), click-through to a session page
- tabs one row — yes — layout.json tab_rows 1 at every width
- route everything — yes — the detail lives at `<sessions>/<id>/`

## Layout
- the grid uses the width — no — 1200.png: the grid overflows and Cost is off-screen (finding 2); 3440 empty 0.775
- overflow_x — yes (none) — layout.json overflow_x false at all widths (the grid scrolls internally)

## Sizing
- bands sized right — yes — page-columns-row share 0.83–0.93; bar 0.015–0.019
- Cost column width — no — it grew to 12rem but is empty in every visible row (finding 1)

## Wrapping
- unwanted wraps — no — 400.png: the summary "539 sessions shown — $16.67…" wraps to 5 lines beside the banner; layout.json wraps list only chrome (drawer-rail at 400, mode-btn elsewhere)
- tab_rows — yes — 1 everywhere

## Spacing and padding
- gaps between controls — no — "SHOW CLOSED☐ NEEDS ATTENTIONfrom" (finding 3)
- left stack — yes — layout.json h1 doc-well 14/19/33/54 px

## Colour and contrast
- flag colour — yes — `.sessions-flag` is ink text with a prim-ink left border, which reads as a fact and not an alarm (1920.png banner)
- muted text legible — yes — 1920.png summary line

## Flow
- most important first — no — the cost (this task's headline) is the last column, off-screen at 1200 and below

## Words
- plain sentences — yes — the detail labels: "Models that ran (from the session file, version included) · effort"
- no jargon on level 1 — no — the banner lists raw agent ids (note 6)
- owner's names — yes — "Claude $total" is shown as "Claude $X" in cost_lines; OpenRouter is kept apart
