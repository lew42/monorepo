# Page plan: sorting the 50 pages of the Lew42 Design System file (2026-11-13)

This is a proposal, not a change. Nothing in the Figma file was touched: every number below came from read-only scripts (one per page). File: `hbolzQ3Xnc78rhxAPj8xK2`. Strategy it serves: [readme, Component strategy](../readme.md#component-strategy-current-2026-11-12).

## The two facts that decide everything

1. **Inside one file, masters move for free.** `appendChild` across pages keeps every instance linked ([readme, Page builder](../readme.md#the-page-builder-page-2026-11-09)). So every MERGE below is a script, safe, with no broken instances.
2. **Between files, only copy and paste works, and a pasted master is a brand-new master.** Instances in the old file do not follow it. So a page can leave the library only if nothing else uses its masters, or if you publish the library first, turn it on in the Lab file, and paste there (instances of published library masters should stay linked; test this once on `Text layouts` before moving anything big).

## What the library must keep (used by almost every page)

These masters are the core. Their pages stay in the library, and they should not be pasted anywhere.

- **Card** `8:5` and its parts `44:494`, `44:499`, `78:817`, `44:501` (Cards page). 158 uses on the cover alone, used on 40+ pages.
- **Button** `8:3`, **Icon button** `21:126`, **Toolbar** `118:423` (Buttons & toolbars).
- **Icon** `301:8248` (Icons page): 324 on the cover, 562 on the Cut list, 100+ on most pages.
- **Pill** `185:9309` and Pill Set, **Icon item** set.
- **Kicker** `48:598` (Text page): 40+ uses on Cards, Overlays, Lists, Navigation, Bars, Buttons and the Cut list.
- **Section** `48:601`, **Section label** `175:12079`, **Masonry** `99:624` (Layouts page).
- **Page · 1920** `67:88`, a variant of **Page Set** `386:12086` on Page Builder: used on nearly every page.
- **Image** `56:944`, **Avatar** `56:969`, **Person** `234:8827` (Images page).
- Input family (`70:87`, `70:89`, `70:92`, `70:94`, `70:96`, Search field, Form field, Slider), **List row** `126:423`, **Divider** `126:436`, **Tile** `126:442`, the Nav family, and the **Token sample** `500:10619` and **Token cell** `500:10621` (used by the three ↳ token pages).

## Pages whose masters are used by a lab page (flag)

| Page | Master | Used on | What to do |
|---|---|---|---|
| Grids | Demo card Set `477:44754` | Grids & sizes (250 / 75 / 75), Live responsive previews (126), Cut list | Move Demo card Set to Layouts before anything leaves |
| Grids & sizes | Dashboard tile `496:10826`, Size card `496:18916` | Live responsive previews (30), Cut list (12) | Keep with the Layouts merge |
| Labels | Class label `442:11254`, Mode label `442:11256`, Label note `442:11261` | Live (12 / 7 / 2), 400 · Mobile (8 / 8) | Keep in the library (small, shared) |
| Flow | Box `403:18272`, Arrow `406:12016`, Step `408:12549` | Live (Box 29, Step 11, Arrow 3 variants) | Flow and Live move together, same paste |
| Flow | needs the old Step `382:26291` | which sits on the Cut list | Do not archive the Cut list until Flow leaves |
| Walkthroughs | .Lesson `270:8059`, .Step `270:8037`, .Tag `189:977` | Component notes (4 / 12 / 1), Live (12 Lesson/Step) | Walkthroughs, Component notes and Live move together |
| Workspace | Workspace `388:11171` | AI-driven approval workflows (1) | Move together |
| Devices | Device `391:11130` | AI-driven approval workflows (2) | Move together |
| Page Builder | Page Set `386:12086` (also variant `386:12071`) | everywhere / approval workflows | Stays in the library |
| 1600 Sections | Hero `92:1729`, Three cards `65:181`, Split `65:292`, Stats `68:172`, Gallery `68:243`, CTA `68:236`, others | Scale (5 each), Pages (up to 11 each), Live | Stays in the library (content masters) |
| UI Kit | `.UI Kit Preview` `326:20501` | the cover (2) | Delete or re-point the cover's copy first |
| Every `.X Preview` | one preview master per page | the cover (1 each) | They are wrappers for the cover; they go with their page |

## Every page: nodes, masters, use on other pages, purpose

"Used elsewhere" counts instances on other pages. "None" means no other page uses any master on it (measured). Counts marked ~ are summed from the audit and rounded.

| # | Page (id) | Top nodes | Masters on it | Used elsewhere | What it is for |
|---|---|---|---|---|---|
| 0 | Lew42 Design System (56:866) | 1 | 0 | none | The cover: the approved set, 1,405 instances of masters from the pages below |
| 1 | Live (445:111) | 1 | 1 (Grid `462:13254`) | none | A live-view test page; heavy user of Flow, Labels, Walkthroughs and Card masters |
| 2 | Start here (444:25313) | 1 | 0 | none | Index of eight cards linking to pages |
| 3 | UI Kit (323:7648) | 1 | 1 (.UI Kit Preview) | 2 (cover) | One card in four schemes; the kit demo |
| 4 | Tokens (206:564) | 4 | 3 (Tokens Preview, Token sample, Token cell) | ~112 (↳ pages) + 1 cover | Variable collections overview and the two sample masters |
| 5 | ↳ Colors (203:564) | 3 | 1 (Colors Preview) | 1 (cover) | The Colors collection, one mode |
| 6 | ↳ Scheme (501:10356) | 1 | 0 | none | Scheme tokens at White, Light gray, Prime, Dark |
| 7 | ↳ Scale (503:10356) | 1 | 0 | none | Scale tokens at seven widths |
| 8 | ↳ Themes (173:563) | 2 | 1 (Themes Preview) | 1 (cover) | The Theme collection demo |
| 9 | Text (170:563) | 5 | 3 (Kicker, .Text Preview, .Quote) | ~190 (Kicker) | Type scale, code style, Kicker |
| 10 | Text layouts (446:107) | 2 | 0 | none | Text layout variants at four widths (a leaf) |
| 11 | Page Builder (225:612) | 5 | 6 (Page Set with 4 variants, .Page Builder Preview) | ~600 (Page · 1920) | The Page · 1920 master and its set |
| 12 | 1600 Sections (208:10803) | 9 | 29 (`.1600 · …` blocks + preview) | ~60 (Scale, Pages, Live) | Heroes, text, cards, media, proof, footers: content blocks |
| 13 | Icons (156:975) | 13 | ~95 (Icon, Icon item set, ~90 glyphs) | ~2,000 | The icon system |
| 14 | Pills (210:14169) | 4 | 3 (Pill, Pill Set, preview) | ~300 | Pill sizes, roles, chip behaviour |
| 15 | Scale (185:10073) | 7 | 1 (.Scale Preview) | 1 (cover) | One page at five widths (400 to 3440) |
| 16 | Labels (442:11253) | 4 | 3 (Class label, Mode label, Label note) | ~37 (Live, 400 · Mobile) | Labels that name classes and modes |
| 17 | Images (56:870) | 9 | 6 (Image, Avatar, Person, Image card Set, base, preview) | ~900 | Image, avatars, image cards, overlays |
| 18 | Inputs (130:412) | 11 | 9 (Input, Select, Text area, Toggle, Checkbox, Search, Form field, Slider, preview) | ~150 | Form controls |
| 19 | Cards (56:868) | 16 | 6 (Card, header, media, body, footer, preview) | ~2,000 | The Card master and parts |
| 20 | Cards · Buttons & toolbars (118:412) | 5 | 4 (Button, Icon button, Toolbar, preview) | ~1,800 | Buttons, icon buttons, toolbars |
| 21 | Cards · Bars (159:507) | 3 | 2 (.Bar, preview) | ~50 (Cut list) | The Bar (three zones) |
| 22 | Cards · Lists & grids (126:412) | 6 | 4 (List row, Divider, Tile, preview) | ~400 | Rows, dividers, tiles |
| 23 | Cards · Navigation (134:416) | 8 | 7 (Nav item, Bottom nav, Tab, Tabs, Segment, Segmented, preview) | ~200 (Apps, Overlays, LRP) | Navigation parts |
| 24 | Cards · Overlays (136:412) | 9 | 7 (Screen, Sheet, Toast, Menu item, Menu, Keyboard, preview) | ~100 (Apps) | Phone-screen overlays |
| 25 | Cards · Domain cards (145:412) | 3 | 1 (preview) | none | Nine example cards in a masonry |
| 26 | Panels (170:569) | 6 | 3 (Panel `153:1779`, Panel `478:49352`, preview) | ~30 | Panel (card with zero padding) |
| 27 | Layouts (56:869) | 7 | 6 (Section, Section label, Wrap row, Masonry, Responsive test, preview) | ~500 | Section, Masonry and layout helpers |
| 28 | Grids (464:10330) | 3 | 1 (Demo card Set, 3 variants) | ~400 (Grids & sizes, LRP, Cut list) | Grid rules and the Demo card Set |
| 29 | Grids & sizes (443:11642) | 4 | 3 (Dashboard tile, Size card, Size · Default) | ~42 (LRP, Cut list) | Card sizes by Scale mode, grids by width |
| 30 | Live responsive previews (511:10359) | 7 | 4 (Preview · Master, Nav Set, Grid Set, Mini layout) | none | One master at eight widths (a test) |
| 31 | Explore · Masonry (336:7485) | 1 | 1 (preview) | none | Masonry board explorations (leaf) |
| 32 | Pages (62:933) | 9 | 8 (Page builder 1920 master, templates, preview) | none | The old page builder and drop templates; 765 instances |
| 33 | Apps · Tasks (140:412) | 5 | 1 (preview) | none | A tasks app, three prototype screens |
| 34 | Apps · Chat (141:412) | 5 | 1 (preview) | none | A chat app, three prototype screens |
| 35 | Apps · Editor (142:412) | 5 | 1 (preview) | none | An editor app, three prototype screens |
| 36 | Cut list (328:6979) | 130 | 191 (backups) | Flow uses 5 (old Step) | Backups of old versions |
| 37 | Walkthroughs (189:933) | 10 | 8 (.Lesson, .Step, .Drop zone, .Toolbox, .Tag set, .Card, .Note) | ~30 (Component notes, Live) | The how-to lessons |
| 38 | Claude · Sandbox (12:60) | 0 | 0 | none | Empty page |
| 39 | Component notes (267:7637) | 10 | 9 (Swatch, DemoTag, Row demos) | none | Demos 1-4 on sets, properties, rebasing |
| 40 | Flow (382:26220) | 30 | 8 (Flow, Branch, Arrow, Step, Fork piece, Path, Box) | ~420 (Live 50, Cut list ~370) | The flowchart kit |
| 41 | AI-driven approval workflows (382:26221) | 2 | 0 | none | One mobile flow, one workspace |
| 42 | Docs (387:11158) | 3 | 0 | none | Notes: library prune, masters and Fill |
| 43 | Workspace (388:11170) | 5 | 1 (Workspace) | 1 (approval workflows) | The workspace template |
| 44 | Devices (391:11126) | 5 | 1 (Device) | 2 (approval workflows) | A device frame |
| 45 | 400 · Mobile (439:11642) | 1 | 0 | none | Resolution test at 400 |
| 46 | 1000 · Default (441:11642) | 1 | 0 | none | Resolution test at 1000 |
| 47 | 1920 · Desktop (441:11948) | 1 | 0 | none | Resolution test at 1920 |
| 48 | 3440 · Mega (441:12321) | 1 | 0 | none | Resolution test at 3440 |
| 49 | Card strategy (477:44553) | 17 | 5 (A, B, C, D test masters) | none | The four-way test of how to make a new card |

## Duplicates between a page's Preview and its body (read-only, 2026-11-13)

**The pattern, found on every page that has a Preview:** the `.X Preview` master is not a short sample. It holds a loose copy of the page's own sections (same names, same sizes), so every section exists twice and an edit to one leaves the other stale. The preview's copy is a pasted frame, not an instance of the body's. Method: for each page, names and rounded sizes of every frame, instance and component at least 150 × 60 in the Preview, matched against the body beside it. "Shared" is how many of the preview's distinct (name, size) pairs also exist in the body.

**Which copy goes, as a rule:** the body copy is the real one (the masters and the owner's edits live there). The preview should be at most the three best items, placed as instances of the body's cards, never a pasted section. So the **preview copy goes** (or shrinks to three instances) on every page below. The exception is Overlays, where it is the body that looks thin (see its row).

| Page | Preview | Shared / preview total | What is duplicated | Keep / go |
|---|---|---|---|---|
| Tokens (206:564) | Tokens Preview (232:994) | 39 of 39 (all of it) | the whole Collections section (1600 × 641), the same 9 collection cards (Colors, Scheme, Theme, Scale, Button, Selection, Bar, 388 wide) and every Pill row | Go: the preview copy. Make the preview three collection cards as instances, or one instance of the body section. (The body still lists Theme; it was merged into Scheme.) |
| Colors (203:564) | Colors Preview | 6 of 9 | `.Section` 1600 × 543, "Scheme modes" 1600 × 419 and the four Scheme cards (White, Light gray, Prime, Dark) | Go: preview copy; keep the body, show two schemes as instances |
| Scheme (501:10356), Scale (503:10356) | none | none | no preview | none |
| Themes (173:563) | Themes Preview | 0 of 3 | none (no body besides the preview) | none; page is the old Theme demos, on the Cut list path anyway |
| Text (170:563) | .Text Preview | 13 of 16 | `.Section` 1600 × 729, Styles 1600 × 634, Card · Styles, Card · Article, Card · Hero (512 × 634), List | Go: preview copy; show the Hero card only |
| Page Builder (225:612) | .Page Builder Preview | 15 of 19 | Card · Travel, Card · Sign in, Card · Settings, Card body, Image (516 wide), Header | Go: preview copy |
| 1600 Sections (208:10803) | .1600 Sections Preview | 31 of 34 | `.1600 · Masonry three`, `.Masonry`, Hero with image, Four features, Testimonial, Footer (all 1600 wide) | Go: preview copy; the sections are the page's content, so the preview shows three as instances |
| Icons (156:975) | Icons Preview | 26 of 31 | `.Section` 1600 × 502, "Core icons" 1600 × 407, and the icon tiles menu, close, search, add (186 × 125) | Go: preview copy |
| Pills (210:14169) | Pills (column) holds one preview | 1 of 10 | only the "Sizes" row (1600 × 69) | Go: the preview's Sizes row; it is the one repeated item |
| Scale (185:10073) | .Scale Preview | 23 of 32 | Step · LG and Step · Default (1600), Scale = LG and Scale = Default | Go: preview copy |
| Labels (442:11253) | none | none | no preview frame on the page | none |
| Images (56:870) | Images (column) holds one preview | 7 of 20 | Shapes 1600 × 332, Wide 1011 × 332, Image, Square | Go: preview copy |
| Inputs (130:412) | Inputs Preview | 21 of 22 | `.Section` (1600 × 830, 1600 × 338), `.Masonry`, Kit, Card · Sign in, Newsletter, Feedback, Settings | Go: preview copy |
| Cards (56:868) | Cards (column) holds one preview | 14 of 19 | Cards 768 × 573 and 768 × 505, Card · Product, Card · Sign in | Go: preview copy |
| Buttons & toolbars (118:412) | preview in the column | 11 of 12 | `.Section` 1600 × 690, "Made from them" 1600 × 444, Kit, Card · Buttons | Go: preview copy |
| Bars (159:507) | preview in the column | 0 of 9 | none found (the preview shows different content) | none |
| Lists & grids (126:412) | preview in the column | 10 of 11 | `.Section` 1600 × 530, "Made from them", Kit, Card | Go: preview copy |
| Navigation (134:416) | preview in the column | 13 of 14 | `.Section` 1600 × 607, "Made from them", Card, Kit | Go: preview copy |
| Overlays (136:412) | preview in the column | 4 of 32 | `.Screen` 400 × 860, Menu, `.Bottom nav`, Spacer | Go: these four from the preview; the rest is its own |
| Domain cards (145:412) | .Domain cards Preview | 34 of 35 | `.Section` 1600 × 1746, "Masonry · 3 @ 1600", Card · Product, Card · Music player | Go: preview copy |
| Panels (170:569) | preview in the column | 15 of 16 | `.Section` 1600 × 704, `.Masonry`, Card · Trip, Card · Photos | Go: preview copy |
| Layouts (56:869) | preview in the column | 3 of 21 | `.Wrap row` 1600 × 416, Card, Text | Go: those three from the preview |
| Grids (464:10330), Grids & sizes (443:11642) | none | none | no preview frame on the page | none |
| Explore · Masonry (336:7485) | .Masonry boards Preview is the whole page | not compared | the page holds only its preview | none |
| Pages (62:933) | .Pages Preview | not compared | the preview sits beside the same templates | check by hand |

**Not checked** (no preview frame found by name, or not compared): UI Kit (the page is only its preview, so nothing to duplicate), Apps · Tasks, Chat and Editor, Component notes, Live, Start here, Text layouts, Walkthroughs, Flow, Docs, Devices, the four resolution pages, Card strategy.

**Fix as one pass (not done, read-only):** open each page's Preview, delete the pasted sections, and put in three instances of the body's own cards. The preview then updates when the body does. About 20 pages, each a minute or two; Tokens first, since the owner named it.

## The proposal

### LIBRARY (stays, publishable): 13 pages plus the token group

| Page | Action | Reason |
|---|---|---|
| Lew42 Design System | Keep, first | The cover and approved set. Drop the `.X Preview` wrappers when their pages go |
| Tokens + ↳ Colors, Scheme, Scale, Themes | Keep as a group | Token cell and Token sample are used by the three ↳ pages |
| Text | Keep | Kicker is used on 40+ pages |
| Icons | Keep | Icon is used on every page |
| **Elements** (new, merge) | Pills + Inputs + Buttons & toolbars | Small masters, used everywhere, one place to look |
| Images | Keep | Image, Avatar, Person are used widely |
| **Containers** (new, merge) | Cards + Panels + Lists & grids + Bars + Navigation + Overlays | All are "a box that holds things". See the merge note below |
| Layouts | Merge Grids and Grids & sizes into it | Section, Masonry, Demo card Set and the size masters are layout tools |
| 1600 Sections | Keep | Content masters used by Pages, Scale and Live |
| Page Builder | Keep, merge the old Pages templates in | Page · 1920 is used on every page |
| Labels | Keep (last, small) | Used by Live and 400 · Mobile; one more Lab page depends on it |
| Start here | Keep, rewrite the links | It is the index; point cards at the library pages only |

### MERGE (scripted, inside the file, safe)

| Pages | Into | Reason |
|---|---|---|
| Pills, Inputs, Cards · Buttons & toolbars | Elements | Small parts, one master each |
| Cards, Panels, Cards · Lists & grids, Cards · Bars, Cards · Navigation, Cards · Overlays | Containers | Same family; the `Cards ·` naming is a leftover |
| Grids, Grids & sizes | Layouts | Demo card Set and Dashboard tile are layout masters |
| Pages | Page Builder | Same system, older version |
| 400, 1000, 1920, 3440 resolution pages | One page "Resolution pages" in the Lab | Built by one generator, four frames of one idea |
| Apps · Tasks, Chat, Editor | One page "Apps" until each gets a file | Same prototype kit |

Merge note: moving a master with `appendChild` keeps instances linked, but the page you merge into gets long. Use sections (`Section · Pills`, …) as a divider, and keep the `Page · 1920` frame where it is, because the Preview rule says each page has its own `Page · 1920` at (0,0). That means one merged page holds several `Page · 1920` frames, side by side; check this with the owner before running it.

### MOVE to "Lew42 Lab" (manual paste)

| Page | Action | Reason, and what must move first |
|---|---|---|
| Live | Move with Flow, Walkthroughs, Labels use | Depends on Box, Arrow, Step, Lesson, Labels; keep Labels in the library and paste Live after the library is published |
| Flow | Move with Live | Its Box/Arrow/Step are used by Live. It also uses the old Step on the Cut list, so paste that backup too |
| Walkthroughs, Component notes | Move together | Component notes uses Lesson, Step, Tag from Walkthroughs |
| Card strategy | Move | Leaf; only needs Button from the library |
| Explore · Masonry | Move | Leaf |
| Live responsive previews | Move | Leaf, but it needs Demo card Set (Layouts), Dashboard tile, Nav Tab: all stay in the library |
| Resolution pages (4, merged) | Move | Leaf, no masters |
| Text layouts | Move first | Best test: leaf, no masters, 119 library instances |
| Scale (185:10073), UI Kit, Cards · Domain cards | Move | Showcase pages; their preview masters are only wrappers for the cover |
| AI-driven approval workflows, Workspace, Devices | Move together | The Workspace and Device masters are used by approval workflows |
| Docs | Move | Notes, no masters |
| Claude · Sandbox | Delete (empty) | Zero nodes. This is destructive, so the owner clicks it |

### APPS (own files)

| Page | Action | Reason |
|---|---|---|
| Apps · Tasks, Chat, Editor | One file each (`Lew42 Apps · Tasks`, …) | No other page uses them. They use ~100-160 Icons and Cards each, so paste only after the library is published and enabled |

### ARCHIVE

| Page | Action | Reason |
|---|---|---|
| Cut list | Move last, as a file `Lew42 Archive` | 130 nodes, 191 masters, 3,063 instances of old backups. Only Flow (5 uses of the old Step) depends on it, so it goes after Flow has moved |

## Suggested library page order

1. Lew42 Design System (cover)
2. Start here
3. Tokens, then ↳ Colors, ↳ Scheme, ↳ Scale, ↳ Themes
4. Text
5. Icons
6. Elements
7. Images
8. Containers
9. Layouts (with Grids and sizes)
10. 1600 Sections
11. Page Builder (with Pages)
12. Labels

The order goes from foundations (tokens, type, icons) to small parts, to boxes, to layout, to whole pages. A reader builds up in the same order a page is built.

## How to move a page by copy and paste (manual, 5 steps)

1. In the library file, publish it (Assets, Libraries, Publish), then open the Lab file and turn the library on (Assets, Libraries, Lew42 Design System).
2. In the library file, open the page, select all (Ctrl+A on the canvas), copy. Include the masters on the canvas root (left of x 0), because they are separate nodes.
3. In the Lab file, add a page with the same name, paste with Ctrl+Shift+V (paste in place) so positions hold.
4. Check one instance: its "main component" should read as the library's, not "local". If it says local, undo, and move the page's masters to the library first.
5. When the pasted page looks right (screenshot at 1920), delete the original page in the library. Do not delete first.

## Open questions for the owner

- Do you want the merged pages to hold several `Page · 1920` frames, or one page per topic?
- Is Labels a library page (proposed, because two lab pages use it) or Lab-only?
- The empty Sandbox page: delete it?
