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
