// ChatSettings: a write from the panel never redraws it; reset saves once; toggle:false leaves the plugin's own switch out.
// Run: node public/framework/ux/Dictate/ChatSettings.test.mjs
import { test } from "../../core/Test/Test.js";
import ChatSettings, { PluginSettings } from "./ChatSettings.js";

const fake_row = (name = "Interrupt") => {
	const listeners = [], cfg = { threshold: 0.35 };
	return {
		plugin: { name, label: name, description: "d", fields: [{ key: "threshold", type: "slider", label: "T" }] },
		get: k => k === "config" ? cfg : true,
		set(o){ if (o.config) Object.assign(cfg, o.config); for (const l of listeners) l("config"); },   // emits synchronously, like a plugin row
		on: (e, fn) => listeners.push(fn),
	};
};

test("a panel write does not redraw the panel; a write from elsewhere does", async t => {
	const row = fake_row(), vc = { plugins: [row] };
	const panel = new ChatSettings({ vc, session: () => "s1", defaults: {} });
	panel.root = { el: { isConnected: true } };
	let redraws = 0; panel.refresh = () => redraws++;
	panel.watch();
	const ps = new PluginSettings(row, { before_set: () => panel.mark_own() });
	ps.on("change", () => panel.changed());
	ps.set("threshold", 0.8);
	t.eq(redraws, 0, "writing through the panel's own control leaves the panel alone");
	t.eq(row.get("config").threshold, 0.8, "and the row holds the value");
	await Promise.resolve();
	row.set({ config: { threshold: 0.2 } });
	t.eq(redraws, 1, "a change from outside (the bar's button, a session opening) redraws it");
});

test("toggle:false draws only the plugin's fields", t => {
	const row = fake_row();
	t.eq(new PluginSettings(row).fields.map(f => f.key), ["on", "threshold"], "default: the on toggle first");
	t.eq(new PluginSettings(row, { toggle: false }).fields.map(f => f.key), ["threshold"], "toggle:false: no on toggle");
});

test("reset holds the per-row saves off and saves the session once, as null", t => {
	const saves = [], vc = { plugins: [], _loading: false, reset_plugins(){ saves.push(["reset", this._loading]); } };
	const panel = new ChatSettings({ vc, session: () => "s1", defaults: {}, save_session: p => saves.push(["save", p]) });
	panel.reset();
	t.eq(saves, [["reset", true], ["save", null]], "events held off during the reset, one explicit save after");
	t.eq(vc._loading, false, "and the hold is lifted");
});
