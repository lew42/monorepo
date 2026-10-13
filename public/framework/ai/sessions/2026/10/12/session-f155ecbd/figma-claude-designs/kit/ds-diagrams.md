# DS · 5 Diagrams & charts — report

**Page built:** `DS · 5 Diagrams & charts` → `164:1067` (root frame `165:20285`, 1440 wide, after DS · 4 Layouts). Pieces live in the holder frame `164:1068`.

**Components added** (no kit component changed): `DG Node` `164:1069`, `DG Line V` `164:1077` (Head On/Off), `DG Line H` `164:1084` (Dir Right/Left), `DG Turn` `164:1094` (Out/Down/In), `DG Fan` `164:1123`. Charts reuse kit `Stat`, `Specimen`, `Timeline entry`.

**What works (each has a before/after resize pair, white and dark):**
- Vertical flow: connector FILLs the gap; line stays joined when a card grows.
- Horizontal flow: connectors `layoutGrow=1`, stretch 60→130 and stay centred.
- Snake: elbow = two FILL halves with 1–2 stroke sides; the join survives resize because the halves butt at layout edges.
- Branch and merge: top bar of two halves + centre stem + stubs; merge bar stays level.
- Timeline/steps: rail FILLs between dots.
- Charts: bars (FILL width, data height), stacked bar (`layoutGrow` = share), donut (`arcData`), sparkline (vector path), stat strip.
- In action: 390 phones (process flow; dashboard) and a desktop zigzag feeding a branch.

**Could not do / limits:**
- No live connectors in design files (`ConnectorNode` is FigJam-only); `generate_diagram` (FigJam) is the free-form alternative, not used.
- A FILL stub under a short card, inside a HUG row, is not re-measured by the plugin API: the row stays stale. The stubs are fixed to (tallest card − own card) instead, named for that reason.
- Variable-bound paints lose paint-level opacity: tints use node `opacity` (0.5, 0.15).

**Values no token gives:** plot height 120, bar/segment 12, donut 120 with inner radius 0.72, connector gutters 16–40, join 56, row gaps 8, segment gap 2, tint opacities 0.5 / 0.15.

**Still looks off:** arrowheads (Material glyph) sit about 2 px off the stem in `Turn In` and the Fan Top heads touch card tops. The Overview page does not link this page yet (not edited).
