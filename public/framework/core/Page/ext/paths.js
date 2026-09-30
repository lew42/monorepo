import { div, h4, a, span, small } from "/app.js";

/* Placed by this folder's own page.jsonl ({"place": "paths.js"}), right after the
 * Inbox demo above — proof that THIS page (the extension system's own demo) is
 * also the simplest place to SHOW the other kind of extension: one that hands a
 * page a whole extra url rather than a behavior inside its own box. The full
 * census and why none of these moved here: doc/path-extensions.md (readme.md
 * links it). Static data, not fetched — the table changes only when a human
 * edits this file, same as the readme's own copy of it. */
const ROWS = [
	{ adds: "md/", on: "every page", saves: "nothing (read-only)", built: true, href: "/framework/core/Page/md/" },
	{ adds: "fs/", on: "every page", saves: "nothing (read-only)", built: true, href: "/framework/core/Page/fs/" },
	{ adds: "its own AI assistant + chat", on: "any page, on first message", saves: "<page>ai/chat.jsonl", built: true, href: "/framework/core/Page/ai/" },
	{ adds: "a day's task folders", on: "/framework/ai/<date>/", saves: "ai/<date>/<slug>/task.jsonl …", built: true, href: "/framework/ai/" },
	{ adds: "a card's own folder", on: "/framework/ai2/<y>/<m>/<d>/<card>/", saves: "that folder's page.jsonl", built: true, href: "/framework/ai2/" },
	{ adds: "<page>/edit/ workspace", on: "—", saves: "—", built: false, href: "/imagine/cms/edit/" },
];

export default function paths(page, box){
	box.append(() => {
		h4("Path extensions — the other kind");
		small.c("muted", "A URL a page gains, not a behavior inside its own box. Full census: ");
		a.c("page-link", "doc/path-extensions.md").href("doc/path-extensions.md");

		div.c("page-ext-paths-table", () => ROWS.forEach(row => {
			div.c("card pad flex v gap-25", () => {
				div.c("flex gap v-center wrap", () => {
					a.c("page-link", row.adds).href(row.href);
					span.c("muted", row.on);
				});
				small.c("muted", row.saves === "—" ? "not built" : "saves: " + row.saves);
			}).ac(!row.built && "muted");
		}));
	});
}
