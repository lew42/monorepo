import { View, div, span, button, select, option, textarea, label, input } from "../../core/View/View.js";
import track from "../../core/track/track.js";
import Part, { PartView } from "../Part.js";

View.stylesheet(import.meta, "Voice.css");

/**
 * class Voice extends Part — text to speech, the output half of the mic pair:
 * `Transcriber` turns speech INTO text, `Voice` turns text BACK into speech.
 * `window.speechSynthesis` (the browser's own `SpeechSynthesisUtterance`) is
 * the whole engine here — built into every modern browser, nothing to
 * install, nothing to run — the same zero-dependency tier as
 * `Transcriber.Browser` (its speech-to-text twin). Why not a local engine
 * like whisper-server: `doc/decisions.md`'s `d-voice-engine` — there is no
 * local TTS binary on this machine today, so there is nothing yet to wrap.
 *
 *   const voice = new Voice();
 *   voice.speak("Hello there.");    // → voice.state === "speaking", then "idle" when done
 *   voice.rate = 1.3;                // takes effect on the NEXT speak()
 *   voice.pick(voice.voices()[2]);   // choose a voice by its SpeechSynthesisVoice object
 */
export default class Voice extends Part {

	state = "idle";       // idle | speaking | paused
	rate = 1;              // 0.1 .. 10 (browser-defined range); 1 = normal speed
	pitch = 1;             // 0 .. 2; 1 = normal
	volume = 1;            // 0 .. 1
	text = "";             // the last text given to speak()
	chosen_voice = null;   // a SpeechSynthesisVoice, or null = the browser's own default
	name = "Heart";        // the persona's name, what a picker shows
	id = "af_heart";       // the recite-server (Kokoro) voice id; render() uses it, speak() does not

	constructor(...args){
		super(...args);
		// ⚠ Same trap `MicStream` found and documented (`MicStream.js`'s own
		// comment, `doc/decisions.md`): a `Part` subclass field with the same
		// NAME as a constructor option (`rate`, `pitch`, …) initializes right
		// after `super()` returns and silently overwrites what `Part`'s
		// `assign()` just set — so the options are re-applied here, last.
		this.assign(...args);
		Voice.track?.(this);
	}

	/** Every voice this browser can speak with. Can come back EMPTY even in a
	 *  browser that supports speech — the list loads asynchronously, often
	 *  only once something else on the page has already touched
	 *  `speechSynthesis` (a real browser quirk, not a bug here).
	 *  `on_voices_ready()` below is how a caller waits for it instead of
	 *  guessing or polling. */
	voices(){ return window.speechSynthesis?.getVoices() ?? []; }

	/** Calls `fn(voices)` the moment the browser's voice list is ready — right
	 *  away if it already is, or on the browser's own `voiceschanged` event
	 *  otherwise. Returns an unsubscribe function, same shape as
	 *  `MicStream.on_level()`. */
	on_voices_ready(fn){
		if (!window.speechSynthesis) return () => {};
		const handler = () => fn(this.voices());
		window.speechSynthesis.addEventListener("voiceschanged", handler);
		if (this.voices().length) fn(this.voices());
		return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
	}

	/** Chooses which voice the NEXT `speak()` uses. `null` goes back to the
	 *  browser's own default. */
	pick(voice){ this.chosen_voice = voice ?? null; this.on_pick?.(voice); }

	/** Speaks `text` out loud. Cancels whatever THIS `Voice` was already
	 *  saying first — one `Voice` speaks one thing at a time, same rule as
	 *  `Recorder` only ever having one clip in progress. Does NOT cancel a
	 *  different `Voice` instance's speech — `window.speechSynthesis` is one
	 *  shared browser queue, so two `Voice`s both calling `speak()` still take
	 *  turns at the browser level; this class does not try to hide that. */
	speak(text, done){
		if (!window.speechSynthesis){ this.on_error?.(new Error("This browser has no window.speechSynthesis — text to speech is not available here.")); return; }
		window.speechSynthesis.cancel();
		this.text = text;
		const u = new SpeechSynthesisUtterance(text);
		u.rate = this.rate; u.pitch = this.pitch; u.volume = this.volume;
		if (this.chosen_voice) u.voice = this.chosen_voice;
		u.onstart = () => { this.state = "speaking"; this.on_change?.(); };
		u.onend = () => { this.state = "idle"; this.on_change?.(); done?.(); };   // done: Recite's browser fallback moves to its next sentence
		u.onerror = e => { this.state = "idle"; this.on_change?.(); this.on_error?.(e); };
		u.onboundary = e => { this.on_boundary?.(e); };
		this.utterance = u;
		window.speechSynthesis.speak(u);
	}

	/** Pauses mid-sentence; `resume()` picks up from the same place. A no-op
	 *  unless already speaking. */
	pause(){ if (this.state !== "speaking") return; window.speechSynthesis.pause(); this.state = "paused"; this.on_change?.(); }
	resume(){ if (this.state !== "paused") return; window.speechSynthesis.resume(); this.state = "speaking"; this.on_change?.(); }

