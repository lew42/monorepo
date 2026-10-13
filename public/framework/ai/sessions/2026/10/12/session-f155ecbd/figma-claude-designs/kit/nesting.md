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

## Update 2026-10-13 (Figma mastermind)
- **Masters are top level** on the page canvas (the `Components` frame is gone; nothing was deleted, only the two emptied frames). Page text says so.
- **One icon system:** `Icon` here is a stand-in. Once `kit/icons.md` exists (task-mastermind-fig-icons, `DS · 1.1 Icons`), swap the Nesting atom to that `Icon`, keep this font-vs-vector comparison as an explainer. **Still open: `kit/icons.md` did not exist when this was written.**

## Update 2026-10-13, after kit/icons.md landed
- **The atom is now the shared `Icon`** (`229:29044`, DS · 1.1): swapped in the Icon item variants, the Card header and every specimen (sizes H4/Body/H3 × Text/Accent, icon from the dropdown). My stand-in set is kept, unused, renamed `was · Icon (font stand-in…)` at the right edge.
- The font-vs-vector comparison stays as an explainer; copy now says the glyphs are font-glyph components picked from a dropdown.
- The glyph set has no home/mail/inbox/favorite, so the specimens use folder, search, settings, send, draft, delete, bolt, star. The master-edit demo is now folder → star.
- Checked: full-page screenshot at 1920, all six sections read.

## 7 · Slot, property, swap or variant (added 2026-10-13)
- `Page template` master `232:1347` (top level): nav with Icon instance, Title TEXT, Show breadcrumb BOOLEAN, footer, Content SLOT. Placed twice (`232:1371` Sessions, `232:1415` Files), slots hold Card and List instances.
- Edited the template nav once (pale bar to prime, "Lew42" to "Lew42 Kit"): both pages updated; slot contents stayed; cards still follow `Card · schemes demo`. Before snapshot is on the page.
- Decision table and the "a variant per page" anti-pattern are in section 7 (`232:1365`); source is `ext/Figma/doc/use-figma.md`.

**Update:** section 7 cut to the two-page demo plus a pointer to `Kit · Slots vs components` (fig-slots). The decision table, anti-pattern and before-snapshot are hidden in section 7, not deleted.
