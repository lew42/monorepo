# Vote: how to organize Lew42 v2 for swapping (mastermind-master-homes, 2026-11-16)

From what the file already showed (no new Figma calls). Context: [master-homes.md](../master-homes.md), [study-sizes.md](../study-sizes.md).

## Q1. Resolution-first pages, or component-type pages?

**Both, split by what the thing is. Resolution-first for layouts, type-first for blocks.**
- A Card, Button, Icon and Text style is one master at every width: its Scale mode (set on the container) does the sizing. These go on Elements, Icons and Text, once.
- A layout (Sidebar + Main, Card stack, App bar) is sized to a tier. Putting it on that tier's page makes the Assets panel and "Go to main component" show only things that fit the width, so a swap cannot drop a 3440 layout into a 400 container by accident. Type pages that hold all sizes mix them in one list, which is the "wrong template in the wrong container" problem.
- The swap menu itself is driven by the component set (variants) and preferred values, not by the page. So tier pages help browsing and the Assets panel, and preferred values do the real "swap and it works". Set preferred values per container slot.
- Fewer pages: Mobile (360 / 400 / 600), Default, Desktop (1600 / 1920), Mega (2600 / 3440), as [study-sizes.md](../study-sizes.md) says.

## Q2. Top-level folders on a resolution page, in order

1. **Preview**: instances only, a 3-column masonry of the best 10%. No masters (a live preview cannot hold them).
2. **Screens** (full pages, the demos).
3. **Layouts** (page-level arrangements: Sidebar + Main, Rails both sides).
4. **Sections** (bands: Card stack, List section, headers).
5. **Containers** (panels, rails, drawers: the fill / hug shells).
6. **Content** (tier-only blocks, e.g. App bar on Mobile). Shared blocks are not here; they live on Elements.

Yes: build the Screens only from that page's masters (plus the shared blocks from Elements as nested instances). Then every region of a demo is swappable for a sibling in the folder below it. Order is top-down by size of piece: a Screen swaps Layouts, a Layout swaps Sections, a Section swaps Containers.

## Q3. One Root per page, or top-level folder frames?

**Top-level folder frames for the masters; the tidy single view is the Preview, not a Root.**
- The Assets panel only groups by top-level frame, so a single Root hides every master under one heading. That is the "defined on a bullshit page" feeling, one level down.
- To get both: folder frames hold the masters (real folders in Assets). The Preview frame at the top is a board of instances of those masters: one screenshot, one tidy look, always in sync because it is made of instances.
- A second route, independent of nesting: slash names (`Layouts/Sidebar + Main`) group inside the Assets panel whatever the frame depth. Use them as the folder for one level, not for the resolution (the owner decided against resolution in names).
- Unknown, worth one canary: whether a Figma Section as the top-level wrapper counts as the group in Assets. If it does, one Section per page named like the page gives a real wrapper and one-screenshot view with the folder frames still inside.
