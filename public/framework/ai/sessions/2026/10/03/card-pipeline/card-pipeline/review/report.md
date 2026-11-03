verdict: fix
1. [fix] The "Then" proof is still missing. The answer to finding 5 says a 1200 px shot of the day page was added to the task dir, but no such png exists, in the main tree or in worktree qf-6. Today's four cards do not exist yet either: `ai/sessions/2026/10/02/cards/` has no card for page-extends-item, panel2-sessions or ai-system-docs, and `asks.jsonl` has 0 `servex-asks-card` lines. Run `run-pipeline.mjs` from main after the merge, shoot the day page, and correct the claim on the card (Requirements "Then").
2. [fix] The before/after counts for items 3 and 4 are not recorded anywhere. `task.jsonl` has no audit results, so `audit-90.mjs --apply` and `audit-cards.mjs --apply` have not been run on the live board. Run both from main and put the numbers on the card (Requirements 3, 4).
3. [note] Only one of the two landing paths writes `paths`. The `close_task` wrap writes them (as the brief said), but the tick's own landing, `check_one()` → `mark(…"landed"…, BY_TICK)` at Asks.js:133, writes none. A task that lands through the tick will never show in any module's Asks box (Requirements 5).
4. [note] `ask_tip()` reads the page link from `assign.links[0]`, while the brief and the function's own comment say `highlight.url`. `links` is the common shape (33 recent task logs against 2), so the code works in practice; fix the comment, or read `highlight.url` first (Requirements 2).
5. [note] There are two copies of the "reason" rule: `audit-90.mjs` `reason_of()` and `rail.js` `reason_for()`, and their wording has already drifted ("card typed question" against "recently active"). Law 6 says one of everything: export one function and import it in both places.
6. [note] `is_major()` now treats every ask owned by a `task-mastermind-*` agent as major, so the word list and the Budget line rarely decide anything. Today this gives the right answer for all four asks (checked: page-extends-item matches on its words, the other three on their owner). The broader rule is a choice the readme should state in one line.
7. [note] The rail's reason text (`face_extra`) is the main visible change from item 3, and no shot shows it. Its layout at 400 px is unchecked.

Widths given: 400, 1200, 1920, 3440 for `/framework/ai/asks/` and `/framework/servex/`.

## Requirements
- 1 "Ask → card → task, by node" — yes — `ensure_card()` runs on the 60 s tick and calls `Cards.create_for_ask()`, then appends a `{ask:{id,card}}` line. `asks.test.mjs` covers major, minor and already-carded (54 passed, 0 failed, run in qf-6).
- 2 "The iceberg tip… never an empty card" — yes — `ask_tip()` writes asked, status, next step and the links. The `create_card` tool refuses a `request`/`task` card with neither `summary` nor `task` (Cards test.mjs: all passed). It does not use `highlight.url` (note 4).
- 3 "Priority bands, written down and shown… audit every card at 90+" — partly — the band legend is in `ai2/readme.md` and the reason sits beside each score in `rail.js`. The audit script exists, but no before/after count was recorded (fix 2).
- 4 "Audit 20 recent cards… fix the cause… record the count before and after" — partly — the cause is closed by the tool guard and `audit-cards.mjs` exists. No counts were recorded (fix 2).
- 5 "Each module shows its own asks, with no copy" — yes — `paths` is written on the close_task landing line, `rows.js` `module_asks()` filters the one ledger, and the Servex page has an Asks section. The rejected alternative is recorded in `Servex/asks/readme.md`. The tick path writes no paths (note 3).
- Then "Run the pipeline over today's four asks… screenshot the day page at 1200" — no — no cards and no shot (fix 1).

## Page structure
- page 1 — yes — shots/…servex/1200.png: the title "Servex" and its lead sentence say what it is.
- page 2 — yes — the new "Asks" h2 names its topic and gives the gist in one line.
- page 3 — yes — the Asks section sits last, below the overview, and is reached by scrolling.
- page 4 — no change — the asks page keeps its own structure; `ask_row` moved to rows.js and draws the same (shots/…asks/sheet.png).
- page 5 — note — the Servex Asks box shows only "No landed task has touched Servex yet." The empty state is honest, but it demonstrates nothing until a task lands.

## Navigation
- nav 1 — tabs (Overview · Source · Lifecycle · Docs; Inbox · Log · System · Tests), a sidebar, a bottom rail at 400.
- tabs — yes — layout.json tab_rows 1 at 1200/1920/3440 on both pages; servex tab_rows 2 at 400 is unchanged by this diff.
- sidebar — yes — unchanged.
- bottom rail — n/a

## Layout
- layout 1 — yes — servex is a single text column; asks is a column board (5 columns at 3440, 2 at 1200), unchanged.
- layout 2 — yes — overflow_x false at every width on both pages.

## Sizing
- sizing 1 — yes — servex widest_text 521–628 px, within the reading measure.
- sizing 2 — note — servex empty 0.78 and narrow_share 0.775 at 3440; this is the Doc layout's own text measure, not new.
- sizing 3 — yes — the new Asks box spans the text column (shots/…servex/1920.png, bottom band).

## Wrapping
- wrap 1 — yes — layout.json wraps lists only the shell's own buttons (drawer-rail-ai 3.2 lines at 400, mode-btn 1.7), which are not from this diff.
- wrap 2 — yes — the Asks lead sentence wraps cleanly at 400 (shots/…servex/400.png, bottom band).

## Spacing and padding
- spacing 1 — yes — left_stack h1 28/38/67/90 px across the four widths on servex, the same scale as before.
- spacing 2 — yes — the gap above the Asks h2 matches the other section gaps (shots/…servex/1200.png).
- spacing 3 — yes — the empty box has `card pad` padding, the same as the asks rows.

## Colour and contrast
- colour 1 — yes — the existing tokens are used: `muted` for the empty text and the reason text, and `card` for the box.
- colour 2 — n/a

## Flow
- flow 1 — yes — servex reads top to bottom (overview, then detail links, then Asks).
- flow 2 — yes — asks page unchanged.

## Words
- words 1 — yes — "Every owner ask whose landed task touched `Servex/` … a filtered view of the one ledger, not a copy." It is plain and links the ledger.
- words 2 — note — the `ai2/readme.md` band section is now one line per band, but the "lift" paragraph under it runs about 90 words. Two sentences would do.
- words 3 — note — the code comments in Asks.js and Cards.js retell the review rounds ("review caught…"). That history belongs in the task log, not in long code comments.
