# Sizing — what a panel can be told about its own size, and what it cannot

**A panel is a `div` in flow.** Its height is what it holds, never below a floor; its width
fills. Adding a split, a section or more text **grows** the panel and its hugging ancestors —
it does not crop or scroll inside them. `size.js` writes the classes and custom properties,
`size.css` is every rule that reads them, and since 2026-08-19 no container queries are
involved anywhere ([decisions](/framework/ext/Panel/doc/decisions/)).

## 1. The default: `w: fill`, `h: hug`

`Panel.defaults` and `size.js`'s `extents()` agree — a panel that never chose reads `hug` on
its block axis. A saved document that never wrote `h` reads `hug` from today, which is the
point: the owner's arrangements are meant to be flow.

Two floors, two jobs, both tokens on `.panel-workspace` (`panel.css`):

| token | means | value |
|---|---|---|
| `--panel-min` | a hugging panel never collapses | `5em` |
| `--panel-section` | a section of a `mode: document` workspace | `16em` |

**5em is measured, not picked.** An empty leaf must still be a box you can aim at: the top
edge strip ends 2.7rem down (bar `1.8rem` + edge `0.9rem`) and the bottom one starts 1.6rem
up, so anything under ~4.3rem has its two edge targets touching. At 5em a blank leaf reads
75px with 7px of clear body between the strips.

**`hug` is flow on the block axis, shrink-to-fit on the inline one.** A hugging HEIGHT takes
`flex-basis: auto` and keeps its `--panel-grow`, so a column of panels is as tall as what it
holds *and* still divides a column that was given a height. A hugging WIDTH keeps
`flex: 0 0 auto` — a sidebar that grows is not a sidebar.

**A workspace with no height follows its root.** `.panel-workspace { height: var(--panel-height, auto) }`.
Every call site that wants a screen still says so and is unmoved (`ext/editor`, `ext/files`,
`ext/Doc`, the playground, this module's own `page.js`, `Workspace`'s wrap). A root fills a
workspace that HAS a height because a hugging cross axis falls back to `align-self: stretch`
when nothing chose a `self` — one word, and it covers the root and every nested row at once.

⚠ **A hugging workspace inside a flex COLUMN collapses to 0** — `.panel-workspace` carries
`flex: 1 1 0`, and a `0` basis contributes nothing to a box measuring itself. Give the caller's
box `flex-basis: auto`, or hand the workspace a `--panel-height`. A block container (the Demo's
`pad wash`) has no such problem.

## 2. Dragging a seam writes a RATIO, never a px

`grip.js`'s `grow()` sets `--panel-grow` on each of the two neighbours as you drag, and
`.panel { flex-grow: var(--panel-grow, 1) }` (`panel.css`) is the whole mechanism. So a drag is
**a share of the row between siblings** — 1 and 3 is a quarter and three quarters at 400px and
at 3440, with nothing to recompute.

**A split halves the struck panel's own share.** `split.js`'s commit is the writer: beside
(the parent already runs that way) each side takes half of the struck panel's `grow`; nested
(across the grain, or a root) both children of the fresh container start level at 1. Measured
in a 600px workspace: split right → 300/300; split the left one's right edge → **150/150/300**,
and the ghost preview's box equals the arriving panel's box to the pixel. The Workspace bar's
`+` is `add`, not a split, and keeps its equal share (200/200/200).

## 3. Dragging an EDGE writes a length — three gestures, one strip

The right and bottom edge strips (`split.css`'s `.panel-edge-r` / `.panel-edge-b`) carry all
three; top and left stay split-only, because a panel in flow is anchored at its top-left and
those two would move the content rather than size the box (the owner, 2026-08-19).

| gesture | does |
|---|---|
| click | split — unchanged |
| drag (≥ 4px before pointerup) | resize this panel's own axis; no ghost ever appears |
| right-click | that axis back to its default word (`w: fill` / `h: hug`) — and it still cancels a live preview first |

Live, the drag writes the class and the custom property `sizing()` would write, so you are
looking at the answer before you commit it. On pointerup one `item.set()` persists and
repaints, exactly as `grip.js` does for ratios.

**The length is `em` of the panel's own font size, to the quarter** — never px. A saved
arrangement then survives a browser zoom and a 3440 screen the way `grow` ratios already do,
and it reads back as the same kind of length `glyphs.js`'s `LENGTHS` offer, so the picker and
the drag write one vocabulary. Measured: a 576px root dragged −200 commits `w: fixed`,
`w_at: 25em`, reads 376px; right-click puts it back to 576 and `w: fill`.

**A seam and an edge never fight.** They get bands rather than z-order (`split.css`'s
`--clear`): at a nested panel's right edge that is also its parent's seam, the grip owns the
outer 0.7rem either side of the boundary and the edge strip starts 11px inside it. Measured on
one boundary: the seam drag still moved the left panel 300 → 400px, and the edge drag then
took it to 320px and wrote `w: fixed`.

⚠ **Edge strips are leaf-only** (`workspace.js` builds them only when there is a `$body`), so
a root that is already a SPLIT has none. Giving a split its own strips is not one line: they
lie over its children, which own the hover (`.panel:hover:not(:has(.panel:hover))`), so the
`.panel-group` reveal pattern would have to come with them.

## 4. `fixed` + a length

`fixed` carries `w_at` / `h_at`; both pickers write the pair in one click (`toolbar.js`,
`properties.js`) from `glyphs.js`'s `LENGTHS` — `8em` `16em` `24em` — and a drag writes any
length at all. A fixed-basis sidebar beside a filling page is one click.

⚠ **The cap on the BLOCK axis is `max-block-size: 100%`, never `min(x, 100%)`.** A percentage
*size* against an indefinite parent resolves to zero; a percentage *max* resolves to `none`.
Measured 2026-08-19: a bottom-edge drag committed `h: fixed, h_at: 39.25em` and the root read
**0px** in an auto-height workspace. The inline axis keeps `min(x, 100%)` — a workspace always
has a definite width.

## 5. Aspect-ratio boxes are NOT a word — next, not built

Framing an image has no word today: you can say `fill`, `hug` or a length, and nothing says
"this shape". The smallest honest shape is a `ratio` word — one row in `glyphs.js`'s `WORDS`,
one custom property, and `aspect-ratio: var(--panel-ratio)` on the body. Missing, not hidden.

## 6. What survives when the chrome is removed

A panel arrangement is meant to become real markup. **The words survive**: `w`/`h`/`self` are
classes and custom properties a plain section can wear verbatim, and `--panel-w-at` is just a
length. **A grow ratio survives as `flex: <n>`** on the section — it is the same number. The
bar, the grips and the overlays are the only things that do not.
