// One row of Host.plugins: the plugin's name, whether it is on, and its saved config. It is an Item, so the item tool
// (or any {enabled: false} delta) drives it: set_enabled installs or removes the hook, set_config saves.
import { Item } from "../Item/Item.js";

export class PluginEntry extends Item {
	static fields = ["name", "enabled", "config"];   // not "on": Item.set reads a bare key naming a method (Events.on) as a call

	get fields(){ return this.plugin?.fields ?? []; }

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
		value ? this.host.enable(rec) : this.host.disable(rec);
		this.put("enabled", rec.on);
		this.save_row();
	}

	set_config(value){
		const rec = this.record, config = { ...this.get_one("config"), ...value };
		this.put("config", config);
		if (rec) rec.config = config;
		this.save_row();
	}

	// Only a change made through the row is saved; a use() in code is the program's own wish, not a saved preference.
	save_row(){
		const rec = this.record;
		if (rec) this.host.store.set(rec.key, { on: rec.on, config: rec.config });
	}
}
Item.register(PluginEntry, "PluginEntry");

export default PluginEntry;
