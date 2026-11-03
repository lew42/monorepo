import { Page, md, code, div, span, p, label, input, details, summary } from "/app.js";
import { Plugin } from "./Plugin.js";

// The page keeps its saved on/config in the browser, so a reload shows what you left (the class itself saves to a Map).
const local = { get: key => JSON.parse(localStorage.getItem(key) ?? "null") ?? undefined, set: (key, value) => localStorage.setItem(key, JSON.stringify(value)) };
Plugin.store = local;

// ── the demo: a pluggable class (Badge) and three plugins. A plugin says what it does to a new Badge in attach().
class Badge extends Plugin {}
const cfg = P => Badge.records.get(P).config;

class Frame {
	static defaults = { width: 3, radius: 8 };
	static fields = [{ key: "width", kind: "number", min: 0, max: 20, step: 1, label: "Line width", section: "Look" },
		{ key: "radius", kind: "slider", min: 0, max: 40, step: 1, label: "Corner radius", section: "Look" }];
	static attach(b){ const c = cfg(this); b.el.style.border = `${c.width}px solid currentColor`; b.el.style.borderRadius = c.radius + "px"; }
	static detach(b){ b.el.style.border = ""; b.el.style.borderRadius = ""; }
}
class Glow {
	static defaults = { blur: 18 };
	static fields = [{ key: "blur", kind: "slider", min: 0, max: 60, step: 1, label: "Blur", section: "Look" }];
	static attach(b){ b.el.style.boxShadow = `0 0 ${cfg(this).blur}px currentColor`; }
	static detach(b){ b.el.style.boxShadow = ""; }
}
class Shout {
	static defaults = { on: false, text: "HELLO" };
	static fields = [{ key: "text", kind: "text", label: "Words", section: "Words" }];
	static attach(b){ b.el.textContent = cfg(this).text; }
	static detach(b){ b.el.textContent = "hello"; }
}
Badge.use(Frame, Glow).available(Shout);

const make_badge = () => {
	const el = document.createElement("div");
	el.className = "pad"; el.style.display = "inline-block"; el.textContent = "hello";
	return new Badge({ el });
};

// A number you drag: pointer left/right changes it, arrow keys step it. Works by touch (touch-action: none).
const scrub = (value, f, set) => {
	const out = input().attr("type", "text").attr("inputmode", "decimal").attr("value", String(value));
	const el = out.el ?? out;
	el.style.touchAction = "none"; el.style.cursor = "ew-resize";
	let x0 = null, v0 = 0;
	const clamp = v => Math.min(f.max ?? Infinity, Math.max(f.min ?? -Infinity, v));
	el.addEventListener("pointerdown", e => { x0 = e.clientX; v0 = +el.value; el.setPointerCapture(e.pointerId); });
	el.addEventListener("pointermove", e => { if (x0 === null) return; const v = clamp(Math.round(v0 + (e.clientX - x0) / 4)); el.value = v; set(v); });
	el.addEventListener("pointerup", () => { x0 = null; });
	el.addEventListener("keydown", e => { const d = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0; if (d){ e.preventDefault(); const v = clamp(+el.value + d * (f.step ?? 1)); el.value = v; set(v); } });
	el.addEventListener("change", () => set(clamp(+el.value || 0)));
	return out;
};

const control = (row, f) => {
	const value = row.get("config")[f.key];
	const push = v => row.set({ config: { [f.key]: v } });
	return label.c("flex v-center split gap", () => {
		span(f.label ?? f.key).style("whiteSpace", "nowrap");
		if (f.kind === "slider") input().attr("type", "range").attr("min", f.min).attr("max", f.max).attr("step", f.step).attr("value", value).el.addEventListener("input", e => push(+e.target.value));
		else if (f.kind === "number") scrub(value, f, push);
		else input().attr("type", "text").attr("value", value).el.addEventListener("input", e => push(e.target.value));
	}).style("minHeight", "2.75em");
};

const panel = (rerender) => div.c("surface flex v", () => {
	for (const row of Badge.plugins) {
		const d = details.c("ui-accordion-item", () => {
			summary.c("flex v-center gap", () => {
				span("▸").style("display", "inline-block").style("width", "1em").style("transition", "transform .15s");
				const box = input().attr("type", "checkbox");
				box.el.checked = row.get("enabled");
				box.el.addEventListener("click", e => e.stopPropagation());
				box.el.addEventListener("change", e => { row.set({ enabled: e.target.checked }); rerender(); });
				span(row.get("name"));
			}).style("border", "0").style("background", "none").style("boxShadow", "none").style("width", "100%").style("minHeight", "2.75em").style("cursor", "pointer");
			const sections = Object.groupBy(row.fields, f => f.section ?? "Settings");
			for (const [name, fields] of Object.entries(sections)) {
				div.c("flex v pad", () => { span.c("muted", name); fields.forEach(f => control(row, f)); });
			}
		});
		d.el.addEventListener("toggle", () => { d.el.querySelector("summary span").style.transform = d.el.open ? "rotate(90deg)" : ""; });
	}
}).style("flex", "1 1 20em");

