// Run: node public/framework/core/Property/Property.test.mjs
import assert from "node:assert";
import { Property } from "./Property.js";

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };

const p = new Property(1), seen = [];
const off = p.bind(v => seen.push(v));
p.set(2); p.set(2); p.set(3);
t(seen.join() === "1,2,3", "bind fires now and on real changes only");
t(p.listeners() === 1, "one listener");
off();
t(p.listeners() === 0, "unbind drops it");

const base = new Property.Map().assign({ heading: "Base", cost: new Property("$0") , note: "n" });
const a = base.clone({ heading: "A" });
t(a.get("heading") === "A" && base.get("heading") === "Base", "override stays on the clone");
t(a.get("note") === "n", "unset keys fall through");
a.unset("heading");
t(a.get("heading") === "Base", "delete falls back");
t(a.unset("heading") === false, "unset of nothing is false");

t(a.prop("cost") === base.prop("cost"), "shared until written");
t(a.set("cost", "$5") === "rebind" && base.get("cost") === "$0", "write copies, parent untouched");
t(a.prop("cost") !== base.prop("cost") && a.get("cost") === "$5", "clone now owns its Property");
a.unset("cost");
t(a.get("cost") === "$0", "unset own Property falls back to the shared one");
t(base.set("cost", "$1") === "prop" && a.get("cost") === "$1", "parent write reaches the sharing clone");

t(!Object.keys(base.props).includes("note"), "no Property before bind");
const noteProp = a.prop("note");
t(base.props.note === noteProp && !Object.keys(a.props).includes("note"), "created on the owning layer");
t(base.data.note === undefined && a.get("note") === "n", "value moved into the Property");
t(a.set("fresh", 1) === "plain" && a.get("fresh") === 1 && base.get("fresh") === undefined, "unbound write is plain and own");

const offs = [a.prop("cost").bind(() => {}), a.prop("cost").bind(() => {})];
t(base.listeners("cost") === 2, "listeners counted through the layers");
offs.forEach(f => f());
t(base.listeners() === 0, "listeners back to 0 after unbind");

console.log(`Property.test.mjs: ${n} checks passed`);
