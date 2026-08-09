import { Page, md, demo, div, h3, p, a } from "/app.js";
import { palette } from "../parts.js";
import { card } from "./card.js";

const body = () => {
	div.c("h4 ui-muted", "Core");
	h3("View");
	p("A DOM element with a chainable API, and one idea: capturing.");
};

export default new Page({
	meta: import.meta,
	title: "Card",
	description: "A padded surface — and the one class the rest of the library is built on.",
	icon: "web_asset",

	content(){

		palette(
			["ui.card(…)", () => card(body)],
			["with a link", () => card(() => {
				body();
				a.c("page-link", "Read →").href("/framework/core/View/").style("color", "var(--prim)");
			})],
			["retuned", () => card(body).style("--gap", "1.2em")],
		);

		md("## Calling it");

		demo(() => {
			card(() => {
				h3("View");
				p("A DOM element with a chainable API.");
			});
		}, "Whatever you pass goes inside. `ui-card ui-surface pad flex v gap` — **no stylesheet of its own**, and `--gap` is the one knob.");

		md("## `ui-surface` is the shared look");

		md("Four token declarations, in `parts.js`, worn by `card`, `panel`, `alert`, `tags`, `stats`, `accordion`, `dialog` and `kbd`:");

		md("```css\n.ui-surface {\n\tbackground: var(--surface);\n\tcolor: var(--ink);\n\tborder: 1px solid var(--line);\n\tborder-radius: var(--radius);\n}\n```");

		md("**`color` is not decoration.** A box that paints its own fill owns its own ink: without that line a card inherits whatever is around it, and on a dark or accent band a `section()` hands down `color: var(--surface)` — every card in the testimonials, pricing and team bands rendered white text on white. Measured, once.");

		md("These were four inline declarations in a shared style object before the move to `ui/`. A class is better for exactly one reason: **you can override it.** A style object lands as an inline style, which nothing downstream can climb over.");

		md("## Cards in a row");

		demo(() => {
			div.c("grid gap auto", () => ["View", "Page", "Router"].forEach(name => card(() => {
				h3(name);
				p("One class does the wall: `grid gap auto`.");
			})));
		}, "`grid gap auto` is `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))` — a responsive wall with no media query. Resize the window.");

		md("One thing to know: `pad flow` looks like the obvious inner class and it is wrong. `flow` is **page** rhythm — a small heading takes `--flow × 1.5`, so an eyebrow label and its title land 48px apart. `flex v` plus a small gap is a component's own rhythm, which is why `--gap` is `0.5em` here.");

		md("Next: [Stat tiles](/framework/ui/stats/) — the same surface, four across, one token retuned.");
	},
});
