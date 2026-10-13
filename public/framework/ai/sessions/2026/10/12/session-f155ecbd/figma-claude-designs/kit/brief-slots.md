# Brief: Slots vs components, a working navigation system (owner, 2026-10-13)

The owner's words (condensed): "I'm not really getting the slots versus component thing. Make a demo page, slots versus components, and show different setups… when you have a master component with multiple text elements inside it, you can't duplicate those text layers in an instance; that's where the slot comes in… header, nav, footer, sub-navigation, it's kind of a nested thing… layers of slots and components, set up so you could have multiple sidebars that are nested and show up on all the right pages… get a navigation system working with reusable page templates and a table of contents… use stuff we already have."

Read first:
- [use-figma.md](/framework/ext/Figma/doc/use-figma.md): the "Slot, property, swap or variant" table and the Slots section.
- [doc/page-layout.md](/framework/ext/Figma/doc/page-layout.md): masters sit TOP LEVEL on the canvas; the page is a 1920 `Page · …` component.
- [lists.md](lists.md): `List / Tree item` `212:1497`, TOC styles, global + inner sidebars, mobile dropdown/sheet.
- [componentize.md](componentize.md): `Layout / Bands`, `Ground`.
- The new `Icon` set on DS · 1.1 (see [icons.md](icons.md) when it exists; plain Material Symbols text until then).

File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. **The owner reads the file, not chat**: a Notes box at the top, in plain words.

## Page `Kit · Slots vs components` (new)
1. **The limit, shown.** A component with three text layers; an instance can't add a fourth. Then the same component with a `Content` slot, where the instance adds as many as it likes. One sentence each.
2. **Side by side, the same card built 3 ways:**
   - (a) properties only (TEXT/BOOLEAN): fixed shape, can't grow;
   - (b) variants / instance swap: pick from a known few, where every new option means editing the master;
   - (c) a slot filled with instances: free content, and the instances inside still follow their masters.
   Edit each master once and show what updates (before/after).
3. **A navigation system that works:**
   - `Site template` (master): global header, a `Global sidebar` instance, footer, and a `Body` slot.
   - `Section template` (master): an `Inner sidebar` (a TOC built from `List / Tree item` instances, with the current item as a property) plus a `Content` slot. It goes inside the Site template's Body slot, so templates nest.
   - Three or four example pages built from them: Home (Site only), Docs › Getting started and Docs › Install (Site + Section with the inner TOC, a different current item), and Settings (Site + its own inner sidebar).
   - Prove it: edit the Global sidebar master once and all pages update; edit the Section template once and both Docs pages update; each page's content stays its own.
   - Wire the sidebars as a clickable prototype between the example pages (▶ PROTOTYPE badge). Prototype pages stay top-level, inside a Section.
4. **"When to use what"**: the decision table from use-figma.md, drawn, with the anti-pattern ("a variant per page") crossed out.
5. Make it a `Page · Kit · Slots vs components` 1920 wrapper component; its masters sit top level beside it.

Screenshot and fix. Link it from the Overview design-system card. Report `kit/slots.md`, committed by path.
