# Using the space: fluid first, no voids, no clipping (owner, 2026-10-13)

Suggestions, not laws. Each one has a reason, and a good reason to break it wins. They apply the same way in the browser and in Figma. The Figma mechanics are in [ext/Figma/doc/figma-layout.md](/framework/ext/Figma/doc/figma-layout.md).

- **Fluid by default.** A card, a column or a section fills the width it is given and grows to the height its content needs. Fix a size only where consistency is the point: an icon, an avatar, a control's hit area, or a column you deliberately pin (for example a 280 sidebar next to a fluid main). Fixed widths leave voids when there is more room and clip when there is less.
- **Never clip content to fit a box.** A box that cuts off its own progress bar or last line is broken, not tidy. Let it grow, or give the content less to show.
- **Fixed + fluid is a normal pair.** Not every column needs to be equal. A pinned narrow column beside a filling one usually reads better than two equal halves.
- **Avoid big voids.** Some white space separates groups, and that is good. A row of three fixed cards with half the width empty beside them reads as broken. Let the cards fill, add a column, or change the layout.
- **Repetition reads as order.** A row of equal-height cards is calm, and ragged heights in a row look accidental. When heights must vary, use a masonry: columns balanced by real height (on the web, [ext/sprawl](/framework/ext/sprawl/)), not a grid with holes.
- **Simplest layouts first.** Show a single column and a two-column split before anything clever. Most pages are one of those.
- **Align when you can.** Shared edges (left edges, tops of cards, baselines) make a page look designed even when it is plain.
- **Two-column sections are a strong default at 1920 and up:** a narrow left column for the title and a short description of the part, with the content filling the right. See [/framework/design/layout/](/framework/design/layout/) for the approved layouts.
