# page.jsonl — a page with no page.js

## The store

A `.jsonl` file is a log: one JSON object per line, only ever appended to. Who does what:

- **Reads:** `Item.Store` ([Store.js](../../Item/Store.js)) replays a file into one live object and tails it.
- **Writes:** appends go through the dev socket (`FsFile.send`); a validated single writer, `FileJournal`, is planned ([storage.md](storage.md)).
- **Filed by day:** a collection of folders (projects today, sessions and tasks next) is made, moved, indexed and queried by [`Dated`](/framework/core/Item/Dated/) and [`DatedFiles`](/Server/doc/dated-files.md). Plan: [store-index-query-plan.md](../../Item/doc/store-index-query-plan.md).

---

A folder can hold a `page.jsonl` instead of a `page.js`. It is a log: one JSON object per
line, read top to bottom. The live example is [/framework/core/Page/jsonl/](/framework/core/Page/jsonl/),
and the code lives in `Page.class.js` (`Page extends Item` directly, PageLog folded in; `Log.js` is a compat re-export).

```
{"title": "Notes", "icon": "description"}       line 1 builds the page: new Page(line1)
{"file": "note.md"}                             note.md EXISTS
{"file": "kid/page.jsonl"}                      kid is a child page, LINKED automatically
{"place": "note.md"}                            note.md is PLACED in the content
```

## Every line is one `set()` call

`page.set(obj)` is `assign()` that calls methods instead of overwriting them. For each key:

- a **method** is called with the value, as exactly one argument (`place` calls `place()`);
- an **object with its own `set`** gets the value passed down to it;
- anything else is **assigned** as data;
- `constructor`, `__proto__` and keys starting `_` are skipped, and a `Map` (core's own
  `children`) is never replaced.

There is no table mapping JSON keys to behaviour: the class is the vocabulary. A subclass adds
a word by adding a method — a `Card` with `message(value)` answers `{"message": {…}}` lines.

A key that was neither a method nor an existing property is kept as data and recorded in
`page.unknown` (an array, computed from `page.data`) — usually a typo. On localhost one `console.info` names each new one;
`page.listing()` shows them on the page.

⚠ Line 1 goes to the constructor, which ASSIGNS: a `file` or `place` key there would replace
the method with data. Put verbs on line 2 onwards.

## Line 1 may name a class

`{"title": "Inbox", "class": "./Card.js"}` — the loader imports that module (resolved against
the folder) and builds its default export, which must extend `Page`. `class` itself is not
assigned. `Card.jsonl(url)` does the same without the line, because the loader builds `new this`.

## Three steps, separate on purpose

1. **Exists** — `{"file": "x"}`. Recorded, never drawn (see "Who writes the file lines" below).
   `{"file": "x", "gone": true}` removes it
   (`set()` calls `file("x")`, then `gone(true)`). Lines are keyed by the FIRST path segment,
   as the plugin keys them, so `kid/` and `kid/page.jsonl` are one entry and the latest line wins;
   repeating a line changes nothing.
2. **Linked** — a file line naming `kid/page.jsonl` or `kid/page.js` declares `kid` as a child
   page. The page remembers which kind, and `child()` reads a jsonl child with `Page.jsonl()` —
   no probe. A `page.js` parent names one the same way: `children: "generator jsonl/page.jsonl"`.
3. **Placed** — `{"place": "note.md"}`, an array of names, or `{"place": {"module": "x.js", …data}}`,
   drawn in line order:
   - `.md` renders as markdown;
   - `.js` is imported into a box captured **before** the import resolves. A default export with
     a `render` (a View) is built as `new Default({ page, …data })`; anything else is called as
     `fn(page, box, data)`. `content.js` is this rule with no data — the escape hatch that replaces
     `content()`;
   - a child's name draws nothing extra: it is already linked.

## Two more lines: a tab's state, and a page's own settings

Added 2026-09-29 (the tabs-settings task), both read by `Log.js`, neither one required —
every page that doesn't write them is unchanged.

**`{"tab": {"name": "x", "disabled": true, "nav": false, "order": 3}}`** — state for ONE
CHILD, written on the PARENT's own log. A child that already exists (a declared child, a
`file` line naming it) is already a tab the moment `Doc.bar()` or `tabs()`
(`ext/tabs/tabs.js`) sees it as a declared child; this line only adds STATE: `disabled`
draws it greyed and unclickable (still a real page at its own url), `nav: false` drops it
from the tab STRIP entirely (still a real page — only missing from the bar), `order` breaks
a tie between tabs that both want a position. A name with none of the three is still
DECLARED as a child (like a plain string in `declare()`), so a `tab` line can be how a tab
comes to exist at all. Repeat lines for one name merge, never replace.

