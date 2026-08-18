# Styles — the CSS strategy under every page: four layers, six type levels, as little else as possible

## Use
Stop at the first rung that works: nothing → a utility class → an existing component's class → the module's own `.css`, layout only → `/styles.css`, skin.

```js
div.c("flex gap v-center pad", () => {
	div.c("h4 flex-1", "row");
	button.c("prim", "One");
	button("Two");
});
```
A module stylesheet, when a rung-4 rule is unavoidable: `View.stylesheet(import.meta, "x.css")`, every rule inside `@layer theme { … }`.

## Watch out
- Every rule lives inside a layer — an unlayered rule beats every layer at any specificity. [`doc/cascade.md`](./doc/cascade.md)
- Four layer names, `base, theme, site, util`; the order is declared once, in `framework.css`, which `app.js` loads first — a name outside the four lands past `util`, silently. [`doc/cascade.md`](./doc/cascade.md)
- Overriding a `framework.css` rule is a bug report about `framework.css` — de-escalate upstream, never escalate downstream. [`doc/ownership.md`](./doc/ownership.md)
- Base-theme selectors stay flat — one element, no descendant combinators — or a theme's `h2` can never win. [`doc/cascade.md`](./doc/cascade.md)
- Never invent a font-size: six levels, each also a class; margins are rhythm and belong to whatever arranges the content. [`doc/theme.md`](./doc/theme.md)
- `.flex > * { margin: 0 }` kills `margin-inline: auto` inside a flex row — reach for `.measure`. [`doc/decisions.md`](./doc/decisions.md)

## More
- Page: [/framework/styles/](/framework/styles/) — the ladder, the layers, the ratchet, the type scale, shown.
- [`doc/decisions.md`](./doc/decisions.md) record, who imports · [`doc/ownership.md`](./doc/ownership.md) ladder, class-vs-function · [`doc/cascade.md`](./doc/cascade.md) ratchet, `site`, `:where()`
- [`doc/layout-system.md`](./doc/layout-system.md) **the five layout words** — page · rail · wall · stage · solo
- [`doc/theme.md`](./doc/theme.md) tokens, scale, dark · [`doc/audits.md`](./doc/audits.md) evictions, measured · [`doc/scrolling.md`](./doc/scrolling.md) which region scrolls · [`doc/measure.md`](./doc/measure.md) `--measure` proposal, unchanged
- [`layers/`](./layers/) one page per layer · [`layouts/`](./layouts/readme.md) seventeen whole-page layouts · [`rules/`](./rules/readme.md) dos and don'ts · [`sections/`](./sections/readme.md) landing-page bands · [`elements/`](./elements/readme.md) every styled element
- Themes: [`layers/theme/`](./layers/theme/) the base theme · [`layers/theme/guide/`](./layers/theme/guide/readme.md) writing a theme · [`layers/theme/lew42/`](./layers/theme/lew42/readme.md) the house theme · [`css-scopes.txt`](./css-scopes.txt) reserved class prefixes
- Files that matter: `/framework/framework.css` (the only `@layer` statement, tokens, utilities), `/styles.css` (this site's skin), `layers/theme/lew42/lew42.css` (the house theme, wired in `app.js`)
