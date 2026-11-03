// core/Plugin: a class that is pluggable, and the class every plugin may extend. Readme: ./readme.md, design: ./doc/design-notes.md
//   Host.use(A, B)    every new Host instance reaches A.attach(inst) and B.attach(inst)
//   Host.unuse(A)     the hook comes off; live instances are told A.detach(inst)
//   Host.plugins      a lazy List of rows (PluginEntry): name, enabled, config; switching a row on or off uses / unuses
import { Events } from "../Events/Events.js";
import { List } from "../List/List.js";
import PluginEntry from "./PluginEntry.js";

const own_events = Symbol.for("core.Plugin.events");

export class Plugin extends Events(Object) {

	// Same order the server's Events had: assign the args, announce "new", then instantiate().
	// A constructor arg named `overrides` ({Name: {enabled?, config?}}, what inst.overrides gave) is loaded BEFORE the plugins attach,
	// so a plugin this instance has off is never attached for a moment, and the others attach with this instance's own config.
	constructor(...args){
		super();
		let start;
		args = args.map(a => { if (!a || typeof a !== "object" || !("overrides" in a)) return a; const { overrides, ...rest } = a; start = overrides; return rest; });
		this.assign(...args);
		if (start) this.load_overrides(start);
		this.constructor.emit("new", this);
		this.instantiate();
	}

	assign(...args){ return Object.assign(this, ...args); }
	instantiate(){ this.initialize(); }
	initialize(){}
	bubbles(){ return false; }   // a plugin host is not a tree; an Item's events still bubble

	// Per-INSTANCE plugin switches: one row per class-level plugin, `enabled`/`config` unset until this instance
	// overrides them (PluginEntry.get_one falls back to the class row's rec.on / rec.config while unset).
	// The row list is kept live: Plugin.record() pushes a row here for any plugin the class gains afterwards.
	get plugins(){
		if (!Object.hasOwn(this, "_plugins")) {
			Object.defineProperty(this, "_plugins", { value: new List(), writable: true });
			const Host = this.constructor;
			if (!Object.hasOwn(Host, "_plugin_instances")) Object.defineProperty(Host, "_plugin_instances", { value: new Set(), writable: true });
			Host._plugin_instances.add(new WeakRef(this));
			for (const rec of Host.records.values()) Host.add_instance_row(this, rec);
		}
		return this._plugins;
	}

	// Switching THIS instance only: attach/detach runs just on `this`, the class-wide hook is untouched, and this
	// instance's own wish is remembered so a later class-wide enable()/disable() never overrides it (see those).
	toggle_plugin(rec, on){
		(this._plugin_overrides ??= new Map()).set(rec, on);
		if (on) Plugin.attach_instance(rec, this);
		else Plugin.detach_instance(rec, this);
	}

	// What this instance changed against the class: a plain {Name: {enabled?, config?}} that survives JSON, so it can be saved
	// with a session and handed back to load_overrides. A plugin this instance left alone is not in it.
	get overrides(){
		const out = {};
		for (const row of this.plugins) {
			const rec = row.record, o = {}, on = this._plugin_overrides?.get(rec), cfg = row.own("config");
			if (on !== undefined) o.enabled = on;
			if (cfg && Object.keys(cfg).length) o.config = { ...cfg };
			if (Object.keys(o).length) out[rec.name] = o;
		}
		return out;
	}

	// Replace every override with `obj`: a listed plugin takes its value, an unlisted one goes back to the class. A plugin
	// whose state does not change is not touched, so loading the same overrides twice runs nothing.
	load_overrides(obj = {}){
		const Host = this.constructor, rows = [...this.plugins], was = new Map();
		for (const row of rows) {   // config first, so an attach that follows reads the new values
			const rec = row.record, cfg = obj[rec.name]?.config, next = cfg && Object.keys(cfg).length ? { ...cfg } : null;
			if (JSON.stringify(row.own("config") ?? null) === JSON.stringify(next)) continue;
			was.set(rec, rec.attached.has(this));
			row.put("config", next);
			row.emit_safely("change", "config", row.get_one("config"));
		}
		for (const row of rows) {
			const rec = row.record, enabled = obj[rec.name]?.enabled, before = rec.attached.has(this);
			if (enabled === undefined) {
				if (this._plugin_overrides?.delete(rec)) row.put("enabled", null);
				if (rec.on) Host.attach_instance(rec, this); else Host.detach_instance(rec, this);
			} else {
				this.toggle_plugin(rec, enabled);
				row.put("enabled", rec.attached.has(this));
			}
			if (was.get(rec) && before && rec.attached.has(this)) Host.rerun_instance(rec, this);   // same on/off, new config
			if (rec.attached.has(this) !== before) row.emit_safely("change", "enabled", row.get_one("enabled"));
		}
		return this;
	}

