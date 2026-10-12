import Item from "../../Item/Item.js";

/* A Part is one piece of a page's body, stored as plain data in the page's own
   page.jsonl: {"content":{"add":{"type":"part-heading","text":"Hello"}}}.
   The subclass says how it looks by overriding draw(). Parts.js owns the list. */
export default class Part extends Item {

	// Draw into the current captor. A subclass overrides this; a bare Part shows its text.
	draw(){ return this.constructor.fallback(this); }

	static fallback(part){
		const text = part.get("text") ?? part.get("title") ?? "";
		return Part.p(String(text));
	}

	// The wire name a subclass is stored under: "part-<kind>".
	static kind = "part";

	// Register a subclass under its wire name; returns it.
	static define(Class, kind){
		Class.kind = kind;
		return Item.register(Class, "part-" + kind);
	}
}
