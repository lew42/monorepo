import Item from "./Item.js";
import Box from "./watch/Box.js";

/* Item's methods for its class page (ext/Doc/ClassDoc.js): each one's job in one line, and a tiny example.
   The page shows the example's body as code and draws what it returns, live. Order is the order on the page:
   the everyday calls first. `static: true` reads the signature off the class, not its prototype. */
export default {
	get: { job: "Read one field (or a child, by its id).",
		example(){ const box = new Box({ title: "Milk" }); return box.get("title"); } },
	set: { job: "Change fields, call a method or walk into a child: one delta, in key order.",
		example(){ const box = new Box({ title: "Milk" }); box.set({ title: "Oat milk", count: 2 }); return box; } },
	find: { job: "Any descendant by id, at any depth.",
		example(){ const shop = new Box({ id: "shop" }); shop.items.add({ id: "milk" }).items.add({ id: "oat" }); return shop.find("oat"); } },
	remove: { job: "Take me out of whichever list holds me.",
		example(){ const shop = new Box({ id: "shop" }); shop.items.add({ id: "milk" }); shop.find("milk").remove(); return shop; } },
	root: { job: "The top of my parent chain: the item that holds the file.",
		example(){ const shop = new Box({ id: "shop" }); return shop.items.add({ id: "milk" }).root(); } },
	walk: { job: "Call a function on me and every descendant, depth first.",
		example(){ const shop = new Box({ id: "shop" }); shop.items.add({ id: "milk" }); const ids = []; shop.walk(x => ids.push(x.id)); return ids; } },
	contains: { job: "Is this item somewhere below me? (Never me.)",
		example(){ const shop = new Box({ id: "shop" }); const milk = shop.items.add({ id: "milk" }); return [shop.contains(milk), milk.contains(shop)]; } },
	lists: { job: "Every List I own, by its name.",
		example(){ return Object.keys(new Box({ id: "shop" }).lists()); } },
	toJSON: { job: "My saved shape: type, id, data and each list, never parent or store.",
		example(){ const shop = new Box({ id: "shop", title: "Shop" }); shop.items.add({ id: "milk" }); return shop.toJSON(); } },
	hydrate: { static: true, job: "Build an item, and its lists, back from that saved shape.",
		example(){ return Item.hydrate({ type: "Box", id: "shop", data: { title: "Shop" }, items: [{ type: "Box", id: "milk" }] }); } },
	register: { static: true, job: "Give a class a type name, so a saved shape becomes that class again.",
		example(){ return Item.types.get("Box") === Box; } },
	replay: { static: true, job: "Build an item from its lines, one set() each.",
		example(){ return Box.replay([{ set: { title: "Shop" } }, { items: { add: { id: "milk" } } }]); } },
};
