// The Chat settings panel (the gear): one place for every Chat setting, in the order Whisper -> LLM -> read aloud -> interruption.
// It edits THIS session's settings (the plugin rows of the page's VoiceChat); "Make default" copies them to the class, which is what a new
// session starts from. Readme: ./doc/settings.md
import { Settings } from "../../core/Settings/Settings.js";
import { div, span, button } from "../../core/View/View.js";
import { VoiceChat } from "./VoiceChat/VoiceChat.js";

export const SECTIONS = [
	{ title: "Sending to the LLM", plugins: ["SendAfter"] },
	{ title: "Recite: read aloud", plugins: ["ReadAloud", "ThinkingCue"] },
	{ title: "Interruption", plugins: ["Interrupt"] },
];

// One plugin's fields as a core/Settings whose values are the plugin row's own (no copy): get and set go through the row.
export class PluginSettings extends Settings {
	constructor(row){
		const P = row.plugin;
		super({ save: "manual", fields: [
			{ key: "on", type: "toggle", label: P.label, help: P.description, path: `${P.name}.enabled` },
			...(P.fields ?? []).map(f => ({ ...f, path: `${P.name}.${f.key}` })),
		] });
		this.row = row;
	}
	get(key){ return key === "on" ? !!this.row.get("enabled") : this.row.get("config")?.[key]; }
	set(key, value){
		if (key === "on") this.row.set({ enabled: !!value });
		else this.row.set({ config: { [key]: value } });
		this.emit("change", key, value);
		return this;
	}
}

export default class ChatSettings {
	// vc: the page's VoiceChat · mic: the chat's Dictate (its settings_panel() is the Whisper part) · session(): the open session id or null ·
	// save_session(plugins|null): saves this session's groups (null = reset) · defaults: a ChatDefaults · on_note(text): where a result is said
	constructor({ vc, mic, session = () => null, save_session, defaults, on_note }){
		Object.assign(this, { vc, mic, session, save_session, defaults, on_note });
		this.listening = new Set();
	}

	level(){ return this.session() ? "This session" : "Defaults (new sessions start from these)"; }

	build(){
		this.root = div.c("flex v gap chat-settings");   // built outside any capture: the caller appends .el
		this.fill();
		return this.root.el;
	}

	fill(){
		const owner = this, sessionless = !this.session();
		this.root.el.replaceChildren();
		this.root.append(() => {
			this.$level = span.c("b", "Editing: " + this.level());
			div.c("flex gap", () => {
				const reset = "Put every setting of this session back to the defaults", copy = "Copy this session's settings to the defaults new sessions start from", none = "You are already editing the defaults";
				button.c("prim", "Make default").attr("type", "button").attr("title", sessionless ? none : copy).click(() => this.make_default()).el.disabled = sessionless;
				button.c("", "Reset to default").attr("type", "button").attr("title", sessionless ? none : reset).click(() => this.reset()).el.disabled = sessionless;
			}).style("flexWrap", "wrap");
			this.$note = span.c("muted", "").attr("aria-live", "polite");
			this.heading("Dictate: Whisper");
			this.whisper ??= this.mic?.settings_panel?.();   // built once: its assistant row keeps a live read-back
			if (this.whisper) div.c("chat-settings-whisper").el.append(this.whisper);
			for (const sec of SECTIONS) {
				this.heading(sec.title);
				for (const name of sec.plugins) {
					const row = this.vc.plugins.find(name);
					if (!row) continue;
					const ps = new PluginSettings(row);
					ps.on("change", () => owner.changed());
					ps.render();
				}
			}
		});
		this.watch();
	}

	heading(text){ div.c("b", text).style("marginBlockStart", "0.6em").style("borderBlockEnd", "1px solid currentColor").style("paddingBlockEnd", "0.15em"); }

	// A panel change with no session is a change to the defaults themselves, so it is saved as such.
	changed(){
		this.own = true;
		queueMicrotask(() => { this.own = false; });
		if (this.session()) return;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.make_default(true), 400);
	}

	// A change that did not come from this panel (a session opened, the bar's button) redraws the plugin sections.
	watch(){
		for (const row of this.vc.plugins) {
			if (this.listening.has(row)) continue;
			this.listening.add(row);
			row.on("change", () => { if (!this.own && this.root?.el.isConnected) this.refresh(); });
		}
	}

	refresh(){
		clearTimeout(this.redraw);
		this.redraw = setTimeout(() => { if (this.root) this.fill(); }, 0);
	}

	say(text){ if (this.$note?.el.isConnected) this.$note.el.textContent = text; this.on_note?.(text); }

	async make_default(quiet){
		VoiceChat.make_default(this.vc);
		const out = await this.defaults.set(VoiceChat.class_values());
		if (!quiet || out.error) this.say(out.saved === "servex" ? "Saved as the default for new sessions." : "Servex could not be reached (" + out.error + "): saved in this browser only.");
		return out;
	}

	reset(){
		clearTimeout(this.timer);
		this.vc.reset_plugins();
		this.save_session?.(null);
		this.say("This session is back to the defaults.");
	}
}
