import Box from "../Item/watch/Box.js";

/* List's core test as steps: the class page draws each one (ext/Doc/ClassDoc.js) and List.steps.test.mjs runs the
   same array in node, with Item's runner (core/Item/Item.steps.js). A Box gives itself a List, `shop.items`, the way
   every class that holds children does. */
const ids = list => [...list].map(x => x.id).join(",");

export default [
	{
		title: "Create",
		code: `const shop = new Box({ id: "shop" })   // its constructor makes shop.items`,
		note: "A List is made by the class that owns it, named for what it holds.",
		run: t => { t.shop = new Box({ id: "shop" }); },
		check: t => t.shop.items.owner === t.shop && t.shop.items.length === 0,
		show: t => t.shop,
	},
	{
		title: "Save",
		code: `store.attach(shop)`,
		note: "The store sits on the root; the list's changes reach it through the owner.",
		run: t => { t.store.attach(t.shop); },
		check: t => t.lines.length === 0,
		show: t => t.shop,
	},
	{
		title: "Add",
		code: `shop.items.add({ id: "milk" })   // Add milk`,
		note: "One line, under the list's name. The member's parent is the owner, never the list.",
		run: t => t.click("Add milk", () => { t.milk = t.shop.items.add({ id: "milk" }); }),
		check: t => t.milk.parent === t.shop && ids(t.shop.items) === "milk" && "items" in t.lines[0],
		show: t => t.shop,
	},
	{
		title: "Add first",
		code: `shop.items.add({ id: "bread" }, { after: null })`,
		note: "Places are named by id, never by number: after: null means first.",
		run: t => { t.shop.items.add({ id: "bread" }, { after: null }); },
		check: t => ids(t.shop.items) === "bread,milk" && t.lines.length === 1,
		show: t => t.shop,
	},
	{
		title: "Move",
		code: `shop.items.move("milk", { after: null })   // Milk first`,
		note: "A move is one line too, naming the member and where it goes.",
		run: t => t.click("Milk first", () => t.shop.items.move("milk", { after: null })),
		check: t => ids(t.shop.items) === "milk,bread" && t.lines.length === 1,
		show: t => t.shop,
	},
	{
		title: "Remove",
		code: `shop.items.remove("bread")`,
		note: "Out of the list, its parent cleared, one line.",
		run: t => { t.bread = t.shop.items.find("bread"); t.shop.items.remove("bread"); },
		check: t => ids(t.shop.items) === "milk" && !t.bread.parent && t.lines.length === 1,
		show: t => t.shop,
	},
	{
		title: "Replay",
		code: `const copy = new Box({ id: "shop" }); lines.forEach(line => copy.set(line))`,
		note: "The lines alone rebuild the same list, in the same order, and the same view.",
		run: t => { t.copy = new Box({ id: "shop" }); t.store.lines.forEach(line => t.copy.set(line)); },
		check: t => t.same(t.shop, t.copy),
		show: t => t.copy,
	},
];