**`{"settings": {"nav": false}}`** — a whole PAGE's own preference, written on ITS OWN log
(a page.js folder writes a sibling `settings.jsonl` instead, the same rule `weight.jsonl`
uses — never a `page.jsonl`, which would subscribe it to the file watcher for nothing). The
first and only setting is `nav`: does this page appear in ITS PARENT's navigation? The right
drawer's Settings tab has an "Appears in navigation" checkbox for whichever page you're
looking at, and a change writes exactly this line. If nothing ever set it, `nav` follows
weight (`core/Page/weight/`): a page whose weight is below 1 is out of nav too.

`Doc.bar()` and `tabs()` both read a name's tab state AND (when the child happens to be
already loaded — nothing is fetched to check) that child's own settings, through two `Page`
methods (`Page.class.js`), `tab_visible(name)` and `tab_order(name)`, so the two can never disagree. Live demo,
all of it: [`core/Page/settings/`](/framework/core/Page/settings/).

## Who writes the file lines

Nobody has to remember them. The dev server's `Server/plugins/PageFiles.js` watches `public/`
and keeps every folder's file list current, one line per change:

```
{"file": "photo.png"}                  a file appeared
{"file": "kid/page.jsonl"}             a subfolder that is a jsonl page
{"file": "kid/page.js"}                a subfolder with a page.js
{"file": "kid/"}                       a plain subfolder
{"file": "photo.png", "gone": true}    it disappeared
```

**Which file holds a folder's list.** A **jsonl page** (a folder with no `page.js`, whose
`page.jsonl` line 1 sets a page up: every AI card, `core/Page/jsonl/`) keeps its list in its own
`page.jsonl`, so loading the page brings its listing for free. **Every other folder** (it has a
`page.js`, or it is a plain folder like `doc/`) keeps its list in **`files.jsonl`**, in the same
line format, and never gets a `page.jsonl` from the plugin: a `page.jsonl` means "this folder is
a jsonl page" to the loader ([writers.md](/framework/core/Page/jsonl/md/doc/writers/)). An
**empty folder gets no list at all**; the first file put inside it creates one. `PageFiles.log_of()`
is the one place that decides, and when a folder changes kind (a hand-written `page.jsonl`
appears, or a `page.js` is added or removed) the list moves to the right file.

**Reading it.** `Page.listing(url)` answers from the loaded jsonl page with no fetch, else from
`files.jsonl`, else from `page.jsonl`, else `null` (the caller then reads `directory.json`).

**Which folders are covered.** Every folder under `public/`, except `node_modules`, a dot-folder,
and anything *inside* a flat task folder `public/framework/ai/YYYY-MM-DD/<task>/` (a minion's
scratch). The day and task folders themselves are covered. The card tree
`public/framework/ai/YYYY/MM/DD/…` is covered at every depth: a card there is a real page.

**Repeat-safe.** Before each append the plugin replays the log and writes only if the answer
would change, so the Windows watcher's extra events (even a read fires one) add nothing. The two
logs are never listed as entries, and neither is `directory.json`. On boot the server catches up
every existing log in the background. `node Server/page-files-backfill.mjs` runs the same walk
with creation turned on (a second run prints 0 created, 0 appended), and
`node Server/page-files-migrate.mjs` moved the old list-only `page.jsonl` files to `files.jsonl`
(2026-09-29; `--dry` shows what it would do).

**Merging.** Every `*.jsonl` carries `merge=union` in `.gitattributes`, so two branches that both
appended to one folder's list merge by keeping both lines; the latest line per name still wins.

## Live on localhost — `log_draw()` and `log_redraw()`

A page with no `content()` of its own gets `log_view()` as its content. `log_view()` captures one
box (`.page-log`) and fills it with `log_draw()`, which draws every placed entry in order.

On localhost the log streams through `ext/JSONL/live.js` (imported dynamically — core never
statically imports ext). A line appended later goes through `set()` like any other line, and
then `log_redraw()` empties that one box and runs `log_draw()` again. The title, the sidebar and
the rest of the page stay put, and nothing reloads. A `content.js` is simply called again, so it
redraws whatever it drew, `page.listing()` included. If the log is rewritten instead of appended
to, `log_forget()` clears the files and placements and the whole log replays from line 1.

