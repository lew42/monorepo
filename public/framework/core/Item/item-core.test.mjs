// The Item core's small safety fixes (Brief B part 1). `node public/framework/core/Item/item-core.test.mjs`
// Real Item, Task and Store; the Store's disk write is replaced by a list (`store.append`), nothing else is faked.
import Test from "../Test/Test.js";
import Item from "./Item.js";
import Store from "./Store.js";
import Task from "../Task/Task.js";

const t = new Test("core/Item: the core's safety fixes");
// Runs fn with console.warn and console.error captured; a throw out of fn is captured too (it is what a test wants to see).
const quiet = fn => { const w = console.warn, e = console.error, said = []; console.warn = console.error = (...a) => said.push(a.join(" ")); try { fn(); } catch (err){ said.push("THREW " + err.message); } finally { console.warn = w; console.error = e; } return said; };

// A store whose lines go into an array instead of a file.
const record = host => { const lines = []; const store = new Store({ url: "/x/" + Math.random() + ".jsonl" }); store.append = line => lines.push(line); store.attach(host); return lines; };

// 1a. A view listener that throws must not stop the save.
{
	const item = new Item({ id: "a" });
	const lines = record(item);
	item.on("change", () => { throw new Error("a view broke"); });
	const said = quiet(() => item.set({ title: "hello" }));
	t.ok(!said.some(s => s.startsWith("THREW")), "1a: set() does not throw because a view listener did");
	t.eq(item.get("title"), "hello", "1a: the value is set even though a view listener threw");
	t.eq(lines, [{ set: { title: "hello" } }], "1a: the line is still saved when a view listener throws");
	t.ok(said.some(s => s.includes("change")), "1a: the broken listener is reported by console, naming the event: " + JSON.stringify(said));
}

t.done();
