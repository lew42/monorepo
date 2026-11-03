// D17: a property hook. A class that defines `set_<key>(value)` has set() call it instead of the default store for that key.
// `node public/framework/core/Item/hooks.test.mjs`
// The hook stores with this.put(key, value) and may do anything else (keep a cache, set a volatile value). It runs for a live
// write, a direct call (which saves too), a line another tab sent and a replayed line alike.
import { test } from "../Test/Test.js";
import Item from "./Item.js";
import Store from "./Store.js";
import Task from "../Task/Task.js";

// Page: /framework/core/Test/view/?file=core/Item/hooks.test.mjs
const quiet = fn => { const w = console.warn, said = []; console.warn = (...a) => said.push(a.join(" ")); try { fn(); } finally { console.warn = w; } return said; };
const record = host => { const lines = []; const store = new Store({ url: "/x/" + Math.random() + ".jsonl" }); store.append = line => lines.push(line); store.attach(host); return { lines, store }; };

// A hook that keeps a derived cache, and one that keeps only a volatile value.
class Cart extends Item {
	static fields = ["qty"];   // a field passed to the constructor (line 1) goes into data only when the class declares it
	calls = 0;
	total = 0;   // derived: never saved, rebuilt by the hook
	set_qty(value){ this.calls++; this.put("qty", value); this.total = value * 2; }
	set_hover(value){ this.hovered = value; }   // volatile: nothing is put, so nothing is saved
}
Item.register(Cart, "Cart");

// live: set() calls the hook, the cache follows, the line is the ordinary one
test("set() calls a set_<key> hook: the value is stored, the cache follows, the ordinary line is saved", t => {
	const cart = new Cart({ id: "c" });
	const { lines } = record(cart);
	const changes = [];
	cart.on("change", (key, value) => changes.push([key, value]));
	cart.set({ qty: 3 });
	t.eq([cart.get("qty"), cart.total, cart.calls], [3, 6, 1], "live: set({qty}) ran the hook once: the value is stored and the cache follows");
	t.eq(lines, [{ set: { qty: 3 } }], "live: and the ordinary line is saved");
	t.eq(changes, [["qty", 3]], "live: and the change event fired once");
	cart.set({ qty: 3 });
	t.eq([cart.calls, lines.length], [2, 1], "live: the same value runs the hook again (it may rebuild a cache) but saves nothing");

	// direct call: the hook's put is a save too
	cart.set_qty(4);
	t.eq([cart.get("qty"), cart.total], [4, 8], "direct: task.set_qty(4) stores and updates the cache");
	t.eq(lines.at(-1), { set: { qty: 4 } }, "direct: and it is saved, like a set()");

	// a volatile hook
	cart.set({ hover: true });
	t.eq([cart.hovered, cart.get("hover")], [true, undefined], "volatile: the hook kept its value off the data");
	t.eq(lines.length, 2, "volatile: and nothing was saved");
	t.view({ saved_lines: lines }, "the lines saved");
	return cart;
});

// another tab: a line read from the file calls the hook, and saves nothing
test("a line read from another tab and a replayed line both call the hook; the tab saves nothing", t => {
	const cart = new Cart({ id: "c" });
	const { lines, store } = record(cart);
	store.read([{ set: { qty: 7 } }]);
	t.eq([cart.get("qty"), cart.total], [7, 14], "another tab: a line read from the file ran the hook");
	t.eq(lines, [], "another tab: and it saved nothing (it is not our write)");
	t.view(cart, "the cart that read the other tab's line");
	// replay: every line shape calls the hook; line 1's own fields too
	const again = Cart.replay([{ id: "c", qty: 1 }, { set: { qty: 5 } }, { qty: 6 }]);
	t.eq([again.get("qty"), again.total], [6, 12], "replay: the last line wins and the cache follows");
	t.ok(again.calls >= 3, "replay: the hook ran for line 1's fields and for both later lines (ran " + again.calls + " times)");
	return again;
});

// a hook calling set() on its own key would loop for ever: refused with a warning
test.optional("edge: a hook that sets its own key warns instead of looping", t => {
	class Loop extends Item { set_n(value){ this.set({ n: value + 1 }); } }
	const item = new Loop({ id: "l" });
	const said = quiet(() => item.set({ n: 1 }));
	t.ok(said.some(s => s.includes("set_n")), "re-entry: a hook that sets its own key warns and does not loop: " + JSON.stringify(said));
});

// Task replays its fields through hooks too (Task.replay_line reads set lines and plain field lines itself)
test.optional("edge: a Task replays its set lines and plain field lines through hooks too", t => {
  class Titled extends Task { shout = ""; set_title(value){ this.put("title", value); this.shout = String(value).toUpperCase(); } }
  Item.register(Titled, "Titled");
  const task = Titled.replay([{ id: "t", title: "first" }, { set: { title: "second" } }]);
  t.eq([task.get("title"), task.shout], ["second", "SECOND"], "Task: a replayed set line runs the hook");
  const plain_field = Titled.replay([{ id: "t" }, { title: "third" }]);
  t.eq(plain_field.shout, "THIRD", "Task: a replayed plain field line runs the hook");
  return plain_field;
});