Off localhost the log is fetched once and nothing streams. `page.jsonl_url` is the log's own
address, for a module that wants to append a line back to it.

A missing log is `null` — the SPA fallback answers a miss with `index.html` at 200, so the
content-type is the 404, as in `Page.read_json()`.

`page.js` folders are untouched: nothing here probes for a `page.jsonl`, and `child()` only
reads one when a listing named it.

## Agent tools — writing a live page without touching the file (2026-10-02)

An agent writes a page the same small way a browser tab would: one line at a time, through
six Servex in-process tools (`Servex/agents/page_tools.js`, `Servex/agents/inbox.js`) over
`Item.Store`'s own append — never a hand-written line, never a whole-file rewrite. Live demo:
[`/framework/core/Page/jsonl/live/`](/framework/core/Page/jsonl/live/), built with these tools
while a headless tab watched it grow.

Every write lands as the canonical **nested** line (2026-10-03: "no `at`, no dots — the path
is the nesting"): `page_call(path, ["k2","answers"], "add", {...})` writes
`{"k2":{"answers":{"add":{...}}}}`, read exactly as `get()` (`core/Item/Item.js`) resolves it —
each hop is a property name (`"content"`) or a child's id, found by scanning the lists a node
owns, never a slash- or dot-path. `page_add`/`page_set` are sugar for the two common calls.

**Now (2026-10-12):** `page_set` is the one write tool (it also makes subpages); `page_call`, `page_add` and `page_log` below are its aliases. The current model: [ai-api.md](ai-api.md).

- **`page_call(path, target, method, args)`** — the general tool: one verb at one target.
- **`page_add(path, item, {after})`** — sugar for `page_call(path, ["content"], "add", item)`.
- **`page_set(path, target, delta)`** — sugar for a plain nested delta (no verb at all — a
  delta IS a set, by `get()`'s own rule). `target: []` sets the page's own fields.
- **`page_log(path, text)`** — a "now doing X" line, posted BEFORE a long step so the owner
  can watch the work happen, not just read about it after.
- **`page_read(path, {format})`** — the page's CURRENT state, computed fresh from the log
  every call, never a second copy: `markdown` (default) or `html` (the content's own markup,
  no nav chrome). Read this before deciding what to add or change next.
- **`page_note(path, text, {to})`** — a note for whoever reads this page next, read by the
  page's own Inbox with no Servex dependency; `to` (or the module's coordinator) also gets a
  short wake. [`ext/Inbox`](../ext/Inbox/) · `Servex/doc/inbox.md` (repo file).

⚠ A bare `page_call(path, [], "add", item)` — no target — collides with `Page.add(name,
child)` (its OWN two-argument method for a CHILD PAGE): `page.add` resolves as a METHOD name
before it ever reaches the content list, so it fires with the wrong arguments. Always target
`["content"]` for a content item; `page_add` already does this for you.

### A content row that IS a page reference (2026-10-03)

`page_add(path, { id: "page", ref: "/framework/core/Page/", text: "…" })` — a `ref` field makes
the row draw as THAT page's own dark class card (the same look `#Page` gets inline, ext/Mention's
`build_row()`, reused rather than rebuilt — `render_content_list()`'s `draw_row`,
`core/Page/Page.class.js`), with the row's own `title`/`text` reading as the caption under it, and
the whole card linking to `ref`'s url. The card is only dark when `ext/Mention/maps/refs.js` marks
that page `class_card: true` (same rule an inline `#Mention` follows); a `ref` not yet in `refs.js`
still renders — a plain icon + the raw url — rather than a blank gap.

## Comments moved out of Page.class.js (2026-10-12)

Wording kept as it was; the code keeps a one-line pointer here. Plan: [comment-plan.md](./comment-plan.md).

### EXTENSIONS, CODE-REGISTERED — Page.use(Ext) turns Ext.setup(page) on f

*was Page.class.js line 43*

════ EXTENSIONS, CODE-REGISTERED — Page.use(Ext) turns Ext.setup(page) on for
EVERY page, the moment this runs. `ext(name)` below is the DATA path — one
page.jsonl line turns one extension on for one page. Both call the same
`Ext.setup(page)`. Model: `Server/Events.js`'s `static use(plugin)` /
`setup(instance)`; `core/Page/ext/readme.md` has the rest.
⚠ Nobody calls this by default, so the forEach below is empty for every page —
  the "must not slow a page with no extensions" rule this exists to keep.

