verdict: fix
1. [fix] `AIDashboard.open_day()` calls itself as its last line (diff.patch line 87, where `this.store.open(this.q.day)` used to be), so `/framework/ai/`, the default AI dashboard, recurses until the stack overflows and never loads its day. Change that line back to `this.store.open(this.q.day)`.
2. [fix] The scope change says "nothing on the AI dashboard", but the diff still changes it: `AIDashboard.js` gets a Review head, Approve buttons and a Ready to merge band, and `AIDashboard.css`, `SessionRow.js` and `SessionStore.js` change too. Revert those files, or keep only the shared `Review`/`Approvals` classes (the readme already plans to move them beside `v/review`).
3. [note] The rows repeat themselves. Line 1 says "mastermind · 16 h ago", then line 2 says "waiting for you · mastermind, no parent recorded". The role appears twice, and "no parent recorded" is noise for the owner (content). shots/…-v-review/1920.png, list band.
4. [note] There is no page that shows the live instances of the new classes `Review`, `Approvals`, `FilterPill`, `TimeFilter` and `ReviewList` (rules.md, "Show the class"). `Review` holds the day's approved/waiting/leaking state, which the owner would want to watch.
5. [note] At 1920 and 3440 the head card (three totals and Approve all) sits in a narrow left column, and the empty space under it runs the full height. layout.json reports empty 0.58 at 1920 and 0.72 at 3440. At 1920 the list rows are about 950 px wide with short text and the Approve button far right. Two columns of rows, or a head band across the top, would use the width.
6. [note] On the v/ index (touched by the diff) at 400, the `sessions-chip` buttons wrap to 4 lines each (layout.json wraps, lines 4). This is probably not new in this diff.

Widths given: 400, 1200, 1920 and 3440 for `sessions/v/review/` and `sessions/v/`, plus the builder's extra shots (review-today/week at 400 and 1920, review-approved-400).

## Requirements
- 1 "a single page … per day", nested under parent, plain title, cost, state, three day totals — yes — review-today-400.png: the Today window, rows with title, cost and state, and an approved/waiting/leaking head. Nesting shows as "26 · 36 with the ones they spawned".
- 2 "Approve in chunks": a row Approve button, Approve all, a parent approves its children, writes through FsFile.append — yes — review-approved-400.png: approved goes 0→$0.78 and leaking 139→138. `Approvals.approve` uses `FsFile.append` and inherits approval when read (`Review.judge`).
- 3 "Leaks in red", with the rule and its numbers in the readme — yes — review-week-400.png: red titles and "$1084 leaking · 139". v/review/readme.md "The leak rule" names $0.50, 1 h and 1 day.
- 4 Ready to merge folded in — n/a — the scope change says it folds in later. It was nevertheless built on the AI dashboard (finding 2).
- 5 "the word today … in a little drop-down … week … month … year", a reusable pill, choice in the url — yes — `FilterPill extends Dropdown`, `TimeFilter extends FilterPill`, `?when=`. Shots show Today and Week. Inside a session it comes later, per the scope change.
- 6 "Plain titles", the slug small — yes — 1920.png: "Task system migration" in bold, `mastermind-task-migrate` small in mono.
- Live instances of the new classes — no — no page lists `Review`/`Approvals`/`TimeFilter` instances (finding 4).
## Page structure
- page 1 (the title says what it is) — yes — 1920.png: breadcrumb "Session variants › Review", panel "Review".
- page 2 (most important first) — yes — 400.png: the totals and Approve all come first, then the list. Leaks sort first (review-week-400.png).
- page 3 (one screen at level 1) — yes — 400.png: the head card fits the first screen.
- page 4 (a duplicate title) — no — 400.png: "Review" panel header, then a "Review" card head right under it. Minor.
## Navigation
- techniques — tabs (AI tabs), breadcrumb, a sidebar (site nav), a bottom rail at 400, a dropdown pill
- tabs stable — yes — layout.json tab_rows 1 at every width.
- current place marked — yes — 1920.png: SESSIONS tab underlined, breadcrumb ends at Review.
- dropdown pill reads its choice — yes — "Today ▾" / "Week ▾" in the shots.
## Layout
- the layout suits the content — partly — at 400 a single column is right. At 1920 and 3440 a narrow head column beside one wide list leaves the left column mostly empty (finding 5).
- no horizontal overflow — yes — layout.json overflow_x false at all four widths.
## Sizing
- text measure — yes — widest_text 239/317/340/382 px, all readable.
- controls sized to content — yes — the Approve pills and Approve all are compact (1920.png).
- rows use their width — no — 1920.png: rows run about 950 px for about 400 px of text, and Approve floats far right (note 5).
## Wrapping
- nothing wraps that shouldn't — yes for review — layout.json wraps only in chrome buttons (drawer rail, mode-btn). The slug wraps under the line at 400 ("reviewer-tasks-page-loading-2"), which is acceptable. On the v/ index, sessions-chip wraps to 4 lines at 400 (note 6).
## Spacing and padding
- rhythm even — yes — 400.png: rows are evenly spaced, and the cards have matching inner padding.
- padding scales with width — yes — left_stack h1 14/19/27/54 px at 400/1200/1920/3440.
- wasted space — no — empty 0.58 at 1920 and 0.72 at 3440, mostly under the head card (note 5).
## Colour and contrast
- status colours follow the mobile picks (green/amber/red/grey) — yes — review-week-400.png: green approved box, amber waiting, red leaking, grey dots for waiting rows.
- contrast — yes — the dark title text on white and the white text on the green Approve all are both readable. The red titles on white are readable.
- colour not the only signal — yes — each leak row also says "leak" in words.
## Flow
- the press path is clear — yes — review-approved-400.png: after Approve the row leaves the list and the totals update.
- order matches priority — yes — leaks, waiting, live, approved (`ReviewList.ORDER`).
## Words
- plain titles, no unexplained slugs — yes — titles are made from the record's title or the agent name in words.
- no repeated or noisy words — no — the role repeats on line 2, and "no parent recorded" shows on most rows (note 3).
- the readme says what it is, its files, the writer and the reader — yes — v/review/readme.md and ux/Filter/readme.md.
