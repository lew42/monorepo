import { Page, md, h2, div, a } from "/app.js";
import demo from "/framework/ext/demo/demo.js";

// ONE TEMPLATE renders every item below — the only difference between them is
// which .json file `child()` handed it. No page.js exists for any item.
export const item_template = data => () => { h2(data.title); md(data.body); };

export default new Page({
	meta: import.meta,
	title: "Example",
	description: "Three items, one template, zero page.js files below this line.",
	icon: "widgets",

	// `index.json` is fetched once and remembered (this.index). A name it does not
	// list is "not mine" — null — so the probe in Page.child() keeps looking.
	async child(name, levels){
		this.index ??= await Page.read_json(this.url + "index.json");
		if (!this.index?.includes(name)) return null;

		const data = await Page.read_json(this.url + name + ".json");
		return data && this.add(name, { title: data.title, content: item_template(data) }).load_all_children(levels);
	},

	content(){
		md("`index.json` names three items. Each one is one small `.json` file — no `page.js` anywhere below this line. `child()` reads the file and draws it with **one** template function, the same function for every item:");

		demo(item_template({
			title: "How this works",
			body: "This one function, `item_template(data)`, is all the code that draws every item below. Its only input is which `.json` file `child()` handed it.",
		}));

		md("The three real items, read live off `index.json` — each has its own url, and a reload lands on the same page:");
		const $list = div.c("flex gap");
		Page.read_json(this.url + "index.json").then(list => $list.append(() =>
			(list ?? []).forEach(name => a.c("page-link", name).href(this.url + name + "/"))));
	},
});
