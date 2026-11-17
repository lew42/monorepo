# Master pass: the layout masters and Res cards in Lew42 v2 (2026-11-16)

The owner's direction: "It's really these master components we want to focus on more than the instances." Every page is built from instances, so each fix here is made on the master and every instance follows.

**Scope:** the masters in the `<width> / Layouts` folders on the 360, 400, 600, 1000, 1600 and 2600 pages, plus the `Res.<mode>` Sets. Not Button, not Card `16:364`, not the Templates swap test.

**Checked on each master:** layout flows parent-down; padding and gaps fit its width; icons match their text; text styles everywhere and nothing wraps badly; room between items; a long-title test.

One line per master: what changed, then before / after shots (in [master-pass/](./master-pass/)).

| Master | What changed | Before / after |
|---|---|---|
| `360 / App bar` `100:4743` | Rebuilt as menu button, title, actions. Each button is a 40 px minimum tap target around a 24 px icon (Icon size mode H3; was 16), with padding from `button-pad-y`. The title is h3, fills the space, and is cut with … on one line (long-title test passed). The icon colour is now bound to the local Scheme `text`, not the old file's colour. Gap between the groups is `button-pad-x`. No Scale mode on the bar. | [before](./master-pass/360-app-bar-before.png) / [after](./master-pass/360-app-bar-after.png) |
| `600 / Stat tiles` `100:5162` | The row sets Scale 360 XS, since each card is a third of the region, so card padding is 16 (was 32) and "8.2k" fits on one line. Cards stretch to the same height. The row wraps with a 140 minimum per card, so below about 470 wide it goes 2 + 1 by itself (tested at 328 and 1000); the detached "Tiles · 2 + 1" frames can become instances again. | [before](./master-pass/600-stat-tiles-before.png) / [after](./master-pass/600-stat-tiles-after.png) |
