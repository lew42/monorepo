verdict: fix
1. [fix] Requirement 2 and 3 are proved for one page only. proof.md has a crumb/href table for `tabs-page` (3 urls) but not for the other eight demo pages, and no `.live-page` / gear / no-Files-button row per url at 400 and 1200. The ask was "one table row per url".
2. [fix] Requirement 6 "before and after" is not met. There are no shots of `/live/design/` or `/live/lab/is-page/`, and no "before" shot of anything; proof.md says `/live/` "DIFFs" and explains it away instead of showing the before/after.
3. [fix] The retitles put a sentence into the title, which is also the h1 and the tab label (live readme line 88, "one title everywhere"). On columns-page at 400 the h1 reads "Columns (shows as plain t…" (shots/…columns/sheet.png, left frame; layout.json widest_text 444, 454 on place, 496 on place-fresh, all wider than the 400 viewport). Per-demo gaps belong in the page body or `page-features.md`, not in the title. Layout 3 / Words 2.
4. [fix] Requirement 4: columns, nav and place draw "Nothing on screen yet." (shots/…columns/sheet.png, band live-main ink 0.12-0.24) while their titles say they work "as plain tabs". The "log one line naming what LivePage lacks" is in session.jsonl and `page-features.md`, but the pages themselves show nothing a visitor can learn from. Minimum fix: a one-line `part-text` on each saying what it would demonstrate and what LivePage lacks.
5. [fix] `tabs-page/page.jsonl` keeps dead lines (`class` = Page.class.js, `navigation:"tabs"`, five `{"tab":…}` lines, a `hello-michael` content line tagged `tab:"overview"`) plus a new `{"file":"ai/","gone":true}`. The doc admits they are dead but the data is left to mislead the next editor; `jsonl.md` says "no Files button at all", while this line is how it was hidden, so that claim is not shown to be true by the code.
6. [fix] Indexing / staleness: `public/live/readme.md:42` still describes page-features as "which ones actually draw, and why"; there is no demos readme, so the nine `demos/*` pages and their state are indexed only by the table in `doc/page-features.md`. `proof.md` "Open" section says tabs become opt-in (`{"tab":true}`) once live-r8 lands, but nothing outside proof.md records that follow-up (no task or note on the session), so a fresh agent opening only this folder would miss it. `proof.md` lists "plus two more compliance/dev merges" without hashes. Add the follow-up as a task on the session.
7. [note] Page structure: every shot has the same four bands; at 3440 `tabs-page/alpha` is 71% empty (layout.json), a width cap in LivePage, not this diff.
8. [note] `place-fresh`, `place-page` and `place` are now three near-identical retitled pages (Requirement 4 "no second version"); consider merging them.

## Requirements
- 1 merge compliance/dev first — yes — proof.md names four merges, no `-X ours` mentioned
- 2 every demo draws as LivePage, one row per url at 400 and 1200 — no — only tabs-page tabulated (finding 1); shots show crumb and gear present on all nine
- 3 breadcrumb equals url — yes for tabs-page (proof.md table); not shown for the others
- 4 each demo still shows its point — no — columns, nav, place blank (finding 4); tabs yes
- 5 scrolling at 400 and 1200 — yes — proof.md scrollHeight 2380 vs 649 and 1963 vs 700; shots/tabs-page-alpha sheet.png shows 15+ lines cut off
- 6 nothing else moves, before/after — no — finding 2; smoke clean is claimed
- 7 docs in same commit — yes — page-features.md rewritten, jsonl.md one line
- class instances page — n/a, no class changed
Widths given: all four (400, 1200, 1920, 3440) for nine pages.
## Page structure
- page 1 — no — title is a sentence on columns/nav/place (shots/…columns/sheet.png)
- other questions — yes — head, breadcrumb, gear, main are consistent across pages
## Navigation
- techniques: tabs (one row), breadcrumb, gear, drawer
- tab_rows 1 at every width on every page — yes (layout.json)
- tab label = full long title on columns/nav/place — no — shots/…columns/1200.png, tab row
## Layout
- yes — single column, no overflow_x (layout.json, all false)
## Sizing
- no — widest_text 444-496 at 400 exceeds the viewport on three pages and the h1 is clipped (layout.json 400)
## Wrapping
- wraps: only the drawer buttons (`drawer-rail-ai`, `drawer-rail-menu`, 3.2 lines at 400) — not from this diff, note only
- title wrap/clip on long retitles — no — finding 3
## Spacing and padding
- yes — live-head share 0.095, main padding consistent across pages
## Colour and contrast
- yes — shots/…alpha/sheet.png, text dark on light grey; no change in diff
## Flow
- no — columns/nav/place end in "Nothing on screen yet." with no explanation on the page (finding 4)
## Words
- titles — no — explanation sentences in h1/tab labels (finding 3)
- "plain tabs", "LivePage has no column layout" — jargon for a visitor (Words 1)
- page-features.md — yes — plain sentences, names the gap per demo
