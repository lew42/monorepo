A `<details>` dropdown's panel, positioned against its summary — the second
component in the directory to pass tooltip's "relationship or state" test.

## Why the trigger needs no CSS but the panel does

The trigger is `.btn` plus `flex v-center`, which also happens to remove the
UA's disclosure triangle (a summary keeps its marker only while
`display: list-item`). Only the panel is `position: absolute` against a
`position: relative` ancestor and appears `on open` — both halves of the
test — so only the panel gets a selector.

## Improvements

Nothing ranked: five rules, and the shadow (`color-mix(in srgb, var(--ink)
14%, transparent)`) already uses the same ink-derivation `panel.js` and
`Sidebar.css` use, rather than an `rgba` literal.
