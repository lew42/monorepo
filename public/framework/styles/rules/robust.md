# Robust — layouts that hold from 400 to 3440

A **robust** layout behaves predictably: it reflows where it was told to and
does nothing surprising in between. A **broken** one is almost never badly
tuned — it is misconfigured, and the misconfiguration shows up as a
discontinuity at some width nobody checked.

This is the shortlist of arrangements that survive the whole range with no media
query. Each one is a single declaration block, and each is measured by
`ext/DesignTool`'s corpus at 400 / 1280 / 1920 / 3440.

## The seven

### 1. Reading column

```css
max-width: min(52em, 100%);
```
One column, capped at the measure, flush left. The house default; `.page.standard`
gives it to you for nothing.

### 2. Tile wall

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(min(14em, 100%), 1fr));
gap: 1em;
align-items: start;
```
Cards. `1fr` is right here — a tile stretching is fine. `auto-fill`, not
`auto-fit`, or two children become two enormous cards. `align-items: start` so a
short cell is not handed dead space.

### 3. Reading columns

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(min(34em, 100%), 38em));
gap: 2em;
```
Three at 3440, two at 1920, one on a laptop — and at one column it stops at
38em instead of running to 130 characters. **The bounded maximum is the whole
difference** between this and #2.

### 4. Sidebar and body

```css
display: grid;
grid-template-columns: minmax(0, 1fr);
gap: 1.5em;

@media (min-width: 56em) {
    grid-template-columns: 19em minmax(0, 1fr);
}
```
The one place a media query earns its keep: a rail should stack *below* a
threshold and sit beside above it, and no intrinsic sizing expresses that.
`minmax(0, …)` on the body track, always.

### 5. Toolbar

```css
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 0.5em;
```
Controls in a row that becomes rows. `gap` for rhythm, never `.flow`. Targets at
`min-height: 2.2em`.

### 6. Split with a stable seam

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(20em, 100%), 1fr));
gap: 1em;
```
Two panes that become one. **Exactly two** wants `repeat(2, minmax(0, 1fr))`
above a breakpoint — `auto-fit` will happily make a third empty track in a wide
container, which is how the DesignTool's own before/after pair ended up huddled
in the left two-thirds of the page.

### 7. Full-bleed band with a gutter

```css
--measure: none;
--page-pad: 2.5em clamp(1.5em, 3%, 3.5em);
```
Edge-to-edge content that still has margins. **Declare the two tokens** — do not
take `.page.full` (which zeroes both) and try to add the padding back on an
inner wrapper, because the page title is not in your wrapper.

## The three checks

**Read at 1280, 1920 and 3440**, plus 400 for a phone. If it holds at those
four, the clamps and auto grids cover the rest.

**Then sweep for the width you would not have thought of.** `sweep()` samples at
a stride and bisects where the *signature* changes — the set of rules firing,
whether the document scrolls sideways, how much is clipped. On its first run it
found an illegible band existing only between 840px and 1208px.

**An edge nobody chose is the finding.** An edge you can name — a `clamp()`
bottoming out, a track count changing — is the layout working.

## What is not here

Anything using `float`, `position: absolute` for structure, `vh` heights on
content, or a fixed pixel width above 400px. Each of those *can* be made to
work, and none of them survive being nested inside something that changes.
