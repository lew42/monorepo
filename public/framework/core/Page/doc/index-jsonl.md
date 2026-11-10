# index.jsonl: a page's index, apart from the page (plan, the owner, 2026-11-01 and 2026-11-09)

**The idea.** Every folder gets an `index.jsonl`: one line per page inside it, with what a link or a preview card needs (title, icon, description). A parent then lists its children from that one small file instead of loading each child. The index is the quick version of a page; `page.js` / `page.jsonl` is the full version, loaded only when you open it. Plan page with the numbers: [/live/plan/index/](/live/plan/index/). Source prompts: cloud session `e3fd9043` (2026-11-01) and the voice call of 2026-11-09 ([its brief](/framework/ai/sessions/2026/11/09/spawned/mastermind-page-index/)).

## Why: what a page loads today (measured 2026-11-09)

Every page imports its parents' children two levels deep (`load_all_children`, `Page.class.js:717`) so tabs, the sidebar and preview cards know their titles. Importing a child's `page.js` also imports its class, and a few constructors fetch data at once.

| url | requests | page.js imported | scripts | bytes | quiet after |
|---|---:|---:|---:|---:|---:|
| `/framework/` | 1078 | 139 | 711 | 5.7 MB | 2.4 s |
| `/framework/ai/sessions/` | 1296 | 161 | 752 | 26.6 MB | 5–17 s |
| one session page | 1322 | ~160 | ~750 | 28.6 MB | 6.4 s |

Raw output and the script: [measure.mjs](/framework/ai/sessions/2026/11/09/spawned/mastermind-page-index/measure.mjs). The sessions grid itself reads one index per day already (`YYYY/MM/DD/index.json`, 62 KB today); its weight is the tree walk above plus three global files fetched more than once (`ai/index.json`, 4 MB, three or four times, by `ai/rail/DashState.js`).

## The MVP (built first)

1. **The line.** `{"page":{"name":"core","title":"Core","icon":"🧱","description":"…","kind":"js"}}`, the same fields as `page.nav()` (`Page.class.js:695`) plus `kind` (`js`, `jsonl`, `md`). Latest line per `name` wins; `{"page":{"name":"x","gone":true}}` removes one. That is the preview: a card draws from `nav()`, so a card needs nothing more.
2. **The writer.** The dev server's watcher that already writes `files.jsonl` (`Server/plugins/PageFiles.js`) also writes the parent's `index.jsonl` when a child's `page.js`, `page.jsonl` or `readme.md` changes. Node can't import a `page.js` (it needs the DOM), so a small class, `PageIndexLine` (`Server/PageIndexLine.mjs`), reads the fields from text: a `page.jsonl`'s own lines (exact), else literal `title:` / `icon:` / `description:` in `page.js` (52% of framework pages have a literal title), else the folder's `readme.md` heading ("Title — description"). A backfill (`node Server/PageIndex.mjs --apply`) writes every folder once.
3. **The aggregate (dev server).** `GET /api/index?dir=/framework/&depth=2` answers one JSON array: the folder's lines plus each child folder's lines, names prefixed (`core/View`). Built on request from the `index.jsonl` files, cached until one of them changes.
4. **Static hosts.** No server, no build: the reader falls back to fetching the folder's `index.jsonl` and then each child's (1 + N small files instead of N `page.js` and their classes). The files are committed, like `files.jsonl`.
5. **The reader.** `load_all_children` asks the index first. A declared child with an index line becomes a **stub**: a `Page` made from the line (`stub: true`, its own children stubbed from the depth-2 lines), with nothing imported. `child(name)` called by the Router (opening it) sees the stub and does the full load, replacing it. A child with no line loads as today. `Page.from_index = false` switches it all off (the before/after toggle).
6. **The check.** In the browser, a page that loads fully compares its `nav()` with its index line and writes one console warning per difference, so a wrong heuristic is seen, not trusted.

Then measure the same three urls again and post before/after on [/live/done/](/live/done/).

## Decisions, and the alternatives

- **One name, `index.jsonl`, everywhere.** The sessions store already writes an `index.jsonl` per day, month and year (`Server/AIIndexStream.mjs`, gitignored there); those lines (`{"session":…}`, `{"day":…}`) are a folder index too, so they share the name and are told apart by their verb. *Alternative:* a new name (`pages.jsonl`) avoids sharing; it wins if the two writers ever fight over one file.
- **files.jsonl stays for now.** It keeps its file and folder lines and its readers (`PageListing`). Merging them into `index.jsonl` and retiring `files.jsonl` is a later scripted move. *Alternative:* write the page lines into `files.jsonl` itself (no new file); it loses the owner's name and mixes file-level and page-level data.
- **Fields from text, not from running the page.** *Alternative:* the browser reports each page's real `nav()` to the dev server when it loads one (exact, no heuristics); worth adding once the check (6) shows how often the text reading is wrong.
- **The aggregate is a query, not a committed file.** *Alternative:* the watcher also writes a depth-2 snapshot (`index.json`) per folder, so a static host gets one request too; it costs a second write per change and a file per folder. Add it if static first loads are too slow.

## Later (not in the MVP)

- **Snapshot vs log.** A page with thousands of lines could keep a snapshot of its current state beside its log, so opening it replays one line, not all of them; the index line is the smallest snapshot (what a card needs). Same writer pattern, own file. Not built.
- **Where a page lives:** embedded in its parent's `page.jsonl`, a peer `<name>.jsonl`, or its own folder; the index line can say which (a `file` field).
- **What the index makes cheap:** search one level deep over titles and descriptions; autocomplete and mentions (`ext/Mention`) look names up in it; auto-tagging (words that match an indexed title or path become references while someone types).
- **Pages vs items:** the index lists pages; items (background data) only with a reason.
- **References:** a backlink (copy, source remembered) vs a live extension (new lines applied over the original).

Older notes: what a parent loads, measured 2026-11-06: [recursive-pages.md](recursive-pages.md) §6–7; directory deltas: [indexing-2026-10-08.md](indexing-2026-10-08.md); the day index of dated collections: `core/Item/Dated.js`.
