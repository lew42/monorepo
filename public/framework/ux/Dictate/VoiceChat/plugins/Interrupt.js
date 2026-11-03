import { VoiceChat } from "../VoiceChat.js";

// Stop reading aloud when you start talking (audio/Recite's BargeIn does the work; this sets it for one chat).
// The values go straight onto the object, never through BargeIn.remember(): they belong to the chat, not the browser.
export default class Interrupt {
	static label = "Interrupt";
	static group = "recite";   // read-aloud: session.settings.recite
	static description = "Stop reading aloud when you start talking.";
	static defaults = { on: true, mode: "volume", threshold: 0.35, quiet_ms: 2500 };
	static fields = [
		{ key: "mode", kind: "choice", options: ["volume", "words"], label: "Detect you by", hint: "Loudness, or only real words" },
		{ key: "threshold", kind: "slider", min: 0.05, max: 1, step: 0.05, label: "How loud counts as you" },
		{ key: "quiet_ms", kind: "number", min: 500, max: 10000, step: 100, label: "Quiet before reading resumes (ms)" },
	];

	static attach(vc){
		const c = VoiceChat.config(vc, this), b = vc.recite.barge;
		b.mode = c.mode; b.threshold = c.threshold; b.quiet_ms = c.quiet_ms; b.on = true;
		b.sync(); vc.recite.changed?.();
	}

	// Only the values change: the mic stays open while a threshold slider moves (detach then attach would close and reopen it).
	static reconfigure(vc){
		const c = VoiceChat.config(vc, this), b = vc.recite.barge;
		b.mode = c.mode; b.threshold = c.threshold; b.quiet_ms = c.quiet_ms;
	}

	// The bar's mic, mode and threshold controls (audio/Recite/ReciteBar.js) call these three; they now also write the row of the chat that
	// owns the bar. Wrapped once per BargeIn (the page has one); the newest bind() decides which chat that is. The host's own call runs first.
	static bind(vc){
		const b = vc.recite.barge;
		b.$interrupt_chat = vc;
		if (b.$interrupt_wrapped) return;
		b.$interrupt_wrapped = true;
		const row = () => b.$interrupt_chat.plugins.find(this.name);
		/* The bar's switch must not keep an override equal to the current class value (chat-settings-session step 4, carried
		 * from the step 2a review): otherwise a later "Make default" elsewhere never shows up on THIS chat, because its own
		 * override still pins the old number even though the owner never deliberately chose to diverge. `own(v)` already
		 * applied the real change straight onto the host; this only decides what gets REMEMBERED as this chat's override. */
		const apply = patch => {
			const r = row(), rec = r.record;
			if ("enabled" in patch){
				/* `overrides` (core/Plugin) reads "enabled" off `_plugin_overrides` (a Map kept by toggle_plugin), not the row's
				 * own data — so dropping it needs the same undo `load_overrides` uses for an unlisted plugin, not a bare put(). */
				if (patch.enabled === rec.on){
					if (r.host._plugin_overrides?.delete(rec)) r.put("enabled", null);
					if (rec.on) r.host.constructor.attach_instance(rec, r.host); else r.host.constructor.detach_instance(rec, r.host);
				} else r.set({ enabled: patch.enabled });
				r.emit_safely("change", "enabled", r.get_one("enabled"));
				return;
			}
			const [key, val] = Object.entries(patch.config)[0], left = { ...r.own("config") };
			if (val === rec.config[key]) delete left[key]; else left[key] = val;
			r.put("config", Object.keys(left).length ? left : null);
			r.emit_safely("change", "config", r.get_one("config"));
		};
		for (const [method, write] of [["set_on", v => ({ enabled: !!v })], ["set_mode", v => ({ config: { mode: v } })], ["set_threshold", v => ({ config: { threshold: Number(v) } })]]) {
			const own = b[method]?.bind(b);
			if (own) b[method] = v => { own(v); apply(write(v)); };
		}
	}

	// What the host holds now that differs from the class: the browser's remembered values, as overrides for the chat that starts on them.
	static snapshot(recite){
		const b = recite.barge, rec = VoiceChat.records.get(this), config = {}, out = {};
		for (const key of ["mode", "threshold", "quiet_ms"]) if (b[key] !== rec.config[key]) config[key] = b[key];
		if (Object.keys(config).length) out.config = config;
		if (b.on !== rec.on) out.enabled = b.on;
		return Object.keys(out).length ? { [this.name]: out } : {};
	}

	static detach(vc){
		const b = vc.recite.barge;
		b.on = false; b.sync(); vc.recite.changed?.();
	}
}
