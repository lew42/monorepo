# AI v3 — a wall of idea cards, ranked by importance; a third take on the AI dashboard

## Use

Five views share one data source (`ai/board.jsonl`, read through `timeline.js`'s `Weighted`
model, the same file the dev bar's own log reads): **now** (the newest thing the owner said,
live), **grid** (every card, sized and ordered by `weight()` — importance, not age), **timeline**
(an inbox rail + detail pane, newest first — the default), and two placeholders (**gallery**,
**dashboard**). `page.js` is the whole page (about 1500 lines — five views is a lot for one file,
named as a known cost, not an oversight); `v3.css` is its styling, `timeline.js` the data model
and shared card helpers, `compose.js` the one text/dictate box every reply goes through,
`ask.js` a prompt card's Yes/No controls, `demos.js` the live examples a card can name.

`?log=`/`?verdicts=` point the page at a scratch pair instead of the real `board.jsonl`/
`verdicts.jsonl` — the device every proof run against this page should use (never write to the
real files directly; copy them into your own task dir first).

The head row also carries **ways out** (`v3-ways-out`, 2026-09-21) — four quiet text links
beside the title: today's board (computed, never hardcoded), the full log, the process page, and
the owner's own start-here page. V1's rail was this section's only navigation before V3 replaced
it; these four links are what V3 has instead — see `ways_out()` in `page.js`.

**Below 400px wide** (`head-mobile`, 2026-09-21), three things fold behind one `More ▾` button
instead of each taking their own row: the four ways-out links, the card-width slider (one column
at that width anyway), and the two disabled view tabs. Nothing is deleted — `set_more()` in
`page.js` only toggles a `.v3-more-open` class on `.v3-head`, and `v3.css`'s own
`@media (width < 40em)` block is what shows or hides those three groups. The title, the version
picker, the count, the three real view tabs, Live and the author filter never hide.

## Watch out

- **Now shows a stale-thread notice, not a redesign** (`front-door-today`, 2026-09-21) — Now is
  still one heard owner card plus its answers, unchanged; `is_stale()`/`paint_stale()` in
  `now_view()` (`page.js`) only add a banner when that heard card is not from today AND the board
  itself has something newer, with one button that jumps to the timeline view. Found live: the
  newest owner-authored card on the board was two days old while 27 fresh cards sat in the
  timeline, because the fast assistant that turns the owner's words into a card was not running —
  Now kept showing that stale card as if it were current, silently. Don't fold this into the
  "answers" fallback net below it — that net already pulls in almost every card touched since the
  owner's own timestamp, which is why this banner reads the owner card's own date, never the
  answers list.
- **The timeline's left rail is ONE chronological list, no strip on top of it** (`live-select`,
  2026-09-21 — the old pinned `needs-you` box and current-hour/clock header are gone). A
  `needs-you` card, or the current `focus` card, still can't get buried: it renders BIGGER right
  in the list (`is_big_card()`, `.v3-tile-big`), reusing the same criteria `weight()`'s own
  biggest bonuses already encode — don't reintroduce a second box for this without re-reading
  that task's `decision` log first.
- **`.v3-toast` needs its own `[hidden]` rule, and so does anything else built the same way** —
  `code` skill #7's own trap: an authored `display` rule (even inside `@layer theme`, even the
  `flex` UTILITY class) always beats the browser's own `[hidden] { display: none }`. This drew a
  real, always-visible empty box for a long time (`live-select`, 2026-09-21) before anyone
  connected it to `el.hidden = true`, which was correct the whole time.
- **`.v3-ways-out` and `.v3-track` dropped their `flex v-center` utility classes on purpose**
  (`head-mobile`, 2026-09-21) — a `@layer util` class always beats a `@layer theme` rule
  regardless of specificity, so a narrow-width `display: none` written in `v3.css` could never
  win against a `flex` class worn in the markup. Both elements now declare their own `display:
  flex; align-items: center` in `v3.css` instead. Don't put a layout utility class back on either
  without re-reading `css` skill rule 3 first.
- **Live means exactly one thing: "nothing is selected."** On, the newest card always shows and
  the url stays bare. Selecting any card (a click, a card's own url, Back/Forward landing on
  one) turns it off and locks the view there. Turning it back on is the deselect gesture
  (`set_live(true)` → `master_detail()`'s own `deselect()`) — clears the selection, scrolls the
  rail to top, shows the newest again. A plain scroll does **not** touch Live any more
  (`live-select`, 2026-09-21, overturning the previous day's `stop_following()` rule) — route any
  new way of "picking something" through `select()`/`set_live(false)`, never a bare scroll.
- **`VERDICTS_PATH` exists because of a real `Server/` bug**, not by choice — see the long
  comment at the top of `page.js` for what it works around and why the real fix waits on a
  fenced restart window.
- **`ask.js` is a byte-for-byte copy**, not an import, of a file in a dated task folder — see its
  own top comment before "cleaning up" that folder.

## More

- [The v3 dashboard](/framework/ai/v/3/) · [v2](/framework/ai/v/2/), the other live take ·
  [ext/JSONL](/framework/ext/JSONL/) the log format. Note: `/framework/ai/` itself now renders
  this same page by default (`ai-front`, 2026-09-21) — `?v1` there still opens the original board.
- [`ai/2026-09-21/front-door-today/`](/framework/ai/2026-09-21/front-door-today/) — the stale-
  thread notice on Now, and the two counts that proved the bug
- [`ai/2026-09-21/live-select/`](/framework/ai/2026-09-21/live-select/) — the rail rebuild
  (one list, two card sizes, no sticky strip) and Live becoming selection/deselection
- [`ai/2026-09-21/v3-ways-out/`](/framework/ai/2026-09-21/v3-ways-out/) — the four head-row
  links out of V3 (today's board, log, process, start here) and why they're not in the toolbar
- [`ai/2026-09-21/head-mobile/`](/framework/ai/2026-09-21/head-mobile/) — the narrow-width head
  row: 255px at 400px wide down to a two-row layout, three groups behind one `More` button
- [`ai/2026-09-20/v3-axis-fix/`](/framework/ai/2026-09-20/v3-axis-fix/) — the earlier pinned-strip
  cap this superseded, kept for its own before/after measurements and reasoning
- Files: `page.js` (the page, all five views), `v3.css`, `timeline.js` (data model), `compose.js`,
  `ask.js`, `demos.js`
