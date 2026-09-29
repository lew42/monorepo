# page.jsonl — a page with no page.js

A folder can hold a `page.jsonl` instead of a `page.js`. It is a log: one JSON object per
line, read top to bottom. The live example is [/framework/core/Page/jsonl/](/framework/core/Page/jsonl/),
and the code is `Log.js` beside `Page.class.js` (`Page extends PageLog`).

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
`page.unknown` (a `Set`) — usually a typo. On localhost one `console.info` names each new one;
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
already loaded — nothing is fetched to check) that child's own settings, through two Log.js
methods, `tab_visible(name)` and `tab_order(name)`, so the two can never disagree. Live demo,
all of it: [`core/Page/settings/`](/framework/core/Page/settings/).

## Who writes the file lines

Nobody has to remember them. The dev server's `Server/plugins/PageFiles.js` watches `public/`.
When a file or folder appears in, or disappears from, a folder that has a `page.jsonl`, it
appends one line to that log:

```
{"file": "photo.png"}                  a file appeared
{"file": "kid/page.jsonl"}             a subfolder with its own page.jsonl
{"file": "kid/page.js"}                a subfolder with a page.js (wins over its page.jsonl)
{"file": "kid/"}                       a plain subfolder: listed, not a page
{"file": "photo.png", "gone": true}    it disappeared
```

Before each append it replays the log and writes only if the answer would change, so the
Windows watcher's extra events add nothing. It skips any folder that has a `page.js` (that
folder uses its `page.js`, and a `page.jsonl` beside it is not the plugin's to fill), dot-files,
`.json` files and the log itself. On boot it catches up every `page.jsonl` under `public/`.
You can still write a file line by hand; the plugin will agree with it.

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
