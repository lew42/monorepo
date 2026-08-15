import { Page, md, h2, code, div, span, icon } from "/app.js";
import Item from "./Item.js";

class DemoCard extends Item {}
Item.register(DemoCard, "demo-card");

// Nesting, a duplicate type, and a type nothing registered.
const doc = {
	type: "Item", id: "root", data: { title: "Doc" },
	items: [
		{ type: "demo-card", id: "a", data: { n: 1 } },
		{ type: "demo-card", id: "b", data: { n: 2 }, items: [
			{ type: "Widget", id: "b1", data: { w: true } },
		] },
		{ type: "Item", id: "c", data: {} },
	],
};

const tree = () => {
	const root = Item.hydrate(doc);
	return [root, root.find("a"), root.find("b"), root.find("c")];
};

const checks = [
	["hydrate round trip is lossless", () => JSON.stringify(Item.hydrate(doc)) === JSON.stringify(doc)],
	["registered type becomes its class", () => Item.hydrate(doc).find("a") instanceof DemoCard],
	["unknown type preserved as Item, wire name kept", () => {
		const w = Item.hydrate(doc).find("b1");
		return w.constructor === Item && w.toJSON().type === "Widget";
	}],
	["adoption: add() sets parent, never serialized", () => {
		const parent = new Item({ id: "p", data: {} }).add(new Item({ id: "k", data: {} }));
		return parent.find("k").parent === parent && !JSON.stringify(parent).includes("parent");
	}],
	["hydrate restores parent by adoption", () => { const [root, a] = tree(); return a.parent === root && a.root() === root; }],
	["move() reorders node-relative", () => {
		const [root, a, b] = tree();
		b.move(root, a);
		return root.items.children.map(k => k.id).join(",") === "b,a,c";
	}],
	["move() reparents and unlinks from the old parent", () => {
		const [root, a, , c] = tree();
		c.move(a);
		return c.parent === a && a.items.length === 1 && root.items.length === 2;
	}],
	["move(parent, null) appends", () => {
		const [root, a] = tree();
		a.move(root);
		return root.items.children.map(k => k.id).join(",") === "b,c,a";
	}],
	["contains() sees descendants only", () => {
		const [root, a, , c] = tree();
		c.move(a);
		return root.contains(c) && a.contains(c) && !c.contains(a) && !root.contains(root);
	}],
	["events bubble to the root", () => {
		const [root, , b] = tree();
		const heard = [];
		root.on("change", (k, v) => heard.push(`${k}=${v}`));
		b.items.children[0].set("w", false);
		return heard.join("") === "w=false";
	}],
	["set() is silent when the value is unchanged", () => {
		const [root, a] = tree();
		let n = 0;
		root.on("change", () => n++);
		a.set("n", 1).set("n", 1);
		return n === 0;
	}],
	["list mutation emits add/remove through the owner", () => {
		const [root, a] = tree();
		const heard = [];
		root.on("add", kid => heard.push("+" + kid.id)).on("remove", kid => heard.push("-" + kid.id));
		a.move(root, null);
		return heard.join("") === "-a+a";
	}],
	["save() delegates up to the document's saver", async () => {
		const [root, , b] = tree();
		let saved = null;
		root.saver = { save(item){ saved = item; return Promise.resolve(true); } };
		return await b.items.children[0].save() === true && saved === root;
	}],
	["no saver anywhere resolves false, never throws", async () =>
		await new Item().save() === false && await new Item().delete() === false],
	["hydrate assigns a missing id", () => typeof Item.hydrate({ type: "Item", data: {} }).id === "string"],
	["hydrate freshens a duplicate id", () => {
		const h = Item.hydrate({ type: "Item", id: "x", data: {}, items: [{ type: "Item", id: "x", data: {} }] });
		return h.id === "x" && h.items.children[0].id !== "x";
	}],
	["hydrate survives non-object data and non-array items", () => {
		const h = Item.hydrate({ type: "Item", id: "z", data: 5, items: "nope" });
		return h.id === "z" && JSON.stringify(h.data) === "{}" && h.items.length === 0;
	}],
	["Item.open() loads, hydrates and attaches the saver", async () => {
		const saver = { load: async () => doc };
		const root = await Item.open(saver);
		return root.saver === saver && JSON.stringify(root) === JSON.stringify(doc);
	}],
];

