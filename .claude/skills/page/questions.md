# Page — review questions

The page skill's rules, worded as questions a reviewer answers yes, no or n/a from the screenshots, `layout.json` or the page's source; the `review` skill asks them.

## Page structure

1. Does the page's title or first line say, in one sentence, what the page is and who it is for? [page: step 1, what is it]
2. Is the first thing under the title the page's core concepts, as linked icon tiles or a short list of linked items? [page: step 5a, concepts first]
3. Does the content run in priority order, top to bottom: what it is, then its state, then what needs doing, then what was done, then detail? [page: step 5, content in priority order]
4. Does what is still open come before what is finished? [page: step 5, open before done]
5. Does the parent page's `children:` name this page, so it is reachable by clicking? [page: creating a new page, 1]
6. Does every view a click reaches (a tab, a selected item, an open panel) have its own URL, so a reload or the back button lands in the same place? [page: creating a new page, 2; CLAUDE.md: route everything]
7. Does the page use a layout word or an approved type, rather than page-specific CSS for its shape? [page: which kind of page is this?]
8. Is every item, label and button self-evident: would the owner know what it is and does without reading more? [page: two tests, self-evident]
9. Does every element earn its space: nothing repeats what a neighbour already shows, and no small control sits alone on a wide empty row? [page: two tests, necessary]
10. Is each piece in its best form: a number or grid rather than a sentence, one filtered list rather than two lists, a structure shown rather than described? [page: step 6, best form]
11. Does every section have a title that makes the whole section clear? [page: step 6; CLAUDE.md: clarity is familiar structure]
12. Where a working version was restructured, is the old version still reachable to compare against? [page: never destroy a viable version]

## Navigation

First, identify: list every navigation technique on the page — tabs, a rail (side navigation column), a bottom rail, a sidebar, a sheet, a modal, full screen. Plain links need not be listed. Write the list, then answer only the questions for the techniques found; the rest are n/a.

13. Identify: which techniques does the page use? (Answer with the list, not yes or no.) [owner 2026-09-30]
14. Tabs: does the tab bar fit on 1 row at 1920, at most 2 rows at 1200, and at most 3 rows at 400? [owner 2026-09-30] [measured: layout.json tab_rows]
15. Tabs: does every tab have its own URL, so a reload lands on the same tab? [CLAUDE.md: route everything]
16. Tabs: is every tab useful, and are many tabs grouped (sub-tabs, a rail, one click down) rather than stacked into rows? [owner 2026-09-30]
17. Rail or sidebar: does it sit beside a centred main column at 3440, and fold away or stack cleanly at 400? [layout: defaults, navigation beside a centred main]
18. Rail or sidebar: does the page keep the rail and its work area still, so nothing the reader is looking at jumps when something arrives or is selected? [layout: the layout never jumps]
19. Bottom rail, or any fixed overlay: does the page leave room for it, so it never covers the last row of content? [layout: a permanent fixed overlay owes the shell the strip it stands on]
20. Sheet or modal: does it have its own URL, and does closing it return to exactly where the reader was? [CLAUDE.md: route everything] [owner 2026-09-30]
21. Full screen: is there a visible way back out, and does it have its own URL? [owner 2026-09-30]
22. Does a selected item open in its own column or view, never by expanding in place and pushing the rest down? [layout: the layout never jumps]

## Controls (the coming `controls` aspect; parked here until the skill tree is approved)

23. Does a widget keep its core row (the box, the mic, Send) on one line at every width, with extras (meter, picker, captions) on a line underneath, so it is recognisably the same widget everywhere? [audio-consolidate, 2026-09-30]
24. Is a debug or advanced toolbar off by default, and on only on the widget's own doc page? [audio-consolidate, 2026-09-30]
25. Does a mode button (hold vs toggle, on vs off) show its current mode on its own face, never in a separate label? [audio-consolidate, 2026-09-30]
