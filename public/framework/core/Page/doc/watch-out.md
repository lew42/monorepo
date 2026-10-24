# Watch out — the traps, one line each

Moved here verbatim from the readme; each line links the doc with the detail.

- **The six page words** — `navigation` `content` `width` `arrangement` `surface`/`background` `type_size`: a page describes its own shape instead of coding it, every default writes nothing, and the values live in one file (`words.js`). The table, and one page file before and after: [`doc/words.md`](./doc/words.md)
- A `.md` becomes a page only where the fallback looks — **beside** a page, one segment down; and the `.md` url itself is always the raw file, so the probe is content-type gated (the SPA fallback answers a miss with `index.html` at **200**): [`doc/declaring.md`](./doc/declaring.md)
- A page IS the shell grid — `main` (prose, `--measure: 40em`), `wide` (all the leftover), `bleed` (edge to edge, and it SPENDS the gutter tracks — prefer `wide`). Never `--measure: none`: [`/framework/styles/doc/layout-system.md`](/framework/styles/doc/layout-system.md)
- Overriding `render()` owes three silent things — set `this.view`, carry `.page`, never nest a second `.page` — and a flex/grid override owns its children's spacing (`gap`, not `flow`): [`doc/decisions.md`](./doc/decisions.md)
- A page placed with no mark and no `default` is `display: none`, and nothing throws; `warn_if_hidden()` says so on localhost only: [`doc/decisions.md`](./doc/decisions.md)
- `.page` visibility is decided in `@layer util`, so it out-ranks the `.grid` / `.flex` a page wears; `.active-page` and `.active-ancestor` are one question asked two ways — read both: [`doc/css.md`](./doc/css.md)
- `children` changes type — you write a string, you read a `Map`: [`doc/property/children.md`](./doc/property/children.md)
- A demo tree must not name children as a string — that probes the server for `<url>a/page.js`; use a POJO (`children: { HTML(){ … } }`) and a fictional root url: [`doc/decisions.md`](./doc/decisions.md)
- `render()` stamps `page--<name>` (double dash) — a single dash let a directory named after a `Page.css` class (`previews`) silently wear its styles: [`doc/decisions.md`](./doc/decisions.md)
- A card's thumb is inert — the label is the only link, because `<a>` in `<a>` is un-nested silently: [`doc/css.md`](./doc/css.md)
- `columns()` makes the whole subtree a row of full-height columns, and since 2026-09-18 **a column that is open never pays for the next one**: since 2026-09-24 it is frozen at about a third of the row (`34cqi`, between the floor and its ceiling), the new column takes what is left, and when nothing is left the row scrolls sideways rather than squeezing what is open (the flat 40–46em width is the alternative, and when to reach for even columns instead, is beside the change). Each page picks its track with `width: "small" | "large" | "full"`, a child marked `classes: "default"` is the one the host arrives with, and an index whose `content()` already draws its children says `index: true` so core leaves its row list out. It reads `--page-column-max`, never `--measure` — a region that sets `--measure: none` would uncap every column: [`doc/columns.md`](./doc/columns.md)
- `columns({ even: true })` is the other mode: **every open column the same width**, and how many fit is `floor(row / --page-column-recommended)` (`fit: "round"` rounds instead, filling the room tighter and letting a column go under its recommendation), recomputed when the ROOM changes and never when a column opens — so a column opens into a slot that was already there and nothing on screen resizes. Past N the row slides by exactly one column (measured: smooth scroll and FLIP both 0 long frames, View Transitions 23). The six width words stand down under it; `full`, a drag and the `< 32em` phone regime still win. Live on the [Finder](/framework/core/Page/overview/columns/finder/), side by side with today at [/web/nav/doc/study/](/web/nav/doc/study/): [`doc/columns.md`](./doc/columns.md)
- **Roles** — a page says `is: "topic"` and its whole subtree finds it with `this.topic()` / `document()` / `nearest(role)`, no import either way. `is:`, never `topic: true`: a flag named after the accessor shadows the method on the page that claims it: [`doc/roles.md`](./doc/roles.md)
- **Storage** — `this.prefs()` keeps a page's state between visits against its own url (`lew42:/imagine/team/`): `get(fallback)` / `set` / `patch` / `clear`, nothing to configure. Storage, not state — it never notifies; a failed write falls back to memory and warns once; a page `move()` re-addressed declares `store_key` to keep its data: [`doc/method/prefs.md`](./doc/method/prefs.md)
- **Panels** (splitting the height) needs no new word — `classes: "solo flex v gap"` plus `this.regions`, which `container()` already reads: [`doc/panels.md`](./doc/panels.md)
- The column pads (`--page-column-pad-x/y`) and the column's own `--flow` are `cqi` clamps × the host's `--size` knob; a rail's first row sits one pad-y under its head, as prose does. A preview card's title link hugs — the card is the control. Why, with the numbers: [`/imagine/design/size/`](/imagine/design/size/)
- `h1.page-title`'s font-size shrinks below ~460px (`clamp(1.75rem, 9vw, 3em)` in Page.css) so one long word — a title with no space to wrap on — never breaks mid-letter; the theme's flat `3em` still wins at every wider width, unchanged.
- Dragging a page to a new url in Make (`?real=`) does not orphan the links and imports that pointed at the old one — a move rewrites every one of them, found by the site-wide census `core/Page/tools/links.mjs` keeps at `public/links.json`.

