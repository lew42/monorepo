# Icons in Figma: one `Icon` component, a dropdown of glyphs (2026-10-13)

File `QYN0G2URSBHYH5I06MOjxU`, page `DS · 1.1 Icons` (`163:20989`). Material Symbols Rounded is a font, so an icon is a text layer holding a ligature name (`arrow_forward`).

## The shape
- **Glyph components** (54, top level right of the page, `Icon / <Category> / <name>`): one text layer `glyph`, colour bound to `text`. Categories: Arrows, People, Files & trees, Actions, Flow, Status. The slash path groups them in the swap menu.
- **`Icon`** (component set `229:29044`, 40 variants): `Size` (H1 56, H2 44, H3 28, H4 18, Body 20) x `Style` (Plain, Framed) x `Fill` (Off, On) x `Tone` (Text, Accent). Inside is one nested glyph instance; the INSTANCE_SWAP property `Icon#229:0` (preferred values = all glyphs) is the dropdown. Swapping keeps the size, Fill and colour, because the nested layer is always named `glyph` (verified).
- **`Icon label`** (`229:29082`): `Size` H1..Body, an Icon plus text in the matching text style, centred.
- **Sizes** are about 1.2 to 1.3 times the text size, so the icon sits at the text's cap height. Framed pads 35% of the glyph and is a 10% black inset (the standard inset).
- **Fill**: the font's FILL axis (0/1) is settable per variant through `fontName.variationSettings`; it is a variant, not a property. Two-tone: the font has none; not faked.

## Add an icon
Duplicate any glyph component, rename it `Icon / <Category> / <name>`, change its `glyph` text to the Material Symbols name, then add it to the Icon set's `Icon` property preferred values (`set.editComponentProperty(key, {preferredValues})`).

## Handoff to code
- **The Material name is the identity.** The site's `icon(name)` (`core/View/View.js`) makes `<span class="material-icons icon">name</span>`. In Figma the `glyph` text is that exact name, and the glyph component's leaf name is too (`Icon / Arrows / arrow_forward`). `get_design_context` on a placed `Icon` returns a `<p>` whose text is `arrow_forward` (checked): that is `icon("arrow_forward")`. The nested layer's name carries the path, with the name last.
- **Trap: Icons vs Symbols.** The site loads Material **Icons**; Figma draws with Material **Symbols**. A Symbols-only name shows on the site as literal text (measured in `styles/layouts/apidoc/page.js`). Probed all 54 names against Figma's Material Icons font: only **`draft`** is Symbols-only (use `description` on the site). It is flagged in the glyph's description and in the page Notes. Probe any new name the same way: set it in `Material Icons` and check the text is glyph-width, not word-width.
- The Fill axis (and `Size`/`Style` frames) have no site equivalent: the site's font has no FILL, so Fill On is a design-only variant.
