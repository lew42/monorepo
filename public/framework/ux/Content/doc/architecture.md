# Content architecture — small cards that remember, one write seam

Content is the set of `ux/` cards a page is built from: Question, Decision, Quotation, Disclosure, plus Object, Concepts and Spend. Each card extends [`ContentModule`](/framework/ux/Content/) (`ContentModule.js`), reads one `.jsonl` log and appends to it. A page places a card with one `{"place": {"module": …}}` line.

## Cards live in ux/, not ui/
**Decided:** Question, Decision and Quotation are `ux/Content/*` classes, one child page each.
**Why:** they hold state (a chosen option, an answer) between renders, and a template only graduates to `ux/` for that reason.
**Instead:** a new top-level `content/` tier (a new tier is surgery), or extending `ui/decision` (ui is markup only, it cannot hold a choice).
**Detail:** [doc/shapes.md](./doc/shapes.md)

## One write seam
**Decided:** every card writes through `ContentModule.write(line)`: a card host POSTs to Servex `/card/append`, anything else (or a failed POST) uses the dev socket's `FsFile.append`; with `edit()` off the click shows locally and writes nothing.
**Why:** Servex is the single writer for card folders, and one seam means one place to fix.
**Instead:** each card appending its own way, which is how the duplicates the census found grew.
**Detail:** [ContentModule.js](/framework/ux/Content/) `write()`

## Latest line wins
**Decided:** answers and choices are never rewritten; a new line for the same id replaces the old one on screen and the old one stays in the log.
**Why:** an append-only log is safe under concurrent writers and keeps history for free.
**Instead:** read-modify-write of the log, which loses lines when two writers meet.
**Detail:** [doc/shapes.md](./doc/shapes.md)

## One renderer per kind
**Decided:** a task-log decision and a placed decision are the same `Decision` card; a legacy `chose`/`over` record is normalized into options with its choice pre-selected.
**Why:** a second copy of the option markup is exactly the duplication the card census found.
**Instead:** each host (AITask, Chat, Collab) keeping its own option markup.
**Detail:** [Decision](/framework/ux/Content/Decision/)
⚠ Chat and Collab import `Decision` today; `ext/AITask/decisions.js` no longer exists.

## Read-only where another path owns the write
**Decided:** the task-board Decisions tab draws Decision read-only (no writes to `task.jsonl`).
**Why:** that tab's write path is Approve/Improve verdict lines; a second kind of line would give one decision two answers.
**Instead:** a writable tab appending `chose` lines to `task.jsonl`.
**Detail:** [Decision](/framework/ux/Content/Decision/)

## Object lives here, not beside Page
**Decided:** the "show a real object" card is `ux/Content/Object`, a sibling of Question and Decision.
**Why:** one structured-content vocabulary, and it must serve every class, not only Page.
**Instead:** a new `ux/Object` module, or code inside `core/Page`.
**Detail:** [Object](/framework/ux/Content/Object/)

## Catalog and plan are child pages
**Decided:** `catalog/` and `plan/` are their own pages, named in this page's `children:`.
**Why:** a page exists only once its parent names it, and separate pages let the census and the card builders work without sharing a file.
**Instead:** making the catalog the Content index itself.
**Detail:** [Card catalog](/framework/ux/Content/catalog/)