	reset_plugins(){ return this.load_overrides({}); }

	// ── class-level events. "new" walks the class chain: parents' listeners first, then each subclass's own.
	static get events(){
		if (!Object.hasOwn(this, own_events)) Object.defineProperty(this, own_events, { value: {}, writable: true });
		return this[own_events];
	}
	static on(event, fn){ (this.events[event] ??= []).push(fn); return this; }
	static off(event, fn){
		const list = this.events[event];
		if (list) this.events[event] = list.filter(l => l !== fn && l.fn !== fn);
		return this;
	}
	static once(event, fn){
		const wrapper = (...args) => { this.off(event, wrapper); return fn.apply(this, args); };
		wrapper.fn = fn;
		return this.on(event, wrapper);
	}
	static clear(event){ if (this.events[event]) this.events[event] = []; return this; }
	static emit(event, ...args){
		const chain = [];
		for (let c = this; c && c !== Function.prototype; c = Object.getPrototypeOf(c)){
			const own = Object.hasOwn(c, own_events) && c[own_events][event];
			if (own?.length) chain.push(own);
		}
		for (let i = chain.length - 1; i >= 0; i--) chain[i].slice().forEach(fn => fn.apply(this, args));
		return this;
	}

	// ── a class that is PLUGGABLE
	static hosts = [];   // every class that has used or listed a plugin, for a page that shows them live
	static store = new Map();   // saved on/config per row, key plugin.<Host>.<Plugin>; a page swaps in localStorage

	static get records(){
		if (!Object.hasOwn(this, "_records")) Object.defineProperty(this, "_records", { value: new Map(), writable: true });
		return this._records;
	}

	static use(...plugins){
		for (const p of plugins) {
			const fresh = !this.records.has(p), rec = this.record(p);
			if (!fresh || rec.wanted) this.enable(rec);   // a saved or default "off" wins over the first use()
		}
		return this;
	}

	static unuse(...plugins){
		for (const p of plugins) { const rec = this.records.get(p); if (rec) this.disable(rec); }
		return this;
	}

	// Know P, but leave it off: the list shows a switched-off row.
	static available(...plugins){
		for (const p of plugins) this.record(p, false);
		return this;
	}

	// The one record per plugin on this class: the exact hook that was installed, so off can find it.
	static record(p, wanted_on){
		let rec = this.records.get(p);
		if (rec) return rec;
		const name = p.name || "plugin", key = `plugin.${this.name}.${name}`;
		const saved = Plugin.store.get(key), defaults = p.defaults ?? {};
		const { on: default_on = true, ...config_defaults } = defaults;
		rec = { plugin: p, name, key, on: false, fn: null, live: new Set(), seen: new WeakSet(), attached: new WeakSet(), n: 0,
			wanted: wanted_on ?? saved?.on ?? default_on, config: { ...config_defaults, ...saved?.config } };
		this.records.set(p, rec);
		if (!Plugin.hosts.includes(this)) Plugin.hosts.push(this);
		if (this._list) this.add_row(rec);
		if (Object.hasOwn(this, "_plugin_instances")) for (const ref of this._plugin_instances) { const inst = ref.deref(); if (inst) this.add_instance_row(inst, rec); }
		return rec;
	}

	// The attach/setup/plain-function dispatch, shared by a class-wide enable() and a per-instance toggle.
	static runner(p){
		return typeof p.attach === "function" ? inst => p.attach(inst)
			: typeof p.setup === "function" ? inst => p.setup(inst)
			: typeof p === "function" && !p.prototype ? p : null;
	}

	// Attach/detach are per (rec, instance): `rec.attached` makes both idempotent, so a plugin with no real
	// detach is never run twice on the same instance across a use() -> unuse() -> use() cycle.
	static attach_instance(rec, inst){
		if (rec.attached.has(inst)) return;
		const run = this.runner(rec.plugin);
		if (!run) return;
		rec.attached.add(inst);
		rec.live.add(new WeakRef(inst));
		run(inst);
	}

	static detach_instance(rec, inst){
		if (!rec.attached.has(inst)) return;
		// Irreversible either way: no `detach` at all, OR a `Plugin` subclass with none of its OWN — it still
		// inherits the base class's no-op `Plugin.detach` (:209), which IS a function, so `typeof` alone would
		// treat it as a real undo (review finding 2, 2026-11-03). Either way, stays "attached" so a later enable
		// never runs attach twice.
		if (typeof rec.plugin.detach !== "function" || rec.plugin.detach === Plugin.detach) return;
		rec.attached.delete(inst);
		rec.plugin.detach(inst);
	}

	// New config for a live instance: a plugin with reconfigure(inst) is told just that; otherwise detach then attach, so it re-reads
	// its config (a plugin with no real detach is left as is).
	static rerun_instance(rec, inst){
		if (!rec.attached.has(inst)) return;
		if (typeof rec.plugin.reconfigure === "function") { rec.plugin.reconfigure(inst); return; }
		this.detach_instance(rec, inst);
		this.attach_instance(rec, inst);
	}

