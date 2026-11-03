import { Page, demo, md, div, a } from "/app.js";

// The AI 2 index pattern, at demo scale: a page whose CHILD is a name read off
// disk, never declared with a children: list. The real one is Card.Folder
// (public/framework/ai2/card.js:964-990) — this is its smallest real piece,
// same shape, no calendar math: a name comes in, a page goes out, remembered.
const years = () => new Page({
	title: "Years",

	async child(name, levels){
		if (!/^\d{4}$/.test(name)) return null;   // not a name I answer for

		return this.add(name, {
			title: name,
			content(){
				md(`**${name}** — nothing on disk made this page. \`child()\` built it the moment you asked for it, the same way \`ai2/\`'s day and card pages are built.`);
			},
		}).load_all_children(levels);
	},

	content(){
		md("No `children:` at all, and these urls work anyway — click one:");

		div.c("flex gap", () => ["2025", "2026"].forEach(name =>
			a.c("page-link", name).href(this.url + name + "/")));
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Basics",
	tree: years,
}));
