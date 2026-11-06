# /live/ round 6: one header, tabs, settings (2026-11-06)

The asks, relayed by voice-app from the owner (the words are in the voice-app session record, [cloud-voice-app-20261106](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/)). Each is checked off in `session.jsonl` with its proof.

1. Name views `render`, not `draw_*`.
2. A sticky header under 100 px on every LivePage at any depth: a tiny breadcrumb, a much smaller h1, one underlined tab row that shows when it overflows.
3. Tabs are the one nav system; no title repeated under each tab.
4. A settings icon at the top right opens `<path>/settings/`: where the data comes from (an embed in the parent's page.jsonl, its own page.jsonl, or page.js), the files, whether it is drawn, and a file list stacked vertically.
5. The preview card, the h1 and the path show one title (the child's own).
6. Each tab is a sub-page; Alpha and Beta scroll; tab content adds no left padding (the tabs-page part is page-design's task tabs-r3).
7. Titles and texts are markdown with @mentions, safe HTML.
8. The breadcrumb mirrors `location.pathname` at all times, a tab switch included (it is the phone's address bar).
9. Settings > Files: folders and files top to bottom; a folder shows its contents, a file opens highlighted on its own page, phone-friendly.
10. The readme has a "Several agents may drive this page" section.
11. Shots at phone width; a report under 80 words.
