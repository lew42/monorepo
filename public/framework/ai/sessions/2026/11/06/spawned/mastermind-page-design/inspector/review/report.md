verdict: fix
1. [fix] A field's name breaks in the middle of the word. In Fields, "description" shows as "descriptio / n" at 1200 and "descr / iption" at 400 (proof/plan-settings-1200-lineN.png and -400-line1.png, Fields band). The cause is `overflow-wrap: anywhere` on `.item-inspector-row`, with the key and value sharing one row. Fix: give the key `flex: none; white-space: nowrap` (or a fixed-width key column) and let only the value wrap.
2. [note] The branch carries about 30 files it was not allowed to edit: the generated `files.jsonl` indexes and two `{"file":…,"gone":true}` lines in `public/live/page.jsonl`. They came from wip commit `f0099ade5` ("pick up other agents' appended lines"). They are generated, append-only lines, but commit by exact path was the rule. Check that the merge does not duplicate them in the logs.
3. [note] Settings says "Lines 13", but the slider reaches "line 14 of 14" on the same page (proof/plan-settings-1200-lineN.png, top band vs the History band). `LivePage.Settings` counts `of.jsonl_lines`, while DeltaHistory counts `store.entries`. One of the two numbers is off by one, or the two count different things, and nothing tells the reader which.
4. [note] At line N, "How it got here" repeats the "Inside" list row for row: the same 11 cards (proof/plan-settings-1200-lineN.png, rows 330–760 and 1290–1720). That roughly doubles the page. At N, a line such as "same as Inside (11 cards)" would say the same thing, and the list can come back for n < N.
5. [note] Two headings sit directly on top of each other: "WHAT IT IS MADE OF" and then "INSIDE", with nothing between them (both proofs). The first finding of round 1 is not fully fixed. Drop ItemInspector's "Inside" heading when it sits under Settings' own heading, or make one of the two visibly lighter.
6. [note] The ext/Inspect doc page has no visible demo when it opens. Its Overview is one link card on 84% empty space (shots/…-framework-ext-Inspect/1200.png; layout.json `empty 0.835` at 1200). DeltaHistory has no demo at all. Requirement 1 asked for "the ones a delta can call", but Methods lists all of them (Page has 107). The readme's Watch out notes this, so it is not hidden.

Widths given: 400, 1200, 1920 and 3440 for `/framework/ext/Inspect/` and `/live/`. Neither of those is the settings page this change adds to, so I also read the worker's own full-height proof shots (`proof/*-settings-{400,1200}-line{1,N}.png` in the `pd-inspect` worktree).

## Requirements
- 1 "ItemInspector: Inside, Methods, Fields" — yes — proof/plan-settings-1200-lineN.png: Inside lists 11 cards with labels, Methods shows the LivePage chain open and Page and Item collapsed, Fields shows short values; "callable by a delta" is only partly met (note 6)
- 2 "DeltaHistory: every line, a slider 1..N, replay in memory, summary of title, cards in order, sub-pages" — yes — the Lines list is capped at 14rem; `Class.replay(lines.slice(0,n))`; the Store has no host, so nothing is written
- 3 "Two lines in LivePage.Settings, dynamic import, h4 headings" — yes — `public/live/LivePage.js:512-515`; it also passes `Class: of.constructor`
- 4 "Proof at 400 and 1200: at line 1 the title only, at N the live page's card count; smoke clean" — yes — plan-settings-400-line1.png shows the title and "Nothing listed yet."; at N there are 11 cards, matching Inside; proof.md says smoke on /live/design/ fails only on a `failures.jsonl` link that was already broken
- 5 "A node test, card count per N, under 1 s" — yes — `Inspect.test.mjs` takes 0.13 s (proof.md)
- 6 "Readme, ext index line, link from live/readme" — yes — `ext/Inspect/readme.md`, the `ext/readme.md` Index line and the `public/live/readme.md` Settings bullet all exist; `framework/readme.md` lists only `ext/` as a folder, so no line belongs there
- Show the class and its live instances — n/a — these are read-only Views and hold no state worth watching
- Docs current and indexed? — yes — the readme's files list matches the folder (`page.js` is linked from its first line); MethodMap's comment names the shared walk
- Could a fresh agent continue from this folder? — yes — requirements.md, review.md (round 1) and proof.md (round 2, with every finding mapped to its fix and the commits listed)

## Page structure
- page 1 (the title says what it is) — yes — the settings h1 "Settings", breadcrumb live / plan / settings
- the most important content comes first — yes — Data from, Class and Lines first, then Files, then Inspect
- one takeaway per section — yes — "What it is made of" and "How it got here" each answer one question

## Navigation
- navigation 1 — the techniques used: a breadcrumb, a collapsed `<details>` per class, and a slider; no tabs are added
- the rows link where the item has a url — yes — `item_row` uses `kid.url` or `link_url(path)`
- tab rows — n/a

## Layout
- one column, read top to bottom — yes — proof shots at 400 and 1200
- no horizontal overflow — yes — layout.json `overflow_x false` at every width, on both pages

## Sizing
- the content column is a readable width — yes — about 620px at 1200 (proof/plan-settings-1200-lineN.png)
- the Lines log is capped — yes — `max-height: 14rem; overflow-y: auto` (proof.md: 224px)

## Wrapping
- a word breaks in the middle — no — "descriptio/n" at 1200 and "descr/iption" at 400 (finding 1)
- a row label wraps at 400 — yes, and that is acceptable — card titles wrap to 2 lines with the type kept on the right (plan-settings-400-line1.png)
- layout.json wraps — only the rail buttons that were already there (`drawer-rail-ai` 3.2 lines at 400), outside this change

## Spacing and padding
- the rows are padded like LivePage.Files — yes — .5em .75rem, a divider between rows, matching the Files card above
- headings are spaced from their content — partly — two h4s stack with no space between them (note 5)
- the doc page has dead space — yes — 84% empty at 1200 and 400 (layout.json `empty`) (note 6)

## Colour and contrast
- the cards follow the page scheme — yes — `--live-card`, falling back to light-dark(#fff, #1f1e24)
- muted text is readable — yes — the type labels and line log are small grey on white and legible in the 1200 proof

## Flow
- the slider's effect shows next to it — yes — the "line n of N" count and the summary sit directly below the slider
- moving the slider never writes — yes — an in-memory replay; the Store is loaded without a host

## Words
- the headings are the owner's plain words — yes — "What it is made of", "How it got here"
- the readme is one screen: what · files · use · watch out · more — yes
- the live/readme addition is one sentence that names both Views and links the module — yes
- the line count reads consistently — no — "Lines 13" vs "line 14 of 14" (note 3)
