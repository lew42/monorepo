# AI v3 — a wall of idea cards, ranked by importance; a third take on the AI dashboard

## Use

**Four views on screen, five urls** (`board-declutter`, 2026-09-22). Every view word is a real
link, so `/framework/ai/days/`, `/framework/ai/now/`, `/framework/ai/timeline/` and
`/framework/ai/prompts/` each open that view — and the same exist under
`/framework/ai/v/3/`. The URL decides the view, always; the saved preference is read only when
the url names none, and the bare url then rewrites itself to the view it settled on, so a
reload, a paste or a Back never lands somewhere else. A card opened in the timeline gets its
own url under that view (`/framework/ai/timeline/<id>/`), and the old flat
`/framework/ai/v/3/<id>/` links still work — they rewrite themselves to the new shape.
`?view=<name>` is still accepted once and rewritten to the path.

**`grid` is hidden, not gone** (the owner, 2026-09-22: "I don't like the grid… maybe we just
hide the grid for now"). `HIDDEN_VIEWS` in `page.js` is the one flag: a name in it loses its
word on the chrome line and its url lands on the default view and rewrites itself there, so
`/framework/ai/grid/`, `?view=grid` and an old saved preference reading `grid` all end up on
`days` instead of on a word that is no longer there. `wall()` and every `.v3-cards` rule are
untouched — take `"grid"` out of that array and the view is back with its url intact.

**days** (2026-09-22, the default) is the odd one out — the owner's own
words, "i never have a nice clean report of what happened": newest day first, one row per
task that actually *landed*, collapsed to the one-line headline it wrote for itself at
landing (`day.jsonl`) until a click reads that task's own `task.jsonl` for the full outcome,
its links, and the task page. Today's still-running tasks show as one quiet "working — …"
line each. The other five share one data source instead (`ai/board.jsonl`, read through
`timeline.js`'s `Weighted` model, the same file the dev bar's own log reads): **now** (the
newest thing the owner said, live), **grid** (every card, sized and ordered by `weight()` —
importance, not age) and **timeline** (an inbox rail + detail pane, newest first). The two
permanently-disabled placeholders (gallery, dashboard) were deleted on 2026-09-22 — a word that
does nothing at any width is not worth a slot. **prompts** (`prompt-lifecycle`, 2026-09-22) is the
other odd one out: it reads neither file, only Servex's own prompt log — see below. `page.js`
is the whole page (about 1600 lines — five views is a lot for one file, named as a known cost,
not an oversight); `v3.css` is its styling, `timeline.js` the board's own data model and shared
card helpers, `compose.js` the one text/dictate box every reply goes through, `ask.js` a prompt
card's Yes/No controls, `demos.js` the live examples a card can name, `agents.js` the Agents
strip and `prompts.js` the Prompts view (both below).

`?log=`/`?verdicts=` point the page at a scratch pair instead of the real `board.jsonl`/
`verdicts.jsonl` — the device every proof run against this page should use (never write to the
real files directly; copy them into your own task dir first).

On the chrome line, on every view, sits the **Agents strip** (`board-from-events`, 2026-09-22) —
one chip per Servex-hosted Claude session that is actually **working** (`GET /agents`, pushed by
`GET /api/stream`), absent with zero console errors when Servex is not answering; click a chip
for its live transcript. Idle sessions get no chip: they collapse into one `N idle` fold at the
end of the same line, which lists them by name when pressed (`board-declutter`, 2026-09-22). A landed `minion`/`task-mastermind` becomes a real board card with nobody writing
one — folded from its own log, merged straight into this page's data, never into `board.jsonl`.
`agents.js` is the whole thing; see the task page for the proof.

The **Prompts** view (`prompt-lifecycle`, 2026-09-22) is the thread of what the owner said and
what was made of it: newest prompt first, their sentences on the left never tidied, and on the
right the fast assistant's reading of them (hover it and the sentences it cites light up), the
names it minted as chips, the card, and a pre-proposal once a card is approved. **The reading now
carries a mode switch** (Condensed → Structured → Clean → Raw, `prompt-refine`, 2026-10-02) —
[`ext/Refine/prompt-card.js`](/framework/ext/Refine/)'s `prompt_modes()`, not a file here, because
`ai2` needed the same piece for its own pinned "Your prompts" card and this board is being
replaced. A ✓ or ✗ on any
chip or card appends one more line through `POST /log/prompts` and is never required — the
appender's naming checks are the authority, this only shows the 200 or the 409. `prompts.js`
holds it and exports `prompt_stream()` (one shared `EventSource` for everything reading that
log) and `prompt_board_cards()` (every assistant card, folded onto the normal timeline and grid
the same way a landed agent's is). `?servex=<url>` points it at another Servex, which is how the
proof ran against a private one.

**The chrome is ONE line, at every width** (`board-declutter`, 2026-09-22 — the owner counted
three rows above the first card and called all of it too much). On the line: the title, the five
view words, whichever agents are working, and `More ▾` at the right end. Behind `More`:
**ways out** (today's board, computed and never hardcoded; the full log; the process page; the
owner's start-here page), the version picker, the count of what is still unreviewed with its
approved toggle, **Live**, the author filter and the card-width slider. Nothing is deleted —
`more_panel()` builds all of it, and `set_more()` only toggles a `.v3-more-open` class on
`.v3-head`, which is what `.v3-more` reads. This used to be a `@media (width < 40em)` fold
(`head-mobile`, 2026-09-21); it is the fold at every width now.

## Watch out

- **A card merged into `log` before `log.live()` has finished its first read is lost**
  (`prompt-lifecycle`, 2026-09-22) — `Timeline.reset()` empties `cards` on every load of
  `board.jsonl`, so `prompt_board_cards()` subscribes only inside that promise's `.then`. The
  Agents strip never hit this because its cards can only arrive much later; anything else that
  wants to merge a card from outside `board.jsonl` has to wait the same way.
- **⚠ `Router.go()` PUSHES THE URL AFTER `content()` HAS ALREADY RUN**, and every page here
  draws through `defer_board()` because of it (`board-declutter`, 2026-09-22). `go()` loads
  first and pushes second on purpose (`core/Router/Router.js`: "so a failed navigation leaves
  no history entry"), so during a real in-app click `location.pathname` is still the url you
  are LEAVING — `draw_board()`'s url check saw a mismatch, skipped, and the owner clicked a
  view word and got a page with nothing on it but its own title. Every cold load passed,
  because there the url is already right, which is exactly why it shipped. `defer_board()` is
  a `setTimeout(…, 0)`, not a `requestAnimationFrame` and not a microtask: `go()` resumes and
  calls `pushState` in a microtask, so a macrotask is the first moment the url is certainly
  final — and a macrotask still runs in a hidden tab, which a frame callback does not. This bit
  twice in one hour: `watch_board()`'s MutationObserver callback is itself a microtask, so its
  first version read the old pathname on all three of the mutations it correctly observed.
  Anything here that reads `location` while building must go through `defer_board()`.
- **`watch_board()` is what saves a page whose `content()` already ran under a deeper url.**
  `render()` caches `this.view`, so such a page keeps an empty view for the whole session, and
  walking back UP to it activates nothing — the reader clicks `AI` in the rail and gets a page
  holding one word. A page under this board could hand back from its own `deactivated()`, but a
  DECLARED child cannot be made to: `/framework/ai/2026-09-22/` has its own `page.js` outside
  this board's reach, and went blank exactly that way. So the page watches its own element for
  the `.active-page` class the arrangement contract stamps on whatever is being shown — one
  observer, attributes only, disconnected the moment the board draws, and it needs nobody's
  cooperation.
- **Every child of `.v3-wall` claims the page gutter for itself** (the owner, 2026-09-22: "that
  word is nudged against the left side of the page with zero padding. This is the law of
  padding that should never be broken"). `.v3-wall` is `display: contents`, so it cannot inset
  anything — `.v3-cards`, `.v3-now`, `.v3-days` and `.v3-prompts` each carry `padding:
  var(--pad)`, and `.v3-sort` was the one that did not, so its line sat at 0px from the rail's
  own border. A new view container gets that padding on the day it is written, or it touches
  the rail. The exceptions are deliberate and are PAINT, not text: `.v3-axis-hour` and
  `.v3-axis-break` pull their boxes out with a negative inline margin so the rule runs the
  column's full width, and re-pad their own text back to the gutter.
- **The chrome line's block padding is its own `em`, its inline padding is `--pad`** — and the
  two differ on purpose. Sideways it has to stand on the same gutter as every card; downwards
  it is a control row, and `--pad` is a percentage of the containing block, so
  `padding-block-start: var(--pad)` measured 15px at 1280 and 62.1px at 3440: a band of empty
  grey above the title that grew with the screen (the owner saw it twice).
- **Every page on this board draws exactly one copy of it, and `draw_board()` is the one rule
  that keeps it that way** (`board-declutter`, 2026-09-22). `Router.activate()` runs the chain
  root-to-leaf, so a url three levels down activates every ancestor too — and each ancestor used
  to build a whole hidden second board, with its own fetches, its own EventSource and its own
  `history.replaceState` overwriting the deeper page's url. `draw_board(page)` builds only when
  `location.pathname === page.url`. Its other half matters just as much: going UP the chain
  activates nothing, so every view/card page's `deactivated()` tells its parent to draw — without
  that, a cold landing on `/framework/ai/grid/` followed by a click on the rail's own AI link left
  `/framework/ai/` blank. Measured after: one `.v3-board` on every url, `/framework/ai/v/3/`
  included, which used to be the worst offender.
- **Days reads `day.jsonl` for the list and `task.jsonl` only on a click** (`days-view`,
  2026-09-22) — about 700 task dirs exist across the archive, so fetching every landed task's
  own `task.jsonl` up front (the way `ext/AITask/dashboard.js`'s own `all_tasks()` does) was
  measured and rejected: 32 small day.jsonl fetches instead of 700. A row's headline is
  therefore the one line a task wrote for `day.jsonl` at landing time, not `assign.outcome`'s
  own bold sentence — the two are usually close but never guaranteed identical; opening the
  row is what reads the real thing. `dv` in `top_level()`'s `redraw()` is never rebuilt by a
  `board.jsonl` update the way `grid` is — only a real view switch reads the days list again.
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
- **`.v3-head`, `.v3-ways-out` and `.v3-track` dropped their `flex v-center` utility classes on
  purpose** (`head-mobile` 2026-09-21, then `.v3-head` itself in `board-declutter` 2026-09-22) —
  a `@layer util` class always beats a `@layer theme` rule regardless of specificity. It is not
  only `display` that gets taken away: `framework.css`'s `.flex > * { margin: 0 }` silently
  zeroed the `margin-inline-start: auto` that puts `More` at the end of the chrome line, and the
  button sat at x=710 in a 1039px row looking like clutter. All three declare their own
  `display: flex; align-items: center` in `v3.css` instead. Don't put a layout utility class
  back on any of them without re-reading `css` skill rule 3 first.
- **Live means exactly one thing: "nothing is selected."** On, the newest card always shows and
  the url stays bare. Selecting any card (a click, a card's own url, Back/Forward landing on
  one) turns it off and locks the view there. Turning it back on is the deselect gesture
  (`set_live(true)` → `master_detail()`'s own `deselect()`) — clears the selection, scrolls the
  rail to top, shows the newest again. A plain scroll does **not** touch Live any more
  (`live-select`, 2026-09-21, overturning the previous day's `stop_following()` rule) — route any
  new way of "picking something" through `select()`/`set_live(false)`, never a bare scroll.
- **The Agents strip only rebuilds its row list when who is live actually changes** — a busy
  agent's own `delta` events repaint every OTHER row's state too, and rebuilding the whole list
  on each one made a chip briefly unclickable (a headless click kept landing mid-teardown).
  `agents.js`'s `paint()` keys a sorted-ids string and only rebuilds on a real join/leave.
- **Every card on this board stands on one of three grounds, and `--v3-card` is the middle one**
  (`board-declutter`, 2026-09-22): the page is `--wash`, a card is `--v3-card` (exactly halfway
  from that to white), and the selected or open one is `--surface`, white. Two equal steps, no
  border and no ring — the owner rejected both. It is a mix of two real tokens, never a hex, so
  dark mode inverts correctly. **Hover never changes a card's ground** — a card whose ground moves
  under the pointer reads as selected for as long as it is there; the title colour is the
  affordance instead.
- **`VERDICTS_PATH` exists because of a real `Server/` bug**, not by choice — see the long
  comment at the top of `page.js` for what it works around and why the real fix waits on a
  fenced restart window.
- **`ask.js` is a byte-for-byte copy**, not an import, of a file in a dated task folder — see its
  own top comment before "cleaning up" that folder.

## More

- [The v3 dashboard](/framework/ai/v/3/) · [v2](/framework/ai/v/2/), the other live take ·
  [ext/JSONL](/framework/ext/JSONL/) the log format. Note: `/framework/ai/` itself now renders
  this same page by default (`ai-front`, 2026-09-21) — `?v1` there still opens the original board.
- [`ai/2026-09-22/board-declutter/`](/framework/ai/2026-09-22/board-declutter/) — three rows of
  chrome down to one, 202px of dead space down to 68, the five views turned into five urls, and
  the one card ground: before/after shots and every number
- [`ai/2026-09-22/days-view/`](/framework/ai/2026-09-22/days-view/) — the days view itself: why
  it reads `day.jsonl` instead of every task's own `task.jsonl`, and why it is the new default
- [`ai/2026-09-22/worktree-proof/`](/framework/ai/2026-09-22/worktree-proof/) — the mastermind's
  follow-up on days: each row's headline now leads with the bold task name, and a still-running
  row is no longer a link
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
- [`ai/2026-09-22/board-from-events/`](/framework/ai/2026-09-22/board-from-events/) — the Agents
  strip and the landed-agent-becomes-a-card fold: proof screenshots, the paint() fix, the
  double-mount finding
- Files: `page.js` (the page, all five views and their routes), `v3.css`, `timeline.js` (the board's data model), `compose.js`,
  `ask.js`, `demos.js`, `agents.js` (the Agents strip)
