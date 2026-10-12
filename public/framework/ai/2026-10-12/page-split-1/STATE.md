# page-split-1: STATE (steps 1-4 done)

All four steps landed as one commit each on `worktree/page-split-1`, then merged to michael/dev. Stopped there on purpose: columns, links and jsonl (plan steps 5-7) are a later task.

## Measure (`node public/framework/core/Page/doc/split-measure.mjs`)

| After | Page.class.js lines | code | comment | blank | methods | New file(s) |
|---|---|---|---|---|---|---|
| before | 2270 | 1027 | 926 | 317 | 150 | |
| 1 comments | 1617 | 1027 | 281 | 309 | 150 | [comment-move.mjs](/framework/core/Page/doc/comment-move.mjs) (772 lines to 13 docs, 0 missing) |
| 2 classes out | 1403 | 893 | 243 | 267 | 116 | `Children.js`, `Reader.js`, `Listing.js`, `Prefs.js` |
| 3 Related | 1373 | n/a | n/a | n/a | n/a | `Related.js` |
| 4 Previews | 1315 | 830 | 235 | 250 | 114 | `Previews.js` |

Net: 2270 to 1315 lines (-42%), code 1027 to 830, comment 926 to 235.

## Proof per step

`node Server/smoke.mjs` against the worktree server on 20 seed pages (core, Page overview, ai, sessions, imagine/paging, a markdown page, ux, ext, servex, web, layouts, imagine, notes, ...) plus one level of links, 60 pages: 0 JS errors, 0 "Page Load Error", after every step. The only failures are the worktree's own missing data files (`weight.jsonl`, `directory.json`, `page.jsonl`, ...), which fail the same way before the change. Step 3: `.page-related` still draws on `/framework/ux/Tree/` and `/layouts/browse/`. Step 4: `.page-preview` (131 to 182 cards per page), `.page-wall` (16) and `.page-previews-group` still render.

## Decisions (alternative in brackets)

- Class names kept (`PageLogReader`, `PageListing`, `PagePrefs`, `PageChildren`); files are `Reader.js` etc. like `Frame.js` holds `PageFrame`. `Page.Reader`, `Page.Listing`, `Page.Prefs` attach as before; `Page.Related`, `Page.Previews` are new parts, held by reference (`new this.constructor.Previews({ page: this })`).
- The 5 listing statics (`listing`, `fetch_listing`, `page_listing`, `UNLOGGED`, `loaded_listing`) STAY on Page: they read and write `Page.*` state (`Page.listings`, `Page.log_pages`). [moving them to Listing.js would need a back-import of Page, a cycle.] `PageListing` now owns `CHILD` and `key_of` as statics; Page reads them back.
- `dev` is duplicated as `PageLogReader.dev` (one line); `memory`/`warn` became statics of `PagePrefs`.
- Previews: `previews`, `walls`, `wall_rungs`, `preview`, `preview_card`, `preview_thumb`, `preview_link` all stay as Page methods (facades), because pages override `preview(nav)` and call `this.preview_card(...)`. `PagePreviews` calls back through them, so overrides still win. `nav`/`nav_for` stay on Page (blog `Post.js` and others call them).
- Related: only `related_aside()` remains on Page; `related_list`/`has_heading` had no callers and became `PageRelated.list`/`has_heading`.

## Open

Plan steps 5-7 (Columns, Links, Jsonl) in [split-plan.md](/framework/core/Page/doc/split-plan.md).
