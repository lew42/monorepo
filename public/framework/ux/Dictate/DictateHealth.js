import ErrorLog from "/framework/ext/ErrorLog/ErrorLog.js";

/**
 * class DictateHealth — what each stage of dictation is doing right now: eight lights, one per stage a spoken sentence
 * passes through (mic, Whisper, the answers heard, the sentence, the send, the reply, the live wire, the page), and a log of
 * what happened, each record with its raw data. One store per browser tab (static), filled by the objects that do the
 * work, read by the Debug tab (`DictateDebug.js`). Nothing here polls or starts anything.
 *
 *   DictateHealth.set("sent", "bad", "Servex did not answer in 10 s");   // state: idle | wait | ok | bad
 *   DictateHealth.step("mic", "requesting…");                           // Dictate's own stage words, mapped
 *   DictateHealth.on(() => redraw());                                    // returns stop()
 *   DictateHealth.fail("page", error, "drawing a bubble");               // a red light, a log line, the raw error one click down
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
		{ id: "transcripts", label: "Heard", ask: "Are Whisper's raw answers coming back?" },
		{ id: "sentence", label: "Sentence", ask: "Do your words become sentences that leave the draft?" },
		{ id: "sent", label: "Send", ask: "Is the text being sent to the AI?" },
		{ id: "llm", label: "Reply", ask: "Is the AI answering?" },
		{ id: "wire", label: "Wire", ask: "Is the live wire to Servex open?" },
		{ id: "page", label: "Page", ask: "Did anything on this page fail? (any script on the page, not only dictation; it stays red until you reload)" },
	];
	static MODULE = "/framework/ux/Dictate/";
	static KEEP = 200;   // log records kept for the Debug tab

	static layers = Object.fromEntries(this.LAYERS.map(l => [l.id, { state: "idle", why: "nothing yet", at: 0 }]));
	static { this.layers.page = { state: "ok", why: "no errors on this page since it loaded", at: 0 }; }   // nothing to wait for: green until something fails
	static events = [];
	static listeners = new Set();
	static timers = {};

	/** Set one layer. `late_ms` + `late` (with state "wait"): if the layer is still this same wait after late_ms, it turns bad with `late`. */
	static set(id, state, why = "", { late_ms, late, quiet = false, raw, always = false } = {}){
		const was = this.layers[id];
		if (!was) return;
		const now = Date.now(), changed = was.state !== state || was.why !== why;
		const row = this.layers[id] = { state, why, at: now, since: was.state === state ? was.since ?? was.at : now, last_bad: state === "bad" ? { why, at: now } : was.last_bad };
		clearTimeout(this.timers[id]);
		if (state === "wait" && late_ms) this.timers[id] = setTimeout(() => { if (this.layers[id] === row) this.set(id, "bad", late); }, late_ms);
		if ((changed || always) && !quiet) this.push(id, state, why, raw);
		if (state === "bad" && was.state !== "bad" && id !== "page") this.report(id, why);   // the page's own errors already reach their module through app.js's ErrorLog.watch
		this.tell();
	}

	/** A log record only, no state change (a transcript, a send). `raw` is the data one click down in the Debug tab. */
	static event(layer, state, why, raw){ this.push(layer, state, why, raw); this.tell(); }

	static push(layer, state, why, raw){
		this.events.push(raw === undefined ? { at: Date.now(), layer, state, why } : { at: Date.now(), layer, state, why, raw });
		if (this.events.length > this.KEEP) this.events.shift();
	}

	/** The one way to show an error: the stage's light turns red with the words, and the log gets the raw error and its stack. Never throws. */
	static fail(layer, error, where = ""){
		try {
			const msg = String(error?.message ?? error?.reason ?? error);
			this.set(layer, "bad", where ? `${where}: ${msg}` : msg, { always: true, raw: { error: msg, where, stack: error?.stack ?? null } });
		} catch (e){ console.error("DictateHealth.fail:", e); }   // the one place an error report may only reach the console
	}

	/** Every uncaught error and unhandled promise rejection on the page lands on the Page light. Once per tab. */
	static watch_window(){
		if (this.watching || typeof window === "undefined") return;
		this.watching = true;
		window.addEventListener("error", e => this.fail("page", e.error ?? e.message ?? "script error", "uncaught" + (e.filename ? ` (${e.filename.split("/").slice(-2).join("/")}:${e.lineno ?? "?"})` : "")));
		window.addEventListener("unhandledrejection", e => this.fail("page", e.reason ?? "rejected promise", "unhandled promise rejection"));
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
	static heard({ kind, text, ms, raw }){
		this.count = (this.count ?? 0) + 1;
		const why = `${this.count} answers · last ${kind === "final" ? "final" : "guess"} in ${ms} ms: “${String(text ?? "").slice(0, 80) || "(silence)"}”`;
		this.set("transcripts", "ok", why, { quiet: true });
		if (this.layers.whisper.state === "bad" || this.layers.whisper.state === "wait") this.set("whisper", "ok", "answering again");   // an answer is the proof it is back
		this.event("transcripts", "ok", `${kind === "final" ? "final" : kind} in ${ms} ms: “${String(text ?? "").slice(0, 120) || "(silence)"}”`, { kind, text, ms, ...(raw === undefined ? {} : { whisper: raw }) });   // every answer: guess, amendment, final
	}

	static on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }
	static tell(){ for (const fn of this.listeners) try { fn(this); } catch (e){ console.error("DictateHealth listener:", e); } }

	static snapshot(){ return JSON.parse(JSON.stringify({ layers: this.layers, events: this.events })); }

	/** A layer turned bad: one line in ux/Dictate's failures log (and the day file). Never throws. */
	static report(id, why){
		try { ErrorLog.report(new Error(`dictation ${id}: ${why}`), { where: "DictateHealth." + id, module: this.MODULE }); } catch {}
	}
}

DictateHealth.watch_window();
globalThis.DictateHealth = DictateHealth;   // headless-test seam (test/stall.mjs) and the console
