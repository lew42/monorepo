# index.jsonl: a page's index, apart from the page (plan, the owner, 2026-11-01 and 2026-11-09)

**The idea.** Every folder's index (today its `files.jsonl`) carries one line per page inside it, with what a link or a preview card needs (title, icon, description). A parent then lists its children from that one small file instead of loading each child. The index is the quick version of a page; `page.js` / `page.jsonl` is the full version, loaded only when you open it. Plan page with the numbers: [/live/plan/index/](/live/plan/index/). Source prompts: cloud session `e3fd9043` (2026-11-01) and the voice call of 2026-11-09 ([its brief](/framework/ai/sessions/2026/11/09/spawned/mastermind-page-index/)).

## Why: what a page loads today (measured 2026-11-09)

Every page imports its parents' children two levels deep (`load_all_children`, `Page.class.js:717`) so tabs, the sidebar and preview cards know their titles. Importing a child's `page.js` also imports its class, and a few constructors fetch data at once.

| url | requests | page.js imported | scripts | bytes | quiet after |
|---|---:|---:|---:|---:|---:|
| `/framework/` | 1078 | 139 | 711 | 5.7 MB | 2.4 s |
| `/framework/ai/sessions/` | 1296 | 161 | 752 | 26.6 MB | 5–17 s |
| one session page | 1322 | ~160 | ~750 | 28.6 MB | 6.4 s |

Raw output and the script: [measure.mjs](/framework/ai/sessions/2026/11/09/spawned/mastermind-page-index/measure.mjs). The sessions grid itself reads one index per day already (`YYYY/MM/DD/index.json`, 62 KB today); its weight is the tree walk above plus three global files fetched more than once (`ai/index.json`, 4 MB, three or four times, by `ai/rail/DashState.js`).

## The MVP (built first; revised after the shape review of 2026-11-09)

A fresh reviewer checked this plan against the code before anything was built ([its findings](/framework/ai/sessions/2026/11/09/spawned/mastermind-page-index/), log of 18:12). Three changes came out of it: the fields ride on the `files.jsonl` lines a parent already fetches, the existing "declared, not loaded" placeholder carries them, and the side rail's repeat fetch was fixed first.

0. **Done first:** `ai/rail/DashState.js` no longer refetches `ai/index.json` (4 MB) for each old line of its opening replay: 6 fetches per sessions-page open became 2 (commit `5d15d9652`).
1. **The line.** The child's existing `files.jsonl` line gains the fields `page.nav()` gives (`Page.class.js:695`): `{"file":"core/page.js","nav":{"title":"Core","icon":"🧱","description":"…"}}`. Latest line per name wins, as today, so no new file and no new request: `child()` already fetches the folder's listing (`Page.listing`, `Listing.js`). A jsonl page keeps its list in its own `page.jsonl`, so its children's lines go there, as today. That is the preview: a card draws from `nav()`.
2. **The writer.** The watcher that writes `files.jsonl` (`Server/plugins/PageFiles.js`) writes a new line when a child's `page.js`, `page.jsonl` or `readme.md` changes **and its fields differ** (session logs change many times a minute). Node can't import a `page.js` (it needs the DOM), so one class, `PageNav` (`Server/PageNav.mjs`), reads the fields from text: a `page.jsonl`'s own lines (exact), else literal `title:` / `icon:` / `description:` in `page.js` (52% of framework pages have a literal title), else the folder's `readme.md` heading ("Title — description"). A backfill writes every folder once (`node Server/PageNav.mjs`, dry run; `--apply` writes).
3. **The aggregate (dev server).** `GET /api/index?dir=/framework/&depth=2` answers one JSON object: each child's name, kind and nav, and its own children's, built on request from the `files.jsonl` files and cached until one changes.
4. **Static hosts.** No server, no build: the reader fetches the folder's `files.jsonl` and each child's (1 + N small files instead of N `page.js` and their classes), committed as they are today.
5. **The reader.** `load_all_children` reads the nav lines first. A declared child that is still a placeholder (`{id, name, stub: true}`, `Children.js:25`) gets its nav fields put on that placeholder, and nothing is imported. `nav_for`, preview cards, tabs and the sidebar read a placeholder's fields where they read a page's. `add()` already replaces the placeholder with the real page when it is opened (`Page.class.js:356`). A child with no nav line loads as today. `Page.from_index = false` switches it off (the before/after toggle).
6. **The check.** In the browser, a page that loads fully compares its `nav()` with its line and writes one console warning per difference, so a wrong reading is seen, not trusted.

Then measure the same three urls again and post before/after on [/live/done/](/live/done/).

## Status (2026-11-10)

Built and on by default: the server half (`Server/PageNav.mjs`, `Server/plugins/PageIndex.js`) and the browser half (`core/Page/Index.js`, `Page.from_index`, `?index=0` turns it off). Measured on the worktree server in one headless run per page, 1200 px shots of each look the same:

| Page | index on | `?index=0` |
|---|---|---|
| /framework/ | 824 requests, 4.7 MB, 27 page.js | 1,076 requests, 5.7 MB, 139 page.js |
| a session page (cloud-voice-app-20261106) | 1,065 requests, 12.7 MB, 47 page.js | 1,300 requests, 13.7 MB, 161 page.js |

The first measurement showed no difference because `load_all_children` crashed in both modes (`false?.get`, fixed: `navs` is `null` when unused). It saves the last level of the tree only, so the remaining requests are scripts, data and the levels above it.

## Decisions, and the alternatives

- **No file named `index.jsonl`.** The owner's name was taken: `ai/index.jsonl` (read as "the last line is the whole picture", `TaskStateLog.js`), the sessions store's day, month and year streams (`Server/AIIndexStream.mjs`, gitignored, so never on a static host) and `ext/Figma/index.jsonl` each assume their own line shape. The index is the `files.jsonl` the folder already has. *Alternative:* a new `pages.jsonl` per folder; it wins if the nav lines ever need their own writer or reader, at the cost of one more request per folder.
- **Fields from text, not from running the page.** *Alternative:* the browser reports each page's real `nav()` to the dev server when it loads one (exact, no heuristics); worth adding once the check (6) shows how often the text reading is wrong.
- **The aggregate is a query, not a committed file.** *Alternative:* the watcher also writes a depth-2 snapshot per folder, so a static host gets one request too; it costs a second write per change. Add it if static first loads are too slow.
- **The placeholder, not a stub Page.** A whole `Page` marked `stub` would be hidden by the shim (`Children.js:13,53`: a stub reads as `null`) and skipped by `move()`.

## Later (not in the MVP)

- **Snapshot vs log.** A page with thousands of lines could keep a snapshot of its current state beside its log, so opening it replays one line, not all of them; the index line is the smallest snapshot (what a card needs). Same writer pattern, own file. Not built.
- **Where a page lives:** embedded in its parent's `page.jsonl`, a peer `<name>.jsonl`, or its own folder; the index line can say which (a `file` field).
- **What the index makes cheap:** search one level deep over titles and descriptions; autocomplete and mentions (`ext/Mention`) look names up in it; auto-tagging (words that match an indexed title or path become references while someone types).
- **Pages vs items:** the index lists pages; items (background data) only with a reason.
- **References:** a backlink (copy, source remembered) vs a live extension (new lines applied over the original).

Older notes: what a parent loads, measured 2026-11-06: [recursive-pages.md](recursive-pages.md) §6–7; directory deltas: [indexing-2026-10-08.md](indexing-2026-10-08.md); the day index of dated collections: `core/Item/Dated.js`.
