verdict: fix
1. [fix] `ext/Doc/page.js` still declares `files: "Doc.js ClassCard.js Doc.css page.js readme.md …"` and `notes: "class-card well architecture …"`: the new `ClassDoc.js`, `ClassDoc.css` and `doc/class-doc.md` are missing from the Doc module's own page (Law 10, index everything). A reader on /framework/ext/Doc/ never finds them.
2. [fix] Two homes for per-method notes now: `core/Item/doc/method/*.md` (the old API tab's, still linked from `core/Item/readme.md` lines 95–98 and listed at line 113 as "one page per verb and field") and the new `core/Item/methods/<name>.md`. `get.md` exists in both. The Item page no longer shows `doc/method/`, so readme line 113 is stale, and Law 6 (one of everything) is broken until the old files move or retire. `class-doc.md` "Watch out" names the problem but leaves no task for it. File it as a task, or move `get`/`set`/`toJSON` now and mark the rest retired.
3. [fix] `ext/Doc/readme.md` lines 13–14, 27, 36 and 45 still say the API tab, `/api/<name>/` and `doc/method/<name>.md` are how a class's members are shown. That is now only true for a plain `Doc`. One line under each should say that a `ClassDoc` with a `method_list` uses Methods and `methods/<name>/` instead. Otherwise a fresh agent can't tell which system applies.
4. [fix] The task folder can't yet be picked up alone: there's no line saying how to answer this review or land the task, and `requirements.md` says nothing about the step-order change. `plan.md` (on the branch only) explains it, but `session.jsonl` in the main tree doesn't link it. Add one log line that points at `plan.md` and the branch `worktree/class-docs` (5947f5eec).
5. [note] At 1920 and 3440 the "A live one" column ends at about y=330, which leaves roughly 60% of that column empty beside the life-cycle picture (shots/…Item/1920.png, band 2; 3440 empty 0.697). At 3440 the hop cards are about 740px wide with 200px code chips inside them. Capping `.doc-class-top` or letting the steps rise into the empty space would use the screen.
6. [note] On a phone, "How a change is saved" stacks 9 cards, so the test steps start more than 2 screens down (layout.json tab-panel share 4.63 at 400 for Item, 4.81 for List). The brief's phone goal of "how a change gets saved" is met in the first 2 screens. The test is far below.
7. [note] Every width logs one 404 (layout.json `errors`, both pages). The source isn't named. Check whether it is the page's own resource (for example a missing `methods/<name>.md` fetch) before merging.
8. [note] There's no shot of a routed method page (`methods/set/`). The route, signature, live example and notes were checked only by reading `ClassDoc.method_page`, not on screen.
9. [note] The tab strip is cut at the right edge: "INBO" at 1200 and "DATE…" at 400 (tab_rows 1, which means it scrolls). This is the existing Doc tab bar, with Methods taking API's slot, so the diff didn't cause it.

Widths given: 400, 1200, 1920, 3440 for both /framework/core/Item/ and /framework/core/List/. The shots show the first screen only.

## Requirements
- 1a "a short class line: what extends what, and what it holds" — yes — shots/…Item/1920.png, top band: "Item extends Events · holds an id, a data bag…"
- 1b "the live default view of a real instance" — yes — "A live one" draws shop → items → milk with `view()`, on both pages
- 1c "the core test drawn on screen… create, set, add a child, save, replay" — yes — 6 step cards with code, a pass mark and the object after each step ("6 of 6 steps pass", 1920 bottom band). The order is changed to put save second, and the reason is recorded in plan.md. Item.steps.test.mjs runs the same array headless
- 1d "the life cycle in one picture… who creates, the delta's path to the file, and back to other tabs" — yes — "How a change is saved": 4 who-cards → 5 numbered hops, drawn from delta-flow.md (Item.life.js cites it), not pasted
- 2a "`methods/<name>/` routed by `route(name)`, never one page.js per method" — yes — `ClassDoc.api_section` route(name) → `method_page`. No method page.js files are in the diff
- 2b "signature, a one-line job and a tiny live example" — yes (code only, no shot) — `method_page` draws the signature, the job, the example body and `view(result)`
- 2c "notes only for set, get, toJSON, never empty files" — yes — exactly three `methods/*.md`, none empty
- 3 "Repeat for List, reusing the same page class" — yes — List page on ClassDoc with no new class code. The only extra key is `method_setup` (shots/…List/1920.png)
- "What good looks like: phone, without reading a paragraph" — yes, mostly — 400.png shows the class line, the live tree and the who-cards with no paragraphs. The test steps are far down (finding 6)
- Fences: no edits to Item.js, Store.js or List.js — yes — not in the diff
- Live instances page for the new class (ClassDoc) — n/a — ClassDoc holds no state the owner would watch (note level)

## Page structure
- page 1 (title says what it is) — yes — "Item" / "List" h1, top band, all widths
- page 2 (one takeaway first) — yes — class line, then the live one, at the top
- page 3 (shown, not told) — yes — no paragraph above the fold at any width. The old prose moved to the Docs/MD tabs
- page 4 (importance order) — yes — instance, life cycle, test, methods, then the older checks folded into one line

## Navigation
- nav 1 identify — tabs (Doc tab strip), a sidebar (site rail), vertical tabs inside Methods
- tabs persistent — yes — same strip on every section. Methods replaces API in the same slot
- tabs fit — no (pre-existing) — strip cut at 1200 and 400, tab_rows 1 (finding 9)
- sidebar shows where you are — yes — Item › Overview highlighted, with Methods listed beneath (1920.png, left)
- old links keep working — yes — `ClassDoc.child` redirects `api/<name>/` to `methods/<name>/` with replaceState

## Layout
- columns suit the width — yes — 1 column at 400, instance | life cycle above 1100px, steps auto-fit (3 across at 1920)
- no horizontal overflow — yes — overflow_x false at every width, both pages
- space used — no (note) — the live-one column is mostly empty at 1920 and 3440 (finding 5)

## Sizing
- line length — yes — widest_text 569/611/687 px at 1200/1920/3440, under 40em
- cards sized to content — partly — the hop cards stretch to about 740px at 3440 around short chips (finding 5)
- phone first screen useful — yes — 400.png: class line, live tree, first who-cards

## Wrapping
- unwanted wraps — no new ones — layout.json wraps list only shell buttons (drawer-rail-ai, mode-btn, chatbox-compose-more), none from the diff
- code chips wrap cleanly — yes — `overflow-wrap:anywhere`. List's agent chip wraps to 2 lines at 1920, which reads fine
- tab rows — yes — tab_rows 1 at every width

## Spacing and padding
- left edges align — yes — left_stack h1 = p at 16/38/54/90 px
- gaps consistent — yes — 1.5em between boxes, 0.5em between hops, ↓ between path hops
- padding grows with width — yes — 16 → 90 px from 400 to 3440

## Colour and contrast
- tokens only — yes — ClassDoc.css uses --subtle, --prime, --ok, --error, --surface (with a fallback)
- pass/fail not by colour alone — yes — check_circle / cancel icon plus text
- contrast — yes — dark text on light cards. Subtle captions are readable at 1920

## Flow
- reads top to bottom — yes — who → arrow → numbered hops → test → methods
- states visible — yes — "Running…" then "6 of 6 steps pass here", and each card fills as its step runs

## Words
- plain words — yes — "A live one", "How a change is saved", "Its test, step by step", "builds it; writes nothing"
- no jargon without explanation — mostly — "Tailed" and "jsonl frame" are bare. Each has a caption line ("the dev server sends the new bytes to every tab")
- owner's words — yes — class-doc.md quotes the owner's ask with its date
- docs current — no — findings 1–3