export default new Page({
	meta: import.meta,
	title: "Plugin",
	description: "A class that takes plugins: Host.use(A, B), each plugin attaches to every new instance, and Host.plugins is a live list you can switch on and off.",
	icon: "extension",

	content(){
		md("A **plugin** is a class (or a function) with `attach(instance)`. `Host.use(A, B)` makes every *new* `Host` instance reach `A.attach` and `B.attach`. `Host.unuse(A)` takes it away again and tells live instances through `A.detach`. `Host.plugins` is a list of rows you can read, switch on and off, and configure.");

		code.js(`class Badge extends Plugin {}
class Glow {
  static attach(badge){
    badge.el.style.boxShadow = "0 0 18px red";
  }
}
Badge.use(Glow);   // new Badges glow
Badge.plugins.set({ Glow: { enabled: false } });
// off: new Badges do not`);

		md("## Try it");
		md("Tick a box to switch a plugin on or off. Open a row to configure it: drag a number sideways, or use the arrow keys. What you leave is saved in this browser.");

		let stage;
		const draw = () => stage.el.replaceChildren(make_badge().el);
		div.c("flex wrap gap", () => {
			panel(draw);
			div.c("flex v gap", () => {
				span.c("muted", "Live result: a new Badge, made after your last change");
				stage = div.c("surface pad").style("minHeight", "8em");
			}).style("flex", "1 1 16em");
		});
		for (const row of Badge.plugins) row.on("change", draw);
		draw();

		md("## One instance, its own settings");
		md("Each instance keeps only what it changed (`inst.overrides`) and reads the rest from the class. `Host.make_default(inst)` copies an instance's changes to the class; `inst.reset_plugins()` drops them. Change the first badge, watch its overrides, then press Make default: the second badge follows the class, and the first has nothing left to override. (Make default is saved in this browser, like the box above.)");
		const pair = div.c("flex wrap gap");
		const insts = [make_badge(), make_badge()];
		const el = (tag, text, props = {}) => Object.assign(document.createElement(tag), { textContent: text ?? "" }, props);
		const show = () => pair.el.replaceChildren(...insts.map((b, i) => {
			const box = el("div"); box.className = "surface pad flex v gap"; box.style.flex = "1 1 16em";
			box.append(el("span", `Badge ${i + 1}`, { className: "muted" }));
			for (const row of b.plugins) {
				const line = el("label"); line.className = "flex v-center gap"; line.style.minHeight = "2.75em";
				const check = el("input", "", { type: "checkbox", checked: !!row.get("enabled") });
				check.onchange = () => { row.set({ enabled: check.checked }); show(); };
				line.append(check, el("span", row.get("name")));
				for (const f of row.fields.filter(f => f.kind === "slider")) {
					const range = el("input", "", { type: "range", min: f.min, max: f.max, step: f.step, value: row.get("config")[f.key] });
					range.oninput = () => row.set({ config: { [f.key]: +range.value } });
					range.onchange = show;
					line.append(range);
				}
				box.append(line);
			}
			box.append(b.el, el("code", `overrides: ${JSON.stringify(b.overrides)}`));
			const bar = el("div"); bar.className = "flex gap";
			const button = (text, fn) => el("button", text, { type: "button", onclick: () => { fn(); show(); } });
			bar.append(button("Make default", () => Badge.make_default(b)), button("Reset to default", () => b.reset_plugins()));
			box.append(bar);
			return box;
		}));
		show();

		md("## Classes using plugins right now");
		const hosts = div.c("surface pad flex v");
		const list_hosts = () => hosts.el.replaceChildren(...Plugin.hosts.map(h => Object.assign(document.createElement("p"), { textContent: `${h.name}: ${[...h.records.values()].map(r => r.name + (r.on ? "" : " (off)")).join(", ")}` })));
		list_hosts();
		for (const row of Badge.plugins) row.on("change", list_hosts);

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => span.c("h4", "Host.use(Plugin)"))); },
});
