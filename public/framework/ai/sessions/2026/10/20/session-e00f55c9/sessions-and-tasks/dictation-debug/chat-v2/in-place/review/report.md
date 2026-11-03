verdict: fix
1. [fix] Toggling "show raw" (and setting a title on a not-yet-refined prompt) leaves the prompt's nest stale (requirement 2, "re-renders only that item's own element"; page 1) — `ChatV2.patch` re-renders only head and raw, but `prompt_nest` filters anchored replies by `raw_open`/`refined`, so after "show raw" an anchored reply shows both beside its sentence and in the nest (duplicate data-id); after a title lands the anchored replies of a sentence-view prompt vanish from view. Read from ChatV2.js:patch vs prompt_nest; no test covers it.
2. [fix] The shots show the wrong page (page 2) — shots/ holds only `.../chat-v2/renderer/` (a mostly empty task page, `empty 0.89–0.95`), not `/framework/ext/Chat/v2/`, the page this diff changes. Layout, sizing, wrapping, spacing and colour cannot be judged for the chat; re-shoot the Chat v2 page.
3. [fix] `ext/Chat/v2/readme.md` is stale: it says "38 checks" (Classes, ChatV2.test.mjs) but the last commit f19ff1be6 has 41; it also doesn't mention that a root Task/Question with `from` nests live, or that `reset()` drops the model (the commit's own additions).
4. [fix] The task folder can't be continued alone: session.jsonl ends at the shots line with no final commit hash (f19ff1be6 landed after the 2 logged), no pass count, no decisions line; `in-place/` has no page.jsonl or files index, and `review/` was indexed in `renderer/page.jsonl` instead (see the diff) — a different task's page.
5. [note] The test checks `window.scrollY` after `scrollTo(0,400)` only, with no check that the page was actually scrollable/mid-page or of a chat scroller's `scrollTop` (requirement 3) — the fixture may not be tall enough for 400px to hold.
6. [note] `ChatV2Model.answer_at` was added (requirement 5) but nothing in the view or test reads it.
7. [note] Widths given: all four (400, 1200, 1920, 3440), but of the renderer page, not the chat.

## Requirements
- 1 "apply(line) returns what it touched … parent (null for root)" — yes — ChatV2Model.apply returns {id,parent,added}
- 2 "one element per item id; new root Prompt appended; new child to parent's nest; change re-renders only that item" — no — appends and changes yes; raw toggle/title change leave nest stale (finding 1)
- 3 "the test: 7 line kinds, same object, still connected, text, scroll unchanged" — yes — all seven kinds plus two root adds present in ChatV2.test.mjs; 41 checks; scroll evidence weak (finding 5)
- 4 "design decision in readme under Decisions" — yes — "In place, never redraw" entry with the keyed-diff alternative
- 5 "match Prompt/Question; two fixture lines; plain-fold decision" — yes — title ?? subject, {from,to}, at ?? ts, phase rule, fixture line for p-1761382950000
- 6 "can you open a page that shows the live instances?" — yes — /framework/ext/Chat/v2/ draws the fixture and ?src= a live copy
## Page structure
- page 1 — n/a — shots are not of the chat page
- page 2 — no — wrong page shot
## Navigation
- identify — n/a — no navigation changed
## Layout
- n/a — not shown in any shot (shots/…/renderer/sheet.png is the task page)
## Sizing
- n/a — not measured for the chat; layout.json is for the renderer page
## Wrapping
- no — layout.json at 400 shows `drawer-rail-ai` wrapping to 3.2 lines, but that is the existing AI drawer, not this diff; chat wrapping not measured
## Spacing and padding
- n/a — CSS change only adds `:empty { display:none }` and flex gap on head/raw-wrap; not visible in any shot
## Colour and contrast
- n/a — no colour changed
## Flow
- n/a — not shown
## Words
- yes — the new readme Decisions text is plain; "In place, never redraw" says what and the alternative
