# Page.class.js split plan (steps 1-6 done 2026-10-12: 2270 → 1086 lines; see [STATE 1-4](/framework/ai/2026-10-12/page-split-1/STATE.md), [STATE 5-6](/framework/ai/2026-10-12/page-split-2/STATE.md))

**Answer to "is 2,000 lines a mistake?"** Half of it is comments. `Page.class.js` is 2,270 lines: **1,027 code, 926 comment (40%), 317 blank**, 150 methods. And ~270 lines are already four helper classes living in the same file. Re-measure any time: `node public/framework/core/Page/doc/split-measure.mjs --callers` (per method: code/comment lines and how many repo files mention the name; generic names like `set`/`get`/`add` over-count, so judge those by hand).

## Where the lines are (code / comment, by group)

| Group (markers in the file) | Lines | Code | Comment |
|---|---|---|---|
| page.jsonl replay, ext hooks, the 3 file steps, tab state, word delta, nav visibility, debug view (72-541) | 470 | 229 | 172 |
| Columns, the Finder shape (1526-1822) | 296 | 101 | 163 |
| Render + content list (1238-1473) | 236 | 97 | 114 |
| Statics: `of`, `file`, `load`, `from`, `props`, `slug` (1027-1237) | 210 | 95 | 83 |
| Words + `declare` (674-804) | 130 | 69 | 64 |
| Previews / walls / load_all_children (1823-1972) | 150 | 66 | 62 |
| Links: `child`, `open_link`, `swap_link`, md helpers (825-1026) | 200 | 71 | 27 |
| Roles (805-824) | 20 | 46 | 40 |
| Listing statics (542-649) | 108 | 53 | 39 |
| Related aside (1474-1525) | 52 | 23 | 22 |
| Prefs (1973-2011) | 39 | 5 | 29 |
| Inner classes already in file: `PageChildren`, `Page.Reader`, `Page.Listing`, `Page.Prefs` (2010-2270) | 260 | 141 | 74 |

## Target: a class tree in code

```js
// Page.class.js: identity, words, set(), render(), the tree API. Aim ~600 lines.
class Page extends Item {}
Page.Jsonl     = class PageJsonl      // replay, 3 file steps, ext hooks, tab state, delta (was PAGE.JSONL, STEP 1-3, TAB STATE)
Page.Columns   = class PageColumns    // columns(), render_column, column*, even_columns, reveal/scroll/resize
Page.Links     = class PageLinks      // open_link, swap_link, md_*, fs_folder, child_md
Page.Previews  = class PagePreviews   // previews, walls, wall_rungs, preview*, load_all_children
Page.Related   = class PageRelated    // related_list, has_heading, related_aside
Page.Reader    = ...   // already a class: move to Reader.js
Page.Listing   = ...   // already a class: move to Listing.js (+ the 5 listing statics)
Page.Prefs     = ...   // already a class: move to Prefs.js
PageChildren   = ...   // already a class: move to Children.js
// Stay in Page: static of/file/load/from/slug, words(), declare(), roles, add/move/child, render/render_content*, activate/deactivate
```
Held by reference, the way `prefs()` already does it: `columns(o){ return new this.constructor.Columns({ page: this }).apply(o); }`, so `page.columns(...)` keeps working for every caller. A subclass can swap a part (`this.constructor.Columns`), per the `code` skill's view pattern. One class per file, named for it, in `core/Page/parts/`-style siblings (`Columns.js` holds `class Columns`).

## Order, lowest risk first

1. ✅ **Comments first** (owner, 2026-10-12: a comment is a pointer, not an essay). 97 blocks of 4+ lines, 772 lines: 37 history to `doc/decisions.md`, 26 traps (keep one warning line, story to `doc/watch-out.md`), 12 banners (title only), 21 explanations (one line, rest to the topic doc), 1 obsolete. About -660 lines, zero behaviour risk, and every later move gets cheaper. Per-block table: [comment-plan.md](./comment-plan.md); script `doc/comment-blocks.mjs`.
2. ✅ **Already-classes out** (`Reader`, `Listing`, `Prefs`, `PageChildren`): ~260 lines, pure move, one attach line each stays. Risk: none (`Page.Reader` etc. keep the same names; only `loaded_listing` has outside callers, 2).
3. ✅ **Related** (52 lines): no outside callers, only `related_aside` is reached via render. Risk: low.
4. ✅ **Previews/walls** (150): callers `previews` (212 files mention it, mostly page.js declarations of the word, so keep the `previews()` facade), `wall_rungs` 1. Risk: low-medium.
5. ✅ **Columns** (296): 74 mentions of `columns(` in page.js files; keep `columns()`, `column()`, `column_host` as facades. Biggest comment share (163) so shrinks the file most. Risk: medium, needs the `/imagine/paging` and Finder pages checked at the four widths.
6. ✅ **Links** (200): `open_link`/`swap_link` called from card.js, markdown open pages. Risk: medium (click routing, reload on deep link).
7. ⬜ **Jsonl** (470): the core path of every page, replay order matters, `set()` calls it. Do last; risk: high; run `check_page` on a sample of pages and the page tool (`page-tool-2026-10-09.md`).

## Do not move

`set`/`get`/`add`/`child`/`render`/`activate`: hundreds of callers and they ARE the Page. Leave them.

Steps 1-6 executed 2026-10-12, one commit each; 7 (jsonl) is a later task. Step 5: `Columns.js` (`PageColumns`) holds the layout; `columns()`, `column()`, `column_host` stay as facades. Step 6: `Links.js` (`PageLinks`) holds `open_link`/`swap_link` and the md helpers; `child_md`, `md_folder`, `fs_folder`, `md_dir` stay on Page. Step 2 deviation: the 5 listing statics stay on Page (they use `Page.*` state). Step 4: `preview*` stay as facades because pages override them.