## Comments moved out of Page.class.js (2026-10-12)

Wording kept as it was; the code keeps a one-line pointer here. Plan: [comment-plan.md](./comment-plan.md).

### Nothing is FETCHED here. A module page constructs ITSELF at import, so

*was Page.class.js line 53*

⚠ Nothing is FETCHED here. A module page constructs ITSELF at import, so a
constructor that loaded its subtree would pull the whole site down from whatever
url you opened — 261 modules for every page under /framework/, measured. The
caller budgets instead: Page.load(), child(), load_all_children(). doc/declaring.md.

### A config children: […] arrives here through ordinary Object.assign (th

*was Page.class.js line 159*

A config `children: […]` arrives here through ordinary `Object.assign` (the
constructor's own `this.assign(...args)` above) — this only STAGES it;
`declare()` is the one place that actually reads it (after `naming()` has set
`this.url`, which children need to move into).
⚠ `this.children = new Map()` is also how a LIVE page throws its whole tree
  away and starts over (core/Page/generator/page.js's `grow()`, a regrow on
  every spec change) — nobody hand-builds a config as a real `Map`, so that
  shape unambiguously means "forget everything now", not "stage this for
  declare() later". Cleared quietly: a Map never announced either.

### DRAW ME AGAIN, IN PLACE — no reload. The old element is swapped for a 

*was Page.class.js line 337*

DRAW ME AGAIN, IN PLACE — no reload. The old element is swapped for a fresh
render(); the pages the router has open BELOW me were mounted in my old regions
(a tab panel), so each is activated again and lands in the new one; then the
router re-marks the chain. `deactivated()`/`activated()` run around it, so a
page that starts a stream in content() stops the old one first.
⚠ Not `redraw()`: `Card` (ai/cards/card.js) already has its own.

### THE PAGE SHOWS ITS OWN FOLDER: page.jsonl and every file its lines nam

*was Page.class.js line 438*

THE PAGE SHOWS ITS OWN FOLDER: page.jsonl and every file its lines name, as
ext/files draws them — a tree, and the one you click as highlighted source. A
reader sees where things are and reads the real thing. `file` lines that name
a child (`kid/page.jsonl`) are pages, not files, and are left out.
⚠ core does not import ext: the import is dynamic, as in draw_md().

### THE LOADER. url is the folder, ending in /. Line 1 is the constructor 

*was Page.class.js line 542*

THE LOADER. `url` is the folder, ending in `/`. Line 1 is the constructor —
`new this(line1)`, so `Card.jsonl(url)` makes a Card — unless it names a
`"class": "<module url>"`, whose default export (a Page subclass) is built
instead. Every later line is `set()`. Null when there is no log.
⚠ On localhost it STREAMS: a line appended later calls set() and redraws.
`Store.for(url)` — one Store per file: a second visit to the same page.jsonl
reaches the SAME live reader, never a second one racing it.
⚠ TWO CALLERS CAN EASILY RACE for the exact same url: `load_all_children()`
  crawls EVERY child of a page (including "jsonl") the moment its PARENT
  loads, at the same time the Router's own sequential walk is reaching
  "jsonl" as the NEXT path segment on that identical parent. `reader._building`
  is the fix: the first call's whole build is ONE promise, and a second call
  made before it resolves joins THAT SAME promise instead of starting its own.

### Folders INSIDE a dated task folder get no log (Server/plugins/PageFile

*was Page.class.js line 628*

⚠ Folders INSIDE a dated task folder get no log (Server/plugins/PageFiles.js
  covers()), so asking would only log a 404: listing() answers null at once and
  the caller falls back. The card style (ai/YYYY/MM/DD/) is left out on purpose:
  a sub-card's folder can hold a real page.jsonl.

### My sub-pages, in declaration order: undefined = not mine, null = decla

*was Page.class.js line 721*

My sub-pages, in declaration order: undefined = not mine, null = declared, Page
= here — the Map-shaped shim over `page.pages` (above) that is the real
storage now. A POJO declares by title — the key is the title, Page.slug(key)
the url segment.
⚠ `list` IS THE DECLARATION — the config's own `children` (staged by the
  `set children()` the moment the constructor's `assign()` sees one, read here
  once `naming()` has given me a `url` to move them into) and whatever a data
  source answered with later, so a SECOND call ADDS and the children declared
  by name keep their places. A FUNCTION is a data SOURCE: it declares nothing
  now and is called on the first ask, by source_children() below. doc/data-children.md.

