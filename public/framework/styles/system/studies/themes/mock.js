import { div, span, a, p, pre, button, figure } from "/app.js";

/* The mock mini-UI, built ONCE and painted by whatever theme class its wrapper
 * wears. Every colour in it comes from a token — there is not one literal here,
 * which is the only reason a class on the parent can repaint the whole thing.
 *
 * Real `button` and `a` elements on purpose: a mock built entirely from private
 * classes would prove only that MY css reads tokens. These are the same elements
 * framework.css and lew42.css style, so what the seam cannot reach shows up.
 */

// The six tokens the strip paints — the ones a person actually recognises a
// theme by. `--line` is the border of every chip, so it draws itself.
export const CORE = ["--wash", "--tint", "--surface", "--ink", "--subtle", "--prim"];

export function ui(name = "press"){
	return div.c("themes-ui", () => {
		div.c("themes-nav", () => {
			span.c("themes-brand", "Lew42");
			span.c("themes-navlink on", "Docs");
			span.c("themes-navlink", "Blog");
			span.c("themes-navlink", "Lab");
		});

		div.c("themes-body", () => {
			p.c("themes-title", "A card, themed");
			p.c("themes-text", () => {
				span("Body copy on ");
				span("--surface");
				span(", one ");
				a("link").href("#");
				span(" underlined in the accent.");
			});
			p.c("themes-caption", "Caption — --subtle, the quiet rung.");

			div.c("themes-btns", () => {
				button.c("prim", "Primary");
				button("Quiet");
			});

			pre.c("themes-code", () => {
				span.c("themes-com", "// the seam\n");
				span.c("themes-kw", "const ");
				span("app = ");
				span.c("themes-str", `"theme-${name}"`);
			});
		});
	});
}

export function swatches(tokens = CORE){
	return div.c("themes-swatches", () => tokens.forEach(t =>
		div.c("themes-swatch").style("background", `var(${t})`).attr("title", t)));
}

// One specimen: the label, the surface, the strip — with `theme` on the OUTER
// box, so the wash behind the card is themed too. `style` carries the generated
// themes' tokens, which exist only at runtime.
export function spec(name, theme, vars){
	return figure.c("themes-spec " + theme, () => {
		span.c("themes-spec-name", name);
		ui(theme.split(/\s+/)[0].replace("theme-", "") || name);
		swatches();
	}).style(vars ?? {});
}
