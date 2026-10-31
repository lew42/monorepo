// D14: a method saved as ONE call. `node public/framework/core/Item/call.test.mjs`
// The method wraps its body: `sort_by(key){ return this.as_call("sort_by", [key], () => { … }); }`. While the body runs, saving is
// muted for this item's tree; one line `{"sort_by()": "title"}` is saved (the value is the one argument, D13 rule 2), only for the
// outermost call, and never while a line is being replayed.
import { test } from "../Test/Test.js";
import Item from "./Item.js";
import List from "../List/List.js";
import Store from "./Store.js";

// Page: /framework/core/Test/view/?file=core/Item/call.test.mjs
const record = host => { const lines = []; const store = new Store({ url: "/x/" + Math.random() + ".jsonl" }); store.append = line => lines.push(line); store.attach(host); return { lines, store }; };

class Table extends Item {
	constructor(...args){ super(...args); this.rows = new List({ owner: this, name: "rows" }); }
	order_of(){ return [...this.rows].map(row => row.id); }
	sort_by(key){
		return this.as_call("sort_by", [key], () => {
			const sorted = [...this.rows].sort((a, b) => String(a.get(key)).localeCompare(String(b.get(key)))).map(row => row.id);
			this.rows.order(sorted);
			this.set({ sorted_by: key });
		});
	}
	// a call that makes two calls: only the outer line is saved
	sort_both({ first, second }){
		return this.as_call("sort_both", [{ first, second }], () => { this.sort_by(first); this.sort_by(second); });
	}
	nothing(){ return this.as_call("nothing", [], () => {}); }
	boom(){ return this.as_call("boom", [], () => { this.set({ half: true }); throw new Error("body failed"); }); }
}
Item.register(Table, "Table");

const fresh = () => {
	const table = new Table({ id: "table" });
	const made = record(table);
	table.rows.add({ id: "r1", title: "pear" });
	table.rows.add({ id: "r2", title: "apple" });
	table.rows.add({ id: "r3", title: "fig" });
	made.lines.length = 0;
	return { table, ...made };
};

// one call, one line
test("a method wrapped in as_call saves ONE line: the call with its argument", t => {
	const { table, lines } = fresh();
	table.sort_by("title");
	t.eq(table.order_of(), ["r2", "r3", "r1"], "the body ran: sorted by title");
	t.eq(lines, [{ "sort_by()": "title" }], "and ONE line was saved: the call with its argument, not the order and set lines it made");
	t.view({ saved_lines: lines }, "the lines saved");
	return table;
});

// replay gives the same order and saves nothing
test("replaying the call line gives the same order, and a tab that reads it saves nothing", t => {
	const { table, lines } = fresh();
	const adds = [{ rows: { add: { id: "r1", title: "pear" } } }, { rows: { add: { id: "r2", title: "apple" } } }, { rows: { add: { id: "r3", title: "fig" } } }];
	table.sort_by("title");
	const again = Table.replay([...adds, ...lines]);
	t.eq(again.order_of(), table.order_of(), "replay: the same order as the live item");
	t.eq(again.get("sorted_by"), "title", "replay: and the body's other changes came back with it");

	// a tab that reads the line from the file: runs the call, saves nothing
	const other = new Table({ id: "other" });
	const tab = record(other);
	tab.store.read([...adds, ...lines]);
	t.eq(other.order_of(), ["r2", "r3", "r1"], "another tab: reading the line ran the call");
	t.eq(tab.lines, [], "another tab: and saved nothing");
	t.view(table, "the live table");
	t.view(again, "a fresh replay of the call line");
	return other;
});

// nested: only the outermost call saves
test.optional("edge: nested calls save only the outermost line", t => {
	const { table, lines } = fresh();
	table.sort_both({ first: "title", second: "id" });
	t.eq(lines, [{ "sort_both()": { first: "title", second: "id" } }], "nested: one line for the outer call, none for the two inside it");
	t.eq(table.order_of(), ["r1", "r2", "r3"], "nested: both inner calls ran (last sort: by id)");
	return table;
});

