import Box from "./watch/Box.js";
import ScratchStore from "./watch/ScratchStore.js";

/* Item's core test as steps: the class page draws each one (its code, a pass or fail, the object after it, the
   lines it wrote; ext/Doc/ClassDoc.js) and Item.steps.test.mjs runs the same array in node.
   `t` is one shared bag: `t.store` keeps every line written (ScratchStore writes no file), `t.lines` are the ones
   the step just wrote. `show(t)` is the object drawn after the step. */
export default [
	{
		title: "Create",
		code: `const shop = new Box({ id: "shop", title: "Shopping" })`,
		note: "Making an object writes nothing.",
		run: t => { t.shop = new Box({ id: "shop", title: "Shopping" }); },
		check: t => t.shop.get("title") === "Shopping" && t.lines.length === 0,
		show: t => t.shop,
	},
	{
		title: "Save",
		code: `store.attach(shop)`,
		note: "From here on, every change is saved as one line.",
		run: t => { t.store.attach(t.shop); },
		check: t => t.shop.store === t.store && t.lines.length === 0,
		show: t => t.shop,
	},
	{
		title: "Set",
		code: `shop.set({ title: "Weekly shop" })`,
		note: "A field on the root: one flat line.",
		run: t => { t.shop.set({ title: "Weekly shop" }); },
		check: t => t.shop.get("title") === "Weekly shop" && t.lines.length === 1,
		show: t => t.shop,
	},
	{
		title: "Add a child",
		code: `const milk = shop.items.add({ id: "milk", title: "Milk", count: 1 })`,
		note: "A list verb: one line, under the list's name. The child's parent is now shop.",
		run: t => { t.milk = t.shop.items.add({ id: "milk", title: "Milk", count: 1 }); },
		check: t => t.milk.parent === t.shop && t.lines.length === 1 && "items" in t.lines[0],
		show: t => t.shop,
	},
	{
		title: "Change the child",
		code: `milk.set({ count: 2 })`,
		note: "The change climbs parent to shop, and the line names the path down, each hop by its list: items, then milk.",
		run: t => { t.milk.set({ count: 2 }); },
		check: t => t.milk.get("count") === 2 && t.lines.length === 1 && "milk" in (t.lines[0].items ?? {}),
		show: t => t.shop,
	},
	{
		title: "Replay",
		code: `const copy = new Box({ id: "shop" }); lines.forEach(line => copy.set(line))`,
		note: "A fresh object, built from the lines alone, equals the original.",
		run: t => { t.copy = new Box({ id: "shop" }); t.store.lines.forEach(line => t.copy.set(line)); },
		check: t => JSON.stringify(t.copy) === JSON.stringify(t.shop),
		show: t => t.copy,
	},
];

// One run of every step, the same in node and the browser: each step's lines are the ones its store flushed.
// `after(step, t, ok)` is called once per step (the page draws there).
export async function run_steps(steps, after = () => {}){
	const t = { store: new ScratchStore({ url: "scratch.jsonl" }), lines: [] };
	t.store.on_lines = lines => t.lines.push(...lines);
	const results = [];
	for (const step of steps){
		t.lines = [];
		let ok, error;
		try { await step.run(t); await null; ok = !!step.check(t); }
		catch (e){ ok = false; error = e; }
		results.push({ step, ok, error, lines: [...t.lines] });
		after(step, t, ok, error);
	}
	return results;
}
