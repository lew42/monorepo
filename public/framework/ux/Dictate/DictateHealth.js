import ErrorLog from "/framework/ext/ErrorLog/ErrorLog.js";

/**
 * class DictateHealth — what each layer of dictation is doing right now, in the owner's five questions:
 * is the mic connected, is Whisper connected, are transcripts coming back, is the text being sent to the AI,
 * and is the AI connected and answering. One store per browser tab (static), filled by the objects that do
 * the work, read by the Debug tab (`DictateDebug.js`). Nothing here polls or starts anything.
 *
 *   DictateHealth.set("sent", "bad", "Servex did not answer in 10 s");   // state: idle | wait | ok | bad
 *   DictateHealth.step("mic", "requesting…");                           // Dictate's own stage words, mapped
 *   DictateHealth.on(() => redraw());                                    // returns stop()
 *   DictateHealth.snapshot();                                            // {layers, events}, plain data
 *
 * A layer that turns bad also becomes one line in its module's failures log (`ErrorLog.report`), so whoever
 * follows `ux/Dictate` hears it. A `wait` with `late_ms` turns bad by itself when nothing settles it in time
 * (the AI that never answers). Doc: doc/debug-tab.md.
 */
export default class DictateHealth {

	static LAYERS = [
		{ id: "mic", label: "Mic", ask: "Is the mic connected?" },
		{ id: "whisper", label: "Whisper", ask: "Is Whisper connected?" },
		{ id: "transcripts", label: "Transcripts", ask: "Are raw Whisper transcripts coming back?" },
		{ id: "sent", label: "Sent to the AI", ask: "Is the text being sent to the AI?" },
		{ id: "llm", label: "AI", ask: "Is the AI connected, and is it answering?" },
	];
	static MODULE = "/framework/ux/Dictate/";
	static KEEP = 60;   // events kept for the Debug tab's list

	static layers = Object.fromEntries(this.LAYERS.map(l => [l.id, { state: "idle", why: "nothing yet", at: 0 }]));
	static events = [];
	static listeners = new Set();
	static timers = {};

	/** Set one layer. `late_ms` + `late` (with state "wait"): if the layer is still this same wait after late_ms, it turns bad with `late`. */
	static set(id, state, why = "", { late_ms, late, quiet = false } = {}){
		const was = this.layers[id];
		if (!was) return;
		const now = Date.now(), changed = was.state !== state || was.why !== why;
		const row = this.layers[id] = { state, why, at: now, since: was.state === state ? was.since ?? was.at : now };
		clearTimeout(this.timers[id]);
		if (state === "wait" && late_ms) this.timers[id] = setTimeout(() => { if (this.layers[id] === row) this.set(id, "bad", late); }, late_ms);
		if (changed && !quiet) this.event(id, state, why);
		if (state === "bad" && was.state !== "bad") this.report(id, why);
		this.tell();
	}

	/** An event for the list only, no state change (a transcript, a send). */
	static event(layer, state, why){
		this.events.push({ at: Date.now(), layer, state, why });
		if (this.events.length > this.KEEP) this.events.shift();
	}

	/** `ux/Dictate`'s own stage words (log_step) as layer states. */
	static step(stage, detail = ""){
		const bad = /^(refused|timed out|could not reopen|not reachable|stopped answering)/.test(detail);
		if (stage === "mic"){
			if (detail === "ok" || detail === "on, level ok" || detail === "reopened") return this.set("mic", "ok", detail === "ok" ? "open, waiting for sound" : "open, hearing sound");
			if (detail === "idle") return this.set("mic", "idle", "off");
			return this.set("mic", bad ? "bad" : "wait", detail);
		}
		if (stage === "whisper"){
			if (/^connected/.test(detail)) return this.set("whisper", "ok", detail, { quiet: /last reply/.test(detail) && this.layers.whisper.state === "ok" });
			return this.set("whisper", bad ? "bad" : "wait", detail);
		}
	}

	/** Dictate stopped with an error: it belongs to Whisper when it says so, else to the mic. */
	static error(msg){ this.set(/whisper/i.test(msg) ? "whisper" : "mic", "bad", String(msg)); }

	/** One Whisper answer came back. */
	static heard({ kind, text, ms }){
		this.count = (this.count ?? 0) + 1;
		const why = `${this.count} answers · last ${kind === "final" ? "final" : "guess"} in ${ms} ms: “${String(text ?? "").slice(0, 80) || "(silence)"}”`;
		this.set("transcripts", "ok", why, { quiet: true });
		if (kind === "final") this.event("transcripts", "ok", `final in ${ms} ms: “${String(text ?? "").slice(0, 120)}”`);
	}

	static on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }
	static tell(){ for (const fn of this.listeners) try { fn(this); } catch (e){ console.error("DictateHealth listener:", e); } }

	static snapshot(){ return JSON.parse(JSON.stringify({ layers: this.layers, events: this.events })); }

	/** A layer turned bad: one line in ux/Dictate's failures log (and the day file). Never throws. */
	static report(id, why){
		try { ErrorLog.report(new Error(`dictation ${id}: ${why}`), { where: "DictateHealth." + id, module: this.MODULE }); } catch {}
	}
}

globalThis.DictateHealth = DictateHealth;   // headless-test seam (test/stall.mjs) and the console
