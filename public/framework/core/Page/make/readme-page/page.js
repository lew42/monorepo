import { Page, md, div } from "/app.js";
import { section } from "../../../../ux/Content/structure/Structure.js";

/**
 * The fifth way to make a page: the content IS the module's own readme.md,
 * rendered with md.file(), plus one JS-built block under it. See core/Page/make/
 * ("5. readme.md") for the source and the rendered result shown side by side.
 */
export default new Page({
	meta: import.meta,
	title: "A readme as the page",
	description: "The whole page is its own readme.md, plus one JS-built block under it.",
	icon: "description",

	content(){
		// A Page isn't a View — it draws through `this.view`, so a promise
		// (capture:false, like every md.file()) gets appended onto a real box,
		// never `this`.
		div().append(md.file(import.meta, "readme.md"));

		section({
			title: "The JS-built part — a row of links, not markdown", bg: true, items: [
				{ name: "Make a page", icon: "add_box", weight: 2, href: "/framework/core/Page/make/" },
				{ name: "core/Page", icon: "menu_book", weight: 2, href: "/framework/core/Page/" },
			],
		});
	},
});
