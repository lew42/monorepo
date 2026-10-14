# Icon swap report (2026-10-13)

Plain Material Symbols text on Claude's pages is now the `Icon` component (DS · 1.1, [doc/icons.md](/framework/ext/Figma/doc/icons.md)). Brief: [brief-icon-swap.md](brief-icon-swap.md). Traps found: [doc/use-figma.md](/framework/ext/Figma/doc/use-figma.md).

## Result
- **Every main component and every loose icon** on the Claude pages is swapped, except the short list below.
- **105 new glyph components** (54 → **159**), each in its category on DS · 1.1 and in the `Icon` dropdown (`Icon#229:0`).
- Final census, as `main / inside instances / loose` plain-text icons left (the "inside instances" are the swapped masters' nested glyph text, not plain icons):

| Page | Plain left |
|---|---|
| Every kit, lab, template, screen and DS page (about 40) | 0 / 0 |
| DS · 5 Diagrams & charts | 8 main (arrowheads) |
| Kit · Nesting | 6 main (the "was · Icon" comparison column) |
| Video · Kit | 4 main (`location_on` in safe-zone guides) |
| Kit · Slots vs components | 4 main (empty spacer texts) |
| DS · 6 Screens | 3 loose (`image` placeholders) |
| DS · 1.1 Icons | the specimen grid and name captions, left on purpose |

The per-page "before" counts were taken page by page while swapping and are in the session log, not repeated here.

## Prototype reactions
Counts match on every touched page. Two pages lost reactions mid-run (UI Kit 5 → 4, Workflows 17 → 12) because deleting a main's text also deletes reactions set on that text inside instances (App bar Back/Action). They were rebuilt (Workflows 5, UI Kit 1) and the executor now carries such reactions over.
- ⚠️ **UI Kit's restored Back reaction is a best guess** at its destination (rebuilt from the original builder script). Worth one click-through.

## Screenshots (before / after, [shots/](icon-swap/shots/))
Input, Alert, Menu row (before and after), plus after-only Tree item, Row, Tab bar (their before shots were not saved). Same glyphs, positions and spacing.
- Alert's first icon was black before and is mid-gray now (the muted fill was copied onto the glyph); the other two tones match.

## Not swapped, and why
- **DS · 5 arrowheads, Nesting "was · Icon", Video guides, Slots spacers, `image` placeholders**: they are diagram parts, a comparison, annotations or deliberately empty, not UI icons.
- **Icons page specimens and captions**: the brief says leave them.
- **Overrides on instances whose icon is toggled off** could not be restored (a hidden icon has no children). Harmless.
- **`draft`, `progress_activity`, `frame_source`** exist in Figma's Symbols font but not the site's Material Icons: they show as literal text on the site (listed in doc/icons.md).

## Decisions
- Size snaps to the nearest of 18/20/28/44/56, ties to the smaller (24 → Body, 16 → H4, 32 → H3).
- Fill bound to `accent` → Tone Accent; `text` → Tone Text; any other colour is copied onto the nested glyph.
- Made a glyph component for every name used rather than substituting a lookalike, so names still map one to one to `icon("name")`.
