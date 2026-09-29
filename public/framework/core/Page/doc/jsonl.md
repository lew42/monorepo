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

Nobody has to remember them. The dev server's `Server/plugins/PageFiles.js` watches `public/`,
and **every folder it covers has its own `page.jsonl`** — not just the folders someone hand-made
one for. Loading any page's own log gets that page's whole listing for free, with no separate
`directory.json` fetch. When a file or folder appears in, or disappears from, a covered folder,
the plugin appends one line to that folder's log:

```
{"file": "photo.png"}                  a file appeared
{"file": "kid/page.jsonl"}             a subfolder that is itself a real page (see below)
{"file": "kid/page.js"}                a subfolder with a page.js (still wins as the page)
{"file": "kid/"}                       a plain subfolder: listed, not a page
{"file": "photo.png", "gone": true}    it disappeared
```

**Which folders are covered.** Every folder under `public/` gets one, except `node_modules`, a
dot-folder, and anything *inside* a task's own working folder under `public/framework/ai/YYYY-MM-DD/<task>/`
— a minion's `task.jsonl`, its `requirements.md`, its scratch files. The task folder itself and
the day folder above it still get one; only what nests inside the task does not. That's the *only*
folder shape this applies to — `public/framework/ai/2026/09/29/...` (year, month and day as three
nested folders) is a different tree, the card/AI2 dashboard system, where a card can nest cards
inside cards to any depth and every one of them is real, hand-written content, not a minion's
scratch — so every folder there is covered, at every depth, same as anywhere else in the site.

**A folder with a `page.js` is no longer skipped.** It used to be — the thinking was "that folder
already has a page, so its `page.jsonl` isn't ours to fill." Now it gets a listing log too, kept
current the same as any other folder's. The `page.js` still wins as the page (nothing about
*loading* a page changed) — the log is just an honest listing of what's on disk beside it. A
folder that holds both today, `imagine/cms/json/`, still renders exactly as before; its own
`page.jsonl` happens to *also* hold that page's real data (deltas the CMS editor appends), and the
two coexist because the CMS's own reader only recognizes its own line shape and ignores anything
else, exactly like every other reader here ignores lines it doesn't recognize.

**A subfolder is only listed as a linked child page (`kid/page.jsonl`) when its own log really is
one** — when its first line sets the page up (a title, a class, ...), the way "Line 1 may name a
class" above describes. A log this plugin filled in on its own never has that: its first line is
a plain `{"file": ...}` entry, same as every other line in it. So a folder that has nothing but an
auto-filled listing stays `kid/`, a plain subfolder — it doesn't turn every `doc/` folder in the
site into a page just because it now has a `page.jsonl`.

Before each append the plugin replays the log and writes only if the answer would change, so the
Windows watcher's extra events (even a plain read fires one) add nothing. It skips dot-files,
`node_modules`, the log itself, and `directory.json` (the other plugin's own generated file) —
every other file, `.json` included, belongs in the listing. You can still write a file line by
hand; the plugin will agree with it.

**On boot**, the server catches up every *existing* `page.jsonl`, in the background — it no
longer holds up the server's first request while it walks the whole tree (measured at ~2.2
seconds over the ~2,800 logs this repo has; the fix was one `setImmediate`, so the walk itself is
unchanged, it just no longer runs before the port opens).

**The backfill.** Rolling this out on an existing site meant thousands of folders needed a first
`page.jsonl` all at once — that's `Server/page-files-backfill.mjs`, a one-time script that runs
the exact same walk as the boot catch-up, with folder *creation* turned on. Run it after any
change to the covered-folder rule or to what a listing line should say, so every existing log
catches up to the new answer:

```
node Server/page-files-backfill.mjs
```

It's safe to run again — a second run visits the same folders but creates nothing and appends
nothing, because every log already agrees with what's on disk. It prints how many folders it
visited, how many logs it created, how many lines it appended, and how long it took.

**Merging two branches that both touched a `page.jsonl`.** Two people (or two agents) working in
different branches often both add a file under the same folder, which means two branches both
append a line to that folder's log. Since every append-only `*.jsonl` file in this repo carries
`merge=union` in `.gitattributes`, git merges those two additions by keeping both lines — in the
order each branch had them — instead of stopping to ask a person to pick a side. This is safe
specifically *because* these logs are append-only and read as "the latest line per name wins": two
lines about two different names never disagree, and even two lines about the *same* name just
leave the later one as the answer, whichever branch's line a merge happens to put second.

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
