import { div, md, demo } from "/app.js";
import layout from "../../ext/layout/layout.js";
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
			overrides(this);
			demo.source(template(this));
		},
	};
}

/* The tokens the class string reads (framework.css) — on a shape whose whole definition
   is its words, they are the only thing there is to override. A string that reads none
   gets no line. */
const TOKENS = { gap: "--gap", pad: "--pad", "all-pad": "--pad", auto: "--column",
	three: "--column", basis: "--basis", measure: "--measure", flow: "--flow" };

function overrides({ words, kids }){
	const tokens = [...new Set([...words.split(" "), ...kids].map(word => TOKENS[word]).filter(Boolean))];

	if (tokens.length)
		md(`**Overrides:** ${tokens.map(token => `\`${token}\``).join(", ")} — declared on the box with \`.style()\`, and inherited by every child.`);
}

const boxes = ({ words, kids }) =>
	div.c(words, () => kids.forEach(kid => div.c("pad wash " + kid, kid || "box").style("--pad", "0.5em")));

const template = ({ words, kids }) => `div.c("${words}", () => {`
	+ kids.map(kid => `\n    div.c("pad wash${kid && " " + kid}", "…");`).join("")
	+ "\n});";

export { word };
