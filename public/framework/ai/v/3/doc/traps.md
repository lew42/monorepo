# 3 — traps (moved from the readme)

<!-- moved verbatim from readme.md lines 77-189, 2026-10-12 readme audit -->
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
  own `task.jsonl` up front (the way `ai/AITask/dashboard.js`'s own `all_tasks()` does) was
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
  `AgentsStrip.js`'s `paint()` keys a sorted-ids string and only rebuilds on a real join/leave.
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
- **`AskControls.js` is a byte-for-byte copy**, not an import, of a file in a dated task folder — see its
  own top comment before "cleaning up" that folder.
