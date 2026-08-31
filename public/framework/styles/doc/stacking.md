# Stacking — when a colour is alpha

Live, measured, both modes: [`/framework/styles/stacks/`](/framework/styles/stacks/).

**Adopted 2026-08-30.** The ladder is in `framework.css` `:root`; the site is on it. See
[the flip](/framework/ai/2026-08-30/alpha-flip/) for what moved and what deliberately
did not.

## The rules

1. **Floors are opaque; fills are alpha.** A floor is painted on the canvas (`--wash`,
   `--tint`, `--surface`, `--sidebar-bg`, `--code-bg`) and has nothing to compose with —
   make one translucent and dark mode goes pale over the browser's white.
2. **Every INTERACTIVE fill goes alpha** — a button, a toggle, a hover, an active row.
3. **Every BADGE fill goes alpha** — a chip, a pill, a tag, a count, inline `code`.
4. **The word is `--fill-aNN`**, rungs `04 · 08 · 16 · 32`, each double the last. Ask *how
   many steps up*, never *which grey*.
5. **An island dark in both modes declares `color-scheme: dark`.** `light-dark()` reads
   that at the element it is *used* on, so the same `--fill-aNN` flips inside it — along
   with `--ink`, `--line`, `--wash` and `--tint`. That one line is the always-dark
   primitive we lacked.
   ⚠ **An island that INVERTS with the mode cannot declare one**, and the declaration
   would be a lie: `styles/sections/tone.js` painted its `dark` band from `--ink`, which
   is dark in light mode and light in dark mode, so any fixed `color-scheme` flipped the
   band's own background with it. The fix is to paint the island from a floor that stays
   dark — `--bg` — and *then* declare it. Same shape wherever an island is "the opposite
   of the page".
6. **An accent stays opaque, and its one failure is PLACEMENT.** `--prim` and `--bg` are
   the two solid fills — a hue and a dark neutral, each with a hardcoded white label.
   Each is invisible on exactly one floor, its own, so *don't put a `.prim` button on a
   `--prim` band or a `.bg` button on a `--bg` one*. Move the button; a rung cannot
   replace either without turning a filled CTA into a wash. The measurement agrees: the
   only place either was ever flagged is the matrix cell that exists to show it.
7. **Alpha compresses on a saturated floor** — `#FF8F60`'s red channel is already 255, so
   a white rung moves only green and blue. On an accent, start one rung higher.
8. **Do not delete the hairline when you add the fill.** `max(fill, border, inset ring)`
   is what "can I see it" actually measures; `framework.css` bolted a ring onto inline
   `code` for precisely this, and lew42's `border: none` on buttons is what removed the
   only thing holding a default button visible.

```css
--shade-a08: rgba(0, 0, 0, 0.08);
--paper-a08: rgba(255, 255, 255, 0.08);
--fill-a08:  light-dark(var(--shade-a08), var(--paper-a08));
```

Literal `rgba()`, so **no interpolation space is involved** — compositing is source-over in
sRGB, arithmetic rather than a mix. Where a rung must be derived *from* a theme colour, use
`color-mix(in srgb, …)`: mixing toward `transparent` in `oklab` travels through
premultiplied oklab and the hue drifts on the way.

## What it cost

76 pages, 3,623 fills, light mode at 1440 — [`hunt.json`](/framework/styles/stacks/hunt.json)
is the raw output and the number in any report has to equal the number in the file.

| | before | after |
| --- | --- | --- |
| distinct invisible pairs | **101** | **19** |
| elements | **504** | **50** |
| matrix cells under the bar (light / dark) | 14 / 13 | 9 / 9 |

The matrix numbers are an A/B on the *same* build — the four changed declarations put back
at document-start — so the two counts come from one page and one set of maths. The nine
that survive in both modes are the same nine: seven placement cells and two compression
cells, all of them arguments the page is making on purpose.

**Four rules did most of it**, and none of them is per-component:

- `framework.css` — `.btn, button` painted `var(--surface)`, the same token the card
  under it paints. One line, the large majority of the 504.
- `lew42.css` — `border: none` on every button at (0,2,0), which out-ranked
  framework.css's hairline *and* every component's `border-color` on `:hover`. Deleted;
  the hairline underneath was right all along.
- `framework.css` — inline `code` and `th`, moved to `--fill-a08` / `--fill-a04`.
- `demo.css`'s `.demo-btn` and `layout.css`'s `.layout-btn`, which painted nothing at all
  and so were whatever bar they sat on: 70 of the 504 between them.

**What the remaining 50 are** — a category each, and none is a control you cannot see:
text labels the scan's class-name test caught (`.layout-tag`, `.blog-chips`,
`.panel-props-tag` have no fill and never wanted one); icon buttons that are transparent
on purpose and carry their glyph as the affordance (`.panel-workspace-mode`, `.drawer-x`,
the panel dial); the two placement demos in the matrix; and one mocked control on the
[UI gallery](/framework/ui/).

## Deliberately still opaque

A fill that must **occlude** what is under it is a floor, whatever it is shaped like:
`.mode-btn` (a floating pill over the page), `.panel-display-badge` and `.pg-chip`
(labels overlaid on live content), `.panel-t-dial`, `.blogx-toggle`, and segment strips
where the segment is a card in its own right (`.decks-chip`, `.imagine-seg-btn`). Plus
`button.prim` and `button.bg` — rule 6.

## The threshold

The bar is **ΔL\* 3**, and the data chose it rather than taste. Across 384 distinct pairs
the distribution is bimodal: **100 sit at exactly 0.00**, then *nothing at all* between 0.5
and 2, one pair at 2.4, and everything else at 3 or above. The nearest thing over the line
is inline `code` on a `.wash` block at **4.2** — a fill of 0.00 rescued by its inset ring,
which is exactly the case that should sit just above a bar and not below it.

## Still open

- The hunt runs in **light mode only**; a dark pass is a re-run with one flag. The matrix
  covers both modes, so the gap is site coverage, not the rules.
- The scan's badge test is a class-name regex, so a `<span class="…-tag">` holding plain
  text is read as a chip that failed. Thirteen of the surviving fifty are that. Tightening
  it (require a painted fill or padding) would change the numbers, so it did not happen in
  the same wave that changed the site — it would have made the before and after
  incomparable.
- Deliberately-transparent icon buttons still score 0.00 by construction. Whether an icon
  button should carry a resting fill is a design question, not a measurement one, and it
  is the owner's.
