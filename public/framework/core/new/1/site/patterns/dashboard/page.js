import { Page, p, div, a, h3 } from "/app.js";
import { code, section } from "../../ui.js";
import { recipe } from "../recipe.js";

/* Twelve panels and ONE url. The product exists to draw a line: a panel is not
 * a page, and the test is not "is it a box" — it is "can you link to it".
 */
const ranges = ["24h", "7d", "30d"];

const panels = [
	["mrr",        "MRR",              ["$48,210", "$48,210", "$47,760"], "+3.1% vs last month"],
	["signups",    "Signups",          ["41", "302", "1,288"],            "62% from the docs site"],
	["active",     "Active workspaces", ["2,914", "3,102", "3,180"],      "seen in the last 24h"],
	["churn",      "Churn",            ["2", "9", "38"],                  "0.9% monthly, flat"],
	["errors",     "5xx responses",    ["18", "212", "1,004"],            "all from the export worker"],
	["latency",    "p95 latency",      ["184ms", "191ms", "205ms"],       "api, excluding uploads"],
	["queue",      "Queue depth",      ["1,204", "480", "512"],           "peaked at 09:40 during the backfill"],
	["workers",    "Workers",          ["12 / 12", "12 / 12", "11 / 12"], "one restarted on Tuesday"],
	["deploys",    "Deploys",          ["3", "19", "74"],                 "median 4m12s, none rolled back"],
	["storage",    "Storage",          ["1.8 TB", "1.8 TB", "1.7 TB"],    "+60 GB this month"],
	["tickets",    "Open tickets",     ["7", "24", "91"],                 "2 breaching first-response"],
	["oncall",     "On call",          ["Ada", "Ada", "Grace"],           "handover Friday 17:00"],
];

const nav = () => ({
	meta: import.meta,
	title: "Dashboard",

	// Two different KINDS of thing arrive through one door, and the if/else is
	// the finding: a panel name is a place, a range is a modifier on this place,
	// and only one of them is a path segment. See the note.
	route(name){
		if (panels.some(([id]) => id === name)) return focused(name);
		if (ranges.includes(name)) return ranged(name);
	},

	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("No `children`, no `$pages`, no `tabs()`. Twelve panels is a `forEach`, and the interesting thing about this page is everything it does not declare.");

		grid("24h");

		section("Where navigation stops");

		code(`
a panel   drawn by content(), has no url, cannot be linked, shares this page's state
a page    has a url, is reachable cold, survives a reload, and can be sent to someone

the test is not "is it a box" — it is "can you link to it"`);

		p("Composition is the default and it is free. A panel becomes a page the moment somebody wants to send it to a colleague — and then it costs a `route()` and nothing else.");

		div.c("row", () => panels.slice(0, 4).forEach(([id, title]) =>
			a.c("page-link", `focus ${title}`).href(`/patterns/dashboard/${id}/`)));

		section("…and where the path stops");

		code(`
route(name){
    if (panels.some(([id]) => id === name)) return focused(name);   // a PLACE
    if (ranges.includes(name))              return ranged(name);    // a MODIFIER
}

/patterns/dashboard/errors/   one panel, big
/patterns/dashboard/7d/       the SAME twelve panels, different numbers`);

		div.c("row", () => ranges.forEach(r =>
			a.c("page-link", `range ${r}`).href(`/patterns/dashboard/${r}/`)));

		p("Those two lines are not the same kind of line. A panel name names a place; a range says how to read the place you are already at — and putting it in the path spends a segment, forces `route()` to disambiguate two namespaces that will one day collide (a panel called `7d`), and mints a second url that renders the same screen. That is the catalogue's argument arriving from a different direction: a modifier is what a query string is for.").ac("note");

		div.c("row", () => a.c("page-link", "the catalogue →").href("/patterns/shop/"));
	},
});

/* Twelve readings, one url. Not a page each — this whole function is what
 * "composition" means when the alternative is twelve directories. */
function grid(range){
	const i = ranges.indexOf(range);

	return div.c("patterns-grid", () => panels.forEach(([id, title, values, note]) =>
		div.c("patterns-panel", () => {
			p(title).ac("note");
			h3(values[i]);
			p(note).ac("note");
		})));
}

function focused(name){
	const [id, title, values, note] = panels.find(([panel]) => panel === name);

	return {
		title,
		content(){
			code(ranges.map((r, i) => `${r.padEnd(6)} ${values[i]}`).join("\n"), title);
			p(note);
			p("A page now, because it has a url. Nothing else about it changed — same data, same three lines that drew it in the grid.").ac("note");
			recipe(nav, "the dashboard's navigation — the first branch of route() produced this url");
			div.c("row", () => a.c("page-link", "← Dashboard").href("/patterns/dashboard/"));
		},
	};
}

function ranged(range){
	return {
		title: `Dashboard · ${range}`,
		content(){
			p(`The same twelve panels, read over ${range}. This is a second url showing the same screen, which is exactly the smell: nothing about the PLACE changed.`);
			grid(range);
			recipe(nav, "the dashboard's navigation — the SECOND branch of route() produced this url");
			div.c("row", () => a.c("page-link", "← Dashboard").href("/patterns/dashboard/"));
		},
	};
}
