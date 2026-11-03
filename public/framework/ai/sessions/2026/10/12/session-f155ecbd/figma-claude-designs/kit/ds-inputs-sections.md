# Report: DS · 2.4 Inputs & controls, DS · 3 Sections

Figma file `QYN0G2URSBHYH5I06MOjxU`, shaped like `DS · 2.1 Buttons`. Brief: [brief-ds.md](brief-ds.md).

## Pages built
- `DS · 2.4 Inputs & controls` → page `159:3788`, root `159:3789`. Text input (4 states), search and select, field (default, error), segments and tabs, chips that wrap (wide, narrow), an on-dark row, and an in-action row: filter toolbar (search, chips, view switch), sign-in form, and the toolbar on dark. Rules box at the end.
- `DS · 3 Sections` → page `160:18402`, root `160:18403`. Six 390 Mobile bands: header + list, header + filter toolbar + grid rail, stats + timeline, hero (no prime ground, one primary button), settings list on dark, footer band (dark inside dark, 50% black). Then two stacked screens: hero + stats + settings + footer, and list + grid rail + footer. Rules box at the end.
- Nav links (`setRangeHyperlink`) join Overview, 2.1, 2.4 and 3.

## Kit components changed
- `Chip` (`145:14691`) and `Segment` (`145:13934`): added a `State=Current` variant (25% black inset, ink text). Their old `Selected` / `Active` states use a prime ground, which tonight's rule forbids; I left them in place so other pages don't change.
- `View switch` (`145:14705`): the selected cell is now a 10% black inset with an accent icon (was prime). This changed it in place everywhere it is used.

## Not done
- `Kit · Controls` has no toggle or checkbox, so none is shown.
- `DataGrid`'s Content slot is empty, so the grid rail is Cards (Inset ground) with a Badge and meta, not a DataGrid instance.

## Values no token gives
- "Current" at 25% black has no named token; it is the approved 25% stack alpha, set raw.
- Band footer overlay (50% black on dark) is also a raw layer.

## Still looks off
- Row `State=Selected` was not used (unverified against the no-prime rule). The `Field` slot ships with a default input, so I removed it from each instance; the Field tiles on 2.4 were not re-shot after that fix.
- Page 3's bands inside a white specimen tile show a white-on-white edge; it reads fine but is faint.
