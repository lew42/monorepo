verdict: fix
1. [fix] Each keys-to-success page opens with the raw dictated prompt, and the answer the page exists to show (the consensus keys and each model's score) sits below it, one to three screens down (page 1, presentation rule "level 1 shown, detail nested"). Evidence: `shots/…keys-to-success-research-process-fast-assistants/1920.png`, where the prompt fills the whole first screen. layout.json gives the page-keys-test band a share of 3.59 at 400 and 2.75 at 1920. Fix: put the keys and the score table first, and move the prompt below them or into a collapsed block.
2. [fix] The keys-to-success index and its child pages use the URL slug as their title: "bigger", "unsupported-link", "research-process-fast-assistants". Their sibling tests have real names, like "H1 page" and "Broken import" (words: names can't be misread). The index cards carry no description either, so a reader can't tell what any prompt is about without opening it. Evidence: `shots/…keys-to-success/1200.png`, the preview wall. In the diff, line 1 of each page.jsonl reads `"title":"bigger"`.
3. [note] The slug titles also wrap to two lines on most child pages at 400, and on two of them at every width. layout.json reports `h1.page-title` at 2 lines on cards-and-logs-subdomain and research-process-fast-assistants at 1200, 1920 and 3440. A short plain-words title fixes this together with finding 2.
4. [note] The Test library index preview for "Keys to success" is the only card with a description, so it stands taller than the five tests beside it. Evidence: `shots/…framework-ai-tests/1920.png`, top band. Giving every test a one-line description, or none, would make the wall even.
5. [note] The 12 `test-library/runs/h1-page-*` shots are fixtures that models wrote during the tests. Most show an empty "Floor test" page: layout.json gives page-previews a share of 0 and 85–94% of the screen is empty. That is expected for a test fixture. They are not pages for readers, so their design was not judged.
6. [note] The `drawer-rail` and `mode-btn` buttons wrap (1.7–3.2 lines) on every page, at every width. That comes from the shared site chrome, not from this diff.

Widths: all four (400, 1200, 1920, 3440). The diff adds two new pages (an index wall and a page type that renders prompts and tables) and changes the layout of the Test library wall.

## Requirements
- 1 "The spike: does the Claude Agent SDK work through OpenRouter today?" — n/a — done earlier (requirements.md plan item 1); not in this diff
- 2 "Wire the `provider` field per tier" — n/a — done earlier; not in this diff
- 3 "If it doesn't… compare our own harness against Open Code" — n/a
- 4 "Consensus review: one cross-family reviewer" — n/a — not in this diff
- Plan 6b "Keys to success: models list the keys to about 10 of the owner's past prompts; consensus is presumed truth; recall and precision" — yes — the diff adds 10 prompt pages; each has key_run lines from 2–4 models, one merge, and model_score lines with recall and precision; `Servex/ext/openrouter/evals/keys.mjs` writes them
- Plan 6a "Every free OpenRouter model that can use tools takes the simple tests" — yes, partly — the diff adds 12 h1-page runs on free models (`test-library/runs/`); the rate-limit data is not visible on any page in this diff
- Plan 2 "Each test a page at /framework/ai/tests/" — yes — keys-to-success is linked from the Test library (`shots/…framework-ai-tests/1200.png`); clicking through works because of the new `child()` probe in `tests/page.js`
- Rules "Stay WELL under the token allotment" — n/a — not visible from the diff

## Page structure
- What it is, shown — no — keys child pages show the raw prompt first and the result later (finding 1)
- Major parts visible on the first screen — no — the keys and score table are below the fold at every width; `research-process-fast-assistants/1920.png`
- Index is a wall of previews, small enough to digest — yes — `keys-to-success/1920.png`: 10 cards in 2 rows
- One takeaway obvious — no — a child page doesn't say which model did best until you scroll past the prompt
- Detail nested one click down — no — every model's raw key list sits on level 1, under the scores

## Navigation
- Techniques used — a sidebar (the site tree), tabs (Inbox/Log/System), a bottom rail at 400, and a preview wall
- Every view has its own URL — yes — each prompt is `/framework/ai/tests/keys-to-success/<slug>/`
- Links work on a deep reload — yes — both `tests/page.js` and `keys-to-success/page.js` now load their children through `child()`, and all 10 child pages were shot
- Tabs fit on one row — yes — layout.json tab_rows 1 at every width, on every page

## Layout
- Content fills the space it is given — no, a note — the keys index is 90% empty at 3440 (layout.json `empty` 0.9) and its 10 cards fit in one row; that is acceptable for a wall
- No horizontal overflow — yes — layout.json overflow_x false on all 25 pages at all widths
- Reading column held to a measure — yes — the prompt text stays near 620–700px wide (widest_text 619 at 1920, 696 at 3440)

## Sizing
- Cards sized to their content — yes — `keys-to-success/1200.png`: the preview cards are even
- Title band a sensible share — yes — page-title share 0.04–0.06 (0.08–0.12 where the title wraps)
- Score table sized to its data — yes, a note — a table with 3 columns and 2 rows; it fits

## Wrapping
- Titles on one line — no — `h1.page-title` wraps to 2 lines on 8 of 10 child pages at 400, and on 2 of them at every width (finding 3)
- Controls on one line — no, a note — `mode-btn`/`drawer-menu` wrap 1.7–1.8 lines; this is the shared site chrome (finding 6)
- Card labels — yes — the slug labels wrap inside their cards at 1200 ("decisions-tab-screenshot") without breaking the grid

## Spacing and padding
- Even gaps in the wall — yes — `keys-to-success/1920.png`
- Left edges line up — yes — layout.json left_stack: h1 at 14px (400) and 19px (1200), a single doc-well layer
- The prompt card's padding matches the other cards — yes — `research-process-fast-assistants/1200.png`

## Colour and contrast
- Body text readable — yes — dark text on white in every shot
- Muted text readable — yes, a note — the raw-extraction labels use `small.muted`; they are small but readable at 1200

## Flow
- Most important first — no — prompt → keys → scores → raw extractions; the scores and keys should come before the prompt (finding 1)
- One reading direction — yes — a single column, top to bottom

## Words
- Names a reader can't misread — no — slug titles: "bigger", "unsupported-link" (finding 2)
- Each heading states its gist — yes, partly — "Keys to success · N" and "Per-model score" are clear; "The prompt" is clear but placed first
- Plain sentences, no jargon — yes, a note — the empty-state line "needs … `keys.mjs --judge`" talks to the developer, not the reader; every page has a merge now, so no reader sees it
- Descriptions on preview cards — no — the 10 keys cards have none (finding 2)
