verdict: fix
1. [fix] Requirement 4 asks for a 1920 shot "showing both demos with their tab bars", but the shot shows only the first demo (shots/127-0-0-1-62645-framework-ext-tabs/1920.png, viewport ends below demo 1). The `block` demo (/tabs-demo-block/) is not shown, so its fix is unproven by the shots; only the session log's `data-demo-url` values vouch for it.
2. [note] Both demo panels render empty under the selected "what" tab (sheet.png, 1920 and 400, demo box below the tab bar): the md text "This panel is a real page..." is not visible. Blank may be the fixed 10em height clipping, or the child not mounting; the owner cannot tell from the shot that the tab content works.
3. [note] The demo tab links carry `data-demo-url` and no `href` (session.jsonl "After" line). That matches the demo box's design, but "link to real urls" is met only as data attributes, not as clickable hrefs.
4. [note] The change adds a second `mark` call (tabs.js `this.app?.mark?.()`) beside `router.mark_links()`. It is one line, but the comment names a demo case inside the real-page tabs code path, so a real page whose `app` has a `mark` would also run it.
5. [note] Smoke after: 3 FAIL remain in the three-page set (Panel text touching, two sessions ?tab=coverage links from Doc). The log says none are in ext/tabs and Panel failed before; I could not verify this from the shots.

Widths given: 400 and 1920 (one page, /framework/ext/tabs/). No ask for 1200 or 3440.

## Requirements
- 1 "the Tabs page loads with no error" — yes — 1920.png and 400.png render the full page and chrome; the log reports 19 FAIL before and none in ext/tabs after
- 2 "demo tabs link to real urls" — yes — demo shows `/tabs-demo/` in its url bar; log gives /tabs-demo/, /tabs-demo/why/, /tabs-demo-block/, /tabs-demo-block/notes/ (no href, see note 3)
- 3 "fix the smallest thing; do not change real pages' tabs" — yes — diff is 2 lines of demo urls plus 1 line in tabs.js; the page's own tab bar (Overview, API, Docs, MD, Files, Tasks, Inbox) is intact at 1920
- 4 "prove it: smoke before/after, shot at 1920 with both demos, href values" — no — shot shows only one demo (finding 1)
- 5 "ready line and decision with the alternative" — yes — session.jsonl has `decision` naming the declined Page.naming()/DemoApp default
- class-instance page — n/a — no class added or changed

## Page structure
- page 1 title says what it is — yes — shots/.../1920.png, top band: "Tabs" with icon
- page 2 one takeaway first — yes — the import/usage snippet then the live demo, 1920.png bands 1-2
- demo shows the thing it documents — yes — 1920.png: demo box with url bar /tabs-demo/ and "what / why" tabs
- demo content visible — no — the panel under the tabs is blank (finding 2)

## Navigation
- techniques used — page tabs (Overview/API/Docs/MD/Files/Tasks/Inbox), a left sidebar tree, a mobile bottom rail, a demo's own tabs
- page tabs: one clear selected tab — yes — 1920.png: OVERVIEW underlined at top
- demo tabs: selected tab marked — yes — "what" underlined in the demo bar at both widths
- bottom rail at 400 reachable — yes — 400.png bottom: three icons

## Layout
- layout reads as one column of a page — yes — layout.json layout "doc", 1920.png bands
- demo box fits its column — yes — 1920.png demo box inside the well, no overflow (overflow_x false at 400)

## Sizing
- nothing overflows the viewport — yes — layout.json 400 overflow_x false
- code block readable — yes — 1920.png dark block, text legible
- demo panel height sensible — no — 1920.png: the panel under the tabs is a large empty strip (finding 2)

## Wrapping
- tab bars on one row — yes — layout.json 400 tab_rows 1; page tab bar at 400 clips to "TASKS" but does not wrap
- demo tabs on one row — yes — 400.png and 1920.png: "what why"
- code lines clipped at 400 — note — 400.png: the demo snippet runs off the right edge inside its scroll box, the expected behaviour for code

## Spacing and padding
- band padding even — yes — 1920.png: heading, snippet, demo, text spaced evenly
- wasted space — no — layout.json 400 "empty" 0.501, 1920.png 0.64; the empty demo panel adds to it

## Colour and contrast
- text contrast — yes — 1920.png: dark code block with light text; body text on light ground
- selected tab distinguishable — yes — orange underline on OVERVIEW and "what"

## Flow
- reads top to bottom: snippet, demo, then explanation — yes — 1920.png
- the second demo follows the first — not shown (finding 1)

## Words
- demo labels plain (what / why, state / notes) — yes — diff page.js
- comment in tabs.js says why, in one line — yes — diff tabs.js, `// a demo.app() box: re-mark and un-href links built after its own pass`
