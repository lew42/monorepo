# Brief: fluid sweep: every page fills its 1920, nothing clips (owner, 2026-10-13)

The owner, looking at the new Index: "in a lot of these pages there are differences in the width of each row… a consequence of using fixed width versus fluid width. Use proper auto layout on the page, then fill width for each container, then fill width for the items… min and max width for cards to say how many fit and when they wrap… a lot of these cards are clipping content (progress bars in specimen cards cut off)… big voids of horizontal space… we don't want fixed height or width anywhere unless absolutely necessary."

The rules (read both): [design/layout/doc/space.md](/framework/design/layout/doc/space.md) (general) and [ext/Figma/doc/figma-layout.md](/framework/ext/Figma/doc/figma-layout.md) (how in Figma), plus [page-layout.md](/framework/ext/Figma/doc/page-layout.md). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Your pages are in the prompt; touch no others.

## Per page
1. Screenshot the `Page · …` component.
2. **Fill all the way down:** page wrapper (1920 fixed) → its sections FILL → each row/frame inside FILL → cards and specimens FILL (with `minWidth` and, where useful, `maxWidth`), heights HUG. The 1440 inner frames that tidy left in place should FILL the 1920 too (the content then sits at the 1920's padding; bind it to section-pad). Every row on a page ends at the same right edge.
3. **Grids of cards:** horizontal, `layoutWrap = WRAP`, children FILL with a minWidth that gives the intended count at 1920 (and that would reflow in a narrower parent). Equal heights where a row reads as a set (the tallest child HUG, the others FILL vertically).
4. **No clipping:** `clipsContent = false` on cards and specimens, unless the crop is the point (a phone screen, an image). Fix every cut-off progress bar or last line.
5. **Keep fixed only where it's named:** icons, avatars, controls, phone frames (390), pinned sidebars. Rename anything fixed that you keep (`(fixed 280: sidebar)`).
6. **Masters top level:** any COMPONENT / COMPONENT_SET still inside a `Components` frame moves onto the page canvas (keep ids), in a tidy grid beside the page component.
7. **Icons:** where a page draws icons as plain Material Symbols text, swap to `Icon` instances from DS · 1.1 (see [icons.md](icons.md)) only when it's quick and safe. List the rest.
8. Screenshot again and compare. Count prototype reactions before and after; they must match.

Report `kit/fluid-<group>.md`: one line per page (what changed, what's still fixed and why, reactions before/after), committed by path.
