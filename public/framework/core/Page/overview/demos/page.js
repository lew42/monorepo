import { Page, md, demo, h2, div, a } from "/app.js";
import mini_app from "./mini-app.js";

export default new Page({
	meta: import.meta,
	title: "Demos",
	description: "Every variation of new Page(…), rendered and clickable.",
	icon: "play_circle",

	content(){

		demo(() => {
			const docs = new Page({
				url: "/docs/",
				title: "Docs",
				content(){ md("A page is a url, a title, and content."); },
			});

			mini_app(docs);
		}, "Every box below is a **real page tree**, running inside `mini_app()` — a miniature App and Router that owns that one box. The strip is `url`, the heading is `title`, the rest is `content()`. ⚠ The url is fictional and nothing here is on disk: a demo tree that touched the network would 404.");

		h2("Children, and the cards they draw");

		demo(() => {
			const guide = new Page({
				url: "/guide/",
				title: "Guide",
				children: [
					{ name: "install", title: "Install", icon: "download",
						content(){ md("Children given as **objects** are adopted at construction."); } },
					{ name: "deploy", title: "Deploy", icon: "rocket_launch",
						content(){ md("So `previews()` has real titles and icons to draw with."); } },
				],
				content(){ this.previews(); },
			});

			mini_app(guide);
		}, "`previews()` draws a card per child, from that child's own `title` and `icon`. **Click one** — the page swaps in the region and the url strip follows it. ⚠ `children: \"install deploy\"` — the string form — would go looking for `/guide/install/page.js` on the server. In a demo, hand it objects.");

		h2("`label`, `title`, `icon`");

		demo(() => {
			const handbook = new Page({
				url: "/handbook/",
				title: "Handbook",
				children: [
					{ name: "start", title: "Start", label: "Start here", icon: "flag",
						content(){ md("`title` is the heading. `label` is what every menu calls it."); } },
					{ name: "api", title: "API", icon: "code",
						content(){ md("No label, so the rail falls back to the title."); } },
				],
				content(){ md("Two children, three ways to name one."); },
			});

			mini_app(handbook, { nav: true });
		}, "The rail is `nav_for(name)` per child — `label ?? title ?? name`, plus the icon — which is the same entry a `Sidebar` and a card wall read. So the three cannot name a child three ways. A menu entry and a page heading are allowed to be different sentences; that is the whole of `label`.");

		h2("`add()` — sub pages with no files");

		demo(() => {
			const shop = new Page({ url: "/shop/", title: "Shop", content(){ this.previews(); } });

			const laces = shop
				.add("catalogue", { title: "Catalogue", content(){ this.previews(); } })
				.add("boots", { title: "Boots", content(){ this.previews(); } })
				.add("laces", { title: "Laces", content(){ md("Four deep. The strip above is `chain()`."); } });

			mini_app(laces);
		}, "`add(name, …)` returns the child, so a chain of them is a spine four levels deep — same tree, no folders. It opens on the leaf: `chain()` is `[root … me]`, so the strip is one link per ancestor. **Click a crumb** to go back up, then a card to come back down.");

		h2("What a page can be");

		demo(() => {
			const studio = new Page({
				url: "/studio/",
				title: "Studio",
				children: [
					{ name: "docs", title: "Docs", icon: "description",
						content(){ md("No class: the reading column, and the region's own inset."); } },

					{ name: "wall", title: "Wall", icon: "grid_view", classes: "pad",
						content(){
							md("`pad` — no measure, an even 2em.");
							div.c("grid gap auto", () => "ABCDEF".split("")
								.forEach(letter => div.c("pad wash h3", letter))).style("--column", "5em");
						} },

					{ name: "app", title: "App", icon: "dashboard", classes: "full fill flex v",
						content(){
							div.c("pad", () => md("**`full fill flex v`** — edge to edge, region height."));
							div.c("flex-1 pad wash", () => md("This band takes the slack."));
							div.c("pad", () => md("…and the footer sits on the bottom."));
						} },
				],
				content(){ md("Three pages, three class strings, one region."); },
			});

			mini_app(studio, { nav: true }).style("height", "21em");
		}, "A page's layout is a class string on the page: nothing here is a component and no page renders another page's shape. [Page shapes](/framework/styles/layouts/fit/) has all four words — `grid`, `pad`, `full`, `fill` — and why they are stances on two tokens.");

		h2("`route()` — urls with no folder");

		demo(() => {
			const swatches = { blue: "#4f7cff", amber: "#ffb020", moss: "#5a9367" };

			const palette = new Page({
				url: "/palette/",
				title: "Palette",

				route(name){
					const hex = swatches[name];

					return hex && { title: name, content(){
						div.c("pad").style({ background: hex, height: "3em" });
					} };
				},

				content(){
					div.c("flex gap", () => Object.keys(swatches).forEach(name =>
						a.c("page-preview", name).href(this.url + name + "/")));
				},
			});

			mini_app(palette);
		}, "`child()` asks `route()` for **undeclared** names only — after memory, before the filesystem — so it cannot shadow a page that exists, and these three urls have no folders behind them at all. [Sections](/framework/styles/sections/) serves nine pages this way.");

		h2("All of it, in one box");

		demo(() => {
			const site = new Page({
				url: "/lab/",
				title: "Lab",
				children: [
					{ name: "start", title: "Start", label: "Start here", icon: "flag",
						content(){ md("An index is a page whose content **is** its children."); } },
					{ name: "parts", title: "Parts", icon: "widgets", classes: "pad",
						content(){ this.previews(); } },
				],
				content(){ this.previews(); },
			});

			site.children.get("parts")
				.add("motor", { title: "Motor", icon: "settings", content(){ this.previews(); } })
				.add("rotor", { title: "Rotor", content(){ md("Three deep, reached by card."); } });

			mini_app(site, { nav: true }).style("height", "18em");
		}, "The rail, the cards, the crumbs and the region are one tree of ordinary `Page`s — `previews()` and `chain()` derive every one of them, and `mini_app()` only decides *where*. Take it apart: rail across, cards down, crumbs back up.");

		md("Nothing on this page is special-cased. `mini_app()` is one small file beside this one: it hands the root a `$pages`, calls `activate()`, and `preventDefault()`s the clicks so a fictional url never reaches the real [Router](/framework/core/Router/).");

		md("Next: [Children](/framework/core/Page/children/) — what that declaration actually costs, and what a manifest would change.");
	},
});
