import { View, div, span, button } from "../../core/View/View.js";
import { servex_url } from "/framework/dev/servex_url.js";
import LevelMeter from "../../audio/v1/LevelMeter/LevelMeter.js";

View.stylesheet(import.meta, "Connection.css");

/**
 * class Connection — one small row that shows the path a spoken prompt takes, so a reader can see
 * which step is stuck:  Mic → Level → Whisper → Transcript → Refine.
 *
 * Each step is a dot (grey = not yet, green = fine, red = failed) plus a few plain words saying why.
 * The row never changes size: every step has a fixed column, and the reason sits in a fixed box (it may wrap onto up to three lines inside it, then is clipped), so nothing a reader might click moves while words arrive.
 *
 *   const c = new Connection({ whisper_url, on_retry });
 *   c.set("mic", "ok", "on");            // step ids: mic level whisper transcript refine
 *   c.level(0.4);                         // the bar inside the Level step (a LevelMeter)
 *   await c.check_whisper();              // ONCE on page load, and again only when the reader clicks Retry
 *
 * Whisper is asked once, never polled (stream, don't poll): `check_whisper()` is called by the page
 * on load and by the Retry click. Everything else is pushed in by the caller's events.
 *
 * `layout: "rows"` stacks the steps, one per line, with the reason in full (the Debug tab, `DictateDebug.js`);
 * a step with an `ask` shows that question under its name. `on_check(up, why)` hears every Whisper check.
 * `layout: "lights"` is one row of small lights, a dot and a name each, the reason on hover; a tap calls `on_pick(id)` (the Debug tab).
 */
export default class Connection extends View {

	static steps = [
		{ id: "mic", label: "Mic" },
		{ id: "level", label: "Level" },
		{ id: "whisper", label: "Whisper" },
		{ id: "transcript", label: "Transcript" },
		{ id: "refine", label: "Refine" },
	];

	render(){
		this.ac("voice-conn");
		/** `{ state: "idle" | "ok" | "bad" | "wait", why }` per step id: plain data, so the debug tree can show it.
		 *  Set here, not as a class field: a View runs render() before subclass fields exist. */
		this.state = {};
		this.meter = new LevelMeter();
		this.steps = this.steps ?? Connection.steps;   // a caller may show fewer: new Connection({ steps })
		this.style("--steps", this.steps.length);
		if (this.layout) this.attr("data-layout", this.layout);
		const lights = this.layout === "lights";
		this.steps.forEach((s, i) => {
			this.state[s.id] = { state: "idle", why: "not yet" };
			const step = (lights ? button : div).c("voice-conn-step", () => {
				div.c("voice-conn-head", () => {
					span.c("voice-conn-dot");
					span.c("voice-conn-label", s.label);
					if (s.ask && !lights) span.c("voice-conn-ask muted", s.ask);   // a light is a dot and a name; the question is its title (hover)
					if (s.id === "whisper" && !lights) this.$retry = button("↻").ac("voice-conn-retry").attr("type", "button")
						.attr("title", "Check Whisper again").click(() => this.check_whisper());
				});
				if (s.id === "level") new LevelMeter.View({ subject: this.meter });
				else if (!lights) span.c("voice-conn-why");
			}).attr("data-step", s.id);
			if (lights) step.attr("type", "button").attr("aria-pressed", "false").click(() => this.on_pick?.(s.id));
		});
		this.draw();
	}

	/** Set one step. `why` is a few plain words ("on", "last reply 0.4 s", "no sound yet"). */
	set(id, state, why = ""){
		if (!this.state[id]) return this;
		this.state[id] = { state, why };
		this.draw(id);
		return this;
	}

	/** The mic's smoothed 0..1 loudness, drawn by the shared LevelMeter bar. */
	level(value){
		this.meter.level = value;
		this.meter.on_change?.(value);
		if (value > 0.05 && this.state.level.state !== "ok") this.set("level", "ok", "");
	}

	draw(only){
		for (const s of this.steps){
			if (only && s.id !== only) continue;
			const { state, why } = this.state[s.id];
			const el = this.el.querySelector(`[data-step="${s.id}"]`);
			if (!el) continue;
			el.dataset.state = state;
			const w = el.querySelector(".voice-conn-why");
			if (w){ w.textContent = why; w.title = why; }
			if (this.layout === "lights") el.title = why;   // hover shows the last word; a tap shows it in full (on_pick)
		}
	}

	/** Is Whisper reachable? One request, on load or on the Retry click, never on a timer. */
	async check_whisper(url = this.whisper_url){
		this.set("whisper", "wait", "checking…");
		const t = performance.now();
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), 2500);
		try {
			const r = await fetch(url + "/", { signal: ctrl.signal });
			const ms = performance.now() - t;
			if (!r.ok){ this.set("whisper", "bad", `error: HTTP ${r.status}`); this.on_check?.(false, this.state.whisper.why); return false; }
			this.note = await Connection.restart_line();
			this.set("whisper", "ok", `connected, ${(ms / 1000).toFixed(1)} s` + (this.note ? " · " + this.note : ""));
			this.on_check?.(true, this.state.whisper.why);
			return true;
		} catch (e){
			this.note = await Connection.restart_line();
			this.set("whisper", "bad", `error: ${e?.name === "AbortError" ? "no answer in 2.5 s" : "not reachable"} at ${url}` + (this.note ? " · " + this.note : ""));
			this.on_check?.(false, this.state.whisper.why);
			return false;
		} finally { clearTimeout(timer); }
	}

	/** One plain line when Servex has had to restart Whisper, from `GET /api/whisper` (Servex/Process.js counts crashes). Empty when all is well or Servex is not there. */
	static async restart_note(){
		const line = await Connection.restart_line();
		return line ? " · " + line : "";
	}

	/** The same fact as a sentence of its own (the one-line status on a phone shows it). It takes about 25 s: Whisper reloads its speech model. */
	static async restart_line(){
		try { return Connection.line(await (await fetch(servex_url("/api/whisper"), { signal: AbortSignal.timeout(1500) })).json()); }
		catch { return ""; }
	}

	/** The sentence for one `/api/whisper` answer (the same shape the stream pushes). Empty when all is well. */
	static line(w){
		const t = w.last_crash && new Date(w.last_crash.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		if (["launching", "restarting", "crashed", "starting"].includes(w.status)) return `Whisper stopped${t ? " at " + t : ""} and Servex is restarting it (2 to 30 s: it reloads its model)`;
		if (["stopped", "errored"].includes(w.status)) return `Whisper is ${w.status === "errored" ? "not running: Servex gave up restarting it" : "stopped"}${t ? " (last crash " + t + ")" : ""}`;
		return w.crashes ? `Whisper stopped at ${t} and Servex restarted it` : "";
	}

	/** Servex pushes Whisper's status the moment it changes (`GET /api/whisper/stream`, SSE): `on_status(w)` runs for the first answer and for every change, so a restart shows as it happens.
	 *  Returns the EventSource (`.close()` to stop), or null where there is none (the caller keeps its old one-off checks). */
	watch(on_status){
		if (typeof EventSource === "undefined") return null;
		try {
			const es = new EventSource(servex_url("/api/whisper/stream"));
			es.onmessage = e => { try { const w = JSON.parse(e.data); this.note = Connection.line(w); this.streaming = true; on_status(w); } catch {} };
			es.onerror = () => { this.streaming = false; };
			return es;
		} catch { return null; }
	}
}
