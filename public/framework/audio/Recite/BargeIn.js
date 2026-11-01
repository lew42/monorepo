import Part from "../Part.js";
import MicStream from "../MicStream/MicStream.js";
import Dictate from "../../ux/Dictate/Dictate.js";

/**
 * class BargeIn extends Part — `Recite.BargeIn`: while Recite reads, it listens
 * on the mic and pauses the moment you talk, remembering the place.
 *
 * Two steps, because a level alone misfires on wind or a passing truck:
 *   1. fast: the level stays above `threshold` for `hold_ms`, so reading pauses at once;
 *   2. check: the next `listen_ms` of sound goes to Whisper. Whisper's VAD returns
 *      no text for noise, so reading resumes by itself ("noise"). Words that match
 *      the sentence being read are the speaker's own echo, so it resumes too.
 *      Anything else is you: it stays paused (state "heard") until you press play.
 * `on = false` (the mic button) closes the mic: playback is manual only.
 */
export default class BargeIn extends Part {

	on = true;
	threshold = 0.35;     // on MicStream's shown level, 0..1 (the meter's own scale)
	hold_ms = 250;
	listen_ms = 1500;
	check = true;         // false: any loud sound pauses, with no Whisper check
	state = "off";        // off | listening | checking | heard
	level = 0;            // the newest shown level, for the bar's meter
	noise_floor = 0;      // raised to the loudest noise Whisper called noise, so steady wind stops pausing; fades over ~10 s
	peak = 0;             // the loudest level while checking
	heard = "";           // what Whisper heard last ("" = noise)
	note = "";            // the last outcome, one line: "noise — resumed", "heard: …"
	whisper_url = Dictate.prototype.whisper_url;

	constructor(...args){
		super(...args);
		this.assign(...args);
		if (this.remember("barge") != null) this.on = this.remember("barge") === "true";
		if (this.remember("threshold") != null) this.threshold = Number(this.remember("threshold")) || this.threshold;
	}

	/** Open or close the mic to match Recite: open while it reads, closed when idle or switched off. */
	sync(){
		const reading = ["playing", "loading"].includes(this.recite.state);
		if (this.dictating()){   // the chat's own mic is on: listen to its level, never open a second mic
			if (this.mic && this.state !== "checking") this.close();
			if (this.on && reading && this.state === "off") this.state = "listening";
			return;
		}
		if (this.on && reading && !this.mic && this.state !== "checking") this.open();
		else if ((!this.on || this.recite.state === "idle") && this.mic && this.state !== "checking") this.close();
	}

	async open(){
		this.mic = new MicStream({ keep: true });
		this.state = "listening";
		try { await this.mic.start(); }
		catch (e){ this.mic = null; this.state = "off"; this.note = "mic: " + e.message; this.recite.changed(); return; }
		if (!this.on){ this.close(); return; }
		this.mic.on_level(shown => this.hear(shown));
		this.recite.changed();
	}

	/** Follow a chat's Dictate mic: while it is on, its level (the same 0..1 meter) drives barge-in, and the line it sends is the check. */
	use_mic(dictate){
		if (!dictate || dictate.$recite_barge) return;
		dictate.$recite_barge = this;
		this.dictate = dictate;
		const prior = dictate.on_meter;
		dictate.on_meter = v => { prior?.(v); if (this.dictating()) this.hear(v); };
	}

	dictating(){ return ["listening", "transcribing"].includes(this.dictate?.state); }

	/** The owner's words reached the chat (a line on the session wire): that is speech, so reading stays paused. */
	owner_spoke(text){
		this.spoke?.(text);
		if (this.recite.state === "playing" || this.recite.state === "loading"){ this.recite.pause("heard"); this.note = "heard: " + text; this.state = "heard"; this.recite.changed(); }
	}

	close(){
		this.mic?.stop();
		this.mic = null;
		this.state = "off";
		this.loud_since = this.quiet_since = null;
		this.recite.changed();
	}

