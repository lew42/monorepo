verdict: pass
1. [note] Requirement 4 ("first visible use" in the AI2 Needs-you/Inbox rows and chat bubbles) has no screenshot evidence — only `/framework/ext/Mention/` and `/framework/ext/` were shot. The wiring is in the diff (`ai2/faces.js` row(), `ai2/needs.js` need_row(), `ext/Chat/md.js` md_into), but nobody has looked at a rendered AI2 or Chat page.
2. [note] The 3440 shot of `/framework/ext/Mention/` failed to load (`layout.json` errors: `ERR_NO_BUFFER_SPACE`) — sizing, wrapping and flow at 3440 are unmeasured for this page (the `/framework/ext/` page shot fine at 3440).
3. [note] Every shot is a ~1000px-tall viewport crop, not the full scroll. The page's own proof section, "Live, in a real sentence" (where `#Page`/`#Servex` resolve and `#Nope` stays plain text), sits below the fold in all four widths, so the one demo built specifically to show the feature working isn't in the evidence.
4. [note] `Mention.js` and `mention_html` both add the class `mention` to every rendered item, but no stylesheet anywhere defines `.mention` — harmless today because `item inline` alone carries the look (confirmed in the shots), but there's no hook yet if a mention ever needs to look different from a plain item.

## Requirements
- 1 "a registry of concepts... a JSON/JSONL index any page can load cheaply" — yes — `maps/refs.js` and `maps/people.js`, plain JS objects imported directly (not JSONL, but "no build step, no fetch" per the doc's own note; cheap either way)
- 2 "`@Page`/`#Page` syntax... renders as an icon item link; unknown stays plain text" — yes — shots/127-0-0-1-57799-framework-ext-Mention/1920.png shows the full icon-item wall built straight from the maps; the "#Nope stays plain" behaviour itself is described in `page.js`'s demo but that demo sits below the fold in every shot (finding 3)
- 3 "agents write `@Page`... add one line to the content skill via mastermind-servex-8" — n/a — not this task's file to touch; not checked
- 4 "first visible use: AI2 Needs-you/Inbox rows and chat bubbles" — not verified by shot — wired in source (`ai2/faces.js`, `ai2/needs.js`, `ext/Chat/md.js`) but no screenshot of either page exists (finding 1)
- 5 "keep it tiny: one parser pass after markdown, one registry file; no build step" — yes — one regex pass in `Mention.js`, no new dependency, no build step; two map files (one per namespace) rather than one, which the change-of-design note explicitly asked for

## Page structure
- 1 — yes — shots/…/1920.png: "Mention" title, one-line description under it
- 2 — yes — shots/…/1920.png: the concept wall (`#reference`/`@person` icon items) is the first real content under the intro line
- 3 — n/a — a reference/library page, not a status page; no state/done-work to order
- 4 — n/a — no open/done items on this page
- 5 — yes — diff: `ext/page.js` children string now includes `Mention`; shots/…/1920.png (ext page) shows the "Mention" tile in the wall
- 6 — yes — tabs (Overview/API/Docs/Files) are the framework's routed `Doc` tabs, unchanged by this diff
- 7 — yes — `layout.json` reports `"layout": "doc"` — the approved Docs three-region type, via the existing `Doc` component; no page-specific CSS was added (diff has no new stylesheet)
- 8 — yes — shots/…/1920.png: each row is an icon + a plain word (Page, View, Router…), self-evident without more text
- 9 — yes — no duplicated labels in the wall; every row differs
- 10 — yes — the map's content is shown as a grid of linked items, not a sentence per name
- 11 — yes — "Every #reference — ext/Mention/maps/refs.js" and "Every @person — ext/Mention/maps/people.js" each say exactly what follows
- 12 — n/a — new module, nothing restructured

## Navigation
- 13 — tabs (Overview/API/Docs/Files), a sidebar (page filter rail), a drawer (☰ menu at 1200/1920, AI + More rail at 400)
- 14 — yes — `layout.json` tab_rows: 1 at 400, 1 at 1200, 1 at 1920 (3440 unmeasured, finding 2)
- 15 — yes — the `Doc` tab bar is the same routed component every other doc page uses; unchanged by this diff
- 16 — yes — 4 tabs, none stacked into rows
- 17 — yes — shots/…/1920.png: sidebar sits beside a centred content column; shots/…/400.png: sidebar collapses to a top rail
- 18 — yes — same sidebar, same position across widths in the shots; nothing shifts when the page itself is static content
- 19 — n/a — no fixed bottom rail on this page
- 20 — n/a — no sheet or modal in the diff
- 21 — n/a — no full-screen mode in the diff
- 22 — n/a — no expand-in-place selection on this page; every mention is a link, not an inline expansion

## Layout
- 1 — n/a for Mention (3440 shot failed to load, finding 2); yes for `/framework/ext/` — shots/…/1920.png (ext) and 3440.png (ext): a full tile wall, not one narrow column
- 2 — yes — `layout.json` "layout": "doc" (Mention, a Docs three-region page) and "wall" (ext, a Tile wall page) — both approved types
- 3 — yes — shots/…/1920.png and 400.png: sidebar, tab bar and content column each read as the right width for their content at every measured width
- 4 — yes — the icon-item wall and the intro paragraph both sit inside the doc's own padded column (`doc-well`/`page` in `left_stack`), nothing bled unintentionally
- 5 — yes — shots/…/1920.png: text keeps clear gaps from the sidebar and the tab bar
- 6 — n/a — the concept wall is two columns of short items, not prose columns
- 7 — yes — `layout.json` bands: no `big_empty: true` anywhere for either page at any measured width
- 8 — yes — shots/…/1920.png: the two-column item wall (refs / people) has roughly even row counts per column
- 9 — n/a — no dead-space gutter issue visible in any shot
- 10 — yes — icon + one word per row, sized to a small list item, not oversized or undersized
- 11 — yes — shots/…/1920.png (ext): the tile wall ends on a balanced row at every width shown (400, 1200, 1920, 3440)
- 12 — yes — the item rows in the Mention wall are flush-stacked under one shared card-like rhythm (`grid gap auto`), consistent with the rest of the wall

## Sizing
- 13 — yes — every region in `layout.json` bands is content-height (`h` varies with content), nothing fixed
- 14 — n/a — no media previews on this page
- 15 — n/a — no bounded/scroll-limited box on this page (the whole doc panel scrolls with the page)
- 16 — yes — no unexpected scrollbar visible in any shot; the sidebar's own page list scrolls, which is the meant one
- 17 — n/a — no band sits above the first navigation; the tab bar is the first thing under the title
- 18 — yes — `layout.json` `overflow_x: false` at every measured width for both pages
- 19 — not measured — can't confirm `em`/`rem` usage from a screenshot; no new CSS was added in the diff to check (no stylesheet file changed)

## Wrapping
- 20 — yes — `layout.json` tab_rows is 1 at every measured width; the `wraps` list only flags section `h2` headings and the AI/More rail buttons, not a tab bar, title or nav row
- 21 — n/a — no row wraps only below 1920; the `h2` headings wrap at every width shown (400, 1200, 1920) rather than newly appearing under 1920
- 22 — n/a — the `h2` wraps are ordinary heading line-wraps, not a designed flex-wrap control row
- 23 — yes — shots/…/400.png: the two-column item grid becomes readable single items, not crushed slivers, at 400 (the wall itself keeps two columns of short rows rather than one column, which reads fine at that width — see shot)
- 24 — n/a — no preview description shared between a wall card and a rail item on this page; the `/framework/ext/` tile descriptions truncate uniformly with every other card on that page (unrelated to this diff)

## Spacing and padding
- 1 — yes — `layout.json` left_stack h1/p total: 28px at 400 for both pages, well under 3em (48px)
- 2 — yes — `layout.json` left_stack.layers: one layer only (`doc-well` or `page`) at every width — no nested padding stack
- 3 — yes — no new CSS was written (diff has no stylesheet file); the wall reuses `ui/item`'s existing `.item` styling, opted into padding the same way every other item list does
- 4 — yes — shots/…/1920.png: text keeps a clear gap from the viewport edge and the sidebar
- 5 — not measured — no new spacing values were introduced (no CSS diff); relies entirely on existing `item`/`grid gap auto` classes
- 6 — yes — the icon-item rows use `ui/item`'s own control sizing, unchanged by this diff
- 7 — n/a — no new box with its own ground was added
- 8 — n/a — no bleed container in this diff
- 9 — n/a — no new CSS rule was added at all (no stylesheet file in the diff)
- 10 — yes — the diff adds zero CSS; it reuses `item()`, `.inline`, `.boxed` and the doc/page layout wholesale

## Colour and contrast
- 11 — not measured — no contrast tool was run; shots show plain dark text on the theme's light ground, consistent with every other page
- 12 — not measured — accent-coloured text (the tab underline, the icon items) isn't new; no new colour was introduced
- 13 — yes — no literal colour appears in the diff; everything rides the existing `item`/theme CSS
- 14 — yes — shots/…/1920.png: the item rows read as rows on the page ground, same as the rest of the site
- 15 — not measured — no dark-mode shot was taken; nothing in the diff is colour-specific, so it should inherit dark mode same as any other `item()` usage, but that's untested here
- 16 — n/a — no new ground seam in this diff
- 17 — n/a — no new repeated anchor/mark introduced
- 18 — yes — no `var(--muted)` used as a colour; the diff has no CSS at all

## Flow
- 25 — yes — shots/…/1920.png: title, then the "nothing typed by hand" intro, then the two concept walls, then the live demo (below the fold) — states-what-it-is before detail
- 26 — yes — `layout.json` `overflow_x: false` at every measured width; nothing runs under the fixed drawer buttons in the shots
- 27 — yes — the two concept walls use `grid gap auto` (a UI rhythm), the intro paragraph uses prose flow — consistent with the page's own content
- 28 — n/a — no labelled cards with ambiguous proximity on this page
- 29 — n/a — not a live/streaming page
- 30 — yes — shots/…/1920.png and 400.png: no prose line runs past its column at any width shown

## Words
- 1 — yes — shots/…/1920.png: the maps are shown as the actual rendered item rows ("nothing is typed by hand below"), not described in prose
- 2 — yes — the grid itself shows the two-namespace split (refs vs people) by being two separate headed walls
- 3 — yes — every paragraph in the shots is well under 60 words (the longest, the intro, is ~55 words across 4 sentences)
- 4 — yes — the title, one intro paragraph and the wall make the page's point within the first shot
- 5 — yes — "Every #reference — ext/Mention/maps/refs.js" and "Every @person — ext/Mention/maps/people.js" name exactly what each section is
- 6 — n/a — no pictures with captions on this page
- 7 — yes — "mention", "namespace", "map" are each used once and consistently across `readme.md`, `doc/syntax.md` and `page.js`
- 8 — yes — every code identifier in the intro (`item()`) and every named file in the readme (`maps/refs.js`, `maps/people.js`, `doc/syntax.md`) links to it
- 9 — yes — `readme.md` and `doc/syntax.md` are both words-only files, but the live page (`page.js`) sits beside them as the widget, and the readme links to it first under "More"
- 10 — yes — the page leads with "write `#Page` anywhere… and it becomes a small icon" (the point) before any mechanism detail
- 11 — yes — the shots show full plain sentences throughout ("Write `#Page` anywhere the site renders markdown or a chat bubble, and it becomes a small icon + the word…"), no clipped fragments
