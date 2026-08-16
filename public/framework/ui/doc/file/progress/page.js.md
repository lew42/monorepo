No `progress.js` — the component is `<progress>`/`<meter>`, and the whole
directory is a demonstration of how much the platform already themes for
free.

## `accent-color` is the browser's own theming API

`framework.css` sets `body { accent-color: var(--prim) }` once, and every bar
on this page arrives themed with zero CSS in this directory. The vendor
pseudo-element route (`::-webkit-progress-bar`) is explicitly not taken: it's
per-engine and opts out of the platform's own theming.

## Improvements

Nothing ranked: the page's own table (markup → what shows) is the clearest
piece of API documentation in the whole directory, and the "Progress / meter
row" candidate was correctly cut in `doc/record.md` §7 for duplicating
`styles/elements/forms`.
