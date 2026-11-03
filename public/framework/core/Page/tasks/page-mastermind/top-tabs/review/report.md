verdict: fix
1. [fix] On a wide screen the stuck tab strip doesn't cover the full width. The strip sits beside the title (`flex: 1 1 24em`), so when the title scrolls away, the content scrolls through the empty spot to its left: the properties card shows at the top-left in shots/page-1920-scrolled.png (x 310–460, y 0–77), and so does the dark code block in shots/tabs-1920-scrolled.png. Ask 2, "on a wide screen, the tab row sticks", is only half met.
2. [note] The code block on core/Page now runs to the right screen edge at 390 (shots/page-390-top.png, band 6, x 16–390), and so does the page.jsonl block in shots/page-390-scrolled.png. In shots/before-page-390-top.png it stopped 28px short. The smaller `--gutter-x` probably dropped the right inset of the wide blocks. (layout 5, spacing)
3. [note] The page title and the content no longer share a left edge on a phone. "Task queue" starts at about x 8, but its cards start at x 16 (shots/queue-390-top.png, bands 3–4). On /framework/ai/ at 400, layout.json `left_stack.h1` is 12, while the content starts at 24. (layout, one left edge)
4. [note] At 1920 the AI queue page is too short to scroll, so shots/queue-1920-scrolled.png looks the same as -top. Nothing shows the AI tab strip sticking on a wide screen.
5. [note] On /framework/ai/ at 400, the filter chips (Ready to merge … Processes) wrap onto 3 rows (shots/…-framework-ai/400.png, band 2). They are a chip row, not a `.tab-bar` (layout.json `tab_rows` 0), so the brief's "every tab row" may not cover them. Still, they read as tabs and take 3 lines.

Widths given: review.mjs shot /framework/ai/ at 400, 1200, 1920 and 3440. The minion's own 390 and 1920 top and scrolled shots, plus the before-shots, were also in shots/.

## Requirements
- 1 "Every tab row: one row that scrolls sideways, never wraps" — yes — ext/tabs `.tab-bar` stays `nowrap` + `overflow: auto`, and the wrap overrides in Doc.css, Inbox.css and rail.css are removed. The strips are one row in shots/page-390-top.png, tabs-390-scrolled.png and page-1920-scrolled.png (cut off at WEIGHT and scrollable).
- 1 "Prefer one shared rule" — yes — the scrolling comes from the one `.tab-bar` rule, and the sticking from one `.tabs.stick` rule in tabs.css.
- 1 "Do not re-add the edge fade" — yes — the diff adds no gradient at the edges; the `.stick` background is a flat fill.
- 2 "On a phone the header scrolls away, the tab row sticks" — yes — shots/queue-390-scrolled.png (the deliverable), page-390-scrolled.png and tabs-390-scrolled.png: the header is gone and the tabs sit at y 0.
- 2 "On a wide screen the tab row sticks" — partly — it sticks, but content shows to its left (finding 1). The AI strip at 1920 is not shown (finding 4).
- 2 "CSS-only first" — yes — `:has()` in styles.css plus `display: contents`, with no scroll listeners.
- 3 "On a phone, halve the side padding" — yes — `--gutter-x` floor 2em→1em at its source (Page.css, with Doc.css matching). The left edge moved from 28px to 16px at 390 (before-page-390-top vs page-390-top).
- 3 "Weigh slim vs every page, pick one, log why" — yes — every page, at the source. The reason is in Page.css and core/Page/readme.md.
- Shots "390 and 1920, top and scrolled, three pages, plus before-shots" — yes — all of them are in shots/, plus core and fw.
- Done "readmes current" — yes — ext/tabs, core/Sidebar and core/Page readmes, plus doc/css.md.
- Class with live instances — n/a

## Page structure
- page 1 (the title says what it is) — yes — shots/queue-390-top.png "Task queue", page-390-top.png "Page"
- page 2 (one main job per page) — yes — unchanged by this diff
- page 3 (the most important thing first) — yes — the tabs sit straight under the title, then the content

## Navigation
- page 13 — tabs, a sidebar (a top bar on a phone), a bottom rail
- page 14 (tabs on one row) — yes — the strips are one row in every shot; layout.json tab_rows 0 (the chips are not tabs, finding 5)
- tabs stay put and are reachable — yes — they stick at 390 (queue-390-scrolled.png). At 1920 they stick but the band leaks (finding 1)
- the selected tab is marked — yes — an orange top line plus a lighter fill on QUEUE and OVERVIEW
- overflow has a way to it — yes — the strip side-scrolls; the cut-off last tab (TASKS at 390, WEIGHT at 1920) is the only cue, by the owner's no-fade rule
- the sidebar or top bar works — yes — it scrolls away only on pages with tabs; other pages keep the sticky bar (fw-390, core-390)

## Layout
- one left edge — no — the title is at 8–12px and the content at 16–24px on a phone (finding 3)
- uses the width — yes — 390 cards now span x 16–374
- wide blocks stay inside the frame — no — the code block touches the right edge at 390 (finding 2)

## Sizing
- the tab strip's height is right — yes — about 30px stuck at 390 (queue-390-scrolled.png, band 1)
- the header's share at 390 — yes — the header and title take about 16% at the top and 0% once scrolled
- layout.json bands — /framework/ai/ 400: page-title share 0.04, ad-dash 0.44, fine

## Wrapping
- the tabs never wrap — yes — tab_rows 0 at every width in layout.json, and one row in every shot
- other wraps — note — the chips wrap onto 3 rows at 400 (finding 5). layout.json lists `drawer-rail-ai`/`drawer-rail-menu` at 3.2 lines, but those are bottom-rail buttons with icon-over-label and look fine

## Spacing and padding
- the side inset is halved on a phone — yes — 28→16px (before-page-390-top vs page-390-top)
- inset and card padding together — yes — about 32px to the text at 390 instead of about 44px
- nothing touches the edge — no — the code block at 390 (finding 2)
- unchanged at 1920 — yes — `4%` takes over from about 700px up (queue-1920-scrolled.png, gutter unchanged)

## Colour and contrast
- the stuck strip is opaque — yes — the text scrolls under it unseen at 390 (page-390-scrolled.png), but see finding 1 at 1920
- the selected tab has enough contrast — yes — dark label on a light fill, with an orange mark

## Flow
- content flows under the stuck strip without a jump — yes — 390 scrolled shots show no gap or overlap below the strip
- the strip in the header's place — yes — y 0 once the header has gone

## Words
- the code comments say what and why — yes — Doc.css, tabs.css and styles.css comments give the owner's date and the reason
- the readme lines are plain sentences — yes — ext/tabs and core/Sidebar lines, one each
- the readmes' word "topic" — note — "makes the topic the scroller" (core/Sidebar readme) assumes the reader knows `.page.topic`. A link would help