	/** The local engine: the audio of `text` in this voice, from recite-server
	 *  (`url` is `Recite.url`). Returns {blob, seconds}; throws one plain line
	 *  when the server is down or refuses. One sentence or paragraph per call. */
	async render(text, url, signal){
		const r = await fetch(url + "/speak", { method: "POST", headers: { "content-type": "application/json" },
			body: JSON.stringify({ text, voice: this.id, speed: this.rate }), signal: signal ?? AbortSignal.timeout(20000) });
		if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? `recite-server answered ${r.status}`);
		return { blob: await r.blob(), seconds: Number(r.headers.get("x-recite-seconds")) || 0 };
	}

	/** A persona by name (`Voice.PERSONAS`), as a new Voice. */
	static persona(name){
		const p = Voice.PERSONAS.find(v => v.name === name) ?? Voice.PERSONAS[0];
		return new Voice({ ...p });
	}

	/** Stops now, with nothing queued after it — the Stop button's verb. */
	stop(){ window.speechSynthesis?.cancel(); this.state = "idle"; this.on_change?.(); }
}

track(Voice);

/** A few personas: a recite-server voice id and a speed each (the 54 ids: GET /recite/voices). */
Voice.PERSONAS = [
	{ name: "Heart", id: "af_heart", rate: 1 },
	{ name: "Bella", id: "af_bella", rate: 1 },
	{ name: "Nicole", id: "af_nicole", rate: 1 },
	{ name: "Puck", id: "am_puck", rate: 1 },
	{ name: "Fenrir", id: "am_fenrir", rate: 1 },
	{ name: "George", id: "bm_george", rate: 1 },
	{ name: "Emma", id: "bf_emma", rate: 1 },
];

/**
 * `Voice.Controls` — the text box + Speak/Pause/Stop buttons + a voice
 * picker and rate/pitch sliders, all pointed at one `Voice`. Not
 * `Voice.View` — same split as `Recorder.Controls`/`Recorder.View`: this is
 * the INTERACTIVE view, `Voice.View` below is the live STATE view.
 *
 *   const voice = new Voice();
 *   new Voice.Controls({ subject: voice });
 */
Voice.Controls = class extends View {
	render(){
		this.ac("audio-voice flex v gap");

		this.$text = textarea.c("audio-voice-text").attr("rows", "3").attr("placeholder", "Type something to hear it read back…");
		if (this.subject.text) this.$text.el.value = this.subject.text;

		div.c("flex gap v-center wrap", () => {
			this.$speak = button.c("audio-voice-btn", "▶ Speak").click(() => this.subject.speak(this.$text.el.value));
			this.$pause = button("‖ Pause").click(() => {
				if (this.subject.state === "paused") this.subject.resume();
				else this.subject.pause();
			});
			this.$stop = button("■ Stop").click(() => this.subject.stop());
		}).style("--gap", "0.4em");

		this.voice_picker();
		this.sliders();

		// Chain, never replace — a `Voice.View` (the state view) drawn
		// alongside this may already be wired to the same `on_change`.
		const prior = this.subject.on_change;
		this.subject.on_change = () => { prior?.(); this.draw(); };
		this.draw();
	}

	/** The `<select>` of every voice the browser offers. Filled once the
	 *  browser's own list is ready (`on_voices_ready()` — it can start
	 *  empty, see `Voice.voices()`'s own doc comment). */
	voice_picker(){
		this.$select = select.c("audio-voice-select").on("change", e => {
			const v = this.subject.voices()[e.target.selectedIndex];
			this.subject.pick(v);
		});
		this.subject.on_voices_ready(list => {
			this.$select.empty(() => {
				if (!list.length){ option("default voice").attr("value", ""); return; }
				list.forEach(v => option(`${v.name} (${v.lang})`));
			});
		});
	}

	/** Rate and pitch, as two plain range sliders with a live number beside
	 *  each — same shape `ext/depth`'s sliders use. Both apply on the NEXT
	 *  `speak()` call, not mid-sentence (the browser gives no way to change
	 *  either while already speaking). */
	sliders(){
		div.c("flex wrap gap", () => {
			this.slider("rate", "Speed", 0.5, 2, 0.1);
			this.slider("pitch", "Pitch", 0, 2, 0.1);
		});
	}

	slider(prop, name, min, max, step){
		label.c("audio-voice-slider", () => {
			span.c("muted", name);
			const $range = input.c("audio-voice-range").attr("type", "range")
				.attr("min", min).attr("max", max).attr("step", step).attr("value", this.subject[prop]);
			const $value = span.c("audio-voice-slider-value", this.subject[prop].toFixed(1));
			$range.on("input", e => {
				this.subject[prop] = Number(e.target.value);
				$value.text(Number(e.target.value).toFixed(1));
			});
		});
	}

	draw(){
		const s = this.subject.state;
		this.$speak.el.disabled = s === "speaking";
		this.$pause.el.disabled = s === "idle";
		this.$pause.text(s === "paused" ? "▶ Resume" : "‖ Pause");
		this.$stop.el.disabled = s === "idle";
		this.$speak.rc("on").ac(s === "speaking" ? "on" : "");
	}
};

/**
 * The state view: idle/speaking/paused, plus (row/panel) how much of the
 * text is actually set up to speak right now — same three sizes every
 * `audio/` part shows (`Part.js`'s own doc comment).
 */
Voice.View = class extends PartView {
	glyph(){ return "record_voice_over"; }
	label(){ return "Voice — " + this.subject.state; }
	stat(){ return this.subject.text ? `"${this.subject.text.slice(0, 24)}${this.subject.text.length > 24 ? "…" : ""}"` : ""; }
	flags(){ return [["speaking", this.subject.state === "speaking"], ["paused", this.subject.state === "paused"]]; }

	render(){
		super.render();
		const prior = this.subject.on_change;
		this.subject.on_change = () => { prior?.(); this.refresh(); };
	}
};

export { Voice };

