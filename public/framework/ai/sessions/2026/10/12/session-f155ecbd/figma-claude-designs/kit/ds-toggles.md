# ds-toggles report

**Page built:** `DS · 2.7 Toggles, checkboxes & radios` → `163:18561` (root frame `163:18562`), placed after `DS · 2.6 Dropdowns & menus`. Nav links: Overview, 2.6, 3 · Sections. Sections: States (8 specimens), On dark (8), Rows that carry them (settings list, checklist, radio group), The same choice three ways (Toggle / Segment row / Select), In action (settings screen, filter sheet with checkboxes, dark plan picker with radios), Rules box.

**Components added** on `Kit · Controls` (x=4500): `Toggle` `163:2283` (Off/On), `Checkbox` `163:2284` (Unchecked/Checked/Indeterminate), `Radio` `163:2285` (Off/On). Each has a `Label` text property, hugs, min height 44; on = `accent` fill + `on-accent` mark; off = a 15% `text`-ink overlay layer (works on light and dark with no mode switch). Toggle's label fills, so in a row the switch sits at the right. No existing component changed.

**Not done / notes**
- Disabled is an instance at 40% opacity, not a variant.
- Off overlay is 15% of `text`, not a bare 10% black: a black 10% layer vanishes on the dark ground. A bound variable's alpha overrides paint opacity, so it is a child layer with node opacity.
- The three In-action specimens are 454 wide (390 phone + `pad-x`), so the third wraps to a second row, same as the Buttons exemplar.
- Selected plan row uses a bare 10% black inset layer (no variable), as the rules say.
- Pages 2.5/2.6 were not edited to link forward to 2.7 (not my pages).
- Looks off: toggle off knob is ink-dark on a pale track, a little heavy; no focus-ring state yet.
