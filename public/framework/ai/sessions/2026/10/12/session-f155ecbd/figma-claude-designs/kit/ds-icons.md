# ds-icons: DS · 1.1 Icons

**Page built:** `DS · 1.1 Icons` (page `163:20989`, root frame `163:20912`), placed right after `DS · 1 Elements`. Shape cloned from `DS · 2.1 Buttons`; nav links point at Overview, 1 · Elements and 2.1 · Buttons.

**Sections:** Core set and Core set on dark (Navigation, Media, Actions, Status, Bullets; 5 groups, 30 glyphs), Sizes (16/20/24/32/48, white and dark), Icon and text (10 specimens, white and dark: inline sized to body/h3/h2, leading in a Row, trailing chevron, big icon above a title, icon on a dark and a light image, and a list pair: inline 24 vs 48 above), List bullets (dot, check, chevron, numbers, icons; white and dark), In action (4 phones at 390 Mobile: nav bar with icon+label tabs, settings list, feature list with check bullets on dark, card with a big icon over an image), and a dark Rules box (5 rules).

**Components added or changed:** none. Reused Row, Button, App bar, Tab bar, Specimen. The trailing-chevron "Go button" is a local frame, not a kit component (the kit Button has only a leading icon).

**Findings:** the inline 24 list reads better than 48 above (the 48 list is about 3x taller for the same words); the big icon earns its space only on a card or over an image.

**Values no token gives:** icon cell label at 14 px body (the h4 style is caps); cell width 120; image box gradient (0 to 50% black/white); `circle` set to the font's FILL=1 axis so it reads as a solid dot (Regular style is an outline ring; applied to all 10 `circle` nodes via `fontName.variationSettings`).

**Still looks off:** the kit Tab bar's active tab is a prime-filled block (against the splash rule; not mine to change). Core set shows about 30 glyphs, not 40. The In action row leaves the right third empty (two 454 tiles per row, as on Buttons). Dark image gradient is flat colour, no photo.
