// One row of Host.plugins: the plugin's name, whether it is on, and its saved config. It is an Item, so the item tool
// (or any {enabled: false} delta) drives it: set_enabled installs or removes the hook, set_config saves.
import { Item } from "../Item/Item.js";

export class PluginEntry extends Item {
	static fields = ["name", "enabled", "config"];   // not "on": Item.set reads a bare key naming a method (Events.on) as a call

	get fields(){ return this.plugin?.fields ?? []; }

	// An INSTANCE row (Plugin.add_instance_row) starts unset: until this instance overrides it, "enabled" and
	// "config" read the class row's live values (rec.on / rec.config) instead of this row's own null.
	// "config" is the class config with only this instance's own fields on top, so a later class change of another field shows through.
	get_one(key){
		const stored = super.get_one(key);
		if (this.instance) {
			if (key === "enabled" && stored == null) return this.record?.on;
			if (key === "config") return { ...this.record?.config, ...stored };
		}
		return stored;
	}

	// What this row itself holds (null until overridden), without the class fallback: the saved override.
	own(key){ return super.get_one(key); }

	// A row is active when it is on and the row above it (the plugin it is a sub-plugin of) is active.
	get active(){ return !!this.get_one("enabled") && this.up?.active !== false; }

	// A sub-plugin is a plugin of the plugin: its rows are the plugin's own Host.plugins list.
	get plugins(){
		const list = this.plugin?.plugins;
		if (list) for (const row of list) row.up = this;
		return list;
	}

	// Called by Host.enable / Host.disable, so the row follows a use() or unuse() made in code.
	sync(on){
		if (this.get_one("enabled") === on) return;
		this.put("enabled", on);
		this.emit_safely("change", "enabled", on);
	}

	set_enabled(value){
		const rec = this.record;
		if (!rec) return this.put("enabled", !!value);
		if (this.instance) {
			this.host.toggle_plugin(rec, !!value);
			// Irreversible (no real detach): the row must say what is actually attached, not what was asked for
			// (review finding 10, 2026-11-03) — `rec.attached` is Plugin's own source of truth for this instance.
			this.put("enabled", rec.attached.has(this.host));
			return;
		}
		value ? this.host.enable(rec) : this.host.disable(rec);
		this.put("enabled", rec.on);
		this.save_row();
	}

	set_config(value){
		const rec = this.record;
		if (this.instance) {   // only the changed fields are kept; the plugin re-reads them through a detach then attach
			this.put("config", { ...this.own("config"), ...value });
			if (rec) this.host.constructor.rerun_instance(rec, this.host);
			return;
		}
		const old = this.get_one("config"), config = { ...old, ...value };
		this.put("config", config);
		if (rec) rec.config = config;
		this.save_row();
		const changed = Object.keys(value).filter(k => JSON.stringify(old?.[k]) !== JSON.stringify(config[k]));
		if (rec && changed.length) this.host.reconfigure_live(rec, changed);
	}

	// Only a change made through a CLASS row is saved; a use() in code and an instance override are not preferences.
	save_row(){
		const rec = this.record;
		if (rec && !this.instance) this.host.store.set(rec.key, { on: rec.on, config: rec.config });
	}
}
Item.register(PluginEntry, "PluginEntry");

export default PluginEntry;
