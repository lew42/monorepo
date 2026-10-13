# Brief: diagrams and charts from auto layout (owner, 2026-10-12, night)

Read [brief-ds.md](brief-ds.md) first (page shape, Specimen tiles, tokens only, prime as a splash, hug or fill). The owner has long wanted flowcharts in Figma whose arrows follow the boxes when the boxes grow, the way Whimsical's do. Figma design files have no live connectors (`ConnectorNode` is FigJam-only and blocked in design mode), so the job is to find out how far **auto layout** gets: arrows that are layout pieces, not drawn lines.

## Explore, in this order, and report what works

1. **Vertical flow (the mobile case):** cards in a vertical stack, and between each pair a connector frame: a 2 px line that FILLs the connector's height + an arrowhead glyph (`arrow_downward` or `south`, Material Symbols Rounded). When a card grows, the line stays attached because the stack reflows.
2. **Horizontal flow:** cards in a row with connector frames that FILL the space between them (`layoutGrow = 1`), so the arrows stretch evenly when the row widens.
3. **Zigzag / snake:** rows of cards; the turn between rows is an elbow piece (a frame with only two stroke sides, e.g. right + bottom, `strokeRightWeight`/`strokeBottomWeight`) that FILLs its cell, so the path follows when heights change. Split a line across two parents where needed (one half in the row, the other in the next), and say whether the join survives a resize.
4. **Branch and merge:** a T-junction piece (a top line across the children plus a stub per child), so one card can fan out to two or three and come back.
5. **Timeline / steps** with a rail line that FILLs between dots.
6. **Charts from layout:** a bar chart (bars FILL a row, heights from data), a stacked progress bar, a donut (`ellipse.arcData`), a sparkline (a vector path), a stat strip. Values bound to tokens where possible; one hue (accent) plus ink/muted.

For each: resize a card (taller text) inside the script and screenshot before and after to PROVE the connector follows; put the before/after pair on the page.

## Page

`DS · 5 Diagrams & charts` (after `DS · 4 Layouts`). Sections per item above, on white and on dark; an In-action row with a 390 phone (a vertical process flow, a dashboard with a bar chart and a donut) and one 1440-wide desktop flowchart (zigzag with a branch). A Rules box: which technique to use when, and the limits you hit. The MCP also has a `generate_diagram` tool that makes FigJam diagrams; mention it as the alternative for free-form charts, do not use it here.

Report: `kit/ds-diagrams.md` (what works, what does not, the piece components you built), committed by path.
