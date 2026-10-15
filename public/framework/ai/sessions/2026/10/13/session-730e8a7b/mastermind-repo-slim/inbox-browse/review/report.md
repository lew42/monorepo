verdict: fix
1. [fix] The Inbox itself, the thing that was rebuilt (ask 2), was never shot: the shots are /framework/ux/ and /framework/ux/Browse/, two doc pages. The rail width (a third at 1920, wider at 3440), Waiting on you at the top, and the 400 phone screen are unproven by any picture (requirements ask 2: "Shot after every step… check_page at 400 / 1200 / 1920 / 3440").
2. [fix] The class architecture, the deliverable the owner sees first (ask 1), is cut off: the comment column of "The classes" code block is clipped mid-word at every width — shots/…-ux-Browse/1920.png, band 3 ("THE ORCHESTRATOR. The s…", "every o…"); at 400 only the class names show (400.png, bottom). Wrap the comments or use a list/table.
3. [fix] Browse's page tells and doesn't show (page 1, "show, don't tell"): it is two markdown files and a link; no live Browse or instance view. Its readme even promises "the class architecture, then the demo", and there is no demo — readme.md line 3 vs page.js.
4. [note] Waiting on you holds 114 lines today (Inbox doc/next.md), mostly "decided N things for you" cards; with a 45vh scroll box it meets "one line each" but not "every open owner decision" as a short, readable list. The upstream fix (one line per task, not a card) is recorded as open.
5. [note] Every shot logged a console 404 (layout.json `errors`, all four widths, both pages); name the missing resource before landing.
6. [note] The Browse page wastes the screen at large widths: empty 0.70 at 1920 and 0.81 at 3440, last band `big_empty` true at 3440 (layout.json) — a single prose track for a page whose subject is a wide two-pane view.
7. [note] Step 3 (Sessions) correctly deferred with a next brief in ai/sessions/doc/next.md; card report and merge are not in the diff, so not checked here.

Widths given: 400, 1200, 1920, 3440 for both /framework/ux/ and /framework/ux/Browse/.

## Requirements
- 1 "The class architecture, as a page first" — partly — the page exists (/framework/ux/Browse/, doc/architecture.md: each class, extends, orchestrator, what Inbox/Sessions/catalog become), but its class block is clipped in every shot (finding 2)
- 1 "one of everything: this replaces the Inbox rail and the Sessions rail, never a third" — yes — diff: Rail.js moves its shell, grip, size and storage into Browse.js and `extends Browse`; no new rail
- 2 "the Inbox rebuilt on Browse" — yes — diff: `class Rail extends Browse`, `draw_list()` replaces `rail()`
- 2 "pinned 'Waiting on you' list at the top … one line each, its card linked; gone when ticked" — yes in code — WaitingOnYou.js; pinned before `$pinned` in `stream()`; tick → `Rules.archive_row`; no shot of it (finding 1)
- 2 "source: cards whose body says 'for you'/'decision', plus waiting lines in ai/asks.jsonl" — yes — `WaitingOnYou.waits()` + `Asks` with waiting/parked/needs-you
- 2 "timeline and date scope kept, inbox zero kept" — yes by diff — FLOOR, CATEGORIES and the scope code are untouched; not shot
- 2 "rail resizable, a third of the screen at 1920 and wider at 3440" — yes in code — Browse.css `clamp(20em, 33.3vw, 100% - 28em)`, grip kept; not shot
- 2 "Shot after every step; check_page at 400 / 1200 / 1920 / 3440" — no — the Inbox page is not among the shots (finding 1)
- 3 "Sessions … only if it fits; otherwise a decision line and the next brief in ai/sessions/doc/next.md" — yes — the "Sessions on Browse" brief is in the diff
- 4 "doc/architecture.md for Browse; the Inbox readme's one line" — yes — both in the diff
- 4 "card report; landing line; merge.mjs" — n/a — not in this diff

## Page structure
- page 1 (title says what it is) — yes — …-ux-Browse/1920.png, top band: "Browse", then "See it live: the AI Inbox →"
- page (show, don't tell) — no — the page is prose and a code block; no live view (finding 3)
- page (one takeaway obvious) — yes — "A list on the left, the thing you clicked on the right" (1920.png, band 2)
- page (reachable by a link) — yes — ux/page.js children adds Browse; the sidebar shows it under UX in every shot
- page (detail nested one click down) — partly — the readme is appended in full under the architecture doc (page.js), so the first page carries both

## Navigation
- navigation 1 (identify) — a sidebar (site nav); no tabs, no rail, no sheet on these pages
- sidebar (the current page marked) — yes — …-ux-Browse/1920.png: "Browse" highlighted under UX
- tabs — n/a
- route everything — yes — Browse's detail is `page.$pages`, so a row's url is real (Browse.js `mount()`)

## Layout
- layout (layout kind) — yes — layout.json `layout: "standard"` at all widths for a doc page
- layout (does the page use the screen) — no — …-ux-Browse empty 0.695 at 1920, 0.807 at 3440 (finding 6)
- layout (overflow) — yes — `overflow_x: false` at all widths, both pages

## Sizing
- sizing (text measure) — yes — widest_text 633px at 1920, 712px at 3440 (…-ux-Browse layout.json)
- sizing (code block fits its content) — no — the class block clips its comment column (finding 2)
- sizing (list default width) — not measured — the Inbox was not shot

## Wrapping
- wrapping (headings) — note — "What each surface becomes" and "The list grows with the screen" wrap to 2 lines at 400 (layout.json `wraps`); acceptable
- wrapping (controls) — note — drawer buttons "✦AI"/"⋯More" 3.2 lines at 400, "brightness_auto" 1.7 lines at 1200+: site chrome, not this diff
- wrapping (tab rows) — n/a — `tab_rows 0`

## Spacing and padding
- spacing (left stack) — yes — one `page` layer: 28px at 400, 38 at 1200, 67 at 1920, 90 at 3440 (layout.json `left_stack`)
- spacing (band rhythm) — yes — …-ux-Browse/1920.png: title, link, paragraph, h2s evenly spaced
- spacing (pinned rows) — not measured — Browse.css pads them `var(--pad-card) + 3px`, matching the inbox rows; not shot

## Colour and contrast
- colour (text on background) — yes — …-ux-Browse/1920.png: dark text on light grey; the code block is light on dark
- colour (accent use) — yes — links underlined in the prime colour; Waiting on you uses `--prime` for its bottom border, `--surface` behind it (Browse.css)
- colour (dark scheme) — not measured — no dark shot given

## Flow
- flow (order: most important first) — yes — the live link, then what it is, then the classes, then what each surface becomes
- flow (ends cleanly) — note — the readme follows the architecture doc and repeats the one-line essence (page.js)

## Words
- content (plain sentences) — yes — "A list on the left, the thing you clicked on the right. The list stays put while you read"
- content (the owner's words quoted, with source linked) — yes — architecture.md opens with the owner's quote and links requirements-12.md
- content (run labels) — no — architecture.md links "dictation 14, ask 7", a run label (memory: owner vocabulary only); say "the owner's ask, 2026-10-14"
- content (promises match the page) — no — readme.md "then the demo": there is none (finding 3)
