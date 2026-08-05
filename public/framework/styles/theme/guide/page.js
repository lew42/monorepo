import { Page, View, md, demo, div, p, a, button, pre, code, span } from "/app.js";

View.stylesheet(import.meta, "paper.css");
View.stylesheet(import.meta, "terminal.css");

/* One block of markup, rendered under every theme on this page. Same DOM, same
 * classes, no theme-aware code anywhere — which is the claim the page is making,
 * so it had better be literally true. */
const sample = () => {
	div.c("h3", "Heading");
	p("Body copy with ", code("inline code"), " and ", a("a link").href("#"), ".");
	pre("app.font('Montserrat')");
	div.c("flex gap v-center", () => {
		button.c("prim", "Primary");
		button("Plain");
		span.c("h4", "annotation");
	});
};

export default new Page({
	meta: import.meta,
	title: "Writing a theme",
	description: "Two sample themes, both modes, and the ladder from token to rule.",
	content(){

		demo(() => {
			div.c("theme-paper pad", sample);
		}, "A theme is a class you put on anything. `body.theme-paper` themes the site; `div.theme-paper` themes one box.");

		demo(() => {
			div.c("flex gap all-1", () => {
				div.c("theme-paper pad", sample);
				div.c("theme-terminal pad", sample);
			});
		}, "**Same markup, same classes, zero theme-aware code.** Two files, neither of which mentions a component or the other theme. This is what §3's *\"two variants side by side\"* meant.");

		md("## What a theme is allowed to contain");

		md("Tokens. Ideally nothing else.\n\n```css\n.theme-paper {\n    --prim:    #9a5b28;\n    --ink:     #2c2622;\n    --surface: #fbf7f0;\n    --radius:  0.5em;\n    --font:    Georgia, serif;\n\n    color: var(--ink);\n    background: var(--surface);\n    font-family: var(--font);\n}\n```\n\nThe theme paints **itself** rather than leaning on `body { color: … }`, so it works at any depth. `color` inherits as a *resolved value* — a nested box that only redefined `--ink` would change nothing.");

		md("## The ladder");

		md("Same shape as the CSS ladder. Stop at the first rung.\n\n| rung | you write | when |\n| --- | --- | --- |\n| 1 | **a global token** — `--prim`, `--font` | almost always |\n| 2 | **a component token** — `--tab-bar-bg` | one component must differ |\n| 3 | **a rule on generic HTML** — `h1::before` | no token can express it |\n| 4 | **a rule naming a component class** | ✗ — the component is missing a token |\n\nRung 4 is the failure the whole design exists to prevent. A theme that says `.tab-bar { … }` has to be edited every time a component is added, and a component can no longer be understood without reading every theme. **If you reach for it, add the token instead and push the change into the component.**");

		demo(() => {
			div.c("theme-terminal pad", () => {
				div.c("h3", "Heading");
				p("Rung 3: a `::before` on generic headings.");
			});
		}, "`terminal` carries one rung-3 rule — markdown-style heading prefixes, which no token can express. It's safe because it names **generic HTML**, and generic HTML is exactly a theme's business. (Modules are the opposite: they style only classes they emit. See [Styles](/framework/styles/).)");

		md("## Light and dark are not two themes");

		md("They're two **modes of one theme**, and they belong in the same file — a token that exists in light and goes missing in dark is a bug you find at 11pm.\n\n```css\n.theme-paper {\n    color-scheme: light dark;\n    --surface: light-dark(#fbf7f0, #1d1917);\n    --ink:     light-dark(#2c2622, #ece4d8);\n}\n.theme-paper.light { color-scheme: light; }\n.theme-paper.dark  { color-scheme: dark; }\n```\n\n`light-dark()` picks by the used value of `color-scheme`, so one declaration covers both and they cannot drift. Declaring `color-scheme` also fixes form controls and scrollbars for free.");

		demo(() => {
			div.c("flex gap all-1", () => {
				div.c("theme-paper light pad", sample);
				div.c("theme-paper dark pad", sample);
			});
		}, "One theme, both modes, forced with `.light` / `.dark`. Omit both and it follows the OS.");

		md("A theme declares `.light` / `.dark` **itself** rather than inheriting them from the framework — honoring the axis is a promise, and a theme with no `light-dark()` in it would be lying by accepting the class. `terminal` supports dark only, and says so by not declaring them.");

		md("## Naming");

		md("The trap is `theme-1`, `theme-2`, `theme-blue`, `theme-blue-big`, `theme-blue-big-compact`. Separate **identity** from **axes** and it doesn't happen.\n\n| | form | combines? | examples |\n| --- | --- | --- | --- |\n| **theme** | a proper noun | no | `paper`, `terminal`, `lew42` |\n| **axis** | an adjective | yes | `dark`, `compact` |\n\nA theme gets a **name, not a description**. `blue` becomes a lie the first time you change the accent; `big` isn't an identity, it's a density axis wearing a costume; `v2` re-opens the versioning argument the design record already settled.\n\nAxes are orthogonal and *do* combine, which is safe because each one is a single dimension:");

		md("```html\n<div class=\"app theme-paper dark compact\">\n```\n\nTwo themes × two modes × two densities = eight looks from two files, and nothing is ever called `theme-blue-big`.");

		md("**The test for \"is this a new theme or an axis?\"** — does it change the *vocabulary* or only the *values*? Values → an axis, or a token override on the class you already have. Vocabulary → a new theme. Almost everything is values.");

		md("Next: [lew42](/framework/styles/theme/lew42/) — a real theme, ported from a Figma comp.");

		md.details(import.meta, "readme.md", "Design record — theming architecture");
	}
});
