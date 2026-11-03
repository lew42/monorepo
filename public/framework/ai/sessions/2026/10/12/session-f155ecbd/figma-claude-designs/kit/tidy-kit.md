# Tidy: kit group (2026-10-13)

Each page now has a 1920 wrapper turned into a component (`Page · <name>`): title, one-line gist, Notes box, then the content. Reactions (prototype links) match before and after on every page. Rule: [page-layout.md](/framework/ext/Figma/doc/page-layout.md).

| Page (id) | Page component | What moved / fixed | Reactions before / after |
|---|---|---|---|
| DS · 4 Layouts (153:1062) | 222:27025 | four 1920 mock-ups stacked under the header | 0 / 0 |
| DS · 4.1 Foundational layouts (164:1062) | 222:27223 | 1440 sheet → FILL; Settings demo set → Components (222:27221); 28 `was ·` and stray frames → Backups (222:27222) | 8 / 8 |
| DS · 5 Diagrams & charts (164:1067) | 222:27232 | sheet → FILL; Piece components → Components (222:27230); 1 backup → Backups | 0 / 0 |
| DS · 6 Screens (169:1063) | 222:27837 | overview sheet + badge in the wrapper; 8 screens kept top-level in Prototype screens (222:27835); 6 backups → Backups | 32 / 32 |
| Layouts · Two columns (213:24357) | 222:27354 (1920) + 222:27355 (wide rows, 8150) | header, notes and a row index in the 1920 page; the 15 rows (7910 wide) in their own wide wrapper beside | 0 / 0 |
| Kit · Layouts (177:1062) | 222:27338 | 12 masters → Components (222:27337); kit sheet → FILL | 0 / 0 |
| UI Kit (126:15264) | 222:29078 | 6 masters → Components (222:29070); wrapper shows instances of every variant; 5 phones → Prototype screens (222:29071); badge in header | 5 / 5 |
| Kit · Controls (145:13667) | 222:28279 (+ 222:28278 sweep, 2390 wide) | 21 masters → Components; 16 in-sheet masters replaced by instances; phones in a row under the sheet | 0 / 0 |
| Kit · Containers (143:1235) | 222:28541 | 16 in-sheet masters → Components, replaced by instances; column and phone screens stacked | 0 / 0 |
| Kit · Workflows (144:1140) | 222:29227 | Components frame moved beside; wrapper shows instances; 13 screens + headers + badges kept (positions preserved) in Prototype screens (222:29220) | 17 / 17 |

## Known leftovers
- Kit · Controls: the Avatar and Pagination rows still run a little past the right edge (their inner rows are wider than the sheet). Kit · Containers: the DataGrid area is crowded and a few specimens overlap. Both look as they did before the move; a layout pass on those two sheets would fix them.
- Specimen instances of Card, Panel and Dialog show empty slots (the masters hold no slot content).
- Other pages were left alone, and the Index page is the mastermind's.

## Update 2026-10-13: masters are top level (rule change)
Per the new rule in [page-layout.md](/framework/ext/Figma/doc/page-layout.md), the masters were taken out of every `Components` frame and now sit directly on the page canvas in a grid right of the page: DS 4.1 (1), DS 5 (5), Kit · Layouts (12), UI Kit (6), Kit · Controls (21), Kit · Containers (16), Kit · Workflows (8). Moving kept node ids, so instances still point at them. Emptied `Components` frames were removed (no content lost); two still exist because they hold other things: DS 5 (222:27230, the "Piece components (diagram)" frame) and Workflows (144:1141, eight `Hdr·` label instances). Not re-screenshotted.
