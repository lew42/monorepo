# Navigation — review questions

Moved from `.claude/skills/page/questions.md`'s "Navigation" section, whole; the review skill asks them.

## Navigation

First, identify: list every navigation technique on the page — tabs, a rail (side navigation column), a bottom rail, a sidebar, a sheet, a modal, full screen. Plain links need not be listed. Write the list, then answer only the questions for the techniques found; the rest are n/a.

1. Identify: which techniques does the page use? (Answer with the list, not yes or no.) [owner 2026-09-30]
2. Tabs: does the tab bar fit on 1 row at 1920, at most 2 rows at 1200, and at most 3 rows at 400? [owner 2026-09-30] [measured: layout.json tab_rows]
3. Tabs: does every tab have its own URL, so a reload lands on the same tab? [CLAUDE.md: route everything]
4. Tabs: is every tab useful, and are many tabs grouped (sub-tabs, a rail, one click down) rather than stacked into rows? [owner 2026-09-30]
5. Rail or sidebar: does it sit beside a centred main column at 3440, and fold away or stack cleanly at 400? [design/layout: defaults, navigation beside a centred main]
6. Rail or sidebar: does the page keep the rail and its work area still, so nothing the reader is looking at jumps when something arrives or is selected? [design/layout: the layout never jumps]
7. Bottom rail, or any fixed overlay: does the page leave room for it, so it never covers the last row of content? [design/layout: a permanent fixed overlay owes the shell the strip it stands on]
8. Sheet or modal: does it have its own URL, and does closing it return to exactly where the reader was? [CLAUDE.md: route everything] [owner 2026-09-30]
9. Full screen: is there a visible way back out, and does it have its own URL? [owner 2026-09-30]
10. Does a selected item open in its own column or view, never by expanding in place and pushing the rest down? [design/layout: the layout never jumps]
