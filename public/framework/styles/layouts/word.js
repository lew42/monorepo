import { div, md, code, details, summary, demo } from "/app.js";
import layout from "../../ext/Layout/layout.js";
import { shape } from "./preview.js";

/* word(child) — one class string, as an inline child page.
 *
 *     children: [
 *         word({ name: "wrap", label: "Wraps to a second line",
 *                words: "flex gap wrap", kids: n(6), note: "…" }),
 *     ]
 *
 * The card is the shape and nothing else; the page is the same string at real size
 * on the stage, under a `layout.bar()` — so every box on it is selectable and the
 * panel reads its words back. The template sits closed underneath.
 *
 * `column` is the CARD's `--column` only (preview.js): the frame is a few em wide,
 * the real box is a stage wide, and the same token cannot be right for both.
 *
 * ⚠ Every rendered box wears `pad wash` so you can see it — the only difference
 * between the template and the picture, and the template says so too.
 */
export default function word(child){
	return {
		title: child.words,
		classes: "standard",
		...child,

		// `surface` because a thumbed card is bare (Page.css): a schematic of empty
		// boxes with no ground of its own would be drawn straight onto the page.
		preview(nav){
			return this.preview_card(nav, () => shape(this.words, this.kids, this.column).ac("surface"));
		},

		content(){
			let $box;

			demo.stage(() => div.c("pad surface", () => { $box = boxes(this); })).ac("bleed");
			layout.bar($box);

			md(this.note);
			source(this);
		},
	};
}

const boxes = ({ words, kids }) =>
	div.c(words, () => kids.forEach(kid => div.c("pad wash " + kid, kid || "box").style("--pad", "0.5em")));

/* `.demo-source` is ext/demo's own closed-details block, borrowed so every source on
   the site looks alike. `demo.source()` itself takes a function; this code is a
   string, built from the two arguments the box above was built from. */
const source = child => details.c("demo-source", () => {
	summary("Source");
	code.js(template(child));
});

const template = ({ words, kids }) => `div.c("${words}", () => {`
	+ kids.map(kid => `\n    div.c("pad wash${kid && " " + kid}", "…");`).join("")
	+ "\n});";

export { word };
