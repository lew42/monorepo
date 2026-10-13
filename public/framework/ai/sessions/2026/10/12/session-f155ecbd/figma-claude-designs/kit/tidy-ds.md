# Tidy: group ds (2026-10-13)

Method: each page's existing auto-layout frame (1440, FILL children) moved into a new 1920 auto-layout wrapper, set to FILL/HUG (ids unchanged, so Overview links still work), then the wrapper became a component `Page · <page name>`. Pilot screenshot of Buttons checked; others verified by size only. No page had a hand-placed layer to fix. The headers already sit at the top, but there is no separate Notes box and the specimen rows still hug at their old width (left-aligned). Nothing was deleted; no `was ·` backups on these pages.

| Page (id) | Page component | Moved / fixed | Reactions before → after |
|---|---|---|---|
| Claude · Overview (144:1062) | 222:27012 | 1440 frame wrapped, 1920×4038 | 0 → 0 |
| 1 Elements (159:17691) | 222:27014 | wrapped, 1920×5773 | 0 → 0 |
| 1.1 Icons (163:20989) | 222:27016 | wrapped, 1920×6770 | 0 → 0 |
| 1.2 Dark grounds (163:18033) | 222:27018 | wrapped, 1920×5943 | 0 → 0 |
| 2.1 Buttons (158:1263) | 222:27010 | wrapped, 1920×2200 (screenshotted) | 0 → 0 |
| 2.2 Lists & rows (159:17140) | 222:27058 | wrapped, 1920×4736 | 0 → 0 |
| Lists · Sidebars, TOC & trees (212:1424) | 222:27185 | wrapped; 3 component sets into `Components` frame 222:27186 (x 2000); 3632-wide `Placements` in its own wrapper 222:27187 (it overlapped the page at x 1600) | 5 → 5 (all inside the TOC sets) |
| 2.3 Cards & containers (159:17141) | 222:27060 | wrapped, 1920×6420 | 0 → 0 |
| 2.4 Inputs & controls (159:3788) | 222:27062 | wrapped, 1920×4567 | 0 → 0 |
| 2.5 Status & progress (160:1062) | 222:27064 | wrapped, 1920×4841 | 0 → 0 |
| 2.6 Dropdowns & menus (163:18208) | 222:27189 | wrapped; 4 phones + prototype badge into Section `Prototype screens` 222:27190 (x 2000) | 16 → 16 |
| 2.7 Toggles (163:18561) | 222:27066 | wrapped, 1920×3913 | 0 → 0 |
| 3 Sections (160:18402) | 222:27068 | wrapped, 1920×4176 | 0 → 0 |
| Colour · Permutations (218:1062) | 222:27070 | wrapped, 1920×2065 (tables hug at 1346/1552) | 0 → 0 |

Left open: a pass that adds a Notes box and widens specimen rows to use the 1920 width.
