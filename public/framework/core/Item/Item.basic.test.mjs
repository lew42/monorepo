// Item: one instance, the everyday calls, a check after each. Run: node public/framework/core/Item/Item.basic.test.mjs
import assert from "node:assert/strict";
import Item from "./Item.js";
import "../List/List.js";

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };

const root = Item.hydrate({ id: "root", title: "Root", kids: [{ id: "a", title: "A" }, { id: "b" }] });
t(root instanceof Item && root.id === "root", "hydrate builds an Item with its id");
t(root.get("title") === "Root", "get reads a field");
const seen = [];
root.on?.("change", e => seen.push(e));
root.set({ title: "New" });
t(root.get("title") === "New", "set changes a field");
root.set({ extra: 1, other: 2 });
t(root.get("extra") === 1 && root.get("other") === 2, "set takes several fields at once");
t([...root.kids].map(k => k.id).join() === "a,b", "kids come back in order");
t([...root.kids][0].parent === root, "a kid knows its parent");
t(root.kids.find("b")?.id === "b", "kids.find by id");
root.kids.add({ id: "c", title: "C" });
t([...root.kids].map(k => k.id).join() === "a,b,c", "kids.add appends");
root.kids.remove("b");
t([...root.kids].map(k => k.id).join() === "a,c", "kids.remove drops the kid");
root.kids.move({ id: "c", after: null });
t([...root.kids].map(k => k.id).join() === "c,a", "move to the front keeps the count");
t(root.kids.find("a").get("title") === "A", "a kid keeps its own fields");
t(root.kids.find("zzz") == null, "find of a missing id is empty");
t(typeof Item.register === "function" && Item.types instanceof Map, "the registry exists");

console.log(`Item basic: ${n} checks passed`);
