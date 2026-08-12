import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-12",
	description: "One composition axis: everything left-anchored. The size system shelved; mini_app renamed to demo.app().",
	icon: "flag",

	content(){

		md("**The axis verdict — blessed by Mike.** A page was running two compositions at once: title and prose on a centred measure, walls and exhibits packed left off the `wide` / `bleed` tracks. Two axes on one page reads broken at every scale, and it recurses — a `demo.app` repeats the fight inside a box already off the outer axis.");

		md(`## Left-anchor everything — one axis

- The opt-in \`.page.standard.left\` variant **became** \`.page.standard\`. Fixed
  gutter (\`clamp(2em, 4%, 5em)\`), \`main\` and \`wide\` starting on one grid line,
  every leftover pixel spent on the right.
- \`.page\` lost \`margin-inline: auto\`, so a \`pad\` / \`full\` page or a page in a
  tab panel joins the same axis instead of finding its own centre.
- \`.bleed\` still spans the page, but a **framed** exhibit pays the gutter back
  like the wall does — \`.demo-stage.bleed\` and \`.layout.bleed\`, each rule in the
  ext that owns the class. Unframed colour bands stay edge to edge; a catalog is
  a region, not an exhibit, and is left alone.
- Record, with the diagnosis and the one counter-argument worth reopening it
  with: [Page — doc/layout.md](/framework/core/Page/).`);

		md("**The size system + exhibit unification proposal was drafted and shelved** — one vocabulary for how big a thing renders (card, thumb, stage, exhibit) is worth having, but not on the same day the axis moved under it.");

		md("**A classdoc's header is a well.** The class name and the tab strip now share one row in a full-bleed band a shade darker than the page — title at the gutter, strip bottom-aligned on the band's edge, and the selected tab filled with the app's own ground (`--tab-fill`, new in `ext/tabs`, `transparent` by default) so tab and content read as one lighter surface cut into it. `.block` tabs took the scale's `h4`. Title and content land on `--gutter-x` — the axis, held.");

		md("**`mini_app()` is now `demo.app()`** — `import { demo } from \"/app.js\"`, then `demo.app(tree, { nav: true })`. `ext/demo/mini-app.{js,css}` became `app.{js,css}`, `MiniApp` became `DemoApp`, and the `.mini-app*` classes became `.demo-app*`. The box was never *mini*; it is the demo tier's app, and it now says so.");

		md("**Every detail page on the site is `demo.exhibit()` now** — `styles/sections` and `styles/layouts` were the last two hand-rolls and both converted by deleting, not adding: `layouts/Layout.js` and `recipe.js` dissolved into `detail.js`, and `sections/parts.js` is gone entirely, its `section()`/`eyebrow()`/`cta()` written out in the fifteen bands whose source is now the lesson. [demo §16](/framework/ext/demo/), [sections §11](/framework/styles/sections/), [layouts](/framework/styles/layouts/).");
	},
});