// mute is for this item's tree only
test.optional("edge: the mute covers this item's tree only; an unrelated item still saves", t => {
	const { table, lines } = fresh();
	const stranger = new Item({ id: "stranger" });
	const theirs = record(stranger);
	table.rows.find("r1").on("change", () => stranger.set({ saw: "a change" }));   // a view-like listener on a row: another item's write during the body
	table.sort_by("title");
	t.eq(lines, [{ "sort_by()": "title" }], "tree: this item's own lines are muted");
	// a write to an unrelated item DURING a body is still saved
	class Pokes extends Item {
		poke(other){ return this.as_call("poke", [], () => { this.set({ a: 1 }); other.set({ b: 2 }); }); }
	}
	const poker = new Pokes({ id: "p" }), poker_lines = record(poker).lines;
	const target = new Item({ id: "t" }), target_lines = record(target).lines;
	poker.poke(target);
	t.eq(poker_lines, [{ "poke()": { $args: [] } }], "tree: the call is one line (no arguments: an empty $args list)");
	t.eq(target_lines, [{ set: { b: 2 } }], "tree: an unrelated item's write during the body is still saved");
	t.view(target, "the unrelated item");
	return table;
});

// no change, no line; a throwing body: no line, mute released
test.optional("edge: no change saves no line; a throwing body saves none and releases the mute", t => {
	const { table, lines } = fresh();
	table.nothing();
	t.eq(lines, [], "a body that changed nothing saves nothing");
	let threw = null;
	try { table.boom(); } catch (e){ threw = e.message; }
	t.eq(threw, "body failed", "a throwing body rethrows");
	t.eq(lines, [], "and saves no line (the half-done change is not in the log)");
	table.set({ after: 1 });
	t.eq(lines.at(-1), { set: { after: 1 } }, "and the mute is released: the next write is saved");
	return table;
});

// act() keeps working, also around an as_call method
test.optional("edge: act() still saves its one verb line around an as_call method, and it replays", t => {
	const { table, lines } = fresh();
	table.act("sort_by", "title");
	t.eq(lines, [{ sort_by: "title" }], "act(): still one line, the verb (written bare unless Store.marked_lines)");
	const again = Table.replay([{ rows: { add: { id: "r1", title: "pear" } } }, { rows: { add: { id: "r2", title: "apple" } } }, ...lines]);
	t.eq(again.order_of(), ["r2", "r1"], "act(): and its line replays (the bare spelling too)");
	return again;
});

// every argument list comes back exactly (review finding 8)
class Args extends Item {
	take(...args){ return this.as_call("take", args, () => { this.received = args; this.set({ n: (this.get("n") ?? 0) + 1 }); }); }
}
Item.register(Args, "Args");

test("every argument list is saved in a line that replays to the same arguments", t => {
	const show = args => JSON.stringify(args.map(a => a === undefined ? "<undefined>" : a));
	const trim = args => { const out = [...args]; while (out.length && out.at(-1) === undefined) out.pop(); return out; };   // a trailing undefined is the same as no argument
	const lists = {
		"none": [], "one": [1], "two": [1, 2], "one undefined": [undefined], "undefined in the middle": ["a", undefined, "c"], "a trailing undefined": ["a", undefined],
		"an object": [{ a: 1 }], "an empty object": [{}], "an array": [[1, 2]], "two arrays": [[1], [2]], "null": [null],
		"an object that looks like the wrapper": [{ $args: [1] }],
	};
	const rows = [];
	for (const [name, list] of Object.entries(lists)){
		const item = new Args({ id: "a" }), { lines } = record(item);
		item.take(...list);
		const saved = JSON.parse(JSON.stringify(lines));   // through the file and back
		t.eq(saved.length, 1, `${name}: one line is saved (${JSON.stringify(saved[0])})`);
		const marked = Args.replay([{ id: "a" }, ...saved]);
		// the item tool strips the "()" before it applies a line (Servex/agents/page_tools.js unmark_delta): the bare spelling must work too
		const bare = Args.replay([{ id: "a" }, ...saved.map(l => Object.fromEntries(Object.entries(l).map(([k, v]) => [k.replace(/\(\)$/, ""), v])))]);
		t.eq(show(marked.received ?? []), show(trim(list)), `${name}: replaying the saved line calls the method with the same arguments`);
		t.eq(show(bare.received ?? []), show(trim(list)), `${name}: and so does the item tool's bare spelling`);
		t.eq([marked.get("n"), bare.get("n")], [1, 1], `${name}: the call ran on replay (its change came back)`);
		rows.push({ arguments: show(list), line: JSON.stringify(saved[0]) });
	}
	t.view(rows, "each argument list and the line it is saved as");
});