const PASS = "var(--ok)";

// The row is placed NOW and filled in a callback — an async check must never build
// DOM after its own await.
function row([label, fn]){
	const $row = div.c("flex gap v-center");

	const paint = (ok, note) => $row.empty(() => {
		icon(ok ? "check_circle" : "cancel");
		span(label);
		if (note) code(note);
	}).style("color", ok ? PASS : "var(--error)");

	return Promise.resolve().then(fn).then(
		ok => { paint(ok === true); return ok === true; },
		e => { paint(false, e.message); return false; },
	);
}

export default new Page({
	meta: import.meta,
	title: "Item",
	description: "A persistent node: `data`, `items`, one saver per document.",
	icon: "data_object",

	content(){

		code.js(`const doc = Item.hydrate({ type: "Item", id: "root", data: { title: "Doc" } });
doc.add(new Item({ data: { text: "Hello" } }));
doc.save();`);

		md("An **Item** is one node of a document tree: a `data` bag, an ordered [List](/framework/core/List/) of child items, and an id. It has no view, no transport and no imports but `List` — you can run this class in node.");

		h2("The envelope");

		code.json(`{ "type": "Item", "id": "…", "data": { }, "items": [ ] }`);

		md("Those four keys are the whole wire format, `items` omitted when empty. **All user state lives under `data`** — so a key of your own called `items` cannot collide with the tree. `parent` and `saver` are instance properties and instance properties are never serialized, which makes a backref impossible by construction; hydrate restores it by adoption.");

		md("`Item.register(Class, name = Class.name)` is the last line of the module that defines a block type, and the optional second argument is the rename seam — the class on this page is `DemoCard` on the wire name `demo-card`. **An unregistered type is an unimported one**, so a document's owner imports its block types explicitly. An unknown type is never dropped and never throws: it hydrates as a plain `Item` with its wire name kept, warns once, and re-saves losslessly.");

		h2("The verbs");

		code.js(`item.get(k)  item.set(k, v)          // set emits "change" only on a real change
item.add(...kids)  item.remove(kid?)  // no argument removes ME from my parent
item.move(parent, before = null)      // reorder AND reparent — node-relative
item.on(ev, fn)  item.emit(ev, …)     // emit bubbles up the parent chain
item.save()  item.delete()            // delegate up to the document's saver`);

		md("**`move()` is the builder's one mutation verb.** It takes a *position* — a parent and the node to sit before, `null` to append — so index arithmetic off-by-ones cannot exist, and reorder, reparent and nest are one code path. Guard a drop with `!this.contains(target)`; ten minutes of nesting otherwise produce a cycle.");

		md("**`save()` delegates up.** A child has no saver, so it asks its parent, and the document's own saver writes the whole document. That is the fix for the defect the council executed: a child saving used to overwrite the document with its own subtree.");

		md("⚠ **No I/O in any constructor.** Construction is pure and synchronous. `await Item.open(saver)` is the one async entry — it loads, hydrates synchronously, attaches the saver and hands back the root.");

		h2("The page is the test");

		md("Every claim above, asserted here on load. Red is a broken framework, not a broken page.");

		const done = [];
		div.c("flex v gap pad surface", () => checks.forEach(c => done.push(row(c))))
			.style({ "--gap": "0.35em", "--pad": "1em" });

		const $tally = div.c("h4 muted", "running…");
		Promise.all(done).then(oks => $tally.text(`${oks.filter(Boolean).length} / ${oks.length} passing`));

		md("Next: [List](/framework/core/List/) — the collection behind `item.items`, and why userland never touches it.");
	}
});
