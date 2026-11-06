// node public/live/design/PageUI.test.mjs
import assert from "node:assert";
import { register } from "node:module";

register("../../../Servex/agents/site-hooks.mjs", import.meta.url);

const { default: DesignPage } = await import("./DesignPage.js");

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };

// (1) a delta walks page -> ui -> tabs, one get() per level, and makes the widget on first touch.
{
	const page = DesignPage.replay([{ title: "Design" }, { ui: { tabs: { names: ["Today", "Idea 2"], selected: "Idea 2" } } }]);
	t(page.ui.get("tabs").get("selected") === "Idea 2", "page.ui.get(\"tabs\") holds the delta's state");
	t(page.ui.made().length === 1, "exactly one widget was made");
}

// (2) a fresh page built from the SAME lines (as replay does) ends up with the same state.
{
	const lines = [{ title: "Design" }, { ui: { tabs: { names: ["Today", "Idea 2"], selected: "Idea 2" } } }];
	const page = DesignPage.replay(lines);
	t(page.ui.get("tabs").get("selected") === "Idea 2", "the state survived a fresh replay of the same lines");
}

// (3) an unregistered name never throws and stores nothing.
{
	const page = DesignPage.replay([{ title: "Design" }]);
	assert.doesNotThrow(() => page.set({ ui: { nope: { x: 1 } } }), "an unregistered ui name does not throw");
	n++;
	t(page.ui.get("nope") === undefined, "an unregistered ui name answers undefined, as Item does");
	t(!Object.prototype.hasOwnProperty.call(page.ui, "nope"), "nothing was stored for it");
}

// (4) the methods widget's state survives a replay too (same shape as the tabs widget, a second registered type).
// The field is `mode`, not the brief's literal `view`: Item.prototype already has its own `view` accessor
// (Item.js:576), and a data key named "view" trips it in node — see the comment in ui/MethodMap.js.
{
	const lines = [{ title: "Design" }, { ui: { methods: { mode: "grouped" } } }];
	const page = DesignPage.replay(lines);
	t(page.ui.get("methods").get("mode") === "grouped", "page.ui.get(\"methods\") holds the delta's state");
	const page2 = DesignPage.replay(lines);
	t(page2.ui.get("methods").get("mode") === "grouped", "the state survived a fresh replay of the same lines");
}

// (5) the method census, computed (not typed): Page has well over 50 of its own methods, and the grouped
// view's buckets (core/Page/doc/namespaces.md) account for every one of them — two numbers that must agree.
{
	const { default: MethodMap } = await import("./ui/MethodMap.js");
	const census = MethodMap.census();
	t(census.Page.length > 50, `Page has ${census.Page.length} own methods, over 50`);
	const grouped = MethodMap.grouped();
	const sum = Object.values(grouped).reduce((total, list) => total + list.length, 0);
	t(sum === census.Page.length, `the grouped buckets (${sum}) add up to Page's own total (${census.Page.length})`);
}

console.log(`ok — ${n} assertions passed`);
