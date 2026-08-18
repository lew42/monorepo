# Rules — the layout dos and don'ts, one page each, with live examples that measure themselves; for whoever reviews a layout, and the agent about to write one

## Use
Each rule is a url — cite it in a review instead of quoting it: `/framework/styles/rules/nesting/`. Reading order: Cascade → Proportion → Nesting → Robust → Reuse. The `css` skill is the compressed version; this is the long form, with proof.

Adding a rule: write `<name>.md` beside `page.js`, declare it there, and hang its live demo after the prose (`page.js`):
```js
doc("Proportion", "proportion.md", "How much room a frame leaves.", padding_ladder),
```
Every rule that can be measured has an `ext/DesignTool` rule of the same name and threshold — Proportion: `pad-scale` `cramped` `double-pad` · Nesting: `escape` `clipped` `measure` `zero-size` · Cascade: `gutter`.

## Watch out
- `.measure` centres and the house rule is one left edge — three Figma layouts each hardcoded `max-width: 34em` around it, scoring A/B the whole time; `.measure.start` is the additive fix, and which way the default belongs is still the owner's call. [`doc/decisions.md`](./doc/decisions.md)
- A rules page and its DesignTool rule can drift apart silently — nothing asserts they agree; when they disagree, one is out of date. [`doc/decisions.md`](./doc/decisions.md)
- The nesting table's "safe?" column is hand-written; the demos beneath it are measured — trust the demos. [`doc/decisions.md`](./doc/decisions.md)
- `never` and `always` appear only where something actually breaks; everything else states its weight — read a firm word here as a claim to check, not an order. [`doc/decisions.md`](./doc/decisions.md)
- This is layout only — no page yet for type or colour, and `robust.md` is a shortlist of what was proven, not a survey. [`doc/decisions.md`](./doc/decisions.md)

## More
- Page: [/framework/styles/rules/](/framework/styles/rules/) — the five rules and their live examples.
- [`doc/decisions.md`](./doc/decisions.md) why in the site not only a skill, the enforcement seam, the open `.measure` default, what is missing · [`doc/file/`](./doc/file/) one note per file in this directory
- Rules: [`cascade.md`](./cascade.md) where a declaration belongs · [`proportion.md`](./proportion.md) two floors, one clamp · [`nesting.md`](./nesting.md) what contains what · [`robust.md`](./robust.md) seven arrangements, four widths · [`reuse.md`](./reuse.md) before a new block
- Files that matter: `page.js` (declares the five), `demos.js` (padding ladder, nesting table), `rules.css` (demo frames only)
