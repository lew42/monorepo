# Progress architecture — use raw HTML elements, themed by the browser

The progress module shows how to use `<progress>` and `<meter>` — native HTML elements for determinate bars, indeterminate spinners, and gauges. Code: [`page.js`](../page.js).

## No wrapper component

**Decided:** there is no `ui.progress()` function. The module documents how to call `progress()` and `meter()` directly, both View factory functions.

**Why:** wrapping a native element hides its attributes (`max`, `value`, `low`, `high`, `optimum`). A label and layout around the bar are composition — `flex split v-center` from the toolbar pattern — not encapsulation.

**Instead:** a component-function (costs an attribute, a type name and a listener) or a static wrapper (costs an extra div).

**Detail:** [ui/doc/decisions.md](/framework/ui/doc/decisions.md#the-bar)

## Themed by accent-color, not pseudo-elements

**Decided:** bars inherit `accent-color: var(--prime)` from the body. One declaration in `framework.css` sets the theme; a vendor pseudo-element route (`::-webkit-progress-bar`) is not used.

**Why:** pseudo-elements are per-engine and lock you out of the platform's own theming. `accent-color` is the browser's standard API, inheritable and animatable.

**Instead:** per-engine shadow-dom styling (fragile across vendors) or a custom canvas/SVG reimplementation (not the honest deliverable).

**Detail:** [framework.css](/framework/framework.css) — line containing `accent-color: var(--prime)`
