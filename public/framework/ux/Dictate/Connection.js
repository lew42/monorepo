import { View, div, span, button } from "../../core/View/View.js";
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
		this.steps.forEach((s, i) => {
			this.state[s.id] = { state: "idle", why: "not yet" };
			div.c("voice-conn-step", () => {
				div.c("voice-conn-head", () => {
					span.c("voice-conn-dot");
					span.c("voice-conn-label", s.label);
					if (s.id === "whisper") this.$retry = button("↻").ac("voice-conn-retry").attr("type", "button")
						.attr("title", "Check Whisper again").click(() => this.check_whisper());
				});
				if (s.id === "level") new LevelMeter.View({ subject: this.meter });
				else span.c("voice-conn-why");
			}).attr("data-step", s.id);
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
			if (!r.ok) return this.set("whisper", "bad", `error: HTTP ${r.status}`), false;
			this.set("whisper", "ok", `connected, ${(ms / 1000).toFixed(1)} s`);
			return true;
		} catch (e){
			this.set("whisper", "bad", `error: ${e?.name === "AbortError" ? "no answer in 2.5 s" : "not reachable"}`);
			return false;
		} finally { clearTimeout(timer); }
	}
}
