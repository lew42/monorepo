import { Page, md, div, span, label, input, button, pre, code } from "/app.js";
import DemoPage from "./DemoPage.js";
import Badge from "./Badge.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import { RecordWriter } from "/framework/core/Item/RecordWriter.js";

// This page's own page.jsonl is NOT the routing kind (readme.md): it is one plain data file, the single source of
// truth for the one switch a reader can save. A line here is `{"overrides": {...}}`, the plain object `inst.overrides`
// gives (core/Plugin/Plugin.js). The item tool writing the same line also reaches this reader, so an open tab redraws.
const FILE_URL = new URL("./page.jsonl", import.meta.url).pathname;

let overrides = {}, sub = {}, demo = null, redraw = () => {};
const jsonl = new JSONL({ url: FILE_URL });
jsonl.read = entries => {
	for (const o of entries) if (o && typeof o.overrides === "object") { overrides = o.overrides; sub = o.sub || {}; }
};
// Badge's own plugin (Count) is a class-level row, not a per-box override, so it rides in the same line as `sub`.
const apply_sub = () => { for (const [name, enabled] of Object.entries(sub)) Badge.plugins.set({ [name]: { enabled } }); };
apply_sub();
// Resolved before this page's own content() builds its DOM (same reason as /live/demos/ref/page.js): `overrides` is
// already the saved value by the time `new DemoPage({overrides})` runs, so the first draw already shows it.
await jsonl.live(() => { demo?.load_overrides(overrides); apply_sub(); redraw(); });

// A worktree's own page answers RecordWriter's one entry point "stubbed" (page_tools.js: "another checkout"), so the
// line never lands there — the same case core/Item/Store.js#flush falls back for: send the ones not taken straight
// through this page's own dev server (Outbox, the wire half of FsFile.append).
const save = async () => {
	if (!demo) return;
	sub = {};
	for (const row of demo.plugins) for (const r of row.plugins || []) sub[r.get("name")] = !!r.get("enabled");
	const { rest } = await RecordWriter.post(FILE_URL, { lines: [{ overrides: demo.overrides, sub }] });
	if (!rest.length) return;
	const { default: Outbox } = await import("/framework/core/Item/Outbox.js");
	await Outbox.shared().send(FILE_URL, rest, { item: true });
};

export default new Page({
	meta: import.meta,
	title: "Plugins",
	description: "A page is a tree of plugins. Flip a switch; the page changes now and after a reload.",
	icon: "extension",

	content(){
		md("**This page is a tree of plugins.** Flip a switch; the page changes now and after a reload.");

		const el = document.createElement("div");
		el.className = "card";
		Object.assign(el.style, { minHeight: "6em", minWidth: "10em", display: "flex", alignItems: "center", justifyContent: "center" });
		el.textContent = "hello";
		demo = new DemoPage({ el, overrides });

		let $panel;
		const toggle = (row, checked) => { row.set({ enabled: checked }); save(); draw(); };

		const sub_row = row => label.c("flex v-center gap", () => {
			const box = input().attr("type", "checkbox");
			box.el.checked = !!row.get("enabled");
			box.el.disabled = !row.up?.active;
			box.el.addEventListener("change", e => toggle(row, e.target.checked));
			span(row.get("name"));
		}).style("marginLeft", "1.6em").style("opacity", row.active ? "1" : ".5");

		const top_row = row => div.c("flow", () => {
			label.c("flex v-center gap", () => {
				const box = input().attr("type", "checkbox");
				box.el.checked = !!row.get("enabled");
				box.el.addEventListener("change", e => toggle(row, e.target.checked));
				span(row.get("name"));
			});
			row.plugins?.forEach(sub_row);
		});

		// A braced body, never a concise one: List#forEach returns the List itself (chaining), and a concise
		// arrow's return value is auto-appended by View (append_fn) — the list would draw itself as a debug tree.
		const draw = () => { $panel.empty(() => { demo.plugins.forEach(top_row); }); };

		div.c("flex wrap gap", () => {
			div.c("flex v gap", () => {
				span.c("muted", "Live result");
				div.c("surface pad").el.appendChild(el);
			}).style("flex", "1 1 16em");
			div.c("card pad flow", () => {
				$panel = div.c("flow");
				button.c("btn prim").text("Reset").attr("type", "button").click(() => { demo.reset_plugins(); Badge.plugins.set({ Count: { enabled: true } }); save(); draw(); });
			}).style("flex", "1 1 16em");
		});
		draw();
		redraw = draw;

		md("## What you just did");
		pre(() => code(`page.plugins.set({Wide: {enabled: true}});   // this instance only\npage.overrides;                               // {Wide: {enabled: true}}\npage.reset_plugins();                         // back to the class defaults`)).attr("style", "white-space: pre-wrap; word-break: break-word");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => span.c("h4", "A tree of plugins"))); },
});
