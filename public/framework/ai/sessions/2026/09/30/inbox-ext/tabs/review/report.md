verdict: fix
1. [fix] Tabs are not derived from the page's own index (requirement 1): `detect_tabs()` reads `root.children` plus a hand-kept `BUILT_IN_CANDIDATES = ["log","system"]` and never reads `files.jsonl`. A new `ai/local/` folder that only the watcher indexes (a `files.jsonl` line, no edit to `children:`) never becomes a tab, so "adding a tab is one file" is true only for folders already named in `page.js` (Tests worked because `tests` is in `children:`, page.js line 36).
2. [fix] Every load of /framework/ai/ checks the settings of all ~40 children, date folders included: one `page_settings()` call each, which means several file checks and fetches per child. Reading `files.jsonl` once, and only the folders it lists, removes both problems. Diff overview.js `detect_tabs`.
3. [note] The tabs after Inbox are drawn only after the settings fetches come back (page.js `detect_tabs(this).then`). At first paint the strip shows Inbox alone, then Log, System and Tests appear.
4. [note] "How a page becomes a tab" is now the FIRST section of the System tab, above "Who does the work". It is detail for builders, so it belongs lower on the page (page: most important first). See shots/127-0-0-1-51490-framework-ai-system/1920.png, band 2.
5. [note] Built-in labels come from `cap(name)`, not the `title` already written in `log/page.jsonl` and `system/page.jsonl`. The title written in the file has no effect.
6. [note] The diff also carries changes to ai2/ and ux/Card/ from other tasks on this branch. This review covers the tabs work only.

Widths: all four (400, 1200, 1920, 3440), because the change sits in the page's top tab strip, which reflows with width. Shots used: `shots/127-0-0-1-51490-framework-ai*` (newest); `before/` and `after/` were compared for the strip.

## Requirements
- 1 "Remove the hand-written TABS array … tabs come from children that declare tab:true … ascending weight, then name, Inbox first" — partly. The array was renamed to VIRTUAL_TABS (it is still used for routing) and a second hand list, BUILT_IN_CANDIDATES, was added. The order is right: shots/…-ai/1920.png shows Inbox · Log · System · Tests. The index (`files.jsonl`) is never read (finding 1).
- 2 "Inbox, Log and System keep working exactly as today, including every URL … and the v1 Log switch" — yes. All three urls render in the shots; the route() check `VIRTUAL_TABS.includes(name) && !(v1() && name === "log")` is unchanged.
- 3 "Adding a tab is one file … tests appears … at 1920 … one row at 400" — yes, with a caveat. `ai/tests/settings.jsonl` (correctly settings.jsonl, because tests has a page.js) makes Tests appear in shots/…-ai/1920.png, and layout.json shows tab_rows 1 at 400. It only works because `tests` is already in `children:` (finding 1).
- 4 "Document it on the System tab … one short heading plus 2–3 sentences … readme one line" — yes. The section is on shots/…-ai-system/1920.png; readme.md gained one line.
- 5 "Shots at 400, 1200, 1920, 3440 … before and after" — yes. shots/before/ and shots/after/ each hold three pages × four widths.
## Page structure
- page 1 (title says what it is) — yes — shots/…-ai-system/1920.png: the AI title and the tab strip
- page (most important first) — no, a note — the tab mechanics come before the system's concepts (finding 4)
- page (route everything) — yes — every tab is a url (/log/, /system/, /tests/)
## Navigation
- navigation 1 (techniques used) — tabs and a sidebar
- tabs: the active tab is marked — yes — shots/…-ai-system/1920.png: SYSTEM is underlined
- tabs: one row — yes — layout.json tab_rows 1 at all four widths, on all three pages
- tabs: stable, no late shift — no, a note — the strip fills in after the fetches (finding 3)
## Layout
- layout: nothing overflows sideways — yes — overflow_x false on all three pages at all four widths
- layout: the strip sits under the h1 at every width — yes — shots/…-ai/sheet.png
## Sizing
- sizing: text measure — yes — widest_text on System is 592 at 1200 (the prose column is capped)
- sizing: empty share — n/a for this change (the Log empty share of 0.75 at 1920 was already in before/)
## Wrapping
- wrapping: the tab strip wraps — no — tab_rows 1 at 400
- wrapping: the new heading — note — "How a page becomes a tab" takes 2 lines at 400 (layout.json wraps), which is fine. The JSON code span breaks mid-token at 400 (shots/…-ai-system/400.png, band 3).
## Spacing and padding
- spacing: tabs_gap grows with width — yes — 11 / 13 / 27 / 47 px
- spacing: the new section uses the page rhythm — yes — it uses the same `heading()` and `md()` as the sections below it
## Colour and contrast
- colour: no new colours — yes — the diff adds no colour; the tabs reuse `.tab`
## Flow
- flow: the reader lands on Inbox and reaches the others in one click — yes — `tab-default` is on Inbox
## Words
- content: heading names the topic and gist in one line — yes — "How a page becomes a tab" / "Declared, not crawled — …"
- content: 2–3 sentences — yes — three sentences; the first is long, at about 45 words with three code spans
- content: plain words — note — "settings.jsonl, when the folder has a page.js" is a needed caveat but slows the read; it could move to the readme
