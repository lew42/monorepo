import { Page, md, div } from "/app.js";
import Concepts from "./Concepts.js";

const items = [{ name: "Servex", slug: "servex", icon: "dns" }, { name: "Agents", slug: "agents", icon: "smart_toy" }, { name: "Cards", slug: "cards", icon: "dashboard" }];
const href = it => ({ ...it, href: "#" });

export default new Page({
	meta: import.meta,
	title: "Concepts",
	description: "What a page is made of: its core concepts as linked icon tiles.",
	icon: "apps",

	content(){
		md("**Flat**");
		div.c("pad", () => new Concepts({ items: items.map(href) }));
		md("**Sections, as columns**");
		div.c("pad", () => new Concepts({ sections: [{ title: "Run", items: items.slice(0, 2).map(href) }, { title: "Show", items: items.slice(2).map(href) }] }));
		md.details(import.meta, "readme.md", "Readme");
	},
});
