import { div, span, code, icon, details, summary } from "/app.js";
import ClassDoc from "../../ext/Doc/ClassDoc.js";
import Box from "./watch/Box.js";
import life from "./Item.life.js";
import steps, { run_steps } from "./Item.steps.js";
import method_list from "./Item.methods.js";
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

export default new ClassDoc({
	meta: import.meta,
	title: "Item",
	description: "A persistent node: an id, a `data` bag, a parent; any list it gives itself.",
	icon: "data_object",

	subject: Item,
	extends: "Events",
	holds: "an id, a data bag of fields, a parent, and any List it gives itself",
	example(){ const shop = new Box({ id: "shop", title: "Shopping" }); shop.items.add({ id: "milk", title: "Milk", count: 2 }); return shop; },
	life,
	steps, run_steps,
	steps_test: "Item.steps.test.mjs",
	method_list,
	method_notes: "set get toJSON",

	properties: "id data parent store view",
	methods: "assign get put set locate remove root lists walk find contains save delete toJSON wire hydrate register open",
	core: "data:10 id:9 set:9 get:8 find:7 walk:6 hydrate:6",   // ClassCard order on pages that inherit from Item (ext/Doc/doc/class-card.md)
	notes: "architecture envelope decisions",
	files: "Item.js Item.steps.js Item.methods.js Item.life.js readme.md page.js",

	// ⚠ Declared after the sections, so "live" never lands before Overview in the rail (2026-10-02).
	initialize(){
		ClassDoc.prototype.initialize.call(this);
		this.declare("live"); this.declare("watch"); this.declare("Dated");
	},

	// Below the drawing: the older checks, folded to one line.
	content(){
		const done = [];
		let $sum;
		details.c("doc-class-more", () => {
			$sum = summary("More checks, run on load: running…");
			div.c("flex v gap pad surface", () => checks.forEach(c => done.push(row(c))))
				.style({ "--gap": "0.35em", "--pad": "1em" });
		});
		Promise.all(done).then(oks => $sum.text(`More checks, run on load: ${oks.filter(Boolean).length} of ${oks.length} pass`));
	}
});
