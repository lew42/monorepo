// One DemoPage, its three plugins, a sub-plugin, and the overrides round trip. Node: no DOM, so a tiny FakeEl stands in.
// Run: node public/live/demos/plugins/DemoPage.test.mjs
import { test } from "../../../framework/core/Test/Test.js";
import { Plugin } from "../../../framework/core/Plugin/Plugin.js";

class FakeEl {
	constructor(){ this.style = {}; this.kids = []; this.parentNode = null; this._text = ""; }
	get textContent(){ return this._text; }
	set textContent(v){ this._text = String(v); }
	appendChild(k){ k.parentNode = this; this.kids.push(k); return k; }
	remove(){ this.parentNode?.kids && (this.parentNode.kids = this.parentNode.kids.filter(k => k !== this)); this.parentNode = null; }
}
globalThis.document ??= { createElement: () => new FakeEl() };

Plugin.store = new Map();
const { default: DemoPage } = await import("./DemoPage.js");
const { default: Border } = await import("./Border.js");
const { default: Badge } = await import("./Badge.js");
const { default: Wide } = await import("./Wide.js");

const make = (overrides) => new DemoPage({ el: new FakeEl(), ...(overrides && { overrides }) });

test("Border and Badge are on by default; Wide is known but off", t => {
	const d = make();
	t.ok(d.el.style.border, "Border attached: the box has a border");
	t.ok(d.el.kids.length === 1, "Badge attached: one child element, the badge");
	t.ok(!d.el.style.width, "Wide is off by default: never attached, so never touched the box");
});

test("toggling Wide for this instance only widens the box, and undoes cleanly", t => {
	const d = make();
	d.plugins.set({ Wide: { enabled: true } });
	t.eq(d.el.style.width, "100%", "Wide attached");
	d.plugins.set({ Wide: { enabled: false } });
	t.eq(d.el.style.width, "", "Wide detached, cleanly");
});

test("Badge's own sub-plugin Count writes a number on the badge, and the row is inactive while Badge is off", t => {
	const d = make();
	t.eq(d._badge.el.textContent, "1", "Count attached to the real Badge instance behind the badge element");
	const badge_row = [...d.plugins].find(r => r.get("name") === "Badge");
	const count_row = [...badge_row.plugins].find(r => r.get("name") === "Count");
	t.ok(count_row.active, "Count's row is active while Badge is on");
	d.plugins.set({ Badge: { enabled: false } });
	count_row.up = badge_row;   // row.plugins (not read again here) is what normally sets this on draw
	t.ok(!count_row.active, "Count's row reads inactive once its parent, Badge, is off");
});

test("overrides round-trips through load_overrides: what this instance changed, and only that", t => {
	const d = make();
	d.plugins.set({ Wide: { enabled: true }, Border: { enabled: false } });
	const saved = d.overrides;
	t.eq(saved, { Wide: { enabled: true }, Border: { enabled: false } }, "overrides is plain JSON of just the changes");
	const e = make(saved);
	t.eq(e.el.style.width, "100%", "a fresh instance loaded with the same overrides: Wide on");
	t.ok(!e.el.style.border, "…and Border off: the override is loaded before Border ever attaches, so it never touches the box");
	e.reset_plugins();
	t.eq(e.overrides, {}, "reset_plugins drops every override");
	t.ok(e.el.style.border, "…back to the class default: Border on again");
});
