# decision architecture — mark the choice with three signals, not color alone

A UI template for showing a decision: a question, its alternatives as cards, and the one that won. Entry: [`decision.js`](../decision.js) (CSS); [`page.js`](../page.js) (demo and spec). It is pure markup, no state — stateful decisions belong in [`ux/Content/Question`](/framework/ux/Content/).

## The chosen card is marked by ground, border, and text together

**Decided:** the chosen option wears a lighter background, a 2px accent border, and the word "chosen" — three independent signals.
**Why:** `--prime` (#FF6157) is only 2.96:1 contrast on white; below 3:1 for UI shapes and 4.5:1 for text. Color alone is not accessible. Any one signal can be missed without losing which card won.
**Instead:** color alone; icon alone; a different size or weight.
**Detail:** [decision.js](../decision.js#L12-L17)

## Unchosen options are `--surface`, never `--wash`

**Decided:** option cards use `--surface` background, not `--wash`.
**Why:** In lew42's theme, `--wash` is the app's ground (#f2f2f2); a wash card on a wash page paints invisibly. Real borders need real background.
**Instead:** `--wash` (invisible boxes); `--tint` (only for nested levels).
**Detail:** [decision.js](../decision.js#L19-L25)

## The grid reflows with no breakpoints

**Decided:** options use `grid-template-columns: repeat(auto-fit, minmax(min(15em, 100%), 1fr))`.
**Why:** 15em is the floor a two-line label needs. One column at 400, three across at 1280, four at 1920 — responsive without breakpoints.
**Instead:** fixed column counts; media queries.
**Detail:** [decision.js](../decision.js#L38-L41)

## Nested decisions step backgrounds

**Decided:** an option that contains another decision nests on `--tint` (#f8f8f8), one step lighter than `--surface`.
**Why:** two levels never paint the same colour; a nested card must read as a layer, not a duplicate.
**Instead:** same background for both levels.
**Detail:** [decision.js](../decision.js#L82-L87)

## The mark is a word, not a symbol

**Decided:** the chosen mark is the word "chosen" with a "✓ " prefix, both in ordinary ink.
**Why:** it reads in screenshots, dark mode, and to readers who cannot distinguish colors.
**Instead:** icon or symbol alone; color-coded text.
**Detail:** [decision.js](../decision.js#L72-L76)

## Options are semantic `<ul>` of `<li>`

**Decided:** the structure is a real unordered list.
**Why:** they are actually a list of alternatives; the markup should say so.
**Instead:** `<div>` wrapper for layout.
**Detail:** [page.js](../page.js#L15-L19)
