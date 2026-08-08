import { Page, h2, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Page",
	description: "A node: a url, some content, and children.",

	content(){
		code.js(`import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Intro",
    content(){ p("hello"); },
});`).ac("mb");
		md("That file at `/docs/intro/page.js` is the url `/docs/intro/`. `meta` is what tells it its own address.").ac("mb");

		h2("Children").ac("mb");
		code.js(`children: "guide api"`).ac("mb");
		md("Names, not imports. Each one is a folder with a `page.js` in it, and it isn't fetched until someone navigates to it, that's the whole of lazy loading. Nothing crawls the filesystem, so this line **is** the registration: a page nobody declared is a 404.").ac("mb");

		h2("A menu, without importing anything").ac("mb");
		code.js(`this.previews()`).ac("mb");
		md("Draws a card per child, using only the name and url that name must have, before those children exist. `nav: { guide: \"The guide\" }` gives an un-loaded child a real label instead of the bare segment.").ac("mb");

		h2("Real titles up front").ac("mb");
		code.js(`initialize(){ this.load_all_children(); }`).ac("mb");
		md("Opts out of laziness: imports every declared child so the menu can read their real titles and icons. The Router waits for that before showing the page, so the menu draws once, correct.").ac("mb");

		h2("Tabs").ac("mb");
		code.js(`content(){ this.tabs("guide api"); }`).ac("mb");
		md("A bar of links plus the panel those children render into. Which children are tabs is decided at *placement*, not marked on the child, so a page can have several sets.").ac("mb");

		md("Next: [Sidebar](/edric/getStarted/framework/sidebar/), a brand over a list of links.");
	}
});