import { Page, demo, div, md } from "/app.js";
import { pick } from "/framework/ext/layout/controls.js";
import { sitemap, lead, widget } from "../parts.js";
import { columns } from "../columns/columns.js";

const MODES = ["rail", "wall", "columns"];

/* Three answers to one question, over one tree. Each takes a FRESH `sitemap()`: a
   Page caches its view and every arrangement adopts what it is handed, so two of
   these would otherwise fight over one set of nodes. */
const dress = {
	rail: () => sitemap().catalog(),
	wall: () => sitemap().assign({ content(){ md(lead); this.previews(); } }),
	columns: () => columns(sitemap()),
};

function navigation(){
	return widget(div.c("flex v gap", () => {
		let $box;

		div.c("flex v-center wrap gap", () => pick(MODES, name => $box.empty(() => open(name)), "rail"))
			.style("--gap", "0.3em");

		$box = div(() => open("rail"));
	}));
}

const open = name => demo.app(dress[name]()).style({ minHeight: "24em", "--rail": "12em" });

export default new Page(demo.layout({
	meta: import.meta,
	title: "Navigation",
	description: "One tree, three ways — a rail, a wall that swaps, and columns.",
	icon: "alt_route",

	layout: navigation,

	note: "**Switch between the three and watch what moves.** The tree is identical in all of them — the same six sections, the same twenty pages, the same `previews()` cards. Only the arrangement changes, and each one is a single call.",

	content(){
		demo.exhibit({
			page: this,
			stage: steer => demo.stage(navigation, steer).ac("bleed"),
			def: navigation,
			file: new URL("page.js", this.meta.url).pathname,
			note: this.note,
		});

		md(`| | what stays put | what it costs | where it wins |
|---|---|---|---|
| **rail** — \`this.catalog()\` | the cards | a fixed column of width, forever (\`--rail\`, 19em by default) | a set you come back to: siblings are one click apart and the page you came from never moves |
| **wall** — \`this.previews()\` | nothing | a click to get back | an index you pass through once — the cards get the whole width, so a live thumb is readable |
| **columns** — \`columns(tree)\` | every ancestor | horizontal scroll, and rows too narrow for a thumb | a deep tree you are hunting in: the path is on screen and you can step sideways at any level |`).ac("wide");

		md("**The honest answer is that the depth decides.** A rail is a wall that ran out of width, and columns are a rail that ran out of levels — the `catalog()` record already says the rail is `previews()` turned on its side, and the columns here are `catalog()` applied at *every* level. One card system, three arrangements of it; nothing above is a second component.");
	},
}));
