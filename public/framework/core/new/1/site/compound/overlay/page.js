import { Page, p, div, a, input } from "/app.js";
import { section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Overlay",

	initialize(){
		/* A modal that is a url. `full` is the only thing that makes it an
		 * overlay, and it is the same class /compound/columns-in-full/ uses to
		 * take the window — one class, two intents, because both are "cover
		 * everything" and neither is chrome management. */
		this.add("sheet", {
			title: "The sheet",
			classes: "full",

			content(){
				div.c("full-body", () => {
					p("I am `position: fixed; inset: 0`, mounted inside my parent's region — so my parent is still rendered, still holding its DOM, directly underneath me.");

					p("Close me and look at the box you typed in. It never went anywhere: pages are built once, and leaving the chain only takes the classes off.").ac("note");

					div.c("row", () => {
						a.c("page-link", "× close").href("/compound/overlay/");
						a.c("page-link", "leave entirely →").href("/compound/");
					});

					p("The browser Back button closes me too, because opening me was a `pushState` and nothing else.").ac("note");

					section("The file that made me");

					// the same module — an inline child has no file of its own, and
					// this is exactly the file a reader needs to see
					this_file(import.meta);
				});
			}
		});
	},

	content(){
		when("something needs the whole window for a moment and must still be linkable, shareable and Back-able — an image viewer, a record editor, a confirm-and-return.");

		div.c("row", () => input().attr("placeholder", "type here, then open the sheet"));

		div.c("row", () => a.c("page-link", "open the sheet →").href(this.url + "sheet/"));

		section("Why the page underneath survives");

		p("`this.$pages` makes the sheet MY child rather than my sibling, so `.page.active-ancestor:has(.page.active-page)` keeps me on screen. Without the region the sheet would land in `app.$pages`, I would be an ordinary replaced ancestor, and closing it would rebuild nothing — but my scroll position and my half-typed input would be gone.");

		section("The file");

		this_file(import.meta);

		cost("`full` covers rather than removes: this page is still tabbable and still read aloud underneath the sheet. A real modal wants `inert` on what it covers, and that belongs to the site rather than the framework.");

		// my region — the sheet mounts in here, which is the whole trick
		this.$pages = div.c("pages");
	}
});
