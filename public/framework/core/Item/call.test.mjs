// D14: a method saved as ONE call. `node public/framework/core/Item/call.test.mjs`
// The method wraps its body: `sort_by(key){ return this.as_call("sort_by", [key], () => { … }); }`. While the body runs, saving is
// muted for this item's tree; one line `{"sort_by()": "title"}` is saved (the value is the one argument, D13 rule 2), only for the
// outermost call, and never while a line is being replayed.
import Test from "../Test/Test.js";
import Item from "./Item.js";
import List from "../List/List.js";
import Store from "./Store.js";

const t = new Test("core/Item: as_call saves a method as one line, outermost only, never on replay");
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
{
	const { table, lines } = fresh();
	table.sort_by("title");
	t.eq(table.order_of(), ["r2", "r3", "r1"], "the body ran: sorted by title");
	t.eq(lines, [{ "sort_by()": "title" }], "and ONE line was saved: the call with its argument, not the order and set lines it made");
}

// replay gives the same order and saves nothing
{
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
}

// nested: only the outermost call saves
{
	const { table, lines } = fresh();
	table.sort_both({ first: "title", second: "id" });
	t.eq(lines, [{ "sort_both()": { first: "title", second: "id" } }], "nested: one line for the outer call, none for the two inside it");
	t.eq(table.order_of(), ["r1", "r2", "r3"], "nested: both inner calls ran (last sort: by id)");
}

// mute is for this item's tree only
{
	const { table, lines } = fresh();
	const stranger = new Item({ id: "stranger" });
	const theirs = record(stranger);
	table.rows.find("r1").on("change", () => stranger.set({ saw: "a change" }));   // a view-like listener on a row: another item's write during the body
	table.sort_by("title");
	t.eq(lines, [{ "sort_by()": "title" }], "tree: this item's own lines are muted");
	t.eq(theirs.lines, [], "tree: (no change event reached the row's listener, since sorting changes no row field)");
	// a write to an unrelated item DURING a body is still saved
	class Pokes extends Item {
		poke(other){ return this.as_call("poke", [], () => { this.set({ a: 1 }); other.set({ b: 2 }); }); }
	}
	const poker = new Pokes({ id: "p" }), poker_lines = record(poker).lines;
	const target = new Item({ id: "t" }), target_lines = record(target).lines;
	poker.poke(target);
	t.eq(poker_lines, [{ "poke()": {} }], "tree: the call is one line");
	t.eq(target_lines, [{ set: { b: 2 } }], "tree: an unrelated item's write during the body is still saved");
}

// no change, no line; a throwing body: no line, mute released
{
	const { table, lines } = fresh();
	table.nothing();
	t.eq(lines, [], "a body that changed nothing saves nothing");
	let threw = null;
	try { table.boom(); } catch (e){ threw = e.message; }
	t.eq(threw, "body failed", "a throwing body rethrows");
	t.eq(lines, [], "and saves no line (the half-done change is not in the log)");
	table.set({ after: 1 });
	t.eq(lines.at(-1), { set: { after: 1 } }, "and the mute is released: the next write is saved");
}

// act() keeps working, also around an as_call method
{
	const { table, lines } = fresh();
	table.act("sort_by", "title");
	t.eq(lines, [{ sort_by: "title" }], "act(): still one line, the verb (written bare unless Store.marked_lines)");
	const again = Table.replay([{ rows: { add: { id: "r1", title: "pear" } } }, { rows: { add: { id: "r2", title: "apple" } } }, ...lines]);
	t.eq(again.order_of(), ["r2", "r1"], "act(): and its line replays (the bare spelling too)");
}

t.done();
