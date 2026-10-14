# Figma to framework: which Figma signal means which of our words (2026-10-12)

**Goal (the owner's): what you see in Figma is what the browser renders.** Read a node with `get_design_context` (it prints the auto layout as `flex`, `gap`, `p`), then choose a framework word from the table. This supersedes the first draft in [mapping.md](./mapping.md).

**What the nine Palette pages actually did:** each Haiku build wrote its own small CSS (`pal-`, `ctl-`, `tsk-` ...) with `display:flex`, `gap` and `padding` in `em`, because the spec gave raw numbers. They are faithful, but they use none of our layout words. That is the gap this table closes: the next spec should name the word, not only the numbers. Em values round-trip exactly (14.92px = 1em at that page's body size).

## The table

| Figma says (as `get_design_context` prints it) | Meaning | Framework word | Signal runs out where |
|---|---|---|---|
| `flex flex-col` | vertical stack | plain block flow spaced by `--flow`; `.flex` column only if the children must align | flow content and a flex stack look identical |
| `flex` (row), children `flex-[1_0_0]` | equal columns | `.flex.auto` (wraps by itself) or `.cols` (`styles/layouts/cols`), for example `.flex.three` | a Figma row never wraps; a row of cards that should wrap needs the owner's word |
| `flex-wrap` | wrapping row | `.wall` (`core/Page/Page.css`, auto-fill grid of cards) | min card width is a guess from the widest child |
| `grid grid-cols-[a b]` | tracks | `.grid.auto`, or one `display:grid` | tracks are fixed px; `1fr`, `minmax`, `auto-fit` are gone, choose by judgement |
| `gap-[Npx]` | item spacing | `--gap` ramp (`--gap-70/50/35/25`) inside a component; `--flow` between blocks | snap N to the nearest rung: divide by the base font size first (em) |
| `p-[Npx]`, `px`, `py` | padding | em padding, or a `clamp(...)` that scales | same snapping; Figma has no clamp |
| child `flex-[1_0_0]`, `size-full`, `w-full` | FILL | page word `fill` (the leaf takes what is left); inside a row `flex: 1` | `fill` yields to an open child (`core/Page/doc/columns.md`) |
| child sized to its text, no width | HUG | page word `hug` (6-24em); chips: `align-self: flex-start` | Haiku stretches hugging chips unless the spec says "does not stretch" (three builds) |
| child `w-[Npx]` | FIXED | `small` (14-24em) or `large` (28-64em) by N relative to the frame width; or a `--measure` | which word depends on the frame width, so one frame is ambiguous |
| frame centered with a max width | reading width | `width: "reading"` / `--measure` (40em) | a wide section also needs `grid-column: 1 / -1` on `.page` |
| fixed-width left or right panel | side region | `.rail` (sticky) or `drawer()` | a drawer is open/closed state: needs a second frame or variant |
| `items-start` / `items-center` | cross-axis align | `align-items` as is (Figma defaults to start, browsers to stretch: always write it) | none |
| `bg-[rgba(0,0,0,0.1)]` or stacked `linear-gradient(rgba..)` | alpha overlay | `.fg-darken-N` / lighten, as in `colors/` | alpha survives exactly; the base colour is the last gradient layer |
| `var(--name, 16px)` | Figma variable | the matching token if one exists | only when the file defines variables; raw hex means nearest-token judgement |
| `rounded-[Npx]`, per-corner `rounded-tl-[..]` | radius | `border-radius` (write the shorthand in the spec) | worded corners got misapplied (sections 8 and 9) |
| absolute children (no auto layout) | a picture only | absolute positioning with exact offsets (Timeline did this) | no direction, gap or sizing: see below |

## Where the signal runs out, and the default

1. **No auto layout at all** (common in hand-drawn files). Use geometry: children sharing a y form a row, a shared x a column, equal gaps become the gap token, a child spanning the parent's width is FILL. Write the guess beside the page and verify it with a screenshot at 1200.
2. **Partial auto layout** (the frame has it, a child does not): use flex words for the outer frame and treat the unflowed child as absolute inside it.
3. **One frame width only.** Default: fluid, mobile-first. A row becomes `.flex.auto` so it wraps by itself; fixed px becomes `clamp` em; check at 400, 1200, 1920 and 3440. A 1920 frame only tells you the wide state.
4. **Wrap, drawers, sticky, hover** are behaviour, not geometry. They need a second frame or the owner's word; default to none.

Confirmed by building the nine Palette pages: flex row/column, gap, padding, align, HUG chips, alpha overlays, the em round trip. Not confirmed (no example in these files): Figma grid layout, component variant sets.

See also: [capture.md](./capture.md) (the other direction: our page into Figma), [haiku-builds.md](./haiku-builds.md) (what a spec must name), [mapping.md](./mapping.md) (first draft).

## Direction of the token sync (decided 2026-10-13)

- **The browser `styles/` tokens are the source of truth; Figma mirrors them.** The site is what ships, and a Figma value is a copy of it.
- **How a change flows:** edit the property in `styles/`, run `node Server/figma-roundtrip.mjs` then `node public/framework/ext/Figma/tokens/FigmaTokens.mjs` (aliases regenerate, `--check` proves it), commit.
- **Figma follows later:** a Figma masterminds task writes the new value into the variable through the Figma MCP; this repo never writes to Figma. Rows that still differ (`dark`, `light`) are listed on `/framework/ext/Figma/tokens/`.
