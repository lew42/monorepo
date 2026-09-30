import { Page, p, h4, h3, div, span, a, button, details, summary, icon, demo } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Headers & menus",
	description: "Six patterns for the top of a card: no title, a heading, an icon beside the title, a header bar with a ⋯ menu — then the same shapes made clickable, expandable, or both.",
	icon: "view_agenda",

	content(){
		p("A card's own content decides how much header it needs. These six are the whole set found on the site today (`doc/inventory.md`), reduced to one pattern each.");

		h4("None");
		demo(() => div.c("card", () => p("Just content — most chips and quiet cards need nothing above it.")));

		h4("Heading");
		demo(() => div.c("card", () => { h3("A plain heading"); p("The most common pattern: a bold title, then body text at the same indentation."); }));

		h4("Icon + title");
		demo(() => div.c("card", () => {
			div.c("card-head", () => { icon("widgets"); span.c("card-head-title", "Icon + title"); });
			p("The title carries a small icon beside it — `ux/Content`'s icon cards and every page preview use this.");
		}));

		h4("Header bar, with a ⋯ menu");
		demo(() => div.c("card", () => {
			div.c("card-head", () => {
				icon("dashboard");
				span.c("card-head-title", "Header bar");
				button.c("card-menu-btn", () => icon("more_vert"));
			});
			p("A title row with room at both ends — an icon on the left, a ⋯ menu on the right. AI 2's rail rows use this same shape.");
		}));

		h4("Clickable — the whole card is a link");
		demo(() => a.c("card", () => { h3("Clickable"); p("The whole box is one `<a>` — click anywhere on it, not just a link inside. This one is a real link: it routes to the first card in `mini-pages/`."); }).attr("href", "../mini-pages/first-steps/"));

		h4("Expandable, with a menu");
		demo(() => details.c("card", () => {
			summary(() => { icon("expand_more"); span("Expandable"); });
			div.c("card-head", () => {
				p.c("card-head-title", "Open me and I still have my own header row.");
				button.c("card-menu-btn", () => icon("more_vert"));
			});
		}).attr("open", ""));
	},
});
