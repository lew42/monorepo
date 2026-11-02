// core/Plugin: A.use(B, C), unuse, A.plugins (lazy List), toggle, config, sub-plugins, the server shim.
// Run: node public/framework/core/Plugin/Plugin.test.mjs   (written before Plugin.js: it fails until the class exists)
import { test } from "../Test/Test.js";
import { Plugin } from "./Plugin.js";
import ServerEvents from "../../../../Server/Events.js";

Plugin.store = new Map();   // saved config goes here, not to a browser

// a pluggable class A, and plugins that record what they were given
const calls = [];
class Host extends Plugin {}
class Spy { static attach(inst){ calls.push(["attach", this.name, inst.tag]); } static detach(inst){ calls.push(["detach", this.name, inst.tag]); } }
class Other { static attach(inst){ calls.push(["attach", this.name, inst.tag]); } }
class Old { static setup(inst){ calls.push(["setup", this.name, inst.tag]); } }   // the old word keeps working

test("use(B, C) installs each, returns the class, and a new instance reaches each plugin with its args already assigned", t => {
	calls.length = 0;
	t.ok(Host.use(Spy, Other) === Host, "use returns the class so it chains");
	new Host({ tag: "one" });
	t.eq(calls, [["attach", "Spy", "one"], ["attach", "Other", "one"]], "attach ran per plugin, in order, after assign");
});

test("setup is still accepted as the old name for attach, and a plain function is a plugin", t => {
	calls.length = 0;
	class H2 extends Plugin {}
	let fn_got; H2.use(Old, inst => { fn_got = inst.tag; });
	new H2({ tag: "x" });
	t.eq(calls, [["setup", "Old", "x"]], "a plugin with only setup is attached through setup");
	t.eq(fn_got, "x", "a plain function is called with the new instance");
});

test("using the same plugin twice is a no-op", t => {
	calls.length = 0;
	class H3 extends Plugin {}
	H3.use(Other); H3.use(Other);
	new H3({ tag: "d" });
	t.eq(calls.length, 1, "attached once");
});

test("unuse removes the hook; live instances are told detach, new ones are not attached", t => {
	calls.length = 0;
	class H4 extends Plugin {}
	H4.use(Spy);
	const live = new H4({ tag: "live" });
	H4.unuse(Spy);
	t.eq(calls, [["attach", "Spy", "live"], ["detach", "Spy", "live"]], "the live instance was detached");
	new H4({ tag: "later" });
	t.eq(calls.length, 2, "a later instance gets nothing");
	t.ok(live, "kept so the instance is not collected before unuse");
});

test("a subclass instance reaches its parents' plugins first, and its own use does not leak up", t => {
	calls.length = 0;
	class P1 extends Plugin {}
	class P2 extends P1 {}
	P1.use(Other); P2.use(Spy);
	new P2({ tag: "kid" });
	t.eq(calls, [["attach", "Other", "kid"], ["attach", "Spy", "kid"]], "parent plugin, then subclass plugin");
	calls.length = 0;
	new P1({ tag: "mum" });
	t.eq(calls, [["attach", "Other", "mum"]], "the parent never runs the subclass's plugin");
});

test("instance events: once fires once, clear drops listeners, on/off chain", t => {
	const e = new Host({ tag: "e" });
	let n = 0;
	t.ok(e.on("x", () => n++) === e, "on returns this");
	e.once("y", () => n += 10);
	e.emit("y"); e.emit("y"); e.emit("x");
	t.eq(n, 11, "once ran once; on ran");
	e.clear("x"); e.emit("x");
	t.eq(n, 11, "clear removed the listener");
});

test("A.plugins is lazy: nothing is built until it is read, then one entry per plugin, in step with use/unuse", t => {
	class H5 extends Plugin {}
	H5.use(Spy);
	t.ok(!Object.hasOwn(H5, "_list"), "reading nothing built nothing");
	const list = H5.plugins;
	t.eq(list.length, 1, "one entry");
	t.eq(list.find("Spy").get("enabled"), true, "the entry is on");
	H5.use(Other);
	t.eq(list.length, 2, "a plugin used after the list exists appears in it");
	H5.unuse(Other);
	t.eq(list.find("Other").get("enabled"), false, "unuse switches the row off");
});

