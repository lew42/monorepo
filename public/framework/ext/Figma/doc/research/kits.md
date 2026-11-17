# How real Figma kits organize their files (research, 2026-11-17)

Answers brief questions **A** (organization, swapping) and **F** (previews) in [brief-2026-11-17.md](../brief-2026-11-17.md). It is research only: nothing in Figma was changed. **[V]** means seen in a source or in the library itself (read through the Figma MCP from the Claude November 2026 file). **[R]** means reported second-hand and not checked.

## Conclusion

1. **Every kit organizes by type, none by width.** The pages are Foundations, then atoms (Buttons, Inputs…), then Cards, then *Sections*, then Examples or Templates. Sections are just one more type. Width is a **property of a section**, never a page.
2. **Kits use 2 or 3 widths, 5 at most.** The common sets are Desktop + Mobile (SDS, Relume, Untitled UI) or Desktop + Tablet + Mobile (shadcn, Flowbite). Only Carbon has 5. Atoms never get per-width versions. Only sections and screens do.
3. **There are three ways to switch width.** (a) A `Platform` or `Breakpoint` **variant** on each section. This is the most common. (b) A **separate component** when the structure really changes (M3: Navigation bar on phones, Navigation rail on larger screens). (c) **Variable modes** (Once UI), which is what our Scale does.
4. **Swapping:** native swap of nested instances is the default. Instance-swap properties are kept for icons. Slots (2026) are for flexible content regions; Figma's own kit added `Card (Slot)` and `Hero (Slot)` next to the old versions. Detaching is what slots replace.
5. **The variants they list are states and types, not grids of combinations.** M3 has about 12 variants per component. Previews show Desktop beside Mobile, and light beside dark. Nobody shows every width × every scheme.

## The kits

| Kit | Pages by | Responsive | Swap | Variants |
|---|---|---|---|---|
| **Simple Design System** (Figma) | Element type: Buttons, Inputs, Cards, Text, Navigation… plus one **Sections** group of 22 (Hero, Card Grid, Panel, Page, Header, Footer) [V] | 2 widths: `Platform = Desktop \| Mobile` variant on 13 section sets, none on atoms [V]. Card is 440 wide in its set and is set to "fill" by its parent [V] | Nested instances; instance swap only for icons (10 of 96 mappings); `Card (Slot)` and `Hero (Slot)` added 2026-03 [V] | 400+ components [V] |
| **Material 3 Design Kit** | By component; slash folders for parts: `Building Blocks/…`, `Examples/…-Web`, `XR/…` [V] | By window size class. A **separate component** where structure differs (Nav bar "for Compact", Horizontal-items bar "for Medium", Rail for large) [V]; a small `Mobile \| Tablet` variant on Carousel [V] | "Select the individual item and edit its variant properties", i.e. nested building blocks [V] | 169 components, 1,984 variants (~12 each) [V] |
| **Apple iOS/iPadOS 26–27** | By component; device templates in slash folders (`iPhone Duo/Standard/Inner - Portrait`) [V] | The device is in the name: `Tab Bar - iPhone`, `Tab Bar - iPad`, i.e. separate components [V] | Nested instances [R] | not counted |
| **Untitled UI** | Components by type, plus marketing-section categories and 420+ page examples [V] | Each example is 1440 desktop with "a designed 375px mobile version **beside** it, in light and dark" [V]; property name `Breakpoint=Desktop` [R] | A `Type` property for layout families; variant swap per tab [V] | 10,000+ components and variants [V] |
| **Relume** | Website sections only, by category [R] | 1,000+ sections, each with a mobile variant: "swap the breakpoint variant and watch your content shift into place" [V] | Copy and paste sections, then swap the variant [V] | Desktop + Mobile only [V] |
| **shadcn/ui kit** (shadcndesign) | Foundation pages (Overview, Style, Color, Typography, Radius, Shadow, Spacing, Controls, Icons, Brand), 62 components, 437 blocks in 60 categories [V] | 1280 / 768 / 390 [V] (the Figma mechanism is not stated) | not stated | 2,000+ components [V] |
| **Flowbite** | Components by type plus 27 example pages [V] | Example pages drawn for mobile, tablet and desktop [V] | not stated | "variants" [V] |
| **Carbon (IBM)** | Separate library *files*: components, type, colour, icons, pictograms [V] | 5 breakpoints (sm/md/lg/xlg/max) via a `Breakpoint` property on Screens [R] | not stated | not counted |
| **Once UI** | not found | Breakpoints as **variable modes** Desktop/Tablet/Mobile (1024+, 560–1024, 375–560) [R] | Deep nesting [R] | few |
| **Polaris / Tailwind Plus** | Polaris: split into files (Components, Colors, Icons, Type), with a small-screen variant toggle [R]. Tailwind Plus stopped its Figma file in 2021 [R] | | | |

