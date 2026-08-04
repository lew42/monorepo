import { Page, p, div, a } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

/* Six records here; a thousand would change nothing on disk. The list is drawn
 * from this array and the detail is claimed by route(), so adding a record is
 * adding a record. */
const records = [
	{ id: "1024", name: "Ada Lovelace",    role: "Analyst",  joined: "1843-10-01" },
	{ id: "1025", name: "Grace Hopper",    role: "Compiler", joined: "1952-04-11" },
	{ id: "1026", name: "Barbara Liskov",  role: "Types",    joined: "1968-09-02" },
	{ id: "1027", name: "Karen Spärck",    role: "Search",   joined: "1972-01-18" },
	{ id: "1028", name: "Radia Perlman",   role: "Routing",  joined: "1985-06-30" },
	{ id: "1029", name: "Margaret Hamilton", role: "Flight", joined: "1965-03-14" },
];

export default new Page({
	meta: import.meta,
	title: "Master / detail",

	// No children declared, so every segment under me is mine to claim. A record
	// that exists is a page; one that doesn't is a 404, not a blank detail.
	route(id){
		const record = records.find(r => r.id === id);

		return record && {
			title: record.name,
			content(){
				p(`Claimed by \`route("${record.id}")\`. No file, no directory, no entry in any children map — and a real, reloadable, linkable url.`);
				code(JSON.stringify(record, null, 2), "the record");
			}
		};
	},

	content(){
		when("a list of records is long, uniform, and comes from data — customers, builds, messages, commits. One file serves all of them.");

		// The list is my content; the detail is my child. Two tracks, not equal,
		// because a list only needs its own width.
		this.$pages = div.c("pages master-detail", () => {

			div.c("master-list", () => {
				records.forEach(record =>
					a.c("page-link", record.name).href(this.url + record.id + "/"));
			});

			// Steps aside the moment a detail joins the chain — one :has() rule,
			// so the detail can be grid track 2 instead of landing on row 2.
			div.c("master-empty", () => {
				p("Pick someone.").ac("note");
				p("`/compound/master-detail/9999/` is a 404, because `route()` returns nothing for an id that isn't there — the claim is per-url, not per-prefix.").ac("note");
			});
		});

		section("The file");

		this_file(import.meta);

		cost("`route()` runs on every unmatched segment under me, so it must stay cheap and it must say no. Returning a page for anything would turn every typo into a blank detail.");
	}
});
