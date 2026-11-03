verdict: fix
1. [fix] STATE.md promises the real `page_set` MCP tool proof "re-proved after the merge (below)", but nothing follows it, and the diff shows no sign that live reloads were held for the merge (requirements, Done when 3). Either add the post-merge proof and the hold lines to STATE.md, or drop the promise.
2. [note] page.jsonl lists `stream-proof-old.png`, but the diff adds no such file, so the task page shows a dead file entry (content: every link works). STATE.md is not listed in page.jsonl either, so the task page does not show it; it is reached only through split-plan.md.
3. [note] split-plan.md still says "7 (jsonl) is a later task" in its closing paragraph, right above the new "Step 7 … The split is complete" line, so the doc now contradicts itself (words: stale text).
4. [note] The requirement asked for screenshots matching at 400/1200/1920/3440. All 40 pages were checked at 1200, but only 8 of them at all four widths. The 5 live pages that differ match the A1/A2 noise floor, so that part is met in spirit.
5. [note] The only page this diff changes is the task page itself (a page.jsonl file list). Its shot problems come from the shared ai2 layout, not from this diff: the h1 wraps to 4 lines at 400, the rail buttons wrap 3.2 lines, and the `mode-btn` "brightness_auto" wraps 1.7 lines at 1200 and wider.

Widths given: 400, 1200, 1920, 3440 (one page: `/framework/ai/sessions/2026/10/12/session-1c7d9e04/page-split-3/`).

## Requirements
- 1 "Move the jsonl replay and file steps into their own class file … every public name keep their exact behaviour" — yes — `core/Page/Jsonl.js` (`PageJsonl`, 297 lines) is attached as `Page.Jsonl` and created through `this.constructor.Jsonl`, so a subclass can swap it. Every moved method keeps a one-line facade on Page; `static jsonl`/`log_class` pass the host class; the import cycle is avoided by setting `PageJsonl.Page = Page`.
- 2 "Before moving: record a baseline … 40 pages … Any difference is a failure" — yes — STATE.md: 40 pages plus 299 jsonl states; after-run is byte-identical on 35 pages; the 5 that differ match the A1/A2 noise floor field for field; `baseline.mjs` is committed.
- 3 "Prove the page tools still stream … within a second" — partly — `stream-proof.json` shows heading 7 ms, card 25 ms, text 33 ms against an old-code baseline. The proof through the real `page_set` tool is promised "below" but missing (finding 1).
- 4 "0 state diffs, 0 new console errors, screenshots match at 400/1200/1920/3440. Smoke clean" — yes, with note 4 — 0 new errors; smoke fails only on the worktree's missing gitignored data files.
- 5 "`split-measure.mjs` before/after in STATE.md; step 7 ticked; split-plan.md says the split is complete" — yes — the table is in STATE.md (1090 → 849); split-plan.md has ✅ 7 and the title says COMPLETE (but see note 3).
- 6 "Merge with live reloads held during the batch" — not shown — nothing in the diff or STATE.md records the hold (finding 1).

## Page structure
- page 1 (title says what it is) — yes — shots/…/1920.png, top band: "page-split-3", then the brief's h1.
- other page questions — n/a — this is a task page rendered by the shared template; the diff only adds its file list.

## Navigation
- nav 1 identify — tabs (AI: Inbox/Dashboard/Log/System/Sessions/Tests), a sidebar (≥1200), a bottom rail (400).
- tabs fit one row — yes — layout.json tab_rows 1 at every width.
- rest — n/a — the chrome is unchanged by this diff.

## Layout
- the content sits in the reading column, no horizontal overflow — yes — layout.json overflow_x false at all four widths.
- the screen is used well at wide widths — note — empty 0.69 at 1920 and 0.78 at 3440 (sheet.png). This comes from the shared ai2 layout, not this diff.

## Sizing
- text measure — yes — widest_text 335 (400), 827 (1200), 1163 (1920), 1308 (3440); the paragraphs stay narrower than the h1 (sheet.png).

## Wrapping
- headings don't wrap needlessly — note — h1 wraps 4 lines at 400 and 2 lines at 1200 (layout.json wraps). The h1 is the long brief title.
- controls don't wrap — no (pre-existing) — drawer-rail-ai/menu 3.2 lines at 400; mode-btn "brightness_auto" 1.7–1.8 lines at 1200/1920/3440; not in this diff.

## Spacing and padding
- left padding consistent — yes — layout.json left_stack: h1 14/19 px (doc-well), p 28/38 px (page), the same at every width.
- bands sized right — yes — page-title share 0.04–0.059; ai-task is the body (share 1.03–1.36).

## Colour and contrast
- text and links readable — yes — shots/…/1200.png: dark text on white; links underlined in the accent colour.

## Flow
- reads top-down: title, brief, Do, Done when — yes — shots/…/1920.png.

## Words
- STATE.md is plain, leads with the outcome, and links what it names — yes — it links Jsonl.js, split-plan.md and page-split-2.
- no stale or contradicting text — no — split-plan.md "7 (jsonl) is a later task" (note 3); STATE.md "(below)" with nothing below (finding 1).
