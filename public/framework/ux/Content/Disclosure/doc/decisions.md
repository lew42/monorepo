# Decisions — the variants words

The five extra words on `Disclosure` (`width`, `gap`, `box`, `scheme`, `marker`/`markerSide`,
[`variants/page.js`](/framework/ux/Content/Disclosure/variants/)) are each one class, added only
when asked for — v1 (`stack` alone) never sees them.

## Two bugs that only measuring found, not looking

- **A rotated marker still needs its own `content`.** `marker-chevron`/`marker-twirl` set
  `content` on the closed state and only `transform` on `[open]`, expecting the un-rotated glyph
  to carry through. It didn't: the base rule already sets `content: "\2212"` on `[open]` at the
  same CSS specificity, and — since that base rule sits earlier in `content.css` — a rule that is
  merely equal-specificity and later normally wins, but only for the properties it actually
  declares. Because the chevron/twirl `[open]` rule never declared `content`, the base rule's
  `content` stood, so every "open" row showed a plain "−" no matter which marker was picked. Fix:
  repeat `content` in the `[open]` rule too. Caught by reading the rendered glyph in a screenshot,
  not by reading the CSS.
- **An inherited `color` can still lose to something more specific you didn't write.** `scheme-dark`
  set `color: #fff` on the row (`.ux-content-disclosure`), expecting the title and icon to inherit
  it. The title rendered at `rgb(63,63,63)` on a `rgb(35,38,45)` background — a 1.44:1 contrast
  ratio, far under the 4.5:1 floor — because something more specific than the inherited value was
  still setting the title's own color. Fix: name `summary`, `.ux-content-title` and `.icon`
  explicitly inside `scheme-dark`, rather than relying on inheritance. Caught by computing the
  actual contrast ratio in a small Playwright script, not by eyeballing the screenshot — the
  white body text right next to the unreadable title looked "close enough" at a glance.

## gap-none and rounded corners

`gap-none` on top of the `faq` stack word (individually-rounded rows) would pinch at the touching
corners — the `layout` skill's own rule: rounded items with zero gap leave a notch. `gap-none`
squares the touching edges and adds a divider between rows, the same fix `flush` already uses for
its own zero gap.

## What was not built

- No new stack word replaces `faq`/`flush`/`lines` — the five words above lay on TOP of any of the
  three, so a page picks a stack word for the shape and, separately, any of these for width, gap,
  colour and the icon.
- No "twirl vs chevron" distinction beyond the glyph and how far it rotates (90° vs 180°) — both
  read as "this row expands," which is what the owner asked to compare, not a request for a third
  fully custom animation.
