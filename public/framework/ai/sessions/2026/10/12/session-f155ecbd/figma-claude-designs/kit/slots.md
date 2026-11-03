# Report: Kit · Slots vs components

Figma file `QYN0G2URSBHYH5I06MOjxU`. Brief: [brief-slots.md](brief-slots.md). Page `Kit · Slots vs components` (`238:30989`), wrapper component `Page · Kit · Slots vs components` (`244:31967`, 1920). Linked from the Overview design-system card (text `244:48424`).

## What is on it
- **1 The limit:** `Demo / Fixed card` (3 text layers, no fourth possible) beside `Demo / Slot card` (Content slot, instance adds 5 lines).
- **2 Same card, three ways:** `Card A · Properties` (TEXT + BOOLEAN), `Card B · Variants` (Tone: Info/Warning/Done), `Card C · Slot` (slot filled with `Demo / Check row` instances). Each master was edited once (accent border, rounder corners, row icon green): BEFORE = detached snapshots, AFTER = live instances.
- **3 Navigation system:** masters `Site template` (header, `Global sidebar` swap, `Body` slot, footer), `Section template` (`Inner sidebar` swap + `Content` slot, nests inside Body), `Nav / Global sidebar`, `Nav / Docs TOC`, `Nav / Settings TOC` (sets, variant `Current=`, items are `List / Tree item` instances in State Active), `Content / Block`. Four pages: Home (Site only), Docs › Getting started, Docs › Install, Settings.
- **Proof:** the Global sidebar got a "Changelog" item once and all four pages show it; the Section template got an accent border once and Docs and Settings changed, Home did not. Before/after pairs for Home and Docs › Install.
- **Prototype:** section `▶ PROTOTYPE · Navigation` (`243:32021`, right of the masters): the same four pages, sidebar items wired to pages (flow "Navigation prototype"). The current item has no link (Figma refuses self-navigation).
- **4 When to use what:** the decision table, with "a variant for every page" crossed out.

## Decisions
- The current item is a VARIANT of the sidebar set (a nested instance's variant can't be exposed as a property); the inner sidebar choice is an INSTANCE_SWAP, so a page picks `Current=Install` by swapping.
- Pages are 800 wide (two across at 1920). Site `Main` hugs with a min height; FILL vertical heights were not re-measured by the plugin.
- Prototype pages are clones, since a navigate destination must be a top-level frame and the page wrapper is a component.

## Not done / off
- Not checked at 400/1200/3440: the page is a fixed 1920 design page.
- The Docs TOC divider line stops at its content height (FILL not re-measured); anti-pattern row columns sit ~48px off the table columns by the ✕ icon.
