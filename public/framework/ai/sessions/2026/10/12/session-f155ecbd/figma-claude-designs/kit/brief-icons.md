# Brief: the Icon component system (owner, 2026-10-13)

The owner's words (condensed): "we have the Material Symbols font available… figure out some core useful icons and set up a component system for those… it seems like a text character that needs to be swapped out… they should have a drop down… maybe variants… we don't want all the icons componentized, I don't want to lag the whole system… three to five categories with five to ten icons each, and it can grow… all the arrows, a user avatar icon, folders opened and closed, trees, flowchart connectors, anything useful to design with… size variants: a size that matches each of our headers, so an H1 with an icon, boom… framed icons have a different weight, so both plain and framed variants… two-tone, if the font supports it… do the work on the icons page, document it."

Read first:
- [doc/page-layout.md](/framework/ext/Figma/doc/page-layout.md): master components sit TOP LEVEL on the page canvas, never inside a frame. There the purple diamond label shows. The page itself is a 1920 `Page · …` component.
- [use-figma.md](/framework/ext/Figma/doc/use-figma.md): recipe rules 6–7.
- [ds-icons.md](ds-icons.md): what DS · 1.1 already has.

File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Work on `DS · 1.1 Icons` (`163:20989`); you own that page now (the tidy agent was told to skip it), so tidy it into its 1920 `Page · DS · 1.1 Icons` component too. **The owner reads the file, not chat**: a Notes box at the top.

## The system: the recommended shape (verify each step in the file, and change it if Figma says otherwise)
1. **Glyph components, one per icon.** Each is a tiny component holding one text layer named `glyph`, set in Material Symbols Rounded with its ligature (`arrow_forward`). Name them `Icon / <Category> / <name>`. The slash path groups them into categories in the swap menu. Place them top level on the page, in a grid by category.
2. **One `Icon` component set**, the thing people actually place:
   - variants `Size` = one per text style (body, h4, h3, h2, h1: measure the file's text styles and pick the icon size that sits right next to each, roughly line height or font size × 1.2; state the numbers) × `Style` = Plain / Framed (a padded square or circle with a subtle fill, so the icon weighs about the same as text);
   - inside, ONE nested glyph instance, swapped through an **INSTANCE_SWAP property `Icon`** whose **preferred values** are the glyph components. That property is the dropdown.
   - Verify the key risk: when the swap changes the glyph, the size and colour overrides on the nested `glyph` text must carry over (layer names match). If they don't, choose the next best option (for example a TEXT property `glyph` plus a Size variant) and write down why.
3. **Colour** binds to `text` (and an Accent option bound to `accent`), so modes recolour icons with no overrides.
4. **Icon + label pairing:** an `Icon label` row component (Icon instance + text) per text style, with the icon centred on the text. Show H1…body each with an icon, to prove the sizes pair.
5. **Fill / two-tone:** the font has a FILL axis (0/1) but no two-tone. Test whether the Plugin API can set the variable axis; if it can, add `Fill = Off / On`. Fake two-tone (a filled glyph at about 30% under the outline glyph) only if it looks right; say what happened.

## Categories (5–6, 5–12 icons each; easy to grow)
- **Arrows:** arrow_forward, arrow_back, arrow_upward, arrow_downward, chevron_right, chevron_left, expand_more, expand_less, north_east (launch), open_in_new, swap_horiz, subdirectory_arrow_right
- **People:** person, account_circle, group, face, badge
- **Files & trees:** folder, folder_open, description, draft, account_tree, topic, attach_file
- **Actions:** add, close, check, edit, delete, search, more_horiz, more_vert, settings, mic, send, content_copy, link
- **Flow:** schema, hub, device_hub, call_split, merge, alt_route, route, linear_scale, polyline, arrow_right_alt
- **Status:** check_circle, error, warning, info, schedule, bolt, star

Show a specimen grid on the page (each category, plain and framed, at body and h3), the Icon label ladder, and a "How to use" box: place `Icon`, pick Size and Style, choose the glyph from the dropdown, and add a new icon by duplicating a glyph component and changing its ligature. Other agents will reuse this system (the `Kit · Nesting` agent is waiting for it), so report as soon as it works. Write [doc/icons.md](/framework/ext/Figma/doc/icons.md) (short: the shape, the sizes, how to add an icon), link it from the ext/Figma readme, and report `kit/icons.md` with the ids, committed by path.

## Addendum: handoff to code (owner, 2026-10-13, sent to the agent)
In the site, `icon(name)` (`core/View/View.js`) renders the ligature NAME, so the Material name is the icon's identity in Figma too: in the glyph text, in the glyph component's leaf name, and in the placed instance's layer name. Verify that `get_design_context` output carries it. The site loads Material Icons, not Symbols, so prefer names that exist in both and flag any that are Symbols-only.
