# Fix split screen layout

## The ask, verbatim

> look into the styles/layouts split screen mode (this might be the ext/demo?)
>
> both sides of the responsive viewer show some transparent background at times,
> instead of filling the entire space.
>
> also, across all layouts, they use the same bg color as the page's bg, so you
> can't see the edge of the demo, which feels very strange. maybe just make that
> page's bg darker?

Follow-up:

> the bg is better
>
> the 2 layouts seem to come off the edge (parent's padding) on both the left and
> right side, when the slider goes to the opposite side. can we make the 2 layouts
> maintain 100% width so it doesn't look buggy?

## What was actually wrong

**The transparent patches** — `two.js` built each pane as `demo-sim checkered`.
`.checkered` is the transparency board, and it exists to answer *"did this render
paint its own background?"*. On the **pane** it answered about the wrong box: what
it showed was the room the pane has that the simulated screen does not use.
Measured at a 3000px window, the phone pane's box was 744px against a 390px
screen — 354px of checkers. Under the render it was the `.demo-size` readout row,
~29px on every layout page at every width. And the question was already answered:
`layout.js` paints `--surface` on every `twin` frame precisely because a simulated
screen has a ground.

**No edge** — the layout paints `--surface` (#fff) and the page under it is
`--wash` (#f2f2f2): 13/255 apart, and the stage is `bleed`, so no border either.
Non-twin layout exhibits are worse — `frame()` paints nothing at all for them.

**The slack** — the fit capped at 1:1, so a 390 pane in a wider box drew at 390
and left ground on one side. With the panes aligned outward that read as the two
screens coming off the tray's left and right edges as the handle moved.

## Steps

1. Reproduce and measure both faults (Playwright, light + dark, 1600 + 3000)
2. Drop the board from the two-up pane
3. Give the exhibit's `bleed` stage a ground so a specimen has an edge
4. Pick the ground colour with Mike (`--line` vs `--bg`) — **`--bg`**
5. Drop the 1:1 cap in the two-up so both panes always fill their boxes
6. Verify: all 20 layout pages clean, fullscreen, dark mode, the `wall` two-up

## Files owned

- `public/framework/ext/demo/two.js`, `two.css`
- `public/framework/ext/demo/exhibit.js`, `exhibit.css`
