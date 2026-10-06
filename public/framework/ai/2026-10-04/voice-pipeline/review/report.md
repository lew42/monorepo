verdict: fix
1. [fix] `requirements.md` asks for the voice pipeline (Microphone/Whisper classes, a pipeline view, resend logging, honest status words, a compare screen, faster sending, Dictate's engine using the new classes) — `diff.patch` contains none of this. It is a different piece of work: the Dictate duplicate-bubble race fix (`req_seq`/`applied_seq` tickets in `Dictate.js`) plus one word added to the Docs notes tab list in `page.js`. `requirements.md` itself says this task is `QUEUED: start after dictate-one-engine lands` — this diff should not be reviewed against this brief; it looks like it was filed in the wrong task folder.
2. [fix] The two new paragraphs added to `doc/decisions.md` ("Duplicate chat bubbles…" and "The fix is two tickets…") each run to roughly 140 words with no break — content Words Q3 (every paragraph 60 words or fewer) fails on both.

## Requirements
(the owner's seven "Want" items, from `requirements.md`)
- 1 "One class per stage, each naming the web API it wraps (`Microphone`, `Whisper`)" — no — diff touches only `Dictate.js`'s existing `partial_tick`/`close_segment`, no new class
- 2 "A pipeline view on the audio page" — no — not in diff
- 3 "Every resend is logged (`{at, segment_ms, sent_ms, reply_ms, text}`)" — no — not in diff
- 4 "Honest status words (chat link vs. transcription stage, stage + browser error name + meaning + one thing to try)" — no — not in diff
- 5 "A compare screen: Whisper vs. Chrome recognition, live, side by side" — no — not in diff
- 6 "Send more often (300–500ms, measure send→visible)" — no — not in diff
- 7 "Dictate's engine uses these classes" — no — the classes in #1 don't exist yet, so this can't be true either
- (unnumbered) "Worktree → check_page → merge.mjs" — n/a — not something a diff or shot can show

## Page structure
*(the shots are the pre-existing Dictate Overview tab; this diff changes no layout — used here only as a baseline sanity check, not as evidence of new work)*
1. title says what it is — yes — 1920.png: "Dictate" + mic icon; the widget right below it shows, not tells, what the page does
2. core concepts first, as linked tiles — yes — 1920.png "AUDIO · WHISPER · REVISE · WHERE IT GOES" tile row under "How it works"
3. priority order — yes — the live widget (state) sits above the explanation
4. open before done — n/a — not a task page
5. reachable via parent's `children:` — yes — sidebar shows Dictate selected under UX
6. every view has its own URL — not measured — can't confirm from a screenshot; unaffected by this diff
7. approved layout type — yes — `layout.json` classes (`doc-well`, `tab-bar`, `tab-panel`) are the standard Doc page regions
8. every item self-evident — yes — "New session", "Send", mic icon, no mystery controls
9. every element earns its space — yes — `layout.json` bands: no `big_empty: true`
10. best form — yes — the four-part pipeline is a tile row, not a paragraph
11. section titles clear — yes — "How it works"
12. old version still reachable — yes — `page.js`'s own comment: "v1" kept nav:false but reachable, the old Overview unchanged

## Navigation
1. identify — tabs (OVERVIEW / SEND MODES / PLAYGROUND / VARIANTS / SURFACES / DOCS), the framework's standing left sidebar
2. tabs: 1 row at 1920, ≤2 at 1200, ≤3 at 400 — yes at 1920 and 400 (`layout.json` `tab_rows: 1` both) — 1200 not shot, not measured
3. tabs: each has its own URL — not measured — no shot proves it; existing Doc tab system, untouched by this diff
4. tabs: useful and grouped — yes — `page.js` comment: "words" and "v1" pulled out of the strip (`nav:false`) specifically to cut tab count on mobile
5–9 rail/sidebar/sheet/modal/full screen — n/a — the sidebar shown is the site's standing chrome, not something this diff built or changed
10. selected item opens its own view, never expands in place — n/a — no such list on this page

## Layout
1. fills 3440 with columns — not measured — no 3440 shot
2. approved layout — yes — Doc's standard tab-panel shape
3. region width right at shot widths — yes — `widest_text` 344px at 400, 609px at 1920, `overflow_x: false` both
4. padding only where needed — yes — `doc-well`/`page` padding only, no stray padded boxes visible
5. text keeps room from neighbours — yes — per shots
6. 2+ columns sit in wide/bleed — n/a — single reading column, no multi-column content
7. band share matches importance — yes — `layout.json` bands: no band both big and `big_empty: true`
8. side-by-side columns roughly equal — yes — 1920.png: the four pipeline tiles (AUDIO/WHISPER/REVISE/WHERE IT GOES) hold similar one-line content each
9. dead space answered by a region, not a widened column — yes — the `empty: 0.705` at 1920 is the page continuing below the fold (by design, widget-first), not a wasted gutter
10. content scaled to its box — yes — per shots
11. wall-of-cards balanced last row — n/a — 4-tile row, not a card wall
12. flush rows vs. rounded cards — n/a — not applicable to this content

## Sizing
13–19 — not measured beyond the above; this diff adds no sizing-affecting markup or CSS — n/a

## Wrapping
20. every tab bar/button row on one line — no — `layout.json` wraps at 400: `drawer-rail-ai` 3.2 lines, `drawer-rail-menu` 3.2 lines, `chatbox-compose-more` 2.4 lines, `ux-dictate-btn` 2 lines. [note] — these are the global drawer-rail/chatbox chrome, outside this diff's fence (it touches no CSS or markup), so flagged as a note, not charged to this change
21. no wrap that appears only under 1920 — not measured — only 400 and 1920 shot, no 1200 to compare
22. a wrapping row wraps by design (`flex wrap`) — not measured — can't tell icon-button wrap cause from a screenshot alone
23. 400: full-row items stack, not crush — yes — per 400.png
24. no clipped preview description — n/a — no preview cards here

## Spacing and padding
33. left-stack padding ≤3em at 400 — yes — `layout.json` `left_stack.h1.total: 28`, `.p.total: 28` (well under 3em)
34. no padded-in-padded-in-padded box — yes — each stack is a single layer (`doc-well` or `page`), not nested
35–42 — not measured beyond the above; this diff touches no CSS — n/a

## Colour and contrast
1–8 — n/a — this diff adds no new class, token or colour; it is pure logic (`Dictate.js`) plus a doc paragraph and one tab-list word

## Flow
25. top-to-bottom priority — yes — widget first, explanation after (per Page structure #3)
26. nothing hidden off-screen — yes — `overflow_x: false` at both widths
27. one rhythm per box — not measured — can't confirm from shot alone, but no new markup in this diff to have broken it
28. labels close to their own card — yes — per 1920.png tile row
29. live page stays still, "N new" pill — n/a — not a live-arriving list on this tab
30. no prose line past the measure — yes — `widest_text` 609px at 1920 is well inside a normal reading column
31. fixed chrome pushes `.app` by tokens — not measured — no CSS in this diff
32. content inside a tab padded once — yes — single `page`/`doc-well` layer per `left_stack`

## Words
1. shown before told — yes — the widget demo sits above the explaining prose
2. layout shows structure, no explaining sentence — yes — the four-part pipeline is a tile row, not a describing paragraph
3. every paragraph ≤60 words — no — see finding 2: both new `doc/decisions.md` paragraphs run ~140 words each
4. point in ten seconds — yes, for the Overview tab shown — the widget + "Say something, or press the mic" make the point immediately
5. every title says exactly what its thing is — yes — "How it works", "Dictate"
6. pictures carry ≤1-line captions — n/a — no pictures on this tab
7. each concept named once, same way — yes — "Whisper", "Revise" used consistently in the tile row and prose
8. every mention of a concept/file links to its page — not fully measured — `doc/decisions.md`'s new text names `ux/Dictate/ai/v-g2roikw.jsonl` and `ai/2026-10-04/voice-pipeline/` as plain paths, not as links (CLAUDE.md: a named file is a clickable link)
9. a doc's words sit beside a picture/widget — n/a — `decisions.md` is a decision log, not a how-it-works doc; existing convention in this module is prose-only here
10. most important thing leads — yes — Page structure #3
11. full plain sentences, no undefined jargon — yes, mostly — the new `decisions.md` text is in full sentences; it does lean on code symbols (`req_seq`, `epoch`, `applied_seq`) without defining them inline, acceptable for a decisions log aimed at the next engineer, not a newcomer-facing page
