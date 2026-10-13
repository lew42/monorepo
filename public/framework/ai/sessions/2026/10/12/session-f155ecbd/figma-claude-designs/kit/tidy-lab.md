# Tidy · lab group (2026-10-13)

File `QYN0G2URSBHYH5I06MOjxU`. Each page now has a 1920 auto-layout wrapper (header, gist, Notes box, then content; spacing bound to Resolution tokens) turned into a component `Page · <name>`. Reactions are counted before → after.

| Page (id) | Page component | What moved / fixed | Reactions |
|---|---|---|---|
| Claude prototype (135:1062) | 222:27436 | Badge into the wrapper; the 4 screens kept top-level in Section `Prototype screens` (222:27435); screen links added | 65 → 65, flow kept |
| Lab · Site shell (142:1246) | 222:27183 | 4 sidebars in one row; `Site sidebar` master to `Components` frame (222:27182), instance shown | 0 → 0 |
| Lab · Stacks (150:1062) | 222:27330 | 55 loose nodes regrouped: 5 recipes, each a heading plus a wrapping row of label+frame columns; Findings became the Notes box; `Section` master to `Components` (222:27329) | 0 → 0 |
| Lab · Elements (155:1062) | 222:27349 | 5 columns (2910 wide) rebalanced into 3 lanes inside 1920 | 0 → 0 |
| Claude test page (124:1062) | 222:27859 | v1 and v2 (prototype destinations) top-level in Section `Prototype screens` (222:27856); v3 and Schemes A–D in the wide 3440 wrapper `Page · Claude test page · wide` (222:27860); `Nav link` set to `Components` (222:27855) | 22 → 22 |
| Video · Kit (187:1062) | 222:28303 | 4400 frame stays beside as its own frame (42 masters, cannot nest); 1920 page with notes and links to every section | 0 → 0 |
| Video · Storyboard · The Twelve (189:1062) | 222:28581 | 3000 frame and image store kept beside; S01–S16 plus the heading in Section `Prototype screens` (222:28580) | 16 → 16 |
| Video · Channel ideas (196:1062) | 222:28324 | 4400 frame beside; 1920 page with notes and links | 0 → 0 |
| Type · Title layouts (198:23900) | 222:28564 | 2300 frame beside (29 masters); 1920 page with notes and links | 0 → 0 |

## Caveats
- The three wide video/type frames are not componentized: each holds dozens of component masters, and a component cannot contain another component's main. Moving the masters would break every instance. Their 1920 page component carries the title, notes and hyperlinks into each section instead.
- Lab · Stacks columns are 390 wide, so five do not fit one 1680 row; the fifth ground (Mixed) wraps.
- The Overview index was not touched (the mastermind builds it).
- No `Backups` section: none of these pages had `was ·` frames.
