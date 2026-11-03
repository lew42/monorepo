import { div, small } from "/framework/core/View/View.js";
import { section } from "/framework/dev/DevBar/parts.js";
import { tabs as devbar_tabs } from "/framework/dev/DevBar/tools.js";
import hold from "/framework/dev/DevBar/hold.js";

/* THE ADMIN TAB — only what already exists, nothing new: the writers' reload hold
   (read-only, as in the dev bar's head — a hold is taken from a terminal, never
   clicked), and the dev bar's own page sections: the route, the dev server, the page
   structure and the links to its tools. Borrowed from dev/DevBar/tools.js by name, so
   a section the dev bar changes changes here too. */
const WANT = ["route", "server", "structure", "jump"];

export default function admin({ app }){
	const page = devbar_tabs.find(([name]) => name === "page")?.[1] ?? [];

	div.c("drawer-admin flex v", () => {
		section("reload hold", () => {
			small.c("muted", "Who is holding live reloads while they write files. Empty means nobody.");
			hold();
		});
		page.filter(fn => WANT.includes(fn.name)).forEach(fn => fn(app));
	});
}
