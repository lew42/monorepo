verdict: pass

1. [note] Step 1 confirmed: the tab bar (`Doc.css:38-50`) scrolls one line below 600px instead of wrapping. Before/after at 400px:
   ![before](shots/before-dictate-400.png) ![after](shots/after-dictate-400.png)
   Measured 122px → 85px (task.jsonl line 9). `View` (tabs already fit one line) shows no regression; 1200px desktop unchanged.
2. [note] Step 2 (title-as-switcher) parked under budget, To-do line in `ext/Doc/readme.md` with the owner's own phrasing — matches the fallback instruction exactly.
3. [note] The 2026-09-29 wrap-not-scroll comment at `Doc.css:50-62` now cross-references the new mobile rule, so it doesn't read as contradicted.
4. [note] `check_page` and `layout-check` at 400/1200/1920/3440 ran clean on both pages (logged in task.jsonl). Branch merged to michael/dev.
5. [note] Simplicity: reuses `ext/tabs`' own nowrap+scroll default rather than a new pattern — about 10 lines of CSS.
