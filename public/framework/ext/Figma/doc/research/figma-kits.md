# How Figma's own UI kits are organized (research, 2026-11-17)

Answers question G of [the brief](../brief-2026-11-17.md). The owner's words are in [section 2](../owner-words-2026-11-17.md#2-other-ui-kits-properties-vs-variants-color-tokens-previews). Nothing in any Figma file was edited. **V** means verified (read from the library search or the kit's source repo), **R** means reported by a secondary source, and **?** means not confirmed.

## The answer

**Every kit sorts by element type, not by size.** Each has one page per component family (Buttons, Cards, Inputs, Navigation, Sections…), with a few pages for foundations and examples. Size only shows up in three narrow places:

1. **A separate component per device or window class, only for page chrome.** Examples: M3's Navigation bar, Navigation Rail and Navigation Drawer, or iOS's `Toolbar - Bottom - iPhone`. **V**
2. **One small "Responsive" variable collection.** SDS has `Responsive / Root Font Size` next to its `Typography` and `Size` collections. This is our Scale, kept much smaller. **V** (its modes **?**)
3. **A handful of full-screen Examples**, such as M3's `Examples/Home-Web` and `Examples/Gallery-Web`. M3 describes these as "Layout template with app bar and navigation regions". **V**

Cards and sections are drawn **once, at one width**, and they fill whatever holds them. In SDS's own words, from the `Card` description: "The cards have a fixed width of 440 in the component set, but when placed in designs their auto layout and width settings should be defined by their parent. Use 'fill'". **V**

**Recommendation for Lew42 v2:**
- Make the kit's pages type pages (Elements, Text, Icons, Cards, Sections, Layouts), plus one Examples page.
- The size pages stop being where things live. Keep a single "Layouts at widths" page that previews only the layout masters at 400, 1000, 1920 and 3440. That page is the only place the owner's "preview at several widths" rule applies, and it matches decision 5 of the brief.

## What is attached to the Claude November 2026 file

`get_libraries` on `woCZQDoXKJW3GcJPZukW7f` finds only **one** library added to the file: **Big Sloppy Design System** (team). The kits the owner saw are Figma's built-in suggestions, listed under "available to add". They are not subscribed. They are Material 3 Design Kit, Simple Design System, iOS and iPadOS 26 and 27, macOS 26 and 27, watchOS 26 and visionOS 26. **V**

None of their source files can be read through the MCP. Figma's SDS source file (`J0KLPKXiONDRssXD1AX9Oi`, from [figma.config.json](https://github.com/figma/sds/blob/main/figma.config.json)) returns "could not access", and the Community pages return 403. So page lists come from the SDS repo, and naming comes from `search_design_system`.

## Kit by kit

### Simple Design System (Figma's own web kit)

| | |
|---|---|
| Pages | **18 pages, one per family** (from the Code Connect page keys, **V**): Icons, Accordion, Avatars, Buttons, Cards, Dialog, Forms, Inputs, Menu, Navigation, Notification, Pagination, **Sections**, Tabs, Tags, **Text**, Tooltip. Figma's page also mentions Examples ("full screen mockups", **R**). |
| Grouping | By type. Code splits it into **primitives** ("can't be reduced further") and **compositions** ("example arrangements… to build a responsive website"). Layout components exist only in code: they "do not have analogous component in Figma". **V** |
| Naming | Flat, plain words, no slashes: `Button`, `Button Danger`, `Icon Button`, `Hero Basic`, `Hero Image`, `Card Grid Pricing`, `Panel Image Content Reverse`, `Page Newsletter`. Slot versions have a suffix: `Card (Slot)`, `Hero (Slot)`. **V** |
| Count | "400+ components" (**R**, Figma). The Sections page holds 22 of them (heroes, card grids, panels, headers, footer, pages). **V** |
| Responsive | Sections are component sets (**V**), likely with a Desktop/Mobile variant (**?**). Cards fill their parent. Type size comes from a `Responsive` collection. Variables: `Size / Space/050…4000` (gap-scoped, with negatives), `Typography / Heading/Size Small/Base/Large`. **V** |

### Material 3 Design Kit (Google)

| | |
|---|---|
| Pages | Getting started (cover and links), Styles, then the components (**R**). The exact page list could not be read. |
| Grouping | By type, with hidden sub-parts kept under `Building Blocks/…` (e.g. `Building Blocks/Navigation rail/Vertical nav item`). These are "hidden on most components, but can be revealed" (**R**). Platform forks get a prefix folder: `XR/XR Navigation Rail`. Full screens live in `Examples/…-Web`. **V** |
| Naming | `Component - style`: `Button`, `Button - outline`, `Button - tonal`, `Button - elevated`, `Icon button - standard`, `Toggle button - outline`. **One component set per colour style**, and sizes are variants inside it (XS–XL, round/square). **V** |
| Count | 28 UI components, 169 Figma components, **1,984 variants**, 429 styles (**R**, M3 blog, first release). This is the "grid of 300 buttons" the owner dislikes. |
| Responsive | A **different component per breakpoint**, not a resized one: Navigation bar for compact, Rail for medium, Rail Expanded or Drawer for large. Each description says which screen it is for. Layouts adapt across compact, medium, expanded, large and extra-large breakpoints (**R**, m3.material.io). Colour uses one `M3` collection of light and dark modes with **five surface levels as separate tokens**: `Schemes/Surface Container Lowest, Low, (default), High, Highest`. **V** |