test("available() lists a plugin switched off and installs nothing", t => {
	calls.length = 0;
	class H6 extends Plugin {}
	H6.available(Spy);
	t.eq(H6.plugins.find("Spy").get("enabled"), false, "shown off");
	new H6({ tag: "a" });
	t.eq(calls.length, 0, "not attached while off");
	H6.plugins.find("Spy").set({ enabled: true });
	new H6({ tag: "b" });
	t.eq(calls, [["attach", "Spy", "b"]], "switching on installs it");
});

test("toggling a row (what the item tool sends) moves the hook with it", t => {
	calls.length = 0;
	class H7 extends Plugin {}
	H7.use(Spy);
	H7.plugins.set({ Spy: { enabled: false } });
	new H7({ tag: "off" });
	t.eq(calls.length, 0, "off: the hook is gone");
	H7.plugins.set({ Spy: { enabled: true } });
	new H7({ tag: "on" });
	t.eq(calls, [["attach", "Spy", "on"]], "on: the hook is back");
});

test("config: defaults, a changed value is saved under plugin.<Class>.<name>, and a reinstall reads it back", t => {
	class Dim { static defaults = { on: true, opacity: 0.6 }; static fields = [{ key: "opacity", kind: "slider", min: 0, max: 1, step: 0.1 }]; static attach(){} }
	class H8 extends Plugin {}
	H8.use(Dim);
	const row = H8.plugins.find("Dim");
	t.eq(row.get("config"), { opacity: 0.6 }, "defaults fill the config");
	row.set({ config: { opacity: 0.3 } });
	t.eq(Plugin.store.get("plugin.H8.Dim"), { on: true, config: { opacity: 0.3 } }, "saved");
	H8.unuse(Dim); H8.use(Dim);
	t.eq(H8.plugins.find("Dim").get("config"), { opacity: 0.3 }, "read back after a reinstall");
	t.eq(row.fields[0].key, "opacity", "the row exposes the plugin's fields for a panel");
});

test("a sub-plugin follows its parent: parent off means the sub-plugin never runs and its row reads inactive", t => {
	calls.length = 0;
	class Sub { static attach(inst){ calls.push(["attach", "Sub", inst.tag]); } }
	class Parent extends Plugin { static attach(host){ new this(host); } }   // a plugin that is also pluggable
	Parent.use(Sub);
	class H9 extends Plugin {}
	H9.use(Parent);
	const row = H9.plugins.find("Parent"), sub = row.plugins.find("Sub");
	new H9({ tag: "p1" });
	t.eq(calls, [["attach", "Sub", "p1"]], "on: the sub-plugin runs for the parent's instance");
	row.set({ enabled: false });
	t.eq(sub.active, false, "the sub row reads inactive while the parent is off");
	calls.length = 0;
	new H9({ tag: "p2" });
	t.eq(calls.length, 0, "off: the sub-plugin does not run");
	row.set({ enabled: true });
	t.eq(sub.active, true, "back on: active again");
});

test("the page can list the live plugin-using classes", t => {
	class H10 extends Plugin {}
	H10.use(Spy);
	t.ok(Plugin.hosts.includes(H10), "Plugin.hosts holds every class that used or listed a plugin");
});

test("the server shim: Server/Events.js is a Plugin that keeps assign, then new, then initialize", t => {
	const order = [];
	class Sock extends ServerEvents { initialize(){ order.push("initialize:" + this.ws); } }
	Sock.use(inst => order.push("new:" + inst.ws));
	new Sock({ ws: 7 });
	t.eq(order, ["new:7", "initialize:7"], "assign, new event, initialize");
	t.ok(new Sock({}) instanceof Plugin, "it is a Plugin");
});
