import { VoiceChat } from "../VoiceChat.js";

// Stop reading aloud when you start talking (audio/Recite's BargeIn does the work; this sets it for one chat).
// The values go straight onto the object, never through BargeIn.remember(): they belong to the chat, not the browser.
export default class Interrupt {
	static label = "Interrupt";
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

	// The bar's mic, mode and threshold controls (audio/Recite/ReciteBar.js) call these three; they now also write this chat's row,
	// so what a session saves is what the owner set. The host's own call still runs first (it saves to the browser).
	static bind(vc){
		const b = vc.recite.barge, row = vc.plugins.find(this.name);
		for (const [method, write] of [["set_on", v => ({ enabled: !!v })], ["set_mode", v => ({ config: { mode: v } })], ["set_threshold", v => ({ config: { threshold: Number(v) } })]]) {
			const own = b[method]?.bind(b);
			if (own) b[method] = v => { own(v); row.set(write(v)); };
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