### iOS and iPadOS 26 (Apple)

| | |
|---|---|
| Pages | Controls and views, templates, text styles, colour styles, materials, layout guides (**R**, Apple / Design Compass). The page list could not be read. |
| Grouping | By type (bars, views, controls). |
| Naming | Hyphen paths inside the name, not slashes: `Button - Liquid Glass - Text`, `Button - Liquid Glass - Symbol`, `Row - Button`, `Sidebar Row`, `Sidebar Search Field`. **The device is part of the name** when it changes the layout: `Toolbar - Bottom - iPhone`. **V** |
| Count | ? |
| Responsive | Separate components for iPhone and iPad chrome. Content rows (`Row - Button`) are one component that fills its width. **V** |

### macOS 26 (Apple)

| | |
|---|---|
| Grouping, naming | By type, with **one slash folder for context**: `Window/Button`, `Window/Segmented Control`, `Window/Pop-Up Button`, next to plain `Push Button`, `Radio Button`, `Pulldown with Menu`. **V** |
| Responsive | Not applicable: windows are resized, so layouts fill. |

watchOS, visionOS and the version-27 kits follow Apple's same pattern (**?**, not searched, to stay inside the budget).

## Patterns worth copying

- **Type pages, not size pages.** Atoms are previewed once, and only layout gets previews at several widths, which matches decisions 4 and 5 of the brief.
- **Draw a master at one width, and let its parent set the width.** Put the rule in the master's description, as SDS does. This is our rule 8 (Fill, min `card-min`).
- **A "Sections" page of ready blocks named by what they show** (`Hero Image`, `Card Grid Pricing`, `Panel Image Content Reverse`). This is the drag-in library the owner described: grab a three-card section and drop it into a dark band.
- **Slot versions as their own named master**, like `Card (Slot)`. We already have `Card · Slot`.
- **Swap the component, not the size, when the layout really changes.** Nav bar, rail and drawer are three masters. Our `Layout.Sidebar` vs `Layout.Miller.Mobile` already follows this.
- **Hide the parts.** M3's `Building Blocks/` folder keeps sub-parts out of the main list. For us, that would be the `.` prefix (hidden from publishing).
- **A few full-screen Examples** as the proof that the system works. That is our Showcase.
- **Write descriptions that say when to use something.** M3 and SDS put usage rules in each component's description, so they show in the Assets panel.

## Patterns to avoid

- **M3's variant explosion** (1,984 variants; a component set per colour × 5 sizes × 2 shapes). We use Scheme modes for colour, so a colour is never a variant (rules 4 and 6).
- **Device names in every component** (Apple). Keep them only where the chrome really differs.
- **Many surface tokens in place of modes** (M3's five `Surface Container` levels). They solve contrast with more tokens, and "Refine, don't accumulate" says the opposite. If we ever need a card colour that differs from the section, add **one** `surface` token beside `fill`, not five. The open question is in the brief (section on colour).
- **Mixing separators.** The kits use `-`, `/` and `( )` all at once. Keep our single rule: plain names, no size in names (rule 7).

## Sources

- `get_libraries` and `search_design_system` on file `woCZQDoXKJW3GcJPZukW7f`, session `de9c8d6a-1e3b-42a4-8806-b18116bade08` (9 Figma calls, no edits).
- SDS: [repo](https://github.com/figma/sds), [figma.config.json](https://github.com/figma/sds/blob/main/figma.config.json) (page keys), [Community](https://www.figma.com/community/file/1380235722331273046/simple-design-system).
- M3: [Community](https://www.figma.com/community/file/1035203688168086460/material-3-design-kit), [blog (mirror)](https://github.com/Glavo/md3-reference-hub/blob/main/docs/blog/material-3-figma-design-kit.md), [layout](https://m3.material.io/foundations/layout/layout-overview).
- Apple: [iOS and iPadOS 26 Community](https://www.figma.com/community/file/1527721578857867021/ios-and-ipados-26), [Design Compass](https://designcompass.org/en/2025/07/21/apple-ios26-design-kit/).
- **To check next:** the exact page lists and SDS's `Platform` variant. Both need a duplicated copy of the kit in the owner's drafts (Community → Get a copy), then `get_metadata` on it. That is one click for the owner and about 6 Figma calls.
