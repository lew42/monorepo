import { Page, md, h3 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "CSS",
	description: "Layers, where a declaration belongs, and how to name a class — the vocabulary itself lives at /framework/styles/.",
	icon: "style",

	content(){
		md(`This page never repeats the vocabulary at [/framework/styles/](/framework/styles/) — no
list of utility classes, no token table. It answers a different question: **given a rule you need
to write, where does it go?**`);

		h3("The ladder — stop at the first rung that works");
		md(`nothing → a utility class → one of the five layout words → an existing component's class →
the module's own \`.css\` → \`/styles.css\` (skin, loaded last). Inline styles are off the ladder
entirely, except for a value only known at runtime.`);

		h3("Four layers, one order");
		md(`\`base theme site util\`, declared once in \`framework.css\`. The direction matters: \`@layer
util\` beats \`@layer theme\` at ANY specificity, so a utility class in your markup can silently
out-rank your own component rule. Fix it by dropping the utility, never by fighting the layer.`);

		h3("A new class name");
		md(`Check \`css-scopes.txt\` for the reserved prefix, census the live CSS for a collision, then
prefix with your module (\`.panel-grip\`, not \`.grip\`). Full six-step version, folded in from the
old \`new-css-class\` skill: [doc/rules.md](doc/rules.md#5-a-new-class-name).`);

		md("Full rules — the ladder, the layers, tokens, ownership, icons and class naming in full: [doc/rules.md](doc/rules.md). What has actually bitten: [doc/caveats.md](doc/caveats.md).");

		md.details(import.meta, "readme.md", "Readme");
	},
});
