# The persistence survey (deliverable 0) — what we already have, and what a card uses

## Superseded 2026-09-24

The split described below, a card's stream in Servex's out-of-git logs and its state in the repo, is gone. A card is now one folder, `ai/2026/MM/DD/<slug>/page.jsonl`, dated by its creation day and written only by Servex. Only the Live card still keeps its old log. Every line of the new format is defined in [`Servex/cards/readme.md`](/Servex/cards/readme.md).

The owner's own words: *"lean into the systems we have... a nested thing is a directory... so
nobody has to decide how to break a JSONL into files."* This is the one-screen answer.

## What each existing system saves, where, and how it loads

| system | saves | where | loads |
| --- | --- | --- | --- |
| `ext/Saver` (`FileSaver`) | one JSON document | any path, over the dev socket's `rpc:write` | `fetch(path)` — dev only, warns and no-ops off localhost |
| `core/Page` `data:`/`page.json` | a page's title, icon, children, and anything else | `<dir>/page.json`, one file | fetched once, lazily, the first time a child is asked for — **a directory with only a `page.json` is already a real page, no `page.js` required** |
| `ai/2026-09-13` **Make** (fs-backed pages) | a tree of pages, each a directory | one `page.json` per directory, nested however deep the tree goes | the same `data:`/`children()`-as-function seam above; "never persist silently" — a save is a real click, not a timer |
| Item/List/Saver stack (`ai/2026-08-13/persistence/`) | one item's fields | `Saver` (`FileSaver` in dev) | on demand, per item |
| `Server/plugins/SocketServer/Append.js` | **append-only lines**, never a whole document | any `.jsonl` under `public/`, one `fs.appendFileSync` per call | `Tail`'s own streaming reader, line by line |
| Servex's `Log` (`Servex/Log.js`) | **append-only lines**, one writer, one process | `%LOCALAPPDATA%/lew42/servex/logs/<name>.jsonl` — outside the repo, outside git, growing forever | `GET /log/<name>` (backlog) + `EventSource /api/stream` (live) |

## The one distinction that decides everything

**A document you edit** (a title, a status, a set of fields, a set of child pages) wants to be
**overwritten in place** — `page.json` through `FileSaver`. **A record of what happened** (who
said what, when) wants to be **appended, never rewritten** — a `.jsonl`, one writer. Trying to
make one system do both is why `Append.js`'s own comment exists: two writers overwriting the
same whole file tear each other's lines.

A card is **both things at once**. What was said into it is a record — append-only. What the
card **is** (its fields, its sub-pages) is a document — overwrite-in-place. So a card wants two
homes, not one, and decision `card-storage-2` (2026-09-22 20:05) already said so:

- **The stream** — every `prompt`, `refined`, `reply`, `name`, `task`, `proposal`, `flag`
  belonging to a card — stays an append-only `.jsonl`, written only through Servex's `Log`
  (the single-writer guarantee `Log.js`'s own comment argues for), named `cards/<slug>` so it
  lands beside `prompts` in Servex's own log home. `board.jsonl` stays the index: one line per
  card, only the fields a rail row needs.
- **The state** — a card's own fields, its sub-cards, whatever it grows into — lives in a real
  directory, `ai/cards/<slug>/`, using the persistence every other page on this site already
  has: a `page.json` a `FileSaver` writes and `core/Page`'s existing `data:` rung reads, with
  **no code of ours**. A sub-card one level deeper is `ai/cards/<slug>/<sub>/page.json` — the
  exact same mechanism, recursing for free, which is the whole of "nobody decides how to split
  a JSONL or name its pieces": nobody does, because a nested thing is just another directory.
  The directory is created **only when a card actually gets a page** — not for all 300+ cards
  on the board today, which is why there is no directory storm.

**This survey confirms the decision rather than amending it further.** The one thing worth
adding: the mechanism for "a directory is a page" was landed on 2026-09-18
(`core/Page/doc/data.md`) and needs nothing new — `Page.load()`'s second rung already turns any
`<dir>/page.json` into a real, routed page. AI 2's own card pages are dynamic today (built by
`card_page(root, id)` in `page.js`, not filesystem pages), so this build wires the seam in
rather than fighting it: a card's *page* stays the dynamic view (it has to — the transcript is
live), but a card's *directory*, once one exists, is where a `page.json`-backed sub-page can
sit beside it, loaded the same way every other data page on the site already loads.

## More

- [`FileSaver`](/framework/ext/Saver/) · [`data:`/`page.json`](/framework/core/Page/doc/data.md) · [`Append.js`](/framework/Server/plugins/SocketServer/Append.js)
- [decision `card-storage`](/framework/ai/2026-09-22/mastermind-servex/) and its amendment `card-storage-2`
- [`doc/decisions.md`](./decisions.md) — this task's own decisions, with the alternative named
