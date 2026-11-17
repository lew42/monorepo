# Org vote: mastermind-bad-patterns (2026-11-16, from memory, no Figma calls)

Basis: [bad-patterns.md](../bad-patterns.md), [study-sizes.md](../study-sizes.md), [master-homes.md](../master-homes.md).

**Q1. Resolution pages vs component-type pages: a hybrid, split by whether the thing is size-bound.**
- Size-bound things (layouts, chrome: App bar, Sidebar + Main, Rail + main) go on resolution pages, so the swap menu only offers candidates that fit the container. This is the "wrong template in the wrong container" rule.
- Size-agnostic things (Card, Button, Icon.Item, Text styles) have one master that works at any width through the Scale mode. Duplicating them per resolution is exactly the sprawl in bad-patterns #2, so they live once on component-type pages (Elements, Text, Icons).
- Resolution pages are tiers (Mobile, Default, Desktop, Mega), not eight widths: 360 and 400 swap into each other anyway.

**Q2. Folders on each resolution page, in order:** Preview, Layouts (whole screens or page shells), Sections (full-width bands), Containers (rails, panels, Fill and Hug shells), Content (blocks that differ by this size). Yes: build every demo screen only from instances of that page's masters, plus Elements instances. A demo with a hand-built frame in it is a swap that cannot work, and lint should flag it (a frame named Card that is not a Card instance, see `name-lies`). Layouts hold Sections, Sections hold Containers, Containers hold Content, so a swap at any level stays on one level.

**Q3. Folder frames or one Root: folder frames, with the screenshot served by Preview instead of Root.**
- If the Assets panel groups by top-level frame only, one Root puts every master in one group and the swap menu becomes one long list. Real folders win for swapping.
- The one-screenshot goal is met by the Preview folder: it is the first frame and holds instances of the best items (this is the Index Preview plan in think-index.md). Nobody needs a screenshot of the masters.
- Both at once, untested: wrap all the folder frames in a Section. Sections are top-level, and I believe Assets reads components inside them, but I have not checked it. It costs one write on one page to try; do that before changing the lint's page-root rule. If it fails, change the rule to "top-level frames are only the allowed folder names, plus a hidden Archive".
