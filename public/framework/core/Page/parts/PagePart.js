import Item from "../../Item/Item.js";
import View, { p } from "../../View/View.js";

/* A PagePart is one block of a page's body, stored as plain data in the page's own
   page.jsonl: {"content":{"add":{"type":"part-heading","text":"Hello"}}}.
   A kind says how it looks by overriding draw(); Page.render_content_list() draws
   every part through PagePart.View, so no page subclass is needed. */
export default class PagePart extends Item {

	// Draw into the current captor. A subclass overrides this; a bare PagePart shows its text.
	draw(){ return this.constructor.fallback(this); }

	static fallback(part){
		const text = part.get("text") ?? part.get("title") ?? "";
		return p(String(text));
	}

	// The wire name a subclass is stored under: "part-<kind>".
	static kind = "part";

	// Register a subclass under its wire name; returns it.
	static define(Class, kind){
		Class.kind = kind;
		return Item.register(Class, "part-" + kind);
	}
}

// Attached after the class, reached through `constructor`, so a kind can swap it.
PagePart.View = class PagePartView extends View {
	render(){ return this.item.draw(); }
};
