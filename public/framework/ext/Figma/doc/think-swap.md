# Swapping content into a region: one model (think-swap, 2026-11-16, proposal)

The question: how do we fill any layout region with the right component quickly, without a component for every variation? Answer: **a region is a slot holding one content block; you change the block with Figma's own swap menu, and the swap menu stays short because blocks live in one folder.** Read-only study of Lew42 v2 (Card `16:364`, `Card · Slot` `112:7282`, Specimen, Notes, Icon.Title) and the Big Sloppy card test (option D in the [readme](../readme.md#component-strategy-current-2026-11-12)); background: [slot vs swap demos](./slot-vs-swap-demos.md).

## Which tool, when

- **Slot**: any region whose amount of content can vary: page body, card body, list, toolbar, Notes. This is the default. Turn on "fill items on counter-axis", so anything dropped in is full width.
- **Native swap menu** (Ctrl/Cmd-click the block inside, then pick from the instance menu in the right panel): the way to change WHICH block is in a region. It needs no property, so nothing has to be mapped.
- **Instance-swap property**: only for a spot that always holds exactly one thing from a small family, on a master placed often, where one click at the top is worth it: the icon in `Icon.Title` or in a Button. Preferred values are its menu (thumbnails confirmed).
- **Plain frame**: layout inside a master (row, stack, grid). It is never swapped.

So Card becomes a shell (fill, radius, padding) with one Content **slot**, holding one block instance by default. Card `16:364`'s `Content` swap property goes: drilling in and swapping does the same job, and you can also press Ctrl+D to add a second block, which a swap property can't do. Migrating its 356 instances is a job for roots; the alternative is to keep the property and accept that a Card can hold only one block.

## Names and folders

- A slash makes a menu folder, so name blocks by role, never by size: `Content / Text`, `Bar / App`, `Layout / Sidebar`. The region's Scale mode sets the size; `400 / Icon + title` and `360 / App bar` lose their width prefix.
- Folders: `Content /` (what goes in a card or region), `Bar /`, `Layout /`, `Element /` (Button, Icon.Item). Each folder has 6 items or fewer; past that, merge blocks rather than add a subfolder.
- Helpers nobody should pick start with `.` (hidden from publishing), so they never show up in the menu.
- Put all `Content /` masters in one frame on the Elements page. Today `Content · Text only`, Card's default, sits on no page at all, and its dot isn't a slash, so it makes no folder.

## The five blocks

1. `Content / Text`: kicker, title, body, and an `Actions` boolean (the default; the Big Sloppy census and today's Card count, 194 of 215, both say it is the common case).
2. `Content / Icon title`: Icon.Title's header plus body. It absorbs Icon + title and Profile (swap the icon for an avatar).
3. `Content / List`: a slot of Icon.Item rows (absorbs Icon rows and List section).
4. `Content / Stat`: a number and a label.
5. `Content / Media`: a full-bleed image above a padded text area (image cards stay edge to edge).

## Keeping a master honest

- Card's master shows `Content / Text`, because most Cards hold it. What you see on the master is what you usually get.
- Content belongs to the block, never the shell. When an instance looks unlike its master, the layers panel says why (`Card > Content / Stat`), and Ctrl/Cmd-click lands on the block's own master. That was the confusion today: a swapped Card showed no sign of what it held.
- The master's description names its slot and the blocks it expects ("Content: one `Content /` block; Text by default").

## One test (under a minute, once roots has renamed the five blocks)

On Elements, place a Card. Ctrl/Cmd-click its content and open the swap menu. **Pass:** it opens on the `Content` folder with 5 thumbnails. Pick Stat, and it fills the card. Press Ctrl+D, and a second block stacks under it in the same card.
