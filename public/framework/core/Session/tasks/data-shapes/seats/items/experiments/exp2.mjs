const R = "file:///C:/Code/lew42/monorepo/public/framework/core/";
const { default: Item } = await import(R + "Item/Item.js");
const { default: List } = await import(R + "List/List.js");
const p = new Item({ id: "p" }); p.a = new List({ owner: p, name: "a" });
p.replay_line({ a: { add: { id: "k", title: "K" } }, by: "owner", ts: "2026-10-28T01:00:00Z" });
p.replay_line({ k: { set: { title: "K2" } }, by: "agent", ts: "2026-10-28T01:05:00Z" });
console.log("host data", JSON.stringify(p.data), "kid data", JSON.stringify(p.a.find("k").data));