### A page's own preferences. Today there is exactly one: nav — "does this

*was Page.class.js line 74*

A page's own preferences. Today there is exactly one: `nav` — "does this page
show up in its parent's navigation?" (core/Page/settings/, loading-study.md
section 4). `this.settings` is never a PLAIN object: it starts life as this tiny
object with its own `set()`, so Item's `set_one()` routes a `settings` line into
its "has its own `.set()`" branch and MERGES — a plain object here would get
SHADOWED (fully replaced) by the second settings line instead of merged with it.

### apply() that calls methods instead of overwriting them — Item's apply(

*was Page.class.js line 102*

`apply()` that calls methods instead of overwriting them — Item's `apply()`
does the real routing (a method key calls it, a value with its own `set()`
gets the nested delta, anything else is data via `get`/`put` above, emitting
`change` + `delta`). This override's own job is four things on top: handle
an ARRAY of lines (Item.set() does this itself, but this override replaces
that whole method, so it has to again), keep every line for a late
`on("line", …)` listener to catch up on, emit `line` exactly ONCE per line
the reader hands this page (never once per recursive nested `set()` call
`apply()` makes along the way — those land on a DIFFERENT object, never
back through this override), and make `page.content` lazily the moment a
content delta arrives.

### Made the first time a content DELTA arrives (a {"content": {...}} line

*was Page.class.js line 136*

Made the first time a content DELTA arrives (a `{"content": {...}}` line) or a
code caller reaches for it directly — never up front, so a page with no visible
blocks of its own pays nothing. Once it exists, Item's own `set_one()` routes
straight to its `.set()` without this method running again.

### My sub-pages — the real storage page.pages. of: null keeps a plain stu

*was Page.class.js line 145*

My sub-pages — the real storage `page.pages`. `of: null` keeps a plain stub
object (`{id, name, stub: true}`) plain: List.make() hydrates a plain value
through `of` only when `of` is truthy, so a stub is never turned into an Item.
A REAL loaded page is a `Page` instance already (never plain), so it is
inserted/replaced UNCHANGED either way — see `add()` above.

### A Map-SHAPED VIEW over pages, so the ~215 existing .children callers a

*was Page.class.js line 152*

A Map-SHAPED VIEW over `pages`, so the ~215 existing `.children` callers across
~94 files keep working unchanged while the real storage is the List above.
New code and docs say `page.pages`. `PageChildren extends Map` so
`instanceof Map` stays true and a page.jsonl line can never REPLACE it (see the
setter below) — only `declare()` above ever builds the real tree.

### EXTENSIONS — a page.jsonl line names one on: {"ext": "Inbox"}

*was Page.class.js line 180*