### A children() FUNCTION is called here, ONCE — the first time anyone ask

*was Page.class.js line 815*

A `children()` FUNCTION is called here, ONCE — the first time anyone asks for a
child: child() asks for the Router's walk, load_all_children() for a landing with
no segment to walk. So a page whose children live in data costs nothing until it
is visited, and it answers with anything `children:` takes — or a promise of it.
⚠ Memoised on `this.sourcing`: the second ask reuses the first one's promise.

### Last resort, so a real page.js always wins: a .md file beside me IS a 

*was Page.class.js line 1031*

Last resort, so a real page.js always wins: a `.md` file beside me IS a page —
`./x/` renders `./x.md`. Nothing crawls; a LINK is the naming. doc/declaring.md.
⚠ The SPA fallback answers every miss with index.html at 200 — content-type is the 404.
⚠ core does not import ext: the import is dynamic, and only on a would-be-404.

### A module that throws is NOT a module that isn't there — swallowing bot

*was Page.class.js line 1052*

A module that throws is NOT a module that isn't there — swallowing both turns a
syntax error in a page you just wrote into a silent 404.
⚠ `levels` — a module page constructs itself at import, so this is the first
  moment anyone can bound its subtree. Nothing means the page's own `depth`,
  which is what App.load("/") wants for the site root; child() passes 0 and
  budgets afterwards.

### THE FALLBACK for a page whose OWN render() replaced this class's —

*was Page.class.js line 1170*

