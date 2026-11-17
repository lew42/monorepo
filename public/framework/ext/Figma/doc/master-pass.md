# Master pass: the layout masters and Res cards in Lew42 v2 (2026-11-16)

The owner's direction: "It's really these master components we want to focus on more than the instances." Every page is built from instances, so each fix here is made on the master and every instance follows.

**Scope:** the masters in the `<width> / Layouts` folders on the 360, 400, 600, 1000, 1600 and 2600 pages, plus the `Res.<mode>` Sets. Not Button, not Card `16:364`, not the Templates swap test.

**Checked on each master:** layout flows parent-down; padding and gaps fit its width; icons match their text; text styles everywhere and nothing wraps badly; room between items; a long-title test.

One line per master: what changed, then before / after shots (in [master-pass/](./master-pass/)). "inline" means the before shot was only looked at during the check, not saved.

| Master | What changed | Before / after |
|---|---|---|
| `360 / App bar` `100:4743` | Rebuilt as menu button, title, actions. Each button is a 40 px minimum tap target around a 24 px icon (Icon size mode H3; was 16), with padding from `button-pad-y`. The title is h3, fills the space, and is cut with … on one line (long-title test passed). The icon colour is now bound to the local Scheme `text`, not the old file's colour. Gap between the groups is `button-pad-x`. No Scale mode on the bar. | [before](./master-pass/360-app-bar-before.png) / [after](./master-pass/360-app-bar-after.png) |
| `600 / Stat tiles` `100:5162` | The row sets Scale 360 XS, since each card is a third of the region, so card padding is 16 (was 32) and "8.2k" fits on one line. Cards stretch to the same height. The row wraps with a 140 minimum per card, so below about 470 wide it goes 2 + 1 by itself (tested at 328 and 1000); the detached "Tiles · 2 + 1" frames on 360 XS and 400 Mobile are plain instances again (mastermind-layouts). | [before](./master-pass/600-stat-tiles-before.png) / [after](./master-pass/600-stat-tiles-after.png) |
| `360 / Navigation` `98:164` | Removed the Scale mode from the master (the region that holds it sets the mode). The title and the six links now fill the width and wrap, so a long title or link no longer runs out of the card (long-title test). | inline / [after](./master-pass/360-navigation-after.png) |
| `360 / Profile` `98:179` | Same as Navigation: no Scale mode on the master; the name fills and wraps (tested with "Alexandra Montgomery-Fitzgerald"). | inline / [after](./master-pass/360-profile-after.png) |
| `400 / List section` `100:4325` | Removed an empty Meta text (" ") from the last row. Icons are Body size next to body text, which matches the Icon.Item pairing. | inline / [after](./master-pass/400-list-section-after.png) |
| `400 / Card stack`, `400 / Icon + title` | Checked, no change: padding fits 400, the long title in Card stack already wraps cleanly, the H3 icon matches the h3 title. | none |
| `600 / Rail + main` `100:5116` | The rail held 16 px icons inside 32 px side padding (8 px of room). Now each icon is 24 px in a 40 px minimum tap target, with padding from `button-pad-y` and `text-gap` between them. The main card fills the row's height, so rail and card match. | [before](./master-pass/600-rail-main-before.png) / [after](./master-pass/600-rail-main-after.png) |
| `600 / Two small cards` `100:5139` | The row sets Scale 400 Mobile (each card is about half the region). Cards are the same height and wrap with a 220 minimum, so they stack by themselves below about 460 (tested at 360). | [before](./master-pass/600-two-small-cards-before.png) / [after](./master-pass/600-two-small-cards-after.png) |
| `1000 / Text column` `100:2115` | The card's text said "600 SM" and "Text column · 720", typed values the Rules forbid. Now "Article", "A column made for reading" and a line about the reading width. The max width was already bound to `measure`. | inline / [after](./master-pass/1000-text-column-after.png) |
| `1000 / Two cards`, `Nav + main`, `Three cards` | Checked, no change: each column region sets a mode near its width, and cards stretch to equal height. | none |
| `1600 / Rail + two cards` `100:3746` | Once Navigation stopped forcing XS, its 400 Mobile rail grew taller than the row and the links spilled out of the card, because a row whose children are all Fill height does not grow. The rail now hugs its content and drives the row's height; the two cards fill it. | inline / [after](./master-pass/1600-rail-two-cards-after.png) |
| `1600 / Rails both sides` `100:3849` | The Text column title was overridden to "Text column · 688"; it now reads "A column made for reading", like the master. | inline / [after](./master-pass/1600-rails-both-sides-after.png) |
| `1600 / 60 / 40`, `1600 / Three cards` | Checked, no change. | none |
| `2600 / Sidebar + Main` `100:3511` | The Navigation sidebar floated at content height in a full-height rail; it now fills the height (Rules: sidebars are Fill height). Removed a redundant 600 SM mode on the Navigation instance (its region already sets it). | inline / [after](./master-pass/2600-sidebar-main-after.png) |
| `2600 / Rail + Main + Rail` `100:3553` | Both rails (Navigation and Profile) now fill the height. | inline / [after](./master-pass/2600-rail-main-rail-after.png) |
| `2600 / Main + Aside` `100:3618` | Removed the 600 SM mode on the Stat tiles instance, so the master's own 360 XS applies (small padding, values on one line). | inline / [after](./master-pass/2600-main-aside-after.png) |
| `2600 / Centred column` `100:3687` | Checked, no change: the column's max width is bound to `squeeze`. | none |
| `Res.<mode> Set` (all 8) | Checked, no change: width bound to Scale `width`, each card sets its own mode, Card hugs with a `card-min` minimum, and the label fits on one line at every size. All have descriptions. | none |
| 2600 `Masters` frame (Nav item, Sidebar, Layout.Columns.One/Two/Three Set, Layout.ScaleRegions Set, Layout.Sidebar Set, Layout.Miller Set, Layout.Miller.Mobile Set) | Added the missing descriptions (type, then purpose). No layout changes: these are older 2600 experiments outside the Layouts folders. | none |

## What this pass found that applies everywhere

- **A row whose children are all Fill height never grows.** When something inside gets taller (a mode change, longer text), the row keeps its old height and the content spills out. At least one child in a row (usually the sidebar or the tallest column) should Hug and drive the height, and the others Fill. Found in `1600 / Rail + two cards`; a sweep of Navigation and Profile instances on 10 pages found no other spill.
- **A mode set on a master's row wins over the region's mode.** `600 / Stat tiles` and `600 / Two small cards` set their own mode because their cards are always a third or a half of the region. That is the same idea as the 1000 and 1600 layouts' column regions, without an extra wrapper frame. An instance that sets its own mode overrides it again, so leave instances without one.
- **Icon buttons are now built twice by hand** (App bar, Rail + main): a frame with a 40 px minimum around a 24 px Icon. The next step is one `Icon button` master. It is not made here, because new masters need the owner's OK and the owner is editing Button.
- **The icons still come from the old file** (the remote `Icon` and its `Lew42 · Icon size` collection). This pass binds each icon's colour to the local Scheme `text`, but the fix for the icon itself belongs on the Icons page.

## Left alone, on purpose

- Card `16:364` (mastermind-figma is merging duplicates into it), Button (the owner is editing it), the Templates swap test (mastermind-layouts).
- Text size at 2600 (16 px body looks small): an open question for the owner, in the Text frame on the AI page.
