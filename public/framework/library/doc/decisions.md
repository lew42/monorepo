# Library decisions

Plan: [ai/sessions/2026/10/12/session-87bec773/ui-library/plan.md](/framework/ai/sessions/2026/10/12/session-87bec773/ui-library/plan.md). Each decision names what it was chosen over.

1. **Lives at `framework/library/`**, beside `ui/` and `ux/`, because it spans them. *Alternative:* `ui/library/` (reads as ui only), `ext/Library/` (buried).
2. **One page, `?at=ui/card/media`**, with `history.pushState` and a `popstate` listener. *Alternative:* a routed child page per item (better urls, more code).
3. **`specimen`**: a page names its bare render function; `demo.page()` sets it for every variant in one line, and about fifteen `ui/*` pages name theirs. *Alternative:* render the page's whole `content()` (docs and chrome come along). Figma pages are the exception: their `content()` is the specimen.
4. **`optimalWidth`** per item: 400 mobile · 1000 default · 1920 desktop · 3440 mega. `ui` defaults to 400, `figma` to 1920.
5. **Preview layout: span by width** (400→1 column, 1000→2, 1920→3, 3440→4, dense flow). *Alternatives:* masonry `pack()`, grouping by size. The rails are one column, so only the zoom rule is built so far.
6. **One zoom rule:** a preview lays out at its `optimalWidth` and is scaled with CSS `zoom = card width ÷ optimalWidth`, never above 1; the height is capped. Never `transform`, which keeps the unscaled box.
7. **Padding contract:** an item is `needs_parent_padding` (own border or background) or `no_parent_padding` (full bleed). The Stage puts `data-needs-parent-padding` on the item; `PaddingContract.check()` adds `.padding-misuse` and one `console.error` that `Server/smoke.mjs` already fails on. *Not yet:* the page assembler refusing before render.

Decision 8 (tree and data) is in [tree.md](tree.md).

9. **Non-Page things get an `Entry`** (title, icon, specimen, empty children) so `Item` wraps layouts and templates unchanged. *Alternative:* a subclass of `Item` per kind (more classes, same result).
10. **A collection can supply the specimen** (`Collection.specimen(item)`): sections use each band's `section(tone)`, so no section page is edited. *Alternative:* a `specimen` line on every section page.
11. **Layouts render as the catalog screenshot at full width** with an "Open the demo →" link to `entry.demo`. *Alternative:* an `<iframe>` of the live demo: live, but 14 iframes on a wall is heavy. Related for layouts = siblings, not same score.
12. **Related is per collection:** ui keeps its BANDS rule; every other collection returns its siblings minus the item, at most 6. **The wall (decision 5, built)**: `?view=wall`, one grid, `span-N` classes (not `grid-column: span var()`, which CSS cannot do), reusing `Rail.card`; at ≤90em spans cap at 2, at ≤40em all 1. The `view` query is read through `Library.mode`, because `Page.view` is taken.

