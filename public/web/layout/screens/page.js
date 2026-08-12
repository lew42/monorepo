import { Page, demo, md, div, p, span, a } from "/app.js";

const tile = (label, value) => div.c("pad surface flex v gap", () => {
	span.c("h2", value);
	span.c("muted", label);
}).style({ "--gap": "0.1em", "--pad": "0.8em" });

const tiles = () => {
	tile("Open orders", "1,284");
	tile("Bays in use", "37 / 48");
	tile("Late", "6");
	tile("Picked today", "9,410");
	tile("Inbound", "12");
	tile("Dwell, hours", "3.1");
};

const throughput = () => div.c("flex gap flex-1", () =>
	[38, 61, 47, 84, 72, 95, 66, 51, 79, 88, 43, 70].forEach(h =>
		div.c("wash flex-1").style("height", h + "%")))
	.style({ alignItems: "flex-end", "--gap": "0.4em", minHeight: "4em" });

const feed = () => div.c("flex v gap", () => [
	["PO-4471 received", "2m"], ["Bay 12 released", "9m"],
	["Cycle count, aisle C", "24m"], ["Trailer 88 docked", "1h"],
].forEach(([what, when]) => div.c("flex split gap", () => {
	span(what);
	span.c("muted", when);
}))).style("--gap", "0.55em");

const panel = (title, fn) => div.c("pad surface flex v gap flex-1", () => {
	p.c("h4", title);
	fn();
}).style({ "--pad": "0.9em", minWidth: "0" });

const bays = () => div.c("grid gap auto", () => {
	for (let i = 1; i <= 48; i++)
		div.c("pad wash flex v", () => {
			span.c("h4", "B" + String(i).padStart(2, "0"));
			span.c("muted", i % 5 ? "held" : "free");
		}).style("--pad", "0.6em");
}).style({ "--column": "7em", "--gap": "0.6em" });

const depot = () => new Page({
	title: "Depot",
	icon: "warehouse",

	children: [
		{ name: "board", title: "Board", icon: "dashboard", classes: "pad fill flex v gap", content(){
			div.c("grid gap auto", tiles).style("--column", "8.5em");

			div.c("flex gap wrap flex-1", () => {
				panel("Throughput · last 12 hours", throughput);
				div.c("basis", () => panel("Feed", feed)).style("--basis", "15em");
			}).style({ minHeight: "0", overflowY: "auto" });
		} },

		{ name: "bays", title: "Bays", icon: "grid_view", classes: "pad fill flex v gap", content(){
			p.c("h4", "Forty-eight bays, one wall — `grid gap auto` at `--column: 7em`");
			div.c("flex-1", bays).style({ minHeight: "0", overflowY: "auto" });
		} },
	],

	// The shell the whole console lives in: a rail that never moves, and the one
	// region that swaps. Both children are ordinary pages wearing `pad fill flex v gap`.
	render(){
		return this.view ??= div.c("page full fill flex", () => {
			div.c("basis flex v gap pad", () => {
				p.c("h4", this.title);

				this.children.forEach((_, name) => {
					const nav = this.nav_for(name);
					a.c("page-link", nav.label).href(nav.url);
				});
			}).style({ "--basis": "9em", "--gap": "0.4em", "--pad": "0.9em" });

			this.$pages = div.c("flex-1");
		});
	},
}).children.get("board");

export default new Page(demo.tree({
	meta: import.meta,
	group: "The page",
	icon: "space_dashboard",

	tree: depot,
	height: "36em",

	content(){
		this.stage().ac("bleed");
		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**Some pages have no prose to protect.** A console, a catalog, a split pane — the content *is* the screen, so the measure has nothing to do and the right answer is to fill the region. `classes: \"pad fill flex v gap\"` is the whole stance: no measure, an even inset, and `fill` so the page is the region's height rather than its content's. Click **Bays** for the other half of it — forty-eight tiles that turn a 3440px monitor into eight columns instead of leaving two-thirds of it grey.");

		md("`fill` has to be earned, and both declarations are load-bearing: `min-height` makes a short page fill, `overflow: hidden` stops a tall one pushing its own footer off the region. That is why the panel row below the tiles carries `flex-1` and owns its own `overflow-y` — a board that stops halfway down the region is not a board.");

		md("Reference: [Dashboard](/framework/styles/layouts/dashboard/) — this shape at full size · [Layouts](/framework/styles/layouts/) — the other seven.");
	},
}));