	// The class config changed in `keys`: re-run every live instance that follows the class for those fields (not `except`).
	static reconfigure_live(rec, keys, except){
		for (const ref of [...rec.live]) {
			const inst = ref.deref();
			if (!inst || inst === except) continue;
			const own = inst._plugins?.find(rec.name)?.own("config");
			if (own && keys.some(k => k in own)) continue;
			this.rerun_instance(rec, inst);
		}
	}

	// "Make default": copy what `inst` changed into the class records and the store, so the next page load keeps it. The
	// instance then has nothing left to override. Other live instances re-run if they follow the class; one with its own
	// override on that plugin keeps it.
	static make_default(inst){
		const overrides = inst.overrides;
		for (const row of inst.plugins) {
			const rec = row.record, o = overrides[rec.name];
			if (!o) continue;
			inst._plugin_overrides?.delete(rec);
			row.put("enabled", null);
			row.put("config", null);
			const old = rec.config, changed = [];
			if (o.config) {
				rec.config = { ...old, ...o.config };
				for (const k of Object.keys(o.config)) if (JSON.stringify(old[k]) !== JSON.stringify(rec.config[k])) changed.push(k);
				rec.row?.put("config", rec.config);
				rec.row?.emit_safely("change", "config", rec.config);
			}
			if (o.enabled !== undefined && o.enabled !== rec.on) o.enabled ? this.enable(rec) : this.disable(rec);
			else if (o.enabled !== undefined) rec.wanted = o.enabled;
			this.store.set(rec.key, { on: rec.on, config: rec.config });
			if (changed.length) this.reconfigure_live(rec, changed, inst);
		}
	}

	// An instance that switched this plugin on/off for ITSELF (Plugin#toggle_plugin) keeps that wish: a class-wide
	// enable()/disable() never overrides an explicit per-instance override, it only moves the instances left unset.
	static overridden(rec, inst, value){ return inst._plugin_overrides?.get(rec) === value; }

	static enable(rec){
		rec.wanted = true;
		if (rec.on) return;
		const Host = this;
		rec.fn = function(inst){
			if (++rec.n % 256 === 0) for (const ref of rec.live) if (!ref.deref()) rec.live.delete(ref);
			if (Host.overridden(rec, inst, false)) return;   // this instance switched itself off: stays off
			Host.attach_instance(rec, inst);
		};
		this.on("new", rec.fn);
		rec.on = true;
		rec.row?.sync(true);
		// Re-attach to every instance this plugin reached before (a disable() kept them tracked, never cleared),
		// skipping one that switched itself off on its own.
		for (const ref of rec.live) {
			const inst = ref.deref();
			if (inst && !this.overridden(rec, inst, false)) this.attach_instance(rec, inst);
		}
	}

	static disable(rec){
		rec.wanted = false;
		if (!rec.on) return;
		this.off("new", rec.fn);
		rec.on = false;
		// Leave alone an instance that switched itself on: the class going off is not its own wish.
		for (const ref of rec.live) {
			const inst = ref.deref();
			if (inst && !this.overridden(rec, inst, true)) this.detach_instance(rec, inst);
		}
		rec.row?.sync(false);
	}

	// Lazy: nothing exists until it is read. After that, use/unuse/available keep it in step.
	static get plugins(){
		if (!Object.hasOwn(this, "_list")) {
			Object.defineProperty(this, "_list", { value: new List(), writable: true });
			for (const rec of this.records.values()) this.add_row(rec);
		}
		return this._list;
	}

	static add_row(rec){
		if (rec.row) return rec.row;
		const row = new PluginEntry({ id: rec.name, name: rec.name, enabled: rec.on, config: rec.config });
		Object.defineProperties(row, { host: { value: this }, record: { value: rec }, plugin: { value: rec.plugin } });
		rec.row = row;
		this._list.add(row);
		return row;
	}

	// One row of an INSTANCE's `plugins` list: enabled/config start unset, so PluginEntry falls back to the class row.
	static add_instance_row(inst, rec){
		const row = new PluginEntry({ id: rec.name, name: rec.name, enabled: null, config: null });
		Object.defineProperties(row, { host: { value: inst }, record: { value: rec }, plugin: { value: rec.plugin }, instance: { value: true } });
		inst._plugins.add(row);
		return row;
	}

	// ── a class that IS a plugin. attach(instance): "this plugin attaches itself to that instance". setup is the old name.
	static attach(instance){ return this.setup?.(instance); }
	static detach(instance){}
	static defaults = { on: true };
	static fields = [];   // [{key, label, kind: "toggle|slider|number|text", min, max, step, section}] drives a panel
}

export default Plugin;
