verdict: fix
1. [fix] A stale comment in the module this diff changes: `List.js` `ref()`'s block comment (worktree qf-1, `core/List/List.js:319-323`) still says `ref()` links "instead of re-parenting it the way `add(x)` still does (D13, 2026-11-02: switching `add()`'s own default is a later, separate merge…)". That stopped being true in this same diff. A fresh agent reading the code would believe `add()` still moves an item. One line fixes it: "`add(x)` now does the same (2026-11-09); `ref()` is the explicit form."
2. [note] Demo ask 3 ("a small line naming where it really lives: Ref → list A / item id") is met only as raw JSON. List B shows `{"type":"Ref","path":"a.shared"}` under "what List B actually stores:" (shots/…/400.png, List B card). That proves what is stored, but a new coder has to decode `a.shared` themselves. Add a plain line such as "Ref → list a / item shared" above the JSON.
3. [note] `public/live/demos/ref/files.jsonl` lists `shots/`, but the repo's `.gitignore:213` (`**/shots/`) ignores that folder. So the 400 and 1200 shots the brief asked for are on disk in the worktree but in no commit, and on a clone the listed file entry points at nothing. Either drop the `shots/` line, or accept it as the repo's convention for every demo.
4. [note] `/live/demos/` (`public/live/demos/page.jsonl`) only has `{"file":"ref/"}` lines. Every other demo there has a `part-link` card (for example `codecard1`), and this one has none. The brief keeps the `/live/` link for the mastermind, so this is a reminder to add the card on `/live/demos/` too. Until then the demo is only reachable from the two doc links.
5. [note] The guard in `List.add` is `x.parent && this.index_of(x) === -1`. That is broader than the brief's wording ("a parent that is a List other than this"). An item held in a slot (`adopt_slot`), not in any list, now also becomes a Ref when added to a list. The census found no such caller, and a Ref is the safe result, so this is recorded as a note only.
6. [note] At 1200 and wider, the h3 "List A — owns the item" wraps to 2 lines (layout.json `wraps` at 1200/1920/3440), while the List B heading fits on 1. So the two cards' headings don't line up.
7. [note] The intro paragraph shouts with capitals ("BOTH", "THROUGH"). Bold or plain words would read calmer (content: tone).

Widths given: 400, 1200, 1920, 3440 (a new page, so all four).

## Requirements
- 1 "Re-check the census on today's code" — yes — session.jsonl log line 90: 8 candidate `.add(<identifier>)` sites, all fresh items, none relies on the move; the same conclusion is appended to plan.md decision 2
- 2 "In `List.add`: an owned item gives `this.ref(x)`; unparented, same-list, plain object, replay, `move_to` unchanged" — yes — diff `List.js:+290` returns early before `insert`; replay goes through `insert`/plain JSON, and `move_to` calls `List.move` directly (`Item.js:523-527`), never `add()`
- 3 "Tests: A→B gives a Ref, A keeps it, parent unchanged; cross-file Ref with url; unparented unchanged; move_to still moves" — yes — all four are in the diff's List.test.mjs; I re-ran it in the worktree: `PASS core/List (47 checks)`
- 4 "Docs in the same commit: ref.md, List readme, plan.md one line" — yes — all three are in commit 810cfc210; the 11-02 paragraph is kept with a "Superseded" line
- 5 "Commit by exact path, smoke, do not merge" — yes — commits 810cfc210, 8dc464d33 and 44ca3f5e0 on worktree/qf-1; smoke is logged ok (log line 240); not merged
- Demo 1 "One item, shown in two lists, made with today's add()" — yes — page.js `root.b.add(shared)`
- Demo 2 "Edit it in one place, the other changes, no reload" — yes — "Edit the title" button; List B redraws through RefView (log line 240, proven headless)
- Demo 3 "The Ref as a card with its source: Ref → list A / item id" — partly — raw JSON only (finding 2)
- Demo 4 "How it works line, JS code, link ref.md" — yes — shots/…/1200.png, "How it works" card
- Demo 5 "Mobile first, shots at 400 and 1200 saved in shots/" — yes — 400.png is a single full-width column; the saved shots are gitignored (finding 3)
- Demo docs "one line each in the List readme and ref.md linking the demo" — yes — diff for both
- Class shown live — yes — the diff changes List's behaviour, and /live/demos/ref/ shows a live Ref instance and its stored data
## Page structure
- page 1 (title says what it is) — yes — shots/…/1200.png top band: "Ref demo"
- page 2 (one takeaway, first) — yes — the intro's bold first words, "One item, two places."
- page 3 (most important content first) — yes — the demo cards come before "How it works"
- page 4 (detail behind a link) — yes — ref.md is linked, not restated
## Navigation
- navigation 1 — techniques: none on the page itself; the site's bottom rail at 400 and the AI drawer at 1920+ are global chrome
- tabs, sidebar, sheet, modal — n/a
- bottom rail — n/a (not changed by this diff; layout.json at 400 shows its labels wrapping 3.2 lines, which is pre-existing chrome)
## Layout
- standard reading layout fits the content — yes — layout.json `layout: standard` at every width
- two related cards side by side when there is room, stacked on a phone — yes — 400.png stacked, 1200.png two columns (`flex auto`)
- no horizontal overflow — yes — `overflow_x false` at all four widths
## Sizing
- content held to a readable measure — yes — `widest_text` 367 / 587 / 630 / 708
- empty share reasonable for a short demo — yes — empty 0.44 at 400, 0.77–0.85 wider. A short page in a standard measure; at 1920 and 3440 the chat drawer takes the right side
- cards sized to their content — yes — flex band share 0.414 at 400, 0.24–0.32 wider
## Wrapping
- headings fit on one line — no (note) — `wraps` h3 "List A — owns the item" 2 lines at 1200/1920/3440 (finding 6)
- code wraps inside its card, not off-screen — yes — 400.png "How it works" pre wraps; `overflow_x false`
- nothing clipped — yes — 400.png
## Spacing and padding
- page edge padding scales with width — yes — left_stack 16 / 48 / 65 / 90 px
- card padding consistent — yes — every card uses `card pad flow` (400.png, 1200.png)
- gaps between bands even — yes — bands at 400: 103→257→698, about a 28 px gap each
## Colour and contrast
- body text readable — yes — dark text on white cards (1200.png)
- muted label still legible — yes — "what List B actually stores:" is mid-gray on white
- button text on the orange — yes — dark text on light orange, the site's `btn prim`
- code blocks — yes — light monospace on dark gray
## Flow
- reads top to bottom: claim → demo → how it works → link — yes — 400.png and 1200.png
- action placed where its result shows — yes — the button sits in List A; its effect is visible in List B right beside it (below it at 400)
## Words
- content 1 (plain words, new coder) — yes — "a pointer, never a copy"
- content 2 (one takeaway obvious) — yes — "One item, two places."
- content 3 (short) — yes — the intro is 45 words
- tone (no shouting) — no (note) — "BOTH", "THROUGH" (finding 7)
- code as JavaScript, not deltas — yes — `b.add(x)` / `x.move_to(b)`
- docs current — no — List.js `ref()` comment is stale (finding 1); ref.md and the List readme are current

## Can a fresh agent continue from this folder?
Yes. requirements.md and demo.md hold both briefs. session.jsonl holds the census log, the three commit hashes, the worktree (qf-1) and the test count. What is left: merge, the `/live/` and `/live/demos/` link cards (finding 4), and finding 1.
