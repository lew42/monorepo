import { Page, classdoc, md, code, h2, toc } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "Page",
	description: "A node: a url, some content, and children.",
	icon: "description",

	Class: Page,
	methods: "child add container activate tabs",

	content(){

		toc();

		code.js(`import { Page, md } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Intro",
    content(){ md("hello"); },
});`);

		md("That file at `/docs/intro/page.js` is the url `/docs/intro/`. `meta` is what tells it so — one line, and the page knows its own address.");

		h2("Children");

		code.js(`children: "guide api"`);

		md("Names, not imports. Each one is a folder with a `page.js` in it, and **it isn't fetched until someone navigates to it** — that's the whole of lazy loading.\n\nNothing crawls the filesystem, so this line *is* the registration. A page nobody declared is a 404.");

		h2("A menu, without importing anything");

		code.js(`this.previews()`);

		md("Draws a card per child. It has to work before those children exist, so it can only use what the parent already knows — the name, and the url that name must have.");

		code.js(`nav: {
    guide: "The guide",                          // a label
    api:   { label: "API", icon: "code" },       // and an icon
}`);

		md("**A label belongs to the parent's list; a title belongs to the page.** Not two copies of one thing — `start` is labelled *\"Start here\"* in its parent's menu and titled *\"Start\"* on its own page, deliberately. An icon is the same kind of thing, which is why it lives here: it names *this entry in this menu*, so it costs no import.");

		md("Declare nothing and it still works: the label falls back to an imported child's `title`, then to the bare segment. A card reads `columns` until you visit it and `Columns` after — the honest cost, and a visible one.");

		h2("Real titles up front");

		code.js(`initialize(){ this.load_all_children(); }`);

		md("Imports every declared child so the menu can read their real titles and icons. **The opt-out of laziness**, and the reason it exists: with it, a page's icon and title live on the page and nowhere else. Pay the imports, delete the duplication.");

		h2("Tabs");

		code.js(`content(){ this.tabs("guide api"); }`);

		md("A bar of links plus the panel those children render into. Which children are tabs is decided at *placement*, not marked on the child — so a page can have several sets, and a child in none of them renders wherever it would have anyway.");

		code.js(`this.tabs("guide api").ac("vertical")`);

		md("The same set, turned on its side — the left nav on this page is that call. Identical JS: same urls, same default, same active marking.");

		md("Next: [Router](/framework/core/Router/) — what turns a url into one of these.");

		md.details(import.meta, "readme.md", "Design record — nav, arrangement, and .cols");
	}
});
