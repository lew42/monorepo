import { Doc, md, h2, code, div, span, icon } from "/app.js";
import Item from "./Item.js";
import List from "../List/List.js";

// A class that gives ITSELF a child list, in its own constructor — Item holds none
// built in (see "Composing a list" below). This is the real pattern: Page, Panel
// and the editor's blocks all do the same thing for their own named list.
class DemoCard extends Item {
	constructor(...args){
		super(...args);
		this.items = new List({ owner: this, name: "items" });
	}
}
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
	["adoption: list.add() sets parent, never serialized", () => {
		const parent = new DemoCard({ id: "p", data: {} });
		parent.items.add(new Item({ id: "k", data: {} }));
		return parent.find("k").parent === parent && !JSON.stringify(parent).includes("parent");
	}],
	["hydrate restores parent by adoption", () => { const [root, a] = tree(); return a.parent === root && a.root() === root; }],
	["list.move() reorders node-relative", () => {
		const [root, a, b] = tree();
		root.items.move(b, { before: a, from: b.parent?.items });
		return [...root.items].map(k => k.id).join(",") === "b,a,c";
	}],
	["list.move() reparents and unlinks from the old list", () => {
		const [root, a, , c] = tree();
		a.items.move(c, { before: null, from: c.parent?.items });
		return c.parent === a && a.items.length === 1 && root.items.length === 2;
	}],
	["list.move(x, {before: null}) appends", () => {
		const [root, a] = tree();
		root.items.move(a, { before: null, from: a.parent?.items });
		return [...root.items].map(k => k.id).join(",") === "b,c,a";
	}],
	["contains() sees descendants only", () => {
		const [root, a, , c] = tree();
		a.items.move(c, { before: null, from: c.parent?.items });
		return root.contains(c) && a.contains(c) && !c.contains(a) && !root.contains(root);
	}],
	["events bubble to the root", () => {
		const [root, , b] = tree();
		const heard = [];
		root.on("change", (k, v) => heard.push(`${k}=${v}`));
		b.items.at(0).set("w", false);
		return heard.join("") === "w=false";
	}],
	["set() is silent when the value is unchanged", () => {
		const [root, a] = tree();
		let n = 0;
		root.on("change", () => n++);
		a.set("n", 1).set("n", 1);
		return n === 0;
	}],
	["a list's move emits one line-shaped event, bubbled to the root", () => {
		const [root, a] = tree();
		const heard = [];
		root.on("move", line => heard.push(line.move.id));
		root.items.move(a, { before: null, from: a.parent?.items });
		return heard.join(",") === "a";
	}],
	["save() delegates up to the document's saver", async () => {
		const [root, , b] = tree();
		let saved = null;
		root.saver = { save(item){ saved = item; return Promise.resolve(true); } };
		return await b.items.at(0).save() === true && saved === root;
	}],
	["no saver anywhere resolves false, never throws", async () =>
		await new Item().save() === false && await new Item().delete() === false],
	["hydrate assigns a missing id", () => typeof Item.hydrate({ type: "Item", data: {} }).id === "string"],
	["hydrate freshens a duplicate id", () => {
		const h = Item.hydrate({ type: "Item", id: "x", data: {}, items: [{ type: "Item", id: "x", data: {} }] });
		return h.id === "x" && h.items.at(0).id !== "x";
	}],
	["hydrate survives non-object data and a non-array items value", () => {
		const h = Item.hydrate({ type: "Item", id: "z", data: 5, items: "nope" });
		return h.id === "z" && JSON.stringify(h.data) === "{}" && h.items === undefined;
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

export default new Doc({
	meta: import.meta,
	title: "Item",
	description: "A persistent node: an id, a `data` bag, one saver per document — no children of its own.",
	icon: "data_object",

	subject: Item,
	properties: "id data parent store view",
	methods: "assign get put set locate remove root lists walk find contains save delete toJSON wire hydrate register open",
	notes: "envelope decisions",
	files: "Item.js readme.md page.js",

	// ⚠ NOT a plain `children: "live"` — that runs through `declare()` inside the
	//   Page CONSTRUCTOR, before `Doc`'s own `initialize()` has added its Overview/
	//   API/Docs/Files sections, so "live" landed in `page.pages` (and so the
	//   SIDEBAR RAIL, which reads raw insertion order) BEFORE "Overview" — even
	//   though the TAB STRIP looked right (`Doc.bar()` hard-codes Overview first,
	//   regardless). Chaining `Doc`'s own `initialize()` first, then declaring
	//   "live", puts it after Overview everywhere a reader sees it. Fixed
	//   2026-10-02, task-mastermind review.
	initialize(){
		Doc.prototype.initialize.call(this);
		this.declare("live");
	},

	content(){

		code.js(`const card = new DemoCard({ data: { title: "Doc" } });   // DemoCard made itself a list, below
card.items.add(new Item({ data: { text: "Hello" } }));
card.save();`);

		md("An **Item** is one node of a document: a `data` bag, an id, `set(delta)`, and a place to save. It has **no children of its own** — nothing on Item holds a list. It has no view, no transport and no required imports — you can run this class in node.");

		h2("Composing a list");

		code.js(`class DemoCard extends Item {
	constructor(...args){
		super(...args);
		this.items = new List({ owner: this, name: "items" });   // a NAMED property, not inherited
	}
}`);

		md("Something that needs children gives **itself** a [List](/framework/core/List/) property, in its own constructor, named for what it holds (`items` here; `page.pages` and `page.content` will be [Page](/framework/core/Page/)'s own, next). The list's own verbs — `add`, `remove`, `move`, `order` — live on THAT property: `card.items.add(kid)`, never `card.add(kid)`. This is composition on purpose: a class with its own `add`/`move` already in use (Page has about 70 methods) would collide if Item inherited the list API instead of merely offering it.");

		h2("The envelope");

		code.json(`{ "type": "Item", "id": "…", "data": { }, "items": [ ] }`);

		md("Those are the whole wire format for a plain Item: `type`/`id`/`data`, plus any List property it gave itself, each written as a plain array under its own name (`items` here) — omitted entirely when that Item never made one. **All user state lives under `data`**, so a key of your own never collides with a list name. `parent`, `store` and `view` are instance properties, never serialized — which makes a backref impossible by construction; hydrate restores `parent` by adoption. More on the envelope, unknown types, and what's deliberately excluded: [doc/envelope](/framework/core/Item/doc/envelope/).");

		h2("The verbs Item DOES have");

		code.js(`item.get(k)  item.put(k, v)        // seams over \`data\` — Page overrides both
item.set(k, v)  item.set({k: v})   // one delta, in key order — see the readme
item.remove()                      // me, out of whichever of my parent's lists holds me
item.on(ev, fn)  item.emit(ev, …)  // (core/Events) — emit bubbles up the parent chain
item.save()  item.delete()         // delegate up to the document's saver`);

		md("**There is no `item.add`, `item.move` or `item.order`.** Those three verbs are the LIST's (`item.items.add(kid)`, `item.items.move(kid, {before, from})`), never the Item's — see *Composing a list* above. Guard a drop with `!this.contains(target)`; ten minutes of nesting otherwise produce a cycle. Every verb has its own page in **API**, above, with the trap it carries.");

		md("⚠ **No I/O in any constructor.** Construction is pure and synchronous. `await Item.open(saver)` is the one async entry — it loads, hydrates synchronously, attaches the saver and hands back the root.");

		h2("The page is the test");

		md("Every claim above, asserted here on load. Red is a broken framework, not a broken page.");

		const done = [];
		div.c("flex v gap pad surface", () => checks.forEach(c => done.push(row(c))))
			.style({ "--gap": "0.35em", "--pad": "1em" });

		const $tally = div.c("h4 muted", "running…");
		Promise.all(done).then(oks => $tally.text(`${oks.filter(Boolean).length} / ${oks.length} passing`));

		h2("See it saved");

		md("[**Live list**](/framework/core/Item/live/) — the same `List`, but on a real page, saved to a real file: drag a row, add one, sort them, then reload. The list comes back.");

		md("Next: [List](/framework/core/List/) — the ordered collection itself, and why a bare `Item` never has one of its own.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
