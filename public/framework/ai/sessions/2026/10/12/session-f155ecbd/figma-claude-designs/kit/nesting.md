# Kit · Nesting: how components nest (2026-10-13)

Figma file `QYN0G2URSBHYH5I06MOjxU`, page `Kit · Nesting` (page component `222:27828`; masters in the `Components` frame `222:27027`). Linked from the Overview design-system card. The owner's `Color Schemes` page was read, not edited.

## The ladder, top to bottom on the page
1. **Atom `Icon`** (`222:27040`): a component set (Size 16/20/24 × Tone text/accent) with one TEXT property `glyph`. The text uses the Material Symbols Rounded font, so any ligature name draws any icon, nothing imported. **Recommended.** The vector way is `Icon · vector` (`222:27054`) with an INSTANCE_SWAP property and 4 preferred vector icons; use it only for custom or multi-colour art.
2. **Molecule `Icon item`** (`222:27249`): Icon instance + label + meta. Properties: Label, Meta, Show meta, Show icon, State (Default/Hover/Active). The inner Icon is an exposed instance, so its glyph can be edited from the item.
3. **Organism `List`** (`222:27250`): one SLOT, `Items`. Shown with 3 and with 6 items.
4. **`Card · schemes demo`** (`222:27267`): header + List instance; fill bound to `surface`, ink to `text`, icons to `accent`, radius and padding to Resolution tokens.
5. **Four schemes:** that one master placed 4 times, only the ground's Text mode differs. Master glyph changed once (folder → rocket_launch); all four followed. A before snapshot sits on the page.
6. **Guide box:** when something becomes a component, and the steps (atom, molecule, organism, place, modes).

## Findings
- A slot's default content is just the children of the frame bound with `slotContentId`; in an instance, clear the SLOT node and append instances.
- Component property keys carry a suffix (`glyph#222:0`); `setProperties` needs the full key, so map by prefix.
- `isExposedInstance = true` on the inner instance exposes its properties; the instance's own `componentProperties` list does not show them (reach the inner instance's properties via `instance.children[0]`).
- A failed `use_figma` script rolls back fully, so a retry is safe.
- Cells with a fixed width must set vertical HUG, or `resize(w, 10)` leaves them 10 px tall.

## Values with no token (as in other kit pages)
Icon-item padding 8/12, gap 12, min height 40; icon sizes 16/20/24.

Checked at 1920 (full-page screenshot, three rounds): header, notes, all six sections read; no clipping after the cell-height and title fixes.
