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

console.log(`ok — ${n} assertions passed`);
