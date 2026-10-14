verdict: fix
1. [fix] The diff appends about 90 `{"file":"session-…/page.jsonl","gone":true}` lines to the day indexes `ai/sessions/2026/10/09/cards`, `10/12`, `10/07`, `10/02` and others, but those session folders still exist on main (e.g. `ai/2026/10/12/session-fbe81ab2/` is present). This is the worktree's file watcher, which has no copy of those generated folders, so merging this would hide real sessions on main. The shot already shows it: shots/…ai-2026-10-12/1920.png, the day page reads "Nothing here yet." Drop every `page.jsonl`/`files.jsonl` hunk outside `ext/Query`, `core/Page` and this task's folder before merging.
2. [fix] Requirement 3 asks for before/after on the Sessions page itself, but no shot of `/framework/ai/sessions/?source=node` reached review. Only `build/measure/proof-*.png` exist, and the shots folder holds the Query page plus unrelated day pages. So the page that changed is unreviewed at either width (Requirements 3, page 1).
3. [note] The Query page's first view is just two cards (Overview, "Spec in, result out"), and the live demo sits one click down. At 1920 that leaves 88% of the screen empty (layout.json `empty 0.881`), so the demo could go on level 1 (page: show, don't tell).
4. [note] Remote mode is opt-in (`?source=node`) because buckets, nesting and provider are not at parity yet. The before numbers are not like-for-like (main site vs. a private server), and `server-query.md` says so honestly. The like-for-like gain is about 310 KB of transfer and half the JS heap, and time to first row did not change.
5. [note] Live updates work as the brief asks: `QueryServer.changed` pushes `query_row` for shown ids only, plus a throttled `query_stale`. One small mismatch: `QueryClient`'s header comment documents `row: (qid, item)`, but it calls `on_row(item)`.
6. [note] Coordination did not happen: STATE.md says Servex refused direct messages to @mastermind-data-grid and @mastermind-perf-system, so notes went to their inboxes instead. STATE.md still shows Build ⬜.

Widths given: 400 and 1920 for every page (10 pages).

## Requirements
- 1 "Past work … `page_read`, `Page.Reader`, the session buckets, `server-perf`" — yes — STATE.md ✅: node already holds `AISessionIndex.snaps`; plan.md exists
- 2 "`plan.md` and an architecture section in the Page docs: where instantiated, when it fully loads, when it unloads" — yes — `core/Page/doc/server.md` (new) answers all three; linked from `core/Page/readme.md` and `doc/architecture.md`
- 3 "Smallest slice: a socket `query` for Sessions (filter, sort, page of N, totals), the grid asking for it, the browser holding only the visible rows. Before and after …desktop and 400 px" — partly — the code is there (`rpc:query`, `remote_ask`, DataGridDrawer `load_more`) and results.jsonl has 400/1920 numbers, but it is opt-in and no review shot shows the page
- 4 "Add it to `code/performance/` docs" — yes — `code/performance/doc/server-query.md` + readme line
- 5 "Coordinate with @mastermind-data-grid and @mastermind-perf-system" — no — only inbox notes (STATE.md)
- 6 "Smoke clean; restart proven on a private port; commit each step; merge" — partly — `check.mjs` passes and the private-server measurements exist; the stray `gone` lines (finding 1) make it not merge-clean
- Design 2 "Full-load safety … measure load time and memory" — yes — no second copy is made; heap goes from 5 to 21 MB; one query over 8,729 sessions takes 1.4 ms
- Design 4 "push only changes to the rows a client is showing" — yes — `QueryServer.changed`
## Page structure
- page 1 — yes — shots/…ext-Query/1920.png: the title "Query" with an icon, and the description says what it is
- show, don't tell — no — the demo is one click down; level 1 shows two cards (finding 3)
- reachable — yes — `ext/page.js` children include Query; `ext/readme.md` links it
## Navigation
- techniques — tabs (Overview/API/Files), the sidebar, the bottom rail at 400
- tabs fit — yes — layout.json `tab_rows 1` at 400 and 1920
- active tab marked — yes — orange underline on OVERVIEW, both widths
## Layout
- the layout suits the content — yes — the standard doc layout, the same as sibling ext pages
- day pages — no — shots/…ai-2026-10-12/1920.png main column shows "Nothing here yet." (finding 1)
## Sizing
- space used well — no (note) — Query at 1920 `empty 0.881`, two 230 px cards in a 1400 px panel
- overflow — yes, none — `overflow_x false` on every page
## Wrapping
- no unwanted wraps — yes — only the known drawer-rail buttons (`lines 3.2`) on every page, which predate this diff
## Spacing and padding
- left edge — yes — Query h1 well 28 px at 400, 67 px at 1920; consistent with other doc pages
- card gaps even — yes — shots/…ext-Query/400.png, the two cards sit evenly in the top band
## Colour and contrast
- contrast — yes — dark text on white cards; the orange active outline is the standard one
## Flow
- reading order — yes — title → tabs → overview cards
## Words
- plain, defined terms — yes — readme: "ask node for just the rows a page shows"
- honest numbers — yes — server-query.md's "Fair reading" paragraph names the unequal baseline
- doc comment accuracy — no (note) — QueryClient's `row: (qid, item)` vs `on_row(item)`
