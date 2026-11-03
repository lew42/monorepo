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

test("enable() re-attaches to every still-live tracked instance, not just new ones", t => {
	calls.length = 0;
	class H14 extends Plugin {}
	new H14({ tag: "single" });               // exists before use(): never tracked
	H14.use(Spy);
	t.eq(calls.length, 0, "use() alone does not reach a pre-existing instance");
	new H14({ tag: "new1" });
	t.eq(calls, [["attach", "Spy", "new1"]], "the new instance was attached and is now tracked");
	H14.unuse(Spy);
	calls.length = 0;
	H14.use(Spy);
	t.eq(calls, [["attach", "Spy", "new1"]], "re-enable reattached the tracked instance, not the untracked singleton");
});

test("a per-instance switch: enabled is unset and follows the class row, off/on touches only that instance", t => {
	calls.length = 0;
	class H11 extends Plugin {}
	H11.use(Spy);
	const a = new H11({ tag: "a" });
	calls.length = 0;
	const row = a.plugins.find("Spy");
	t.eq(row.get("enabled"), true, "unset: follows the class row (on)");
	row.set({ enabled: false });
	t.eq(calls, [["detach", "Spy", "a"]], "off: detached this instance only");
	calls.length = 0;
	row.set({ enabled: true });
	t.eq(calls, [["attach", "Spy", "a"]], "on: reattached this instance only");
	calls.length = 0;
	H11.unuse(Spy);
	t.eq(calls.length, 0, "the instance's own 'on' wins: the class going off does not detach it");
	t.eq(row.get("enabled"), true, "row shows the real, still-attached state");
	H11.use(Spy);
	t.eq(calls.length, 0, "already attached: re-enabling the class does not attach it a second time");
});

test("attach is idempotent per (instance, plugin): use -> unuse -> use never attaches the same live instance twice", t => {
	calls.length = 0;
	class H15 extends Plugin {}
	H15.use(Spy);               // Spy has detach, but Other (used below) does not
	const live = new H15({ tag: "live" });
	calls.length = 0;
	H15.unuse(Spy); H15.use(Spy);
	t.eq(calls, [["detach", "Spy", "live"], ["attach", "Spy", "live"]], "one real detach, then one re-attach — not a duplicate attach");
	calls.length = 0;
	class H16 extends Plugin {}
	H16.use(Other);              // Other has no detach: disable() can't undo the first attach
	const live2 = new H16({ tag: "live2" });
	calls.length = 0;
	H16.unuse(Other); H16.use(Other);
	t.eq(calls.length, 0, "no real detach ran, so attach_instance's own guard skips the second attach");
	calls.length = 0;
	// A Plugin SUBCLASS with no detach of its own inherits Plugin.detach (a no-op) — review finding 2, 2026-11-03:
	// `typeof rec.plugin.detach === "function"` is true for that inherited no-op, so detach_instance must also
	// check it isn't just the base class's default, or it wrongly treats the inherited no-op as a real undo.
	class NoOwnDetach extends Plugin { static attach(inst){ calls.push(["attach", "NoOwnDetach", inst.tag]); } }
	class H19 extends Plugin {}
	H19.use(NoOwnDetach);
	const live3 = new H19({ tag: "live3" });
	calls.length = 0;
	H19.unuse(NoOwnDetach); H19.use(NoOwnDetach);
	t.eq(calls.length, 0, "the inherited no-op detach is not a real undo either — attached once, stays attached");
});

test("inst.plugins picks up a plugin the class gains after the row list was first read", t => {
	class H17 extends Plugin {}
	H17.use(Spy);
	const inst = new H17({ tag: "late" });
	t.eq(inst.plugins.length, 1, "one row before Other is added");
	H17.use(Other);
	t.eq(inst.plugins.length, 2, "Other's row appeared on the already-read instance list");
	t.eq(inst.plugins.find("Other").get("enabled"), true, "unset: follows the class row");
});

test("the item-tool delta shape works on both Host.plugins and inst.plugins", t => {
	calls.length = 0;
	class H12 extends Plugin {}
	H12.use(Spy);
	H12.plugins.set({ Spy: { enabled: false } });
	t.eq(H12.plugins.find("Spy").get("enabled"), false, "class list toggled off");
	const inst = new H12({ tag: "z" });
	calls.length = 0;
	inst.plugins.set({ Spy: { enabled: true } });
	t.eq(calls, [["attach", "Spy", "z"]], "instance list toggled on: attach ran for this instance only");
});

test("instance config falls back to the class config until this instance sets its own", t => {
	class Dim2 { static defaults = { on: true, opacity: 0.6 }; static attach(){} }
	class H13 extends Plugin {}
	H13.use(Dim2);
	const inst = new H13({ tag: "c" });
	const row = inst.plugins.find("Dim2");
	t.eq(row.get("config"), { opacity: 0.6 }, "falls back to the class config");
	row.set({ config: { opacity: 0.9 } });
	t.eq(row.get("config"), { opacity: 0.9 }, "its own override, once set");
	t.eq(H13.plugins.find("Dim2").get("config"), { opacity: 0.6 }, "the class row is unaffected");
});

test("the server shim: Server/Events.js is a Plugin that keeps assign, then new, then initialize", t => {
	const order = [];
	class Sock extends ServerEvents { initialize(){ order.push("initialize:" + this.ws); } }
	Sock.use(inst => order.push("new:" + inst.ws));
	new Sock({ ws: 7 });
	t.eq(order, ["new:7", "initialize:7"], "assign, new event, initialize");
	t.ok(new Sock({}) instanceof Plugin, "it is a Plugin");
});
