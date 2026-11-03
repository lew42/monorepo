// core/Settings: a plain settings store between data and UI. Readme: ./readme.md
//   s.get(key) / s.set(key, value)   own override, else the default; set removes an override equal to the default
//   s.own / s.load(obj) / s.reset()  the plain overrides a session saves, and the replace/clear of them
//   s.save() / s.make_default()      flush now; copy own into defaults and clear it
//   groups: { dictate: { fields, defaults } } makes s.dictate a child Settings, reached at s.dictate / s.recite
import { Events } from "../Events/Events.js";
import { div, span, label, input, select, option } from "../View/View.js";

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export class Settings extends Events(Object) {

	constructor({ fields = [], defaults = {}, values = {}, save = { debounce_ms: 400 }, persist, clock, groups, level } = {}){
		super();
		this.fields = fields;
		this.defaults = { ...defaults };
		this._own = { ...values };
		this.save_policy = save;
		this.persist_fn = persist;
		this.clock = clock ?? { setTimeout: (...a) => setTimeout(...a), clearTimeout: (...a) => clearTimeout(...a) };
		this.level = level;
		this._timer = null;
		if (groups) {
			this.groups = {};
			for (const [name, g] of Object.entries(groups)) {
				const child = new Settings({ fields: g.fields, defaults: g.defaults, values: g.values, save: "manual", clock: this.clock });
				child.group_name = name;
				child.on("change", (key, value) => { this.emit("change", key, value, name); if (!child._loading) this.schedule_persist(); });
				this.groups[name] = child;
				this[name] = child;
			}
		}
	}

	get(key){ return key in this._own ? this._own[key] : this.defaults[key]; }

	set(key, value){
		if (same(value, this.defaults[key])) delete this._own[key];
		else this._own[key] = value;
		this.emit("change", key, value);
		this.schedule_persist();
		return this;
	}

	// This instance's own overrides, plain and JSON-safe; a group only appears while it has overrides of its own.
	get own(){
		const out = { ...this._own };
		if (this.groups) for (const [name, g] of Object.entries(this.groups)) {
			const go = g.own;
			if (Object.keys(go).length) out[name] = go;
		}
		return out;
	}

	// Replace every override with `obj` (a session opening): emits "change" per key that actually moved, never persists.
	load(obj = {}){
		this._loading = true;
		try { this.load_now(obj); } finally { this._loading = false; }
		return this;
	}

	load_now(obj){
		const names = this.groups ? Object.keys(this.groups) : [];
		const top = {};
		for (const [k, v] of Object.entries(obj)) if (!names.includes(k)) top[k] = v;
		const before = this._own;
		this._own = { ...top };
		for (const key of new Set([...Object.keys(before), ...Object.keys(top)])) {
			if (!same(before[key], top[key])) this.emit("change", key, this.get(key));
		}
		for (const name of names) this.groups[name].load(obj[name] ?? {});
	}

	reset(){
		this.load({});
		this.save();
		return this;
	}

	schedule_persist(){
		if (!this.persist_fn) return;
		const policy = this.save_policy;
		if (policy === "manual") return;
		if (policy === "each") { this.save(); return; }
		this.clock.clearTimeout(this._timer);
		this._timer = this.clock.setTimeout(() => this.save(), policy?.debounce_ms ?? 400);
	}

	save(){
		this.clock.clearTimeout(this._timer);
		this._timer = null;
		return this.persist_fn?.(this.own);
	}

	// "Make default": defaults + own become the new defaults, own is cleared, persisted. The caller stores what comes back.
	make_default(){
		const merged = { ...this.defaults, ...this._own };
		this.defaults = merged;
		this._own = {};
		if (this.groups) for (const g of Object.values(this.groups)) merged[g.group_name] = g.make_default();
		this.save();
		return merged;
	}

	// One row per field, by type; a slider shows its end texts and current value, a select shows the chosen option's help.
	render(){
		const help_for = (f, v) => (f.options?.find(o => (o.value ?? o) === v) || {}).help ?? "";
		const row = f => {
			const value = this.get(f.key);
			const set = v => this.set(f.key, v);
			return label.c("flex v-center gap", () => {
				span(f.label ?? f.key).style("flex", "0 1 6em");
				if (f.type === "toggle") {
					const box = input().attr("type", "checkbox");
					box.el.checked = !!value;
					box.el.addEventListener("change", e => set(e.target.checked));
				} else if (f.type === "slider") {
					if (f.low != null) span.c("muted", f.low);
					const range = input().style("flex", "1 1 6em").style("minWidth", "6em").attr("type", "range").attr("min", f.min).attr("max", f.max).attr("step", f.step ?? 1).attr("value", value);
					const val = span.c("muted", String(value));
					range.el.addEventListener("input", e => { set(+e.target.value); val.el.textContent = e.target.value; });
					if (f.high != null) span.c("muted", f.high);
				} else if (f.type === "number") {
					const box = input().attr("type", "number").attr("min", f.min).attr("max", f.max).attr("step", f.step ?? 1).attr("value", value);
					box.el.addEventListener("change", e => set(+e.target.value || 0));
				} else if (f.type === "select") {
					div.c("flex v gap", () => {
						const sel = select(() => {
							for (const o of f.options ?? []) {
								const opt = typeof o === "object" ? o : { value: o, label: o };
								option(opt.label ?? opt.value).attr("value", opt.value);
							}
						});
						sel.el.value = value;
						const help = span.c("muted", help_for(f, value));
						sel.el.addEventListener("change", e => { set(e.target.value); help.el.textContent = help_for(f, e.target.value); });
					});
				} else {
					const box = input().attr("type", "text").attr("value", value ?? "");
					box.el.addEventListener("change", e => set(e.target.value));
				}
				if (f.help && f.type !== "select") span.c("muted", f.help).style("flex", "1 1 100%");
			}).style("minHeight", "2.25em");
		};
		return div.c("flex v gap", () => {
			if (this.level) span.c("b", "Editing: " + this.level);
			for (const f of this.fields) row(f);
		});
	}
}

export default Settings;
