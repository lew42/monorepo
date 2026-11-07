import { Doc, md, demo } from "/app.js";
import Item from "/framework/core/Item/Item.js";
import Page from "/framework/core/Page/Page.class.js";
import ItemInspector from "./ItemInspector.js";

export default new Doc({
	meta: import.meta,
	title: "Inspect",
	description: "See what any Item is made of — its lists, its callable methods, its saved fields — and replay a folder's page.jsonl on a slider.",
	icon: "search",

	subject: Item,
	files: "ItemInspector.js DeltaHistory.js Inspect.css Inspect.test.mjs readme.md page.js",

	overview: [
		{ title: "ItemInspector", icon: "search", description: "Given {item}, three sections: Inside, Methods, Fields.", content(){
			md("A small Page with two cards, inspected live:");
			demo(() => {
				const sample = Page.replay([
					{ id: "sample", title: "A sample page" },
					{ content: { add: { id: "h1", type: "part-heading", text: "A heading" } } },
					{ content: { add: { id: "c1", type: "part-card", title: "A card", text: "Its text." } } },
				]);
				new ItemInspector({ item: sample });
			});
		} },
	],
});
