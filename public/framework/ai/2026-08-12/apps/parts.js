import { Page, md } from "/app.js";

/**
 * widget($el) — a box on a stage that handles its own pointer.
 *
 * ⚠ `demo.stage(fn, steer)` hands the render to `layout.bar()`, which makes it a
 * SELECTABLE REGION: every click inside opens the right drawer on whatever was
 * clicked, and every hover dashes it. That is exactly right for a layout lesson and
 * wrong for a widget with controls of its own — an editor whose properties chip
 * opens a second properties panel is showing two answers to one question. The bar
 * still steers the render as a whole; only its insides go quiet.
 */
export const widget = $el => $el
	.on("click", e => e.stopPropagation())
	.on("mouseover", e => e.stopPropagation());

/* The one tree these examples browse. A FACTORY, not a constant: a Page caches its
   view and every arrangement here adopts the tree it is handed, so two demos on one
   screen would fight over one set of nodes. */

const leaf = body => ({ content(){ md(body); } });
const branch = (icon, children) => ({ icon, children, content(){ this.previews(); } });

export const lead = "**Six sections, twenty pages, one tree.** Nothing below is data — every row, card and column is a real `Page` reading its own `children`.";

export const sitemap = () => new Page({
	title: "Studio",
	icon: "workspaces",

	children: {
		Color: branch("palette", {
			Tokens: branch("tag", {
				Prim: leaf("`--prim` is the **one** accent. A theme retunes it; nothing downstream names a colour."),
				Ink: leaf("Body text, paired light and dark by `light-dark()` — one token, two values."),
				Surface: leaf("What a card paints. A box that paints its own fill owns its own ink."),
			}),
			Contrast: leaf("`--subtle` is derived from the band's own ink, never from a fixed grey."),
			Modes: leaf("Light and dark are **modes of one theme**, not two themes."),
		}),

		Type: branch("text_fields", {
			Scale: leaf("Six levels: `h1`–`h4`, body, `code`. Each is also a class, so a `p` can borrow a level without lying about the outline."),
			Measure: leaf("`--measure` is the reading column. A page declares it; a wall opts out with `bleed`."),
		}),

		Layout: branch("dashboard", {
			Flex: leaf("Nine class strings, each one word from its neighbour."),
			Grid: leaf("Three strings and one token between them."),
			Shapes: leaf("`standard`, `pad`, `full`, `fill` — four stances on two tokens."),
		}),

		Motion: branch("animation", {
			Easing: leaf("One curve, or none. A second curve is a second opinion."),
			Duration: leaf("Long enough to be seen, short enough not to be waited on."),
		}),

		Icons: branch("star", {
			Sizes: leaf("`1.25em`, and it rides the text it sits beside."),
			Sets: leaf("One set. A second set is a second vocabulary."),
		}),

		Ship: branch("rocket_launch", {
			Deploy: leaf("Static assets with an SPA fallback. Nothing runs on the server."),
			Domains: leaf("Every branch gets its own preview host."),
		}),
	},

	content(){ md(lead); },
});