════ EXTENSIONS — a page.jsonl line names one on: `{"ext": "Inbox"}` ══════════
The DATA path — one page at a time. `Page.use(Ext)` above is the CODE
path — every page, the moment the module that calls it is loaded. Both end up
calling the same `Ext.setup(page)`.
⚠ core never statically imports ext code — resolved against THIS file's OWN url
  (not the page's), so it always finds `core/Page/ext/<Name>/<Name>.js`.
⚠ This import is ASYNC; the replay of an already-fetched page.jsonl is NOT —
  see `jsonl_lines` above, which is what lets a late setup() catch up.
`ext_ready` — every extension's own import+setup promise, so anything that
reads what an extension set up (a `place`-d module, say) can
`await Promise.all(page.ext_ready ?? [])` first rather than race it.

### STEP 1 — the file EXISTS

*was Page.class.js line 198*

════ STEP 1 — the file EXISTS ════════════════════════════════════════════
Recorded, never rendered. A repeat changes nothing: the latest line per name wins.
TWO CALLERS, split: a REPLAYED `{"file": …}` line (this.store is mid-`read()`,
`this.store.replaying` is true) registers the listing, same as always. A CODE
call — `page.file("demo.jsonl")`, not a line — never touches the listing (that
would double-count a file the code already knows about) and instead hands back
the real file: ext/filesystem's `FsFile`, the one file class, dynamically
imported because core never statically imports ext. Its own lazy `.store`
getter is `Item.Store.for(url)` — one Store per file, the same one `page.store`
is for page.jsonl itself.

### STEP 2 — a child page is LINKED, automatically

*was Page.class.js line 226*

════ STEP 2 — a child page is LINKED, automatically ══════════════════════
"kid/page.jsonl" → the child "kid", remembered as a jsonl child so child()
loads it from the right file without probing. Also what `declare()` calls for a
page.js parent's `children: "kid/page.jsonl"`.

### TAB STATE — {"tab": {"name": "x", "disabled": true, "nav": false, "ord

*was Page.class.js line 248*

════ TAB STATE — `{"tab": {"name": "x", "disabled": true, "nav": false, "order": 3}}` ═══
A child that already exists — a declared child, a `file` line, a `children:`
entry on a page.js parent — is already a tab the moment Doc.bar() or tabs()
(ext/tabs/tabs.js) sees it: this only adds STATE to it. `disabled` draws it
greyed and unclickable; `nav: false` drops it from the tab STRIP entirely (it
is still a real page at its own url); `order` breaks a tie when more than one
tab wants a position. A name with none of the three still gets DECLARED as a
child here (the same thing declare()'s own string form does), so a `tab` line
can be how a tab comes to exist at all, with nothing yet to draw there.
⚠ Repeat lines for the same name MERGE (the new keys land on top of the old),
  never replace — set() calling this again is just one more spread.
(2026-10-09, the page tool) A `tab` line that also brings PAGE DATA (`title`,
`icon`, `description`, `content`) builds that tab's page right here, in memory,
so an agent's "add a tab" draws at once: `{"tab": {"name": "notes", "title":
"Notes", "content": "…"}}`. Its own items arrive later as `{"notes": {"content":
{"add": {…}}}}` (`get("notes")` finds the child in `pages`). A page with no tab
strip yet turns `navigation: "tabs"` on, because a tab nobody can see is not
what was asked. doc/architecture.md.

### THE SIX WORDS AS A DELTA (2026-10-09, the page tool)

*was Page.class.js line 292*

════ THE SIX WORDS AS A DELTA (2026-10-09, the page tool) ═══════════════
`{"navigation": "tabs"}` or `{"width": "fill"}` on a live page.jsonl reshapes the
page: the word lands on the PAGE ITSELF, where render() reads it (never in
`data`, where Item's routing would have put it), and a page already on screen
redraws. A word that did not change redraws nothing, so a log replayed twice
is quiet.

### A LOG ON TOP OF A TEMPLATE. A page drawn by code (a template, like a s

*was Page.class.js line 314*

A LOG ON TOP OF A TEMPLATE. A page drawn by code (a template, like a session
page) can still be reshaped by a page.jsonl beside its data: only the SHAPE of
a line applies here — the six words, `tab` lines, `title`, and lines addressed
to a tab that a `tab` line built. Everything else in such a log (a card's own
fields, cost lines, `add`/`at` lines older code wrote) stays that log's data,
because an unknown key can name a Page METHOD (`add`, `move`) and must never
call it. Returns the part it applied, or null.

### NAV VISIBILITY — one rule, read in one place, for the rail, the tab st

*was Page.class.js line 368*

════ NAV VISIBILITY — one rule, read in one place, for the rail, the tab strip
and the drawer's own checkbox ═══════════════════════════════════════════════
Shown unless: MY OWN `tab` line says `nav: false` for this child (explicit,
always wins, and an explicit `nav: true` always wins the other way — see
`section()` in ext/Doc/Doc.js, which pins its own OVERVIEW/API/DOCS/FILES
chrome this way so those never depend on a real page's settings). Otherwise
this asks the exact question the drawer's own checkbox asks —
`page_settings()`, core/Page/settings/settings.js — which already unifies an
explicit `{"settings": {"nav": false}}` line on the CHILD's own log with the
weight fallback (below 1 is out of nav too).

That real answer needs a fetch, so this stays SYNCHRONOUS the way every
caller (Doc.bar(), tabs(), Sidebar's rail) needs at render time: the first
ever ask answers optimistically `true` — a tab is never hidden before it's
actually been checked — then checks for real in the background, and if the
answer disagrees, corrects the cache and calls `nav_redraw()`
(ext/tabs/tabs.js) so the strip (and the rail, which bubbles up to it) fixes
itself with no reload. `nav_ready()` below is the same answer, awaited, with
no flash — used the one place that can afford to await before its first
paint (Sidebar.visible_nodes()).

Code: the replay hooks, the three file steps, tab state and the placed-file drawing live in [`Jsonl.js`](/framework/core/Page/Jsonl.js) (`Page.Jsonl`); `Page.class.js` keeps one-line facades.
