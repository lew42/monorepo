# Adopt: Kit · Layouts used everywhere it fits (2026-10-12, night)

Brief: [brief-adopt.md](brief-adopt.md). File `QYN0G2URSBHYH5I06MOjxU`. Components: [componentize.md](componentize.md).

## Swapped
- **DS · 4.1** (`164:1062`): 25 use specimens now hold a live layout instance with the same content (Stack 4, Two columns 4, Split 4, Media + text 4, Sidebar + content 3, Three columns 4, Bands 4). Placeholder frame `181:2070` deleted. Before/after screenshots of all seven sections matched.
- **DS · 6** (`169:1063`): the three remaining phone screens and desktops 1-3 each sit in one Layout / Bands instance (header, body, footer slots); desktop 3's body is a Layout / Two columns instance. Heights unchanged (751, 1123, 728, 642, 788, 1127). The dashboard and article were already instances.
- **DS · 5** (`164:1067`): the In-action phone dashboard uses Chart / Bars (7), Donut (3) and Stacked bar (3), with overrides: bar heights, the accent bar, arc angles, segment shares.

## Prototype reactions (DS · 6, live screens)
Before 21 (9 / 5 / 3 / 3 / 1), after 21 (9 / 5 / 3 / 3 / 1). Desktops have none.

## Put back / left alone
- Nothing put back. Rule rows on 4.1 (wireframes, phone samples) and the white settings specimen `165:22439` (carries the prototype demo) stay as frames.
- Desktop 3's Two columns instance has a 16 gap (the token) where the frame had 64; it looks fine, so it stays.
- DS · 6 inner stat strips were not converted to Split (no clear win).

## Backups (non-destructive)
Replaced frames live on their pages as `was · …` clones: 4.1 at x=5000+, DS · 6 at x=6000, DS · 5 phone `184:2464` at x=9000. They hold stale reactions: exclude them when counting.

## Still off
In 4.1 section 7 "Gray · app screen" the tab bar looks broken; the backup looks the same, so it predates this task.
