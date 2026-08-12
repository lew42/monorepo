import { Page, demo, md, div } from "/app.js";
import web from "/framework/ext/demo/web.js";

/* The same nine-child sample site every demo borrows (ext/demo/web.js), wearing a
   catalog: the wall turned on its side, beside the region its children mount in.
   ⚠ Opened one level down, so a card is lit and the region is full. */
const dash = () => web({
	title: "Console",
	icon: "dashboard",

	content(){
		div.c("flex gap", () => {
			div.c("basis", () => this.previews().style({ "--column": "100%", "--gap": "0.4em" }))
				.style("--basis", "9.5em");

			// Children mount HERE, so clicking a card swaps this half and only this half.
			this.$pages = div.c("flex-1");
		});
	},
}).children.get("css");

export default new Page(demo.tree({
	meta: import.meta,
	group: "Patterns",
	tree: dash,
	height: "30em",

	note: "**Master–detail: the same cards as a [wall](/web/nav/wall/), in a column that does not move.** You keep the overview *and* the page, which is why it is the shape for a set you browse rather than read — demos, components, records. On the real site it is one line, `initialize(){ this.catalog(); }`, and the page's own `content()` becomes the first card in the rail. **The page you are reading is that call** — the rail on the left is this pattern, running.",
}));
