const R = "file:///C:/Code/lew42/monorepo/public/framework/core/";
const { default: Item } = await import(R + "Item/Item.js");
const { default: List } = await import(R + "List/List.js");
const { default: Task } = await import(R + "Task/Task.js");
// A: does a bare Item get an items list on demand?
const a = new Item({ id: "a" }); a.set({ items: { add: { id: "x" } } });
console.log("A bare Item:", { is_list: a.get("items") instanceof List, stored_as: JSON.stringify(a.data) });
const b = Item.hydrate({ id: "b", items: [{ id: "x" }] });
console.log("A hydrate:", { is_list: b.items instanceof List });
const t = new Task({ id: "t" }); t.set({ tasks: { add: { id: "x", title: "X" } } });
console.log("A Task:", { is_list: t.tasks instanceof List, n: t.tasks.length, lists: Object.keys(t.lists()) });
// B: replay cost vs size (adds, then a set on each member, then one move, one order)
const lines = n => { const L = []; for (let i = 0; i < n; i++) L.push({ items: { add: { id: "i" + i, after: i ? "i" + (i - 1) : null, title: "t" } } });
  for (let i = 0; i < n; i++) L.push({ ["i" + i]: { set: { title: "u" } } }); return L; };
for (const n of [1000, 2000, 4000, 8000]){
  const L = lines(n); const root = new Item({ id: "r" }); root.items = new List({ owner: root, name: "items" });
  const t0 = performance.now(); for (const l of L) root.replay_line(l); const ms = performance.now() - t0;
  const t1 = performance.now(); root.items.order([...root.items].map(x => x.id).reverse()); const ord = performance.now() - t1;
  console.log(`B n=${n} lines=${L.length} replay=${ms.toFixed(0)}ms per_line=${(ms / L.length * 1000).toFixed(1)}us order=${ord.toFixed(0)}ms`);
}
// C: write-side cost: hops() on a deep member
{ const root = new Item({ id: "r" }); root.items = new List({ owner: root, name: "items" }); const lines = [];
  const s = new Item.Store({ url: "/x.jsonl" }); s.append = l => lines.push(l); s.attach(root);
  for (let i = 0; i < 8000; i++) root.items.insert({ id: "i" + i });
  const last = root.items.at(-1); const t0 = performance.now(); for (let k = 0; k < 1000; k++) last.set({ title: "v" + k }); 
  console.log(`C 1000 sets on the last of 8000 members: ${(performance.now() - t0).toFixed(0)}ms`); }
