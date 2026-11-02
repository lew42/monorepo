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
	constructor(...args){
		super();
		this.assign(...args);
		this.constructor.emit("new", this);
		this.instantiate();
	}

	assign(...args){ return Object.assign(this, ...args); }
	instantiate(){ this.initialize(); }
	initialize(){}
	bubbles(){ return false; }   // a plugin host is not a tree; an Item's events still bubble

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
		rec = { plugin: p, name, key, on: false, fn: null, live: new Set(), n: 0,
			wanted: wanted_on ?? saved?.on ?? default_on, config: { ...config_defaults, ...saved?.config } };
		this.records.set(p, rec);
		if (!Plugin.hosts.includes(this)) Plugin.hosts.push(this);
		if (this._list) this.add_row(rec);
		return rec;
	}

	static enable(rec){
		rec.wanted = true;
		if (rec.on) return;
		const p = rec.plugin, tracks = typeof p.detach === "function" && p.detach !== Plugin.detach;
		const run = typeof p.attach === "function" ? inst => p.attach(inst)
			: typeof p.setup === "function" ? inst => p.setup(inst)
			: typeof p === "function" && !p.prototype ? p : null;
		if (!run) { console.warn(`Plugin ${rec.name} must be a function or have attach(instance) or setup(instance)`); return; }
		rec.fn = function(inst){
			if (tracks) {
				rec.live.add(new WeakRef(inst));
				if (++rec.n % 256 === 0) for (const ref of rec.live) if (!ref.deref()) rec.live.delete(ref);
			}
			return run.call(this, inst);
		};
		this.on("new", rec.fn);
		rec.on = true;
		rec.row?.sync(true);
	}

	static disable(rec){
		rec.wanted = false;
		if (!rec.on) return;
		this.off("new", rec.fn);
		rec.on = false;
		for (const ref of rec.live) { const inst = ref.deref(); if (inst) rec.plugin.detach?.(inst); }
		rec.live.clear();
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

	// ── a class that IS a plugin. attach(instance): "this plugin attaches itself to that instance". setup is the old name.
	static attach(instance){ return this.setup?.(instance); }
	static detach(instance){}
	static defaults = { on: true };
	static fields = [];   // [{key, label, kind: "toggle|slider|number|text", min, max, step, section}] drives a panel
}

export default Plugin;
