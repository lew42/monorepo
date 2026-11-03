// One Voice Chat per Recite (one per page, shared by every chat on it): the class lists the plugins once, each instance switches and configures them for itself.
// Hosts are handed in by chat.js: `new VoiceChat({ recite, mic })`. Readme: ./readme.md
import { Plugin } from "../../../core/Plugin/Plugin.js";

export class VoiceChat extends Plugin {

	// A plugin that is off for this chat must still leave its host in the off state: Recite's own default may be on.
	// (detach() is safe before attach(); core/Plugin only detaches what was attached.)
	initialize(){
		for (const row of this.plugins) {
			const rec = row.record;
			if (rec.attached.has(this)) continue;
			try { rec.plugin.detach?.(this); } catch (e) { console.error(`[VoiceChat] ${rec.name} detach() failed`, e); }
		}
		for (const row of this.plugins) row.record.plugin.bind?.(this);   // a plugin may route its host's own controls through its row
	}

	// What a plugin reads: this chat's own settings for it (its overrides on top of the class values).
	static config(vc, P){ return vc.plugins.find(P.name).get("config"); }

	/* Split this chat's overrides by the group each plugin declares (static group = "dictate" | "recite"; a plugin with no
	 * group goes under "recite"): {dictate: {...}, recite: {...}}. What a session saves (core/Session's session.settings). */
	overrides_by_group(){
		const out = { dictate: {}, recite: {} };
		for (const [name, o] of Object.entries(this.overrides)){
			const group = this.plugins.find(name)?.plugin?.group === "dictate" ? "dictate" : "recite";
			out[group][name] = o;
		}
		return out;
	}
	// The inverse: the session's two groups, merged back into one load_overrides call.
	load_grouped(obj = {}){ return this.load_overrides({ ...(obj.dictate ?? {}), ...(obj.recite ?? {}) }); }
}

// A plugin's value as the class holds it now (class values differ from what the plugin ships with only after "Make default"): {Name: {enabled?, config?}}.
VoiceChat.class_values = function(){
	const out = {};
	for (const rec of this.records.values()) {
		const { on: default_on = true, ...config_defaults } = rec.plugin.defaults ?? {}, o = {}, config = {};
		for (const k of Object.keys(rec.config)) if (JSON.stringify(rec.config[k]) !== JSON.stringify(config_defaults[k])) config[k] = rec.config[k];
		if (Object.keys(config).length) o.config = config;
		if (rec.on !== default_on) o.enabled = rec.on;
		if (Object.keys(o).length) out[rec.name] = o;
	}
	return out;
};

// The inverse, at page start: shared defaults ({Name: {enabled?, config?}}) become the class values; every chat that follows the class re-runs.
VoiceChat.apply_defaults = function(plugins = {}){
	for (const rec of this.records.values()) {
		const o = plugins[rec.name];
		if (!o) continue;
		const changed = [];
		if (o.config) {
			const old = rec.config;
			rec.config = { ...old, ...o.config };
			for (const k of Object.keys(o.config)) if (JSON.stringify(old[k]) !== JSON.stringify(rec.config[k])) changed.push(k);
			rec.row?.put("config", rec.config);
			rec.row?.emit_safely("change", "config", rec.config);
		}
		if (o.enabled !== undefined && o.enabled !== rec.on) o.enabled ? this.enable(rec) : this.disable(rec);
		if (changed.length) this.reconfigure_live(rec, changed, null);
	}
};

export default VoiceChat;
