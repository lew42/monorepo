# page-split-3: STATE (step 7, jsonl, done)

The jsonl replay, file steps, tab state, word delta, nav visibility and placed-file drawing are out of `Page.class.js` into [`Jsonl.js`](/framework/core/Page/Jsonl.js) (`PageJsonl`, attached as `Page.Jsonl`). That finishes the split: [split-plan.md](/framework/core/Page/doc/split-plan.md) now says complete. Follows [page-split-2](/framework/ai/2026-10-12/page-split-2/STATE.md).

## Measure (`node public/framework/core/Page/doc/split-measure.mjs`)

| | Page.class.js lines | code | comment | blank | methods | New file |
|---|---|---|---|---|---|---|
| before | 1090 | 692 | 192 | 206 | 114 | |
| after | 849 | 528 | 156 | 165 | 114 | `Jsonl.js` (`PageJsonl`, 297 lines) |

Whole split: 2270 to 849 lines (-63%). Methods stay 114: every moved method keeps a one-line facade on Page, because pages call and override them (`file`, `tab`, `place`, `log_view`, `draw_*`, `listing`).

## Proof (baseline before, same pages after; `baseline.mjs`, `stream-proof.mjs` in this folder)

- **40 pages**, saved at 1200 (computed replay state of every jsonl page, a DOM outline hash, the text hash, a screenshot) and, for 8 of them, at 400/1200/1920/3440 (core/Page, columns demo, markdown open demo, `/framework/ai/`, sessions, a parts page, a page-tool page, `/imagine/paging/`). 299 jsonl pages' state compared in total.
- **Noise floor first:** two baseline runs (A1, A2) on the unchanged code differ on 5 live pages (`/framework/`, `/framework/ai/`, `/framework/ai/sessions/`, `/framework/ext/Refine/`, `/framework/ux/Inbox/`: clocks, counters, a routed-chain race). After (B) differs from A1 on exactly the same 5 pages and the same fields, and is **byte-identical on the other 35** (state, outline, text, every screenshot hash at every width). 0 new console or page errors on any page.
- **Streaming:** a script appended `page_set`-shaped lines to `core/Page/jsonl/live/page.jsonl` while a headless browser watched it. Old code: heading 6 ms, card 26 ms, text 32 ms. New code: 7, 25, 33 ms. Two probes (a card update by id, a title change) are not shown on that demo page on the old code either (same result both runs), so they say nothing about the move. Files: `stream-proof.json`, `stream-proof-old.json`, `stream-proof.png`. The real `page_set` MCP tool writes to the main tree, which still ran the old code until the merge; re-proved after the merge (below).
- **Smoke** (`node Server/smoke.mjs`, 6 seeds): the only FAIL lines are 404s for the worktree's missing gitignored data files (`directory.json`, `page-work.json`, `weight.jsonl`), as in page-split-2; 0 JS errors.

## Decisions (alternative in brackets)

- Same part shape as steps 2 to 6: `new this.constructor.Jsonl({ page: this })`, state on the page, calls back through `this.page.*`. [Moving the state into the part: rejected, `Page.listing`, `Reader` and `card.js` read `page.listed` / `placed` directly.]
- `Page.jsonl(url)` is a facade over `PageJsonl.load(host, url)`; `host` is the (sub)class it was called on, so `Class.jsonl()` still builds a `Class`, and the `log_pages` map still lives on `Page` itself.
- `PageJsonl.Page` is assigned after `Page` is defined: importing `Page` into `Jsonl.js` would be a cycle that breaks on deep reload.
- The listing statics (`listing`, `fetch_listing`, `page_listing`, `loaded_listing`, `UNLOGGED`) stay on Page, as in step 2: they own `Page.listings` / `Page.log_pages`, which outside code (`rail/groups.js`, `Page/Log.js`, `ext/Inbox`) reads by name.

## Open

Nothing for the split. `reshape()` / `rerender()` stay on Page (rendering, not jsonl).
