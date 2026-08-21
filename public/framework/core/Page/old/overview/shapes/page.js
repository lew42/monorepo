import { Page, demo, md, div } from "/app.js";

const studio = () => new Page({
	title: "Studio",

	children: {
		HTML: {
			icon: "code",
			content(){
				md("No `classes:` — the **default shape**, `standard`: prose in a measure…");

				div.c("wide wash pad", () => md("…and a `.wide` band that escapes it."));
			},
		},
		CSS: {
			icon: "palette",
			classes: "full pad",
			content(){
				md("`classes: \"full pad\"` — no measure, an even inset: a board.");

				div.c("grid gap auto", () => "abcdef".split("").forEach(() =>
					div.c("wash").style({ height: "2.5em", borderRadius: "var(--radius)" })))
					.style({ "--column": "6em", "--gap": "0.5em" });
			},
		},
		JS: {
			icon: "data_object",
			classes: "full fill flex v",
			content(){
				div.c("wash pad flex-1", () => md("`full fill` — edge to edge, and BE the region's height."));
			},
		},
	},

	content(){
		md("Each child wears a different `classes:` — **walk the rail** and watch the page change shape.");
		this.previews();
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Basics",
	tree: studio,
	rail: true,
	height: "18em",
}));
