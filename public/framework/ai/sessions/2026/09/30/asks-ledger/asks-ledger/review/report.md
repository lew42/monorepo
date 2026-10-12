verdict: fix
1. [fix] Inbox rows don't show their score (requirement 3b, "Show the number on the row"). `inbox.js` computes `it.score`, but `ai2.css` itself says drawing `.ai2-score` on a rail row was left for a later edit. Only Needs you shows badges: shots/…-ai2/1920.png.
2. [fix] No shot shows a stalled ask as an Inbox row, which is what the course correction asks for. All four ai2 shots open on Needs you, so the Inbox row, its bold unread state and its place at the top are unproven. Shoot `/framework/ai2/inbox/` (or whatever the Inbox tab's URL is) at the four widths.
3. [fix] A stalled row's "silent" time counts from when the stall was *marked* (`status_at`), not from when the owner last spoke. The row says "Silent 50 min — owner agent silent 131 min" (shots/…-ai2/1920.png, the Memory row), so the words contradict each other. The score is too low for the same reason (61, when 131 min should give ~65). Use the owner's last-seen time, or the stall time plus the silence the `why` already carries.
4. [fix] `proof.md` does not exist in the task folder (requirement 4). There is no fake-minion run, no stalled line, and no before/after ranking.
5. [note] Nothing on `/framework/ai/` links to the Asks page above the fold. `children:` names it, but the page is `leaf: true`, so the sidebar never lists it (shots/…-ai/1920.png). The only click path is the Inbox row's "the asks ledger" link.
6. [note] `BLOCKER_WORDS` includes "key", "delete" and "force", so four rows tie at 95 (shots/…-ai2/1920.png, top band). Ties sort by date, and a stray "key" in any title will jump that row to the top.
7. [note] Some asks' `words` point at `.claude/prompts/…` and show as plain text, not a link. Requirement 3(a/c) asks for "links to the card and the words" (shots/…-ai-asks/3440.png, the Stalled and Landed columns).
8. [note] On the Asks page at 1200, the last band is an empty framed card (layout.json 1200 `card` ink 0), the work strip with nothing in it.

## Requirements
- 1 "Asks.js … mounted from Servex.js in one line; append-only; mark(); read() folds; a CLI" — yes — diff: Servex.js adds the import plus one mount line, `Asks.mark` appends, `fold_asks` makes the latest line win, and `mark.mjs` exists. The finish-task line is to be sent separately; not seen here.
- 2 "stalled(ask, owner_row, now) with the rule in its comment; 60 s tick from Asks.js; mark once; speaking clears; close_task lands" — yes — `stalled.js` states the rule, `setInterval` runs every 60 s in Asks.js, `check_one` marks only when the state changes, and `wrap_close_task` lands the agent's asks when its task closes.
- 3a (course-corrected) "A stalled ask is an Inbox row; 60+ on top; unread bold; leaves by itself" — partly — the code is there (`inbox.js` `stalled_asks()`, `inbox_order`, `.ai2-row-ask` weight), but no shot shows it (finding 2).
- 3b "Every Needs you and Inbox item gets an importance score 1–100, ranked, show the number on the row" — no — Needs you: yes (1920.png badges 95/95/95/95/61/59/59). Inbox: ranked but not drawn (finding 1).
- 3c "The ledger's own page … grouped by status, newest first, each row linking card and words; route everything" — yes — shots/…-ai-asks/3440.png shows five status columns, and `?status=` routes the filter.
- 4 "Proof (proof.md)" — no — the file is missing.
- 5 "One line to mastermind-servex-9 when merged" — n/a — not yet merged.
## Page structure
- page 1 — yes — asks 400.png: "Asks" plus "Every ask you made, who owns it, and whether it landed."
- page 2 — yes — the count strip (Stalled · Building · Routed · Landed · Dropped) sits right under the intro
- page 3 — yes — Stalled comes first, then Building, Routed, Landed, Dropped
- page 4 — yes — open groups come before Landed and Dropped
- page 5 — yes — ai/page.js `children:` adds `asks` (finding 5: not visible in the sidebar)
- page 6 — yes — `?status=` with pushState/popstate; the stalled row has `ask:<id>` URLs
- page 7 — yes — `.wide.wall` with `--column: 22em`
- page 8 — yes — each row shows its title, owner, age, card and words
- page 9 — no — the empty work-strip card at the bottom (finding 8)
- page 10 — yes — the counts are chips; the groups are columns, not prose
- page 11 — yes — each group is titled with its status and count
- page 12 — n/a
## Navigation
- nav 1 — tabs (AI 2: Needs you · Inbox · Overview), a sidebar
- nav 2 — yes — layout.json ai2 tab_rows 1 at every width
- nav 3 — yes — the tabs are routed pages (existing, unchanged)
- nav 4 — yes — three tabs
- nav 5 — yes — asks 3440.png: sidebar beside the wall; at 400 it folds to ☰
- nav 6 — yes — the filter re-renders groups in place; the rail stays still
- nav 7 — yes — asks 400.png: the bottom bar does not cover a row
- nav 8 — n/a
- nav 9 — n/a
- nav 10 — yes — history opens inside a `details` inside its card, which is a small push, acceptable
## Layout
- layout 1 — yes — asks 3440.png: five status columns
- layout 2 — yes — Tile wall
- layout 3 — yes — 22em columns; one column at 400
- layout 4 — yes — each row is a `.card pad`
- layout 5 — yes
- layout 6 — yes — the wall is in `wide`
- layout 7 — yes — layout.json asks: no big_empty band at any width
- layout 8 — no, accepted — column heights differ (Building 12 vs Dropped 1); that's inherent to a status wall
- layout 9 — yes
- layout 10 — yes
- layout 11 — n/a — these are columns, not a card grid
- layout 12 — yes — cards stand apart with a gap
## Sizing
- sizing 13 — yes
- sizing 14 — yes
- sizing 15 — n/a
- sizing 16 — yes — no surprise scrollers in the shots
- sizing 17 — yes
- sizing 18 — yes — overflow_x false at every width on all three pages
- sizing 19 — yes — chip padding is in em
## Wrapping
- wrap 20 — yes — layout.json asks/ai2 wraps show only drawer and mode buttons (existing chrome)
- wrap 21 — yes — no new wraps below 1920
- wrap 22 — yes — the count chips are `flex wrap` and wrap cleanly at 400 (asks 400.png: "Dropped 1" on row 2)
- wrap 23 — yes — asks 400.png: one column
- wrap 24 — n/a
## Spacing and padding
- spacing 33 — yes — asks left_stack 28px at 400
- spacing 34 — yes — one layer (`page`)
- spacing 35 — no, small — `.card pad` on each row puts `.pad` on a card (questions.md: "never `.pad` on a card")
- spacing 36 — yes
- spacing 37 — yes — `--gap-35` is used between rows
- spacing 38 — yes
- spacing 39 — yes — the cards sit on a different ground from the page
- spacing 40 — n/a
- spacing 41 — yes — `@layer theme`
- spacing 42 — yes — mostly site words; one small asks.css
## Colour and contrast
- colour 1 — yes — ai2 1920.png: white on --error in the badges reads
- colour 2 — yes
- colour 3 — no, small — `color: white` in `.ai2-score-hot` and `var(--on-prim, white)` in asks.css are literals
- colour 4 — yes
- colour 5 — not measured — no dark-mode shot
- colour 6 — yes
- colour 7 — yes — the score badge looks the same on every row
- colour 8 — yes — `.muted` class
## Flow
- flow 25 — yes — Stalled comes first; on Needs you the highest score comes first
- flow 26 — yes — overflow_x false
- flow 27 — yes
- flow 28 — yes — each group title sits on its column
- flow 29 — n/a — the page reads once on load
- flow 30 — yes — widest_text 547 at 3440
- flow 31 — n/a
- flow 32 — yes
## Words
- words 1 — yes — the ledger is shown as a status wall
- words 2 — yes
- words 3 — yes — the intro is one sentence
- words 4 — yes
- words 5 — yes
- words 6 — n/a
- words 7 — no, small — the same state reads as "Stalled", "silent 50 min" and "owner agent silent 131 min" on one row (finding 3)
- words 8 — no, small — `.claude/prompts` words are unlinked (finding 7)
- words 9 — yes — the readmes sit beside a live page
- words 10 — yes
- words 11 — yes

