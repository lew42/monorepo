import { Page, md, code } from "/app.js";

const SCALE = { "--column": "18em", "--gap": "1.25em", "--thumb-max": "15em" };

export default new Page({
	meta: import.meta,
	title: "UI",
	description: "Nineteen components — three functions, sixteen copy-paste templates.",
	icon: "widgets",

	children: "table field crumbs pagination card stats badge alert toolbar tags panel tooltip avatar dialog progress menu accordion timeline kbd",

	/* No toc(): the wall renders REAL components, whose `h3`/`.h2` once read as
	   sections of this page — "View · 3 · 0 · 16". `.page-previews` is in `toc()`'s
	   skip list now, so a rail here would work; nobody has tried it. */
	content(){

		this.previews().style(SCALE);

		md("Every card above is a **live call**, drawn by the page it links to — each component overrides `preview()` with its own render, so a card cannot show something its page doesn't.");

		code.js(`import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");`);

		md("## Three functions, sixteen templates");

		md("Only [Data table](/framework/ui/table/), [Timeline](/framework/ui/timeline/) and `keys()` on [Keys](/framework/ui/kbd/) are functions, and each is a **loop** — the one thing markup cannot express. The other sixteen pages hand you the markup with a copy button: some ship a class or two of CSS beside it, and several ship none at all.");

		md("The bar for exporting a function is **logic a user shouldn't have to carry**: a loop over rows, a listener, a name that has to be unique, a trap that costs an afternoon. Everything else is markup, and markup is better handed over than hidden. Sixteen of nineteen failed that bar in an [independent review](/framework/ai/2026-08-09/) — and the strongest evidence was the site itself: where a page genuinely needed a panel, a stat tile, a crumb trail or an FAQ, its author wrote the markup by hand rather than import the helper.");

		md("## The CSS");

		md("A component that survived as CSS did so because a rule was about a **relationship or a state** — a bubble positioned against its word, a hairline between two items, a ring drawn only on a stacked circle. Each such module is a `<name>.js` holding one `css()` call, which writes `@layer base, theme, site, util;` for you, because a short layer list silently drops `site` past `util`. **No component relies on a theme**: every value is a framework token, so one renders unthemed.");

		md("Start at [Data table](/framework/ui/table/) — one declaration of CSS, and it is a bug report.");

		md.details(import.meta, "readme.md", "Design record — what survived the review, and where the CSS lives");
	},
});
