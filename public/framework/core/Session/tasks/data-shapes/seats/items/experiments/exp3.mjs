const R = "file:///C:/Code/lew42/monorepo/public/framework/";
const { default: Item } = await import(R + "core/Item/Item.js");
await import(R + "core/List/List.js");
const { default: MemorySaver } = await import(R + "ext/Saver/MemorySaver.js");
// A snapshot store in ~6 lines: same "delta" event the JSONL Store listens to, but it saves the whole object.
const saver = new MemorySaver();
const root = Item.hydrate({ id: "s", title: "S", tasks: [{ id: "t1", title: "one" }] });
root.on("delta", () => saver.save(root));
root.tasks.add({ id: "t2", title: "two" }); root.tasks.find("t1").set({ title: "one!" }); root.tasks.move("t2", { after: null });
await saver.writing;
const back = await Item.open(saver);
console.log("equal:", JSON.stringify(back) === JSON.stringify(root), [...back.tasks].map(t => t.id + ":" + t.get("title")).join(","));
// The same snapshot as ONE jsonl line, read by a {"snapshot":...} rule: hydrate, then keep replaying deltas on it.
const line = { snapshot: JSON.parse(JSON.stringify(root)) };
const from = Item.hydrate(line.snapshot); from.replay_line({ t1: { set: { title: "after snap" } } });
console.log("snap+delta:", [...from.tasks].map(t => t.id + ":" + t.get("title")).join(","));