	/** One level frame (about every 8 ms). */
	hear(shown){
		this.level = shown;
		this.noise_floor *= 0.9993;
		if (this.state === "checking") this.peak = Math.max(this.peak, shown);
		if (this.state !== "listening" || this.recite.state !== "playing") return;
		const now = performance.now();
		if (shown > Math.max(this.threshold, this.noise_floor * 1.15)){
			this.quiet_since = null;
			this.loud_since ??= now;
			if (now - this.loud_since >= this.hold_ms) this.trigger();
		} else {
			this.loud_since = null;
			this.quiet_since ??= now;
			if (now - this.quiet_since > 1000){ this.mic?.cut(); this.quiet_since = now; }   // keep only the last second of quiet as the clip's lead-in
		}
	}

	async trigger(){
		this.recite.pause("heard");
		this.loud_since = null;
		if (!this.check){ this.state = "heard"; this.note = "paused: you were loud"; this.recite.changed(); return; }
		this.state = "checking";
		this.peak = 0;
		this.note = "listening…";
		this.recite.changed();
		let text = "";
		try { text = this.dictating() ? await this.await_line() : await this.listen_and_transcribe(); }
		catch (e){ this.state = "heard"; this.note = "Whisper did not answer (" + e.message + "): press play to go on"; this.recite.changed(); return; }
		const echo = this.echo(text);
		this.heard = text;
		if (!text || echo){
			this.note = echo ? "my own voice — resumed" : "noise — resumed";
			if (!echo) this.noise_floor = Math.max(this.noise_floor, this.peak);
			this.state = "listening";
			if (this.recite.state === "heard") this.recite.resume();
		} else {
			this.note = "heard: " + text;
			this.state = "heard";
			if (this.mic) this.close();   // the mic is yours now (dictate); play reopens it
		}
		this.recite.changed();
	}

	/** Own mic: record listen_ms more, then ask Whisper. */
	async listen_and_transcribe(){
		await new Promise(r => setTimeout(r, this.listen_ms));
		if (!this.mic) throw new Error("the mic closed");
		const samples = this.mic.snapshot();
		this.mic.cut();
		return this.transcribe(samples);
	}

	/** Dictate's mic: it transcribes on its own; wait up to 5 s for the owner's line, else it was noise. */
	await_line(){
		return new Promise(done => {
			const timer = setTimeout(() => { this.spoke = null; done(""); }, 5000);
			this.spoke = text => { clearTimeout(timer); this.spoke = null; done(text); };
		});
	}

	async transcribe(samples){
		const form = new FormData();
		form.append("file", this.mic.wav(samples), "barge-in.wav");
		form.append("response_format", "json");
		const r = await fetch(this.whisper_url + "/inference", { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
		if (!r.ok) throw new Error("HTTP " + r.status);
		const text = ((await r.json()).text ?? "").replace(/\s+/g, " ").trim();
		return BargeIn.noise(text) ? "" : text;
	}

	/** True when most of what Whisper heard is words of the sentence being read (the speaker leaking into the mic). */
	echo(text){
		const words = s => String(s).toLowerCase().match(/[a-z']+/g) ?? [];
		const heard = words(text);
		if (!heard.length) return false;
		const near = new Set(words(this.recite.chunks.slice(Math.max(0, this.recite.at - 1), this.recite.at + 2).map(c => c.text).join(" ")));
		return heard.filter(w => near.has(w)).length / heard.length >= 0.6;
	}

	set_on(on){ this.on = !!on; this.remember("barge", this.on); if (this.on && this.state === "heard") this.state = "off"; this.sync(); this.recite.changed(); }
	set_threshold(v){ this.threshold = Number(v); this.remember("threshold", this.threshold); }

	/** Recite.remember, reached through the instance: Recite imports this file, not the other way. */
	remember(key, value){ return this.recite.constructor.remember(key, value); }

	/** Whisper's own non-speech marks ("[BLANK_AUDIO]", "(wind blowing)", "♪") count as noise. */
	static noise(text){ return !text || /^[\[(♪*].*[\])♪*]$/.test(text) || /^(thank you\.?|you)$/i.test(text); }
}
