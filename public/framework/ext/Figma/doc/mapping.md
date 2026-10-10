# Figma properties to framework layout words (2026-10-10, first draft)

**Goal (the owner's): what you see in Figma is what the browser renders.** This table says which Figma signal implies which of our words, and where the signal runs out. Framework side read from `core/Page/doc/columns.md`, `core/Page/doc/words.md` and `styles/doc/layout-system.md` (a Haiku read; items marked *unconfirmed* are not verified in code). Figma side observed on the captured test page: [capture.md](./capture.md).

## What the MCP exposes

- `get_metadata`: only ids, names, x/y/width/height. **No auto layout, no gap, no padding.** A frame list is geometry.
- `get_design_context`: React + Tailwind per node. Here the structure shows: `flex flex-col`, `grid grid-cols-[...] grid-rows-[...]`, `gap-*`, `p-*`, `justify-self-stretch`, `size-full`, `content-stretch`, tokens as `var(...)` when the file has variables. Costs about 3k tokens per card; over about 90 KB it falls back to metadata only, so ask per sub-node.
- A node with no auto layout comes back as absolutely positioned children: the layout is only a picture then.

## The table

| Figma signal | Means | Our word | Signal runs out where |
|---|---|---|---|
| Auto layout VERTICAL | stack, top to bottom | `.flex` column (a `.flex.v` form is *unconfirmed*); or plain block flow with `--flow` | cannot tell flow content from a flex stack |
| Auto layout HORIZONTAL | a row | `.flex` row; if the children are full-height panes, `columns()` | a row of cards that should wrap is also HORIZONTAL; wrap is a separate Figma flag |
| Auto layout WRAP | wrapping row | `.wall` (auto-fill grid of cards) | min card width is a guess from the widest child |
| Grid (Figma grid layout) | explicit tracks | `display:grid` as `.fg-scheme` does | tracks arrive as fixed px, never `1fr`/`minmax`/`auto-fit`: round up to our `.wall` or `1fr` by judgement |
| Item spacing (gap) | gap | `--gap` rungs (`--gap-70/50/35/25`), `--flow` between sections, never px | px must be snapped to the nearest token; the page measured 14.92px = 1em exactly, so em-based pages round-trip |
| Padding | pad | `--pad` | same snapping |
| Child sizing FILL | takes the leftover | columns word `fill`; `flex:1` | |
| Child sizing HUG | content width | columns word `hug`; no width | |
| Child sizing FIXED | a number | columns words `small` / `large` (clamped ranges) or a `--measure` | which word depends on px at the file's frame width: 1920 frame, 300px = `small`; ambiguous at one width |
| Max width on a frame (centered) | reading width | page word `width: reading` / `--measure` (40em) | |
| Left or right pinned panel, fixed width | side region | `.rail` (sticky side) or `drawer()` if it hides | a drawer is a state (open/closed); Figma needs a variant or second frame to show it |
| Constraints (pin left/right, scale) | resize behaviour | none direct: we use flex + clamps, not constraints | constraints in a file without auto layout are the only resize hint; treat as FILL when left+right pinned |
| Fill with opacity black/white | overlay | `.fg-darken-N` / lighten (colors demo) | exact alpha survives (`rgba(0,0,0,0.1)`) |
| Variables / styles | tokens | `styles/` tokens, `--text`, `--muted` | only when the file defines variables; raw hex otherwise (match to nearest token) |
| One frame per breakpoint (400/1200/1920/3440) | responsive | one page across our four widths | pairing frames by name is a convention the file must follow |

## Missing in Figma files (the common case)

No auto layout means no direction, gap or sizing. Fall back to geometry: children sharing a y are a row, a shared x a column, equal gaps become the gap token, a child spanning the parent's width is FILL. That is interpretation, so record the guess beside the page and check it with a screenshot at 1200.

## Known unknowns

- Whether drawers and resizable columns can be seen in a file at all (they are behaviour, not geometry).
- The framework's flex direction and grid utility classes were not all read (`styles/layouts/flex/`, `grid/`).
- The reverse direction (our page into Figma) freezes layout; see [capture.md](./capture.md).