⚠ THE FALLBACK for a page whose OWN `render()` replaced this class's —
  `ext/Doc`'s well-and-tabs shell is the one on the site today. render()
  above already draws the aside for the ordinary grid page and for a
  columns row (column()); `related_drawn` is how those two say "already
  mine", so this never fires twice. `activate()` is generic and Doc
  does not override it, which is what makes this the one place related:
  still reaches a page whose chrome core does not own — appended after
  whatever that chrome already built, so it reads as a block at the
  end rather than a right rail (`.page-related`'s own `flex-basis:
  100%` is for exactly this shape; doc/decisions.md).

### A page that said one of the six words gets a FRAME: the chrome its

*was Page.class.js line 1260*

A page that said one of the six words gets a FRAME: the chrome its
arrangement word asks for, around the box its content goes in. A page
that said none has no frame at all and draws exactly what it drew before
the words existed. Frame.js.
⚠ `page-frame-page` — THIS frame is the page's own, as opposed to one
  drawn as a picture of a page inside a cell. It is the only frame whose
  body becomes a container, so it is the only one the `< 34em` stacking
  query can reach (Page.css says what that cost when every frame had
  one). A demo that draws a page-sized frame of its own opts in with the
  same class.

### APPENDED, not woven into the callback above: the two branches above

*was Page.class.js line 1279*

⚠ APPENDED, not woven into the callback above: the two branches above
  this line already return their own value on purpose (the Frame or
  render_content()'s own view, which `.append()` — the capturing trap
  this whole codebase is built around — would otherwise re-append A
  SECOND TIME). `.append(fn)` on the finished view re-opens it as the
  captor for exactly this one call, the same shape content_at() uses,
  so nothing about the two branches above has to change.

### My column, then the region MY children mount in — so the DOM stays an 

*was Page.class.js line 1570*

My column, then the region MY children mount in — so the DOM stays an ordinary
tree and the visibility contract holds; Page.css flattens only the LAYOUT. The
host wraps both in the row every column lands in, under its crumb strip.
⚠ No `page-title` and no `flow`: the head below IS the title, and the two
  framework rhythm rules (`.flow > * + *`, `.page-title + *`) would each hand a
  column body a top margin it has no room for.
⚠ `classes` is ADDITIVE here, where `render()` lets it REPLACE the shape. A column
  has no shape to choose — it is `.page.column` or it is not in the row — so a
  declared class can only be an extra. Without this a columns host could not be
  marked `default`, which is the only way to show one that is never routed to
  (a panel, a demo box): `uses/split` had to write `activated(){ … }` by hand.

### index: true — my content ALREADY shows my children, as a previews()

*was Page.class.js line 1645*

⚠ `index: true` — my content ALREADY shows my children, as a `previews()`
  wall, so this rail would say the same things a second time (`layout` Q4:
  a page shows each thing once). Three pages had written the whole method
  out by hand to say it. A FIELD, not a method — and not `nav:` (`nav()` is
  a method here) or `rail:` (four pages already declare it as their own
  word): the `opens()` collision, avoided by grepping first. doc/columns.md.

### ── the seam — drag it and this column keeps the width you left it at ─

*was Page.class.js line 1671*

── the seam — drag it and this column keeps the width you left it at ──
A SIBLING of the body, so it is a real flex item of the row: `.page.column` is
`display: contents` and cannot host an event, and the body is a scroller, so an
overlay inside it would scroll out of view. It measures 0 — the 6px hit zone is a
`::before` straddling the hairline — so the row's px still add up to the columns.
⚠ `lostpointercapture`, not `pointerup`: it fires for a cancelled drag too, so one
  handler ends the gesture however it ended.
⚠ `preventDefault` on the DOWN, or the drag selects the text either side of it.

### The width a drag leaves behind, written as the SAME three tokens the w

*was Page.class.js line 1698*

The width a drag leaves behind, written as the SAME three tokens the width words
set — one level stronger, because an inline custom property out-ranks a class.
⚠ NO `px` = back to the page's word: `setProperty(prop, "")` REMOVES the
  declaration, so the class's tokens are what the body reads again. That is the
  double-click, and it is why nothing here remembers a previous value.
⚠ Per VISIT. The columns are rebuilt on reload and the width goes with them; where
  a width would be stored, and whether a url or a page owns it, is open (doc).

### ── even — N columns, all the same width, N computed from the ROOM ──

*was Page.class.js line 1716*

── `even` — N columns, all the same width, N computed from the ROOM ──
N = max(1, floor(available / recommended)); width = available / N. `available`
is the ROW's own inline size, not the window's — the owner asked "screen or
container?" and the answer is container, because a row can be a panel, a demo
box or one half of a split and still has to get this right. `floor` is what
buys the guarantee: a column is never narrower than the width it recommends.
Page.css turns the ONE value written here into every column's width.
⚠ STATIC, so the lab at /imagine/design/navigation/ sizes its `even` row with
  the very function a real host uses. The page's own readout and a headless
  measurement of the same click then cannot disagree, because there is one
  copy of the arithmetic.
⚠ THE STAMP COMES OFF BEFORE THE READ. `max-width` is the recommendation only
  while `--page-column-even-w` is unset (Page.css spells out why); with the
  stamp on, max-width IS the even width and the row would divide its own
  answer again, halving the columns on every resize.
⚠ `max-width: none` means the `< 32em` PHONE REGIME has taken over — it writes
  the three properties directly and pages the row one column at a time. There
  is nothing to compute down there and nothing of that regime is touched: the
  stamp comes off and stays off. Core's own threshold, read off core's own
  rule, so the two can never drift apart.

### Should a navigation inside this row slide, or jump? Measured headless,

*was Page.class.js line 1771*

Should a navigation inside this row slide, or jump? Measured headless,
5 runs × 2 widths, frames over 50ms during the move (doc/columns.md):
native smooth scroll 0 · FLIP (translateX + Web Animations) 0 · View
Transitions 23, worst frame 116.7ms. Smooth scroll and FLIP tie on jank, so
the cheaper one wins: a scroll is ALREADY what this row does, and asking the
browser to animate it costs one word.
⚠ Reduced motion is read HERE, not in a media query, for the same reason
  `slide` is an argument: the sheet cannot tell an arrival from a click.
⚠ Only the `even` mode slides today. In the elastic mode the columns RESIZE
  as the row scrolls, and animating a reflow is how you get the jank this
  mode exists to remove. Dropping `this.column_even &&` is all it would take.
  (Since 2026-10-23 `columns()` is opt-in: the task and session pages no longer
  use it, they open a child as a full page. See design/navigation/readme.md.)

### The row has no box yet on a cold load, and no frame you can count will

*was Page.class.js line 1793*

⚠ The row has no box yet on a cold load, and no frame you can count will give
it one: a page is BUILT detached, so every rect at rAF is 0. The observer
fires the moment it gets a size — and again on every resize, which is exactly
when the deepest column needs revealing again.

### One frame, for every navigation after that: Router.mark() marks what s

*was Page.class.js line 1799*

⚠ One frame, for every navigation after that: Router.mark() marks what shows
AFTER activate(), so right now the newest column is still `display: none`.
… and it is the one settle that SLIDES: the observer above owns the arrival
and the resize, this owns the click.

### The deepest column on screen, brought in by the smallest move — the co

*was Page.class.js line 1806*

The deepest column on screen, brought in by the smallest move — the columns to
its left stay exactly where they are.
⚠ `scrollBy` on the row, never `scrollIntoView`: that walks up and scrolls the
document around the whole host too.

### One rung per child: its name as a link, then ITS children as cards. An

*was Page.class.js line 1852*

One rung per child: its name as a link, then ITS children as cards. An index of
indexes — `previews()` is my children, `walls()` is my grandchildren under their
parent's name. Depth 1 on purpose, and a childless child has no rung: a heading
over nothing is this method quietly turning back into `previews()`.
⚠ `leaf` opts a child out whole: it presents ITSELF, not its children — and a
child that overrode `previews()` into something else entirely (a rail, a
timeline) would otherwise render that thing here, on someone else's index.

Split into `wall_rungs()` (the array, built DETACHED from whatever capture is
open — same reason `ext/Mention`'s `build_row()` does it, core/View/doc/
capturing.md) and this thin wrapper (the one flex column every existing caller
still gets) so a caller that wants to place the SAME rungs a different way —
`ext/sprawl`'s balanced columns, `public/framework/page.js` — can ask for the
array instead of this one fixed arrangement, with no second copy of the "which
child counts as a section" judgment call above.

### The thumb is INERT (Page.css): the label below it is a link, so a live

*was Page.class.js line 1897*

⚠ The thumb is INERT (Page.css): the label below it is a link, so a live render
in here would be an `<a>` inside an `<a>` — invalid, and the browser un-nests it.
`nav.class_card` (set by `ext/Doc`'s own `nav()`, true when `Doc.is_class(this.subject)`
says the page documents a real ES class) wears the SAME always-dark island every other
"dark" surface on the site already uses (`page-surface-dark`, `core/Page/words.js`'s
`dark` SURFACE word) — one card look for "this names a class", not a new one invented
for this task (CLAUDE.md law 6).

### My children fetched, and theirs, until the budget runs out. levels is 

*was Page.class.js line 1947*

My children fetched, and theirs, until the budget runs out. `levels` is what the
CALLER needs; nothing means my own `depth`, which is what navigating to me asks
for. Awaiting each child's `loading` makes this mean "the next `levels` are
ready"; Router.load() awaits it, so a page draws once, complete.
⚠ Idempotent — `loaded` is what is already here, so revisiting costs nothing and
  a deeper ask tops up. It returns `this`, which is what lets child() chain it.
⚠ A `leaf` child spends NONE of my budget: leaf already means "I present myself,
  not my children" — walls() and framework's sections() both skip it — so its
  subtree waits until you open it. 50 modules on /framework/ alone.

### The box the six page words open, in its own file because this one is l

*was Page.class.js line 1991*

The box the six page words open, in its own file because this one is long enough.
`extends` copies the static side, so a Page subclass gets the whole machine with
nothing to wire and a method inside reaches it as `this.constructor.Frame`.
⚠ `PageFrame`, never `Frame` or `Stage` — View.classify() mints a CSS class from
  every constructor name in the chain, and `.stage` is a framework layout word that
  would shrink-wrap the frame with nothing thrown. Frame.js says it at length.
