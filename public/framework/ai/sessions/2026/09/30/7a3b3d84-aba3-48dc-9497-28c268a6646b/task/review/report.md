verdict: fix
1. [fix] Opening a row does not mark it read (ask 2). `rules.js` changes read state only when the owner presses the dot, "never automatically on open", which is the opposite of what the brief asks. The minion never received the owner's words.
2. [fix] Resolved rows only dim to 0.7 opacity and stay in the Inbox (ask 4). The rule also misses "a task landed or stopped", and it marks every card that never had an ask as "resolved". So most of the rail dims, as the minion's own decision line admits (`rules.js` `is_resolved`).
3. [fix] Search covers only the plain cards (ask 5). It skips groups and real-page rows, finds archived cards only while the "archived" toggle is on, and the query has no URL, so a reload loses it (`page.js` `search_q`).
4. [fix] The Now card still shows a state word on every row (ask 6). "— now" is gone, but a "working" / "dormant" column sits beside every row under "Running now": shots/…/1920.png, middle column; 400.png, "Running now" band.
5. [note] The hard $8 budget ran to $9.84 (task.jsonl, spend.json). The task mastermind also skipped this review on purpose before it merged.
6. [note] Every needs scan now clears every row's signature and calls `paint()` (`page.js`, `watch_needs`), so the whole rail redraws on every poll. That costs work, and a quiet rail can still jump.
7. [note] A tall orange pill sits at the left of every "You said…" row, where the new dot `<button>` goes (1920.png, rail). Check whether this is the dot drawn at the wrong size. The unread state has no bold text either, so it rests on that dot alone.
8. [note] The row's archive × is tiny and faint at 55% opacity (1920.png, rail, right edge of each row).

## Requirements
- 1 "Hide the Needs you tab for now; don't delete its code" — yes. Three tabs show at every width, and `needs/` still routes. Per the owner's later update, the filter became a "Needs you" chip with a badge (1920.png, rail top: "Needs you 26").
- 2 "Opening a row marks it read… per viewer" — no. Per viewer (localStorage) works, but opening marks nothing (`rules.js`, read/unread comment).
- 3 "A button that removes it from the Inbox. Nothing is ever deleted" — yes. The × writes `status: archived` through the same route as the card's "clear" button (`rules.js` `archive_row`). The row greys out and leaves the list unless "archived" is on.
- 4 "A row leaves the Inbox by itself when it's resolved… write the rule down in one comment" — no. The rule is written in one comment, but rows dim and never leave. Landed or stopped tasks are not covered, and cards with no asks count as resolved.
- 5 "One search box that finds any card or row, including archived ones" — no. It searches plain cards only, finds archived ones only with the toggle on, and has no URL.
- 6 "Say it once: the rows just name the agent and what it's doing" — no. The "— now" suffix is gone, but the "working" column stays (1920.png, "Running now").
- Rule: screenshots at 400 and 1920 — yes. shots/ holds 400, 1200, 1920 and 3440.
- Rule: $8 hard budget — no. Spent $9.84.

## Page structure
- page 1 — yes — 1920.png: the title "AI 2" with the Inbox tab lit
- page 2 — n/a
- page 3 — yes — Live first, then Running now, Working on, Just landed (1920.png)
- page 4 — yes — Working on comes before Just landed
- page 5 — yes — the page already existed
- page 6 — no — the search query is closure state and does not survive a reload; the chip filter does (`?review=1`)
- page 7 — yes — the existing ai2 layout
- page 8 — no — the dot works as a button with only a hover title to say so, and the × is barely visible
- page 9 — yes
- page 10 — yes
- page 11 — yes
- page 12 — yes — `needs/` is kept, just unlinked

## Navigation
- page 13 — tabs, a rail (the Inbox list), a site sidebar
- page 14 — yes — layout.json tab_rows 1 at 400, 1200, 1920 and 3440
- page 15 — yes — Inbox, `log/` and `overview/` each have a URL
- page 16 — yes — three tabs
- page 17 — yes — the rail sits beside the detail at 3440; at 400 it folds to "← all cards" (400.png)
- page 18 — no — `watch_needs` repaints every row on each scan (finding 6)
- page 19 — yes — the bottom bar at 400 does not cover the last row
- page 20 — n/a
- page 21 — n/a
- page 22 — yes — a card opens in the detail column

## Layout
- layout 1 — yes — 3440.png: rail, then two columns of the Live card
- layout 2 — yes — rail + content
- layout 3 — yes — the search box grows into the space the chip row leaves (1920.png)
- layout 4 — yes
- layout 5 — yes
- layout 6 — yes
- layout 7 — yes — layout.json: big_empty false in every band at every width
- layout 8 — no — at 1920, Running now runs to 650px while Working on stops near 620, leaving an empty lower right (small, not from this diff)
- layout 9 — yes
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes

## Sizing
- layout 13 — yes
- layout 14 — yes
- layout 15 — yes — Working on rows are cut with an ellipsis (1920.png)
- layout 16 — yes — the rail scrolls, as designed
- layout 17 — yes
- layout 18 — yes — layout.json overflow_x false at every width
- layout 19 — yes — `.ai2-search` has a 6em floor and an 8em basis

## Wrapping
- layout 20 — yes — tab_rows 1. The only wraps are rail icons (drawer-rail-ai at 400, mode-btn at 1200+), which predate this diff
- layout 21 — yes — no new wrap below 1920
- layout 22 — yes — the chip row wraps to two lines at 1920 (New card + Needs you, then auto-transcribe + Search) and reads cleanly
- layout 23 — yes — 400.png
- layout 24 — n/a

## Spacing and padding
- css 1 — yes — left_stack h1 is 14px at 400
- css 2 — yes — one layer (doc-well)
- css 3 — yes
- css 4 — yes
- css 5 — yes — no new spacing constants
- css 6 — yes — the dot and the × keep em sizes
- css 7 — yes
- css 8 — n/a
- css 9 — yes — the new rules sit inside the existing ai2.css layer block
- css 10 — yes — the × reuses `.ai2-clear` and the badge reuses `.ai2-tab-badge`

## Colour and contrast
- css 11 — no — the × at 0.55 opacity, and resolved rows at 0.7 opacity with muted text inside, likely fall below 3:1 and 4.5:1 (1920.png, rail)
- css 12 — yes — the orange "working" text is large enough to read
- css 13 — yes
- css 14 — yes
- css 15 — not measured — no dark-mode shot
- css 16 — yes
- css 17 — yes
- css 18 — yes

## Flow
- layout 25 — yes
- layout 26 — yes — overflow_x false
- layout 27 — yes
- layout 28 — yes
- layout 29 — no — see finding 6
- layout 30 — yes — widest_text 966px at 1920 is a rail preview, not prose
- layout 31 — n/a
- layout 32 — yes

## Words
- content 1 — yes
- content 2 — yes
- content 3 — yes on the page. The readme's new paragraph runs about 120 words (`readme.md`, "The rail also has…")
- content 4 — yes
- content 5 — yes — the chip is renamed "Needs you", matching the owner's word
- content 6 — n/a
- content 7 — no — "working" appears in the Live card, in the state column and in the Running now heading's sense (ask 6)
- content 8 — yes
- content 9 — n/a
- content 10 — yes
- content 11 — yes
