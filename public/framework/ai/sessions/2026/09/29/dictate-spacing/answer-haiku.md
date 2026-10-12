# Dictate page spacing analysis

## Layout gaps and their sources

| Gap | Element | Rule | Selector | File | Computed value (400px) |
|-----|---------|------|----------|------|------------------------|
| Large blank band below tabs | `.tab-bar` container spacing | `--pad-y` | `.page` grid | `Page.css:178` | 24px top padding + 24px bottom padding on page |
| Excessive left/right margins | `.page.doc-section` padding | `--gutter-x` | `.page` | `Page.css:173` | 32px left, 32px right (clamped to floor since 4% of 400 = 16px < 2em floor) |
| Tabs text cut off ("PLAYGROUN…") | Tab container width | implicit; tab text flows to edge | `.tab-bar` flex container | `Doc.css` (tabs module) | 400px viewport, no padding on tabs, text overflows |
| "Folder" label isolation | Block spacing after tabs | `--gap` or margin + inherited padding | `.page-fs-link` parent | Framework layout | Default block margin + page padding = ~24px above/below |

## The exact changes

### 1. Reduce top padding in tab panel (smallest, highest impact)
- **Selector:** `.tab-panel`
- **Property:** `padding-top` (or modify the flex gap that creates the band)
- **From:** Currently inherits page's `--pad-y: clamp(1.5em, 4%, 3em)` = 24px at 400px
- **To:** `0px` or `var(--gap)` (14px)
- **Why:** The tab panel content area has no reason to pay the full page padding again; the `.doc-well` (header) already paid it above

### 2. Allow cards to use their own width, not parent's
- **Selector:** Cards/sections using `--pad` token
- **Property:** `padding` (where using `--pad`)
- **From:** `var(--pad)` = `calc(clamp(1em, 2.6% - 1.1em, 4em) * var(--size))` (resolves % against PARENT)
- **To:** `var(--pad-card)` = `calc(clamp(1rem, 2%, 2em) * var(--size))` or convert to `cqi` inside a container-query context
- **Why:** At 400px, parent `2.6%` = ~10.4px − 1.1em = negative, clamps to 1em = 16px. But a card's own 2% of its own width makes more sense and doesn't depend on whether the parent is full-width or narrow.

### 3. Prefer container-query units for responsive padding
- **Property:** Padding on card-like elements
- **From:** `2.6%` (percentage of parent)
- **To:** `1.6cqi` (container query inline)
- **Caveat:** Only works if the card's own closest ancestor is marked `container-type: inline-size`. The framework currently does NOT mark `.page` or `.tab-panel` as containers, so cqi reads the **viewport**, not the card — a 250px card at 3440 ends up at the same 32px as a 1400px card.
- **Simplest fix:** Change `--pad` formula to use a pure length clamp without percentage, or mark the actual card containers as `container-type: inline-size` and rebase all padding to `cqi`.

## The `--pad` token analysis

**Does percentage pad resolve against parent?** ✓ Yes. In CSS, `padding: 2.6%;` resolves the percentage against the containing block's **width**. At 400px parent, `2.6% = 10.4px`. That is the CSS spec (CSSOM spec §4.4).

**Can a container-query unit (cqi) on an element resolve against ITSELF?** ✓ Yes, BUT only if it has a declared `container-type`. Without one, `cqi` resolves against the **viewport inline size** (the root container), not the element's own width. Spec: CSS Containment Module Level 3, §7.1.

**Smallest correct design for "a card's padding follows the card's own width":**
```css
/* Option A: Pure length, no percentage (safest) */
--pad: calc(clamp(1rem, 3vw, 2em) * var(--size));
/* Reads viewport, scales with screen, not parent width */

/* Option B: Container query (requires setup) */
.card { container-type: inline-size; }
.card { --pad: calc(clamp(1rem, 8cqi, 2em) * var(--size)); }
/* Only works if EVERY card is marked container-type: inline-size */

/* Option C: Drop percentage, use pure em clamp */
--pad: calc(clamp(1rem, 1.2em, 2em) * var(--size));
/* Padding scales with the CARD'S own font size, not its parent width */
```

The owner's instinct is right: a percentage in `--pad` is relative to the parent, which varies in width across single/multi-column layouts. Option A (viewport-based clamp) or Option C (font-size-relative clamp) are the fastest ships; Option B requires declaring `container-type` on every card ancestor.

## Tokens/cost used
- Playwright headless inspections (2 shots at 400px)
- CSS spec lookups (1–2 min)
- No edits made
