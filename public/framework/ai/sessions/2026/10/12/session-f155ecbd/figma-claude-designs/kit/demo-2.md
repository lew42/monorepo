# Report: Demo · Site, round 2 (2026-10-14)

Figma file `QYN0G2URSBHYH5I06MOjxU`, page `Demo · Site` (`296:106079`). Brief: [brief-demo-2.md](brief-demo-2.md). Continues [demo.md](demo.md).

## Checklist
- ✅ **Related links wired** on both Reading screens (5 rows each: Why slots/instances, Buttons, Cards, Layouts, Templates).
- ✅ **Six new scheme-A screens** (1920×1080, scroll), all instances: Foundations · Layouts `302:108327` (7 feature cards), Cards `302:108352` (8 card styles), Type `302:108377` (article sample on h1–h4/body), Essentials `302:108402`, Patterns · Search results `302:108427` (search, filters, rows), Empty state `302:108452`.
- ✅ **Scheme A sidebar now has 9 items** (adds Foundations, Patterns); rebuilt on Home, Docs ×2, Settings and the six new screens. Foundations and Patterns have their own gray inner sidebars.
- ✅ **Phone flow `Demo · Phone`**, seven frames at 390×844 below the desktop screens (start: Phone · Home `304:54217`): Home, Docs · Getting started, Docs · Install, Elements, Foundations · Type, Patterns · Search, plus the "On this page" menu screen `304:54223`. Global nav is a dark bottom tab bar; the inner sidebar is the "On this page" bar under the title, which opens the menu screen. Content scrolls inside each frame.
- ✅ **Notes frame** updated (how to play the phone flow, what round 2 added).
- ✅ **Click-test by script:** 23 screens, every reaction destination exists, 0 dead ends, every screen has an incoming link.
- Screenshots seen at 100%: Foundations · Layouts, Cards, Essentials, Empty state, Search results, Phone · Home, Phone · Docs. Not viewed: Type, Phone Elements/Type/Search/Install/menu.

## Decisions
- Figma overlays cannot be set from the plugin (read-only), so the phone dropdown navigates to a full "menu open" screen.
- The dark tab-bar is set to the Dark BG text mode so icons and labels read.

## Left over
- Card grids fill only the article column (760), so the cards sit left; widening the article would fix it.
- Buttons keep their leading "+"; the Empty state callout shows the stock "Heads up" text.
- The phone flow starting point is named `Demo · Phone`; the second one `Demo · Site` is unchanged.
