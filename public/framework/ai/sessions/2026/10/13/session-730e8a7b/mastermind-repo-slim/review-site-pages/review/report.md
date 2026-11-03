verdict: fix
1. [fix] Catalog: the first screen shows no preview card at any width; it is two text blocks, three pill links and three class cards, and the previews start below "Core (30)" (page 1, requirements 1). Evidence: shots/monorepo-localhost-framework-catalog/1920.png. The code comment says "the first screen is previews".
2. [fix] Catalog: the owner's test, "40 previews load in under 2 s", is not met. `doc/next.md` says live iframes cannot meet it and records the next brief. The shots do not measure it (requirements 1).
3. [fix] Catalog at 1920 and 3440: everything stays in a column about 760 px wide, with 3 class cards per row, while 228 cards wait further down. The page is 16 screens long at 1920 and 75 at 400 (layout 1, sizing 1). Evidence: layout.json empty 0.73 / 0.79, band `cat` share 15.96 at 1920 and 74.73 at 400.
4. [fix] Catalog: the "Refine" class card is empty, with no "extends" line and no methods. The owner asked for "class cards with the icon and the core API" (requirements 1). Evidence: shots/monorepo-localhost-framework-catalog/1920.png, class-card band, first card.
5. [fix] Object: the new INSTANCETREE tab pushes the Object tab bar onto 2 rows at 1200 (navigation, tabs fit one row). Evidence: layout.json tab_rows 2 at 1200 for both Object pages. Dictate surfaces also has 2 rows at 1200, but that tab set was there before this change.
6. [note] Object (`/framework/ux/Content/Object/`) renders blank on the main site at all four widths. Evidence: shots/monorepo-localhost-framework-ux-Content-Object, empty 100%, band share 1 with ink 0. The worktree build (127.0.0.1) renders, so check the page again after the merge.
7. [note] Catalog: the heading says "Class cards (54)", but the brief and readme say 55.
8. [note] Figma tokens on the main site opened scrolled down to the dropdown at 1200 and wider (the top bands have ink 0), and its doc links showed as raw markdown at 400. The worktree build fixes both. At 3440 the `width: "full"` page still keeps the table about 600 px wide, 78% empty.
9. [note] InstanceTree: the "add a child page" and "rename this page" buttons wrap to 2 lines at 1200, 1920 and 3440 (layout.json wraps).

Widths given: all four (400, 1200, 1920, 3440) for every page. Object, InstanceTree, surfaces and tokens were shot on both the main site and the worktree build; the catalog was shot on the main site only.

## Requirements
- 1 "a preview on the catalog page is enough… click through to the full demo" — no — the previews are below the fold (1920.png), the under-2 s test is unmet (doc/next.md), and clicking through is wired in CatalogPage.js but not shown in a shot
- 1 "class cards with the icon and the core API" — partly — the cards show an icon, a name, "extends" and methods, but Refine is empty (1920.png)
- 1 "the live instance hierarchy" — yes — the catalog links to the InstanceTree page; shots/127…instance-tree/1920.png shows the tree beside the demo buttons
- 7 "a page I can click through to, that documents how it all works" — yes — surfaces 1920.png: nine surfaces, and each card says where it is, its file, who answers and its log; the dev shell row is now traced (diff)
- 10.2 "simple views of the live classes" — yes — Object's 127 shots show three live view() trees side by side
- tokens "does the tokens page show the pairs" — yes — 127…Figma-tokens/1920.png: the Figma variable → site property table with swatches
- Show the class "rendered view beside the live instance" — yes — instance-tree 1920/3440: the demo on the left, the live tree on the right
## Page structure
- page 1 (title says what it is) — yes — every page's h1 band names it (Catalog, Object, InstanceTree, Voice and chat surfaces, Figma tokens)
- page level 1 shown, not told — no — Catalog's first screen is text and pills, with no previews (finding 1); the other four pages show their subject above the fold
- page detail nested — yes — InstanceTree puts "How this works" in a details block; surfaces moves detail into its doc
## Navigation
- techniques — tabs (Object, Dictate), a sidebar (all), cards that link through (Catalog)
- tabs in one row — no — tab_rows 2 at 1200 (Object, Dictate surfaces); 1 at 400, 1920 and 3440
- sidebar marks the current page — yes — "Catalog" and "Voice and chat surf…" are highlighted in the 1920 shots
- every view has a URL — yes — InstanceTree has its own route, /framework/ux/Content/Object/instance-tree/
## Layout
- uses the screen at wide widths — no — Catalog empty 0.73 at 1920 and 0.79 at 3440; tokens (a `width: "full"` page) 0.78 at 3440
- columns where the content is a set — partly — Object's view() row uses 3 columns at 1920+, and surfaces uses an auto-fit grid; Catalog's class cards stop at 3 per row
- no horizontal overflow — yes — overflow_x false at every width
## Sizing
- reading text at measure — yes — widest_text 587–716 px across pages at 1200+
- page length proportional — no — Catalog 74.7 screens at 400 and 16 at 1920 (band `cat`)
- cards a sensible size — yes — surfaces cards and class cards are about 240 px wide at 1920
## Wrapping
- headings do not wrap needlessly — yes — at 400 only, "Live instance hierarchy" (catalog) and "Voice and chat surfaces" take 2 lines, which is acceptable
- buttons do not wrap — no — the InstanceTree demo buttons take 2 lines at 1200+ (layout.json wraps)
- tab labels — yes — they do not wrap inside themselves
## Spacing and padding
- left edge consistent — yes — left_stack h1 = p: 28 / 38 / 67 / 90 px at 400 / 1200 / 1920 / 3440 on every page
- padding scales with width — yes — the same numbers
- no wasted bands — no — the Catalog intro plus the hierarchy pills fill the first screen before any content (1920.png, bands 1–3)
## Colour and contrast
- text readable on its background — yes — body text is dark on light grey in every shot; the class cards' cream fill keeps contrast
- colour carries meaning, not decoration — yes — the gold edge marks a class with its own static api (catalog, System card)
- token swatches match their labels — yes — the 127 tokens table: prime orange, error red, ok green
## Flow
- most important first — no — Catalog puts the hierarchy pills and class cards above the previews, which are its main subject
- one takeaway per page — yes — surfaces ("nine places, which share one conversation") and InstanceTree ("press, watch the tree change")
## Words
- plain full sentences — yes — the surfaces and InstanceTree intros read clearly
- no jargon standing in for an explanation — partly — Catalog's "Gap: it shows one instance you open by hand…" is an internal note shown on the page
- numbers agree — no — "Class cards (54)" vs 55 in the brief and readme
- links instead of plain names — yes — the tokens page now renders its doc links (md()), where before they showed as raw markdown on the main site at 400
