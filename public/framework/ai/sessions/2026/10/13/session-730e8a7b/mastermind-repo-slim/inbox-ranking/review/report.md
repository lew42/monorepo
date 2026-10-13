verdict: fix
1. [fix] The debug list is not visible beside the live inbox at 1200, 1920 or 3440 (requirement 3) — shots/*Inbox/sheet.png: the rail's own "Pick something on the left" pane fills the right side and "Why each row sits where it does" appears only under the rail at 400; layout.json bands show `inbox-demo` taking a full-page share at 400 (1.096), so at wide widths the debug list is likely pushed below the fold.
2. [fix] The diff touches far outside the fence (requirement fence: `core/Page/ext/Inbox/**`, its readme and doc) — about 30 `files.jsonl` / `page.jsonl` files plus `ai/rail/inbox.js` and `ux/Inbox/*` change; `ux/Inbox/page.js` is the demo so it is expected, the rest is index churn that should be committed separately or explained.
3. [note] Widths given: all four (400, 1200, 1920, 3440). Empty space is 64% at 1200, 74% at 1920, 82% at 3440, and `narrow_share` is 0.76–0.85 at the wide widths: the demo content stays a narrow column.
4. [note] `debug_list` uses `h1.c("h4", …)` for a sub-heading, so the page gets a second h1 (page structure); use an h-level that matches.
5. [note] `doc/ranking.md` example "pinned risk from 5 hours ago = 100 + 24 = 124" does not match the code: the pinned note adds `KIND_WEIGHT/100` and the tail boost is about 29 at 5 h, so about 130. Minor, but the doc should compute what the code computes (law 7).
6. [note] Importance is `it.score ?? KIND_WEIGHT[kind]`, so a row with a score ignores its kind weight; kind order (needs-you > risk > decision > request…) only holds for score-less rows. Say so in the doc.

## Requirements
- 1 "One ranking function … Inbox.rank … formula in doc/ranking.md, owner_note = 100 pin kept" — yes — Inbox.js `static rank` with importance/boost; ranking.md has one example per rule (examples slightly off, finding 5); the pin stays at 100 + epsilon
- 2 "A visible cue: new mark + age, important one shows its kind, reuse the row component" — yes — Rail.row_head adds `inbox-new-mark`, `age()` and `inbox-kind`; sheet.png shows NEW badges and "3 min" at every width
- 3 "Demo on the Inbox page: live inbox beside a debug list with computed score" — no — the list exists in page.js but is not visible beside the rail at 1200 and up (finding 1)
- 4 "check_page at 400, 1200, 1920, 3440; screenshot" — yes — four pngs plus sheet.png present; overflow_x false at all four
- 5 "Report on your card: formula in three lines, link, screenshot" — n/a — not part of the diff; not measured
- Fence — no — finding 2
## Page structure
- page 1 — yes — shots/…Inbox/400.png: the title "Inbox" and the Demo / How to use it tabs say what the page is
- page 2 — no — second h1 for the debug heading (finding 4)
## Navigation
- techniques used: tabs (Demo / How to use it), a left sidebar tree, a rail with a detail pane
- tabs — yes — layout.json tab_rows 1 at all four widths
- sidebar — n/a
## Layout
- the live rail and the debug list sit side by side at wide widths — no — finding 1
- one clear reading order at 400 (title, tabs, rail, debug list) — yes — layout.json bands order page-title, inbox-head, inbox-demo
## Sizing
- no horizontal overflow — yes — overflow_x false at 400, 1200, 1920, 3440
- content width suits the screen — no — narrow_share 0.76 at 1920 and 0.85 at 3440, empty 74% / 82%
## Wrapping
- nothing wraps that should not — yes — widest_text 385 at 400, row titles wrap only as titles; `.inbox-demo` flex-wrap puts the debug list below at narrow widths, as intended
## Spacing and padding
- band spacing is steady — yes — bands y 51, 91, 173 at 400 are evenly spaced; new-mark and kind chips have padding 0.05em 0.45em
## Colour and contrast
- new mark (white on accent) and kind chips (white on `--error`) readable — yes — sheet.png shows white-on-blue and white-on-red tags, the same pattern the old score chip uses; not measured numerically
## Flow
- the new items are the first thing seen — yes — the fresh rows sit at the top of the rail in every shot, the 5-hour-old pinned risk follows them
- debug list reachable without hunting — no — below the fold at wide widths (finding 1)
## Words
- "new" with title "arrived in the last 30 minutes", ages as "3 min" — yes — plain words
- ranking.md reads as short plain sentences with an example per rule — yes — four numbered rules
- debug lines like "231.0 = 40 + 191 · id" — note — numbers only; a short key under the heading would help a newcomer
