# kbd architecture — real `<kbd>` elements stay accessible

The kbd module exports a single `keys()` function that renders keyboard shortcuts as styled chip rows. Entry: [`kbd.js`](../kbd.js).

## Real `<kbd>` elements with span separators

**Decided:** each key is a real `<kbd>` element; the `+` separator is a `<span>` with no semantic meaning.

**Why:** screen readers read the markup structure, so each key should be its own `<kbd>` to be read as a key. A single text node or one `<kbd>` wrapping all keys loses that information.

**Instead:** a single string like `"Ctrl+K"` (no semantic detail), or join all keys in one `<kbd>` (can't style or read them separately).

**Detail:** kbd.js line 16–21, comment at lines 4–6.

## Styling: base box from framework, border-lip from the component

**Decided:** `framework.css` provides the base `<kbd>` styling (font, box, colors via mono list); kbd.js adds the heavier `border-bottom-width` that gives the distinctive chip appearance.

**Why:** a `<kbd>` element's role varies by site — sometimes a chip, sometimes plain text. The component owns its visual signature.

**Instead:** move the border to `framework.css` (couples the look across all uses), or style the entire `<kbd>` in the component (redundant duplication).

**Detail:** kbd.js lines 4–14, readme [Watch out](../readme.md#watch-out).

## Flex row with gap for alignment

**Decided:** keys are laid out in a flex row with `v-center` (vertical center) and dynamic `--gap`.

**Why:** ensures consistent alignment and spacing without hardcoding width; gaps scale.

**Instead:** inline-block (no alignment control), grid (unnecessary for a simple row), or margin on each key (fragile, no dynamic spacing).

**Detail:** kbd.js lines 18, 22.
