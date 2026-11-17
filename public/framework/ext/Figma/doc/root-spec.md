# The Root spec: one tokenized Root per page (2026-11-17)

Read from the Index page's `Root` (`137:725`), which the owner configured by hand. Every page in Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`) uses the same Root. It is a plain frame, not a component. Rule 7 in [rules.md](./rules.md); plan in [root-plan-2026-11-17.md](./root-plan-2026-11-17.md).

## Root

| Property | Value | Token (id) |
|---|---|---|
| Name | `Root`, the only top-level frame on the page | |
| Fill | black 5% | Colors `tint` (`VariableID:228:7333`, collection `Lew42 v2 · Colors` `VariableCollectionId:12:2`) |
| Scale mode | **3440 Mega**, explicit on Root | `Lew42 v2 · Scale` (`VariableCollectionId:2:2`), mode `2:2`. Never Big Sloppy's remote `Lew42 · Scale`. |
| Padding | 256 all round at Mega | left/right `section-pad-x` (`VariableID:23:482`), top/bottom `section-pad-y` (`VariableID:23:483`) |
| Gap | 256 at Mega | `section-pad-x` (`VariableID:23:482`) |
| Layout | horizontal, no wrap, align top-left | |
| Sizing | Hug × Hug | |
| Clip content | off | |
| Children | Root columns only, plus a hidden `Archive` as the last child | |

## Root column

| Property | Value |
|---|---|
| Name | `Root Column - <title>` (the owner's own naming on Index: `Root Column - Sizes` `162:11145`) |
| Layout | vertical, no fill, no padding, align top-left |
| Gap | `gap` (`VariableID:2:5`), resolved in the column's own mode |
| Scale mode | explicit: the tier the column shows (e.g. `1920 Desktop` `58:0`); a column of mixed content keeps the mode its content was drawn in |
| Width | 1920 when possible, wider only when its content needs it; Hug height. Nothing grows to 5000+ wide. |

## Scale modes (`Lew42 v2 · Scale`)

`1000 Default` 2:0 · `360 XS` 2:5 · `400 Mobile` 2:1 · `600 SM` 2:3 · `1600 LG` 2:4 · `1920 Desktop` 58:0 · `2600 XL` 2:6 · `3440 Mega` 2:2

## How a page moves onto it safely

1. The page's old Root children go into one Root column, which takes the Scale (and Scheme) mode Root had before, and the old gap. Nothing inside shifts. (Freezing at the column, not on every child, keeps modes in the three places of rule 19; it is the same thing, since every child inherited Root's mode.)
2. Root then gets the spec above. A hidden `Archive` stays Root's last child.
3. Split the column into titled Root columns of sensible widths, each set to its tier. First give every moved child the mode it was drawn in, so nothing shifts. The 1920 Desktop pilot did this; the proposals for the other pages are in [root-audit.md](./root-audit.md).

The same spec is on the AI page as the `Root` card (`246:2`).

Index itself (reference, not changed by agents) holds today: `Root Column - Sizes` (two previews), `Icons Preview`, Big Sloppy's `Page Set` (not ours, to replace) and a visible `Archive` with the owner's screenshot `image 1`.