Figma's own rule [V]: **instance swap** is for rigid parts where one nested thing changes (an icon). **Slots** are for flexible regions inside fixed padding, radius and shadow (cards, modals, page sections). **Variants** are for states and types, "not a workaround for slots." Figma Sites can pick a variant whose name matches the breakpoint, but only in Sites [V].

## Common pattern, and why

- **By type, because the Assets panel and the swap menu are organized by page and folder.** A designer looks for "a card" or "a hero", never "a 1600 thing". Grouping by type keeps the near-alternatives together in the swap menu: every hero sits beside every other hero.
- **Width is a property, because the content is the same at every width.** The section is one thing whose layout changes. A `Platform` variant (or a mode) keeps the text overrides when you switch, which separate pages can't do.
- **A separate component only when the structure changes,** for example a bottom bar on phones and a side rail on tablets. Those parts have different jobs, so they get different names, not one variant.
- **Few widths, because each width is a full redraw** of every section. 2 or 3 widths cover what real screens need, and the browser handles everything in between.

## What this means for Lew42 v2

**Recommendation: stop using size as the page axis. Use one Layouts page, organized by type, with a 3-width preview for layouts only.**

1. **Pages by type.** Index, Scale/Colors/Text/Icons (foundations), Elements (atoms), Cards, Layouts (sections, containers, page shell), Templates. Our Scale modes already play the role of Once UI's breakpoint modes, so we need no `Platform` variant (rule 6 holds).
2. **Fold the 8 size pages into Layouts.** Each layout is one responsive master (wrap + Fill + min `card-min`, per [scale-space.md](../scale-space.md)). Layouts whose structure only exists at one width become separately named masters, the way M3 does it: `App bar` (phone), `Rail + main`, `Sidebar + main`. Use the name, not a size page.
3. **Per-width previews for layouts only:** Mobile 400, Default 1000 and Desktop 1920 (1600 content) side by side, the way Untitled UI puts mobile beside desktop. Mega 3440 gets one preview of the page shell, nothing else. Atoms and Cards get none (as rule 13 already says).
4. **Scheme previews once, not per width:** one Card and one Section band in each Scheme, on the Colors page. Kits show light and dark, never every scheme at every width.
5. **8 Scale modes are too many to preview.** They can stay as tokens, since a mode costs nothing until it is drawn. Draw only 3.

**Alternative:** keep size pages, but 4 tiers (Mobile, Default, Desktop, Mega; [study-sizes.md](../study-sizes.md)). The case for it is that the swap menu then only offers parts built for that width ([org-scheme.md](../org-scheme.md), 11 of 12 votes). No kit we looked at does this. They get the same effect from names and folders, and the cost is the same master shown on several pages. Choose it only if a type-organized swap menu turns out to be confusing in practice (one test: swap a Layouts-page section in a 1920 frame).

## Sources

- Figma: [slots vs instance swap vs variants](https://help.figma.com/hc/en-us/articles/38741465279895-The-difference-between-slots-instance-swaps-and-variants) · [slots blog](https://www.figma.com/blog/supercharge-your-design-system-with-slots/) · [responsive components (Sites)](https://help.figma.com/hc/en-us/articles/31242826664983-Create-a-responsive-component-that-automatically-adapts-to-each-breakpoint) · [SDS repo](https://github.com/figma/sds) (`src/figma/compositions/*.figma.ts`, `figma.config.json`) · [SDS Community file](https://www.figma.com/community/file/1380235722331273046/simple-design-system)
- Library reads (Figma MCP `search_design_system`, 2026-11-17): Simple Design System, Material 3 Design Kit, iOS and iPadOS 27
- [M3 kit counts](https://github.com/Glavo/md3-reference-hub/blob/main/docs/blog/material-3-figma-design-kit.md) · [Apple iOS 26 kit](https://www.figma.com/community/file/1527721578857867021/ios-and-ipados-26)
- [Untitled UI feature sections](https://www.untitledui.com/components/features-sections) · [Untitled UI kit list (2026)](https://www.untitledui.com/blog/figma-ui-kits) · [Relume Figma library](https://www.relume.ai/figma-library) · [shadcndesign llms-full](https://www.shadcndesign.com/llms-full.txt) · [Flowbite Figma](https://github.com/themesberg/tailwind-figma-ui-kit) · [Carbon Figma kits](https://carbondesignsystem.com/designing/kits/figma/) · [Once UI breakpoints](https://designdividend.once-ui.com/tokens/layout/breakpoints-in-figma) · [Belka: variables over breakpoint variants](https://belkadigital.com/blog/why-youll-kick-yourself-for-not-designing-responsive-components-with-figma)
