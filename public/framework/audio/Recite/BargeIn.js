import Part from "../Part.js";
import MicStream from "../MicStream/MicStream.js";
import Whisper from "../Whisper/Whisper.js";

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
 *
 * `mode` picks what pauses reading: "volume" (above: pause on loud, then check) or "words" (the owner's own idea,
 * 2026-11-02: Whisper's text is the threshold, so a cough or a bang never pauses anything). In "words" mode the same
 * loud sound only starts the Whisper check; reading keeps going until Whisper returns real text that is not Recite's
 * own voice, and only then pauses. Everything about it lives in this class: `id`, `label`, `defaults`, `start()`
 * and `stop()` are the shape a plugin registry can take as it is.
 */
export default class BargeIn extends Part {

	static id = "barge";
	static label = "Interrupt";
	static defaults = { on: true, mode: "volume" };   // mode: "volume" | "words"

	on = true;
	mode = "volume";      // what pauses reading: "volume" (loud, then check) or "words" (only real words from Whisper); remembered as "barge_mode"
	threshold = 0.35;     // on MicStream's shown level, 0..1 (the meter's own scale)
	hold_ms = 250;
	quick_hold_ms = 120;   // cutting in (2026-11-03): the hold used instead of hold_ms when the owner was ALREADY talking as the chunk began (no grace to wait out) — a reply that starts over the owner must die fast
	grace_ms = 1000;       // cutting in: for this long after a chunk starts, the fast volume trigger is blocked (the chunk's own first word tripping the mic, then stopping it — the stutter) — but only when the owner was quiet when it began; skipped entirely if they were already talking (quick_hold_ms applies instead)
	chunk_at = 0;          // cutting in: performance.now() the current chunk started playing (Recite.chunk_started())
	last_speech_at = -Infinity;   // cutting in: performance.now() of the last frame loud enough to count as the owner talking — the one-second hold reads this, not the instantaneous level (review finding 5, 2026-11-03)
	chunk_grace_skip = false;   // cutting in: true when the owner was already talking as the chunk began — no grace, quick_hold_ms applies
	listen_ms = 1500;
	check = true;         // false: any loud sound pauses, with no Whisper check
	state = "off";        // off | listening | checking | heard
	level = 0;            // the newest shown level, for the bar's meter
	noise_floor = 0;      // raised to the loudest noise Whisper called noise, so steady wind stops pausing; fades over ~10 s
	peak = 0;             // the loudest level while checking
	heard = "";           // what Whisper heard last ("" = noise)
	note = "";            // the last outcome, one line: "noise — resumed", "heard: …"
	quiet_ms = 2500;      // no-flood: real speech heard: once this much quiet passes, pick the interrupted reply back up (2-3 s, the owner's own range, 2026-11-02; was 1.5 s) — a separate field from Recite.turn_wait_ms with the same new default: see that field's own comment for why
	resume_timer = null;   // the schedule_resume() timer waiting for quiet
	echo_threshold_mult = 1.6;   // echo: while recite.echo_active(), the fast barge-in trigger and speaking() need this much more level before they fire, so the read-aloud voice leaking into the mic (and a cough right after) don't pause or hold a reply
	near_silent = 0.045;   // echo: a Whisper final heard with the mic at or below this level is treated as hallucinated text on near-silence, not real speech
	recent_peak = 1;   // echo: a decaying max of hear()'s own-mic/dictate-mic level, read by owner_spoke()'s near-silent check; starts high ("no mic info yet") so a line arriving before any frames is never mistaken for silence
	whisper_url = Whisper.default_url();   // the same URL rule as Dictate: 127.0.0.1:8178 here, <origin>/whisper elsewhere

	constructor(...args){
		super(...args);
		this.assign(...args);
		if (this.remember("barge") != null) this.on = this.remember("barge") === "true";
		if (this.remember("threshold") != null) this.threshold = Number(this.remember("threshold")) || this.threshold;
		if (["volume", "words"].includes(this.remember("barge_mode"))) this.mode = this.remember("barge_mode");
	}

	/** Plugin shape: open the mic if reading, ready to listen. */
	start(){ this.sync(); }

	/** Plugin shape: undo everything start() and use_mic() added (mic, timers, the wrapped meter, a pending check), leaving
	 *  Recite as if the feature were off. The saved `on` and `mode` settings are not touched. */
	stop(){
		this.cancel_resume();
		this.spoke?.(""); this.spoke = null;
		if (this.dictate && this.dictate.$recite_barge === this){ this.dictate.on_meter = this.prior_meter; delete this.dictate.$recite_barge; }
		this.dictate = null; this.prior_meter = undefined;
		this.close();
		if (this.recite.state === "heard") this.recite.resume();
	}

	set_mode(mode){
		if (!["volume", "words"].includes(mode)) return;
		this.mode = mode;
		this.remember("barge_mode", mode);
		this.recite.changed();
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
		const prior = this.prior_meter = dictate.on_meter;
		dictate.on_meter = v => { prior?.(v); if (this.dictating()) this.hear(v); };
	}

	dictating(){ return ["listening", "transcribing"].includes(this.dictate?.state); }

	/** The owner's words reached the chat (a line on the session wire): that is speech, so reading stays paused.
	 *  First checked against three things that are NOT the owner talking, so a reply keeps playing through them: a
	 *  known Whisper phantom phrase ("Thank you.", "you", heard with nothing actually said); a fuzzy match against
	 *  the sentence Recite just read or is reading while `recite.echo_active()` (its own voice leaking into the
	 *  chat's mic); and a Whisper final heard while `recent_peak` (hear()'s own decaying max, review finding 1,
	 *  2026-11-01) never rose above `near_silent` — the same hallucination guard `trigger()` runs for its own mic,
	 *  now covering the chat-mic path too, since that is the normal one on a phone — but only for a line that came
	 *  from speech: a TYPED line (`via === "text"`) is skipped, since `recent_peak` is a mic reading and decays to
	 *  under `near_silent` after about 5 s of a quiet mic, which a typed line says nothing about (review finding 1,
	 *  2026-11-02). Each is logged and dropped, never acted on. Otherwise cancels the whole queue at once (`cut()`,
	 *  cutting in 2026-11-03) — a reply held by turn-taking (`wait_at`, never started) counts as "reading" too, so
	 *  real speech dropped the moment it is confirmed, not only once something is already playing. */
	owner_spoke(text, via){
		this.spoke?.(text);
		if (BargeIn.noise(text)){ this.recite.trace("barge: phantom phrase dropped", { text: String(text).slice(0, 80) }); return; }
		if (this.recite.echo_active() && this.echo(text)){ this.recite.trace("barge: echo dropped", { text: String(text).slice(0, 80) }); return; }
		if (text && via !== "text" && this.recent_peak < this.near_silent){ this.recite.trace("barge: near-silent dropped", { text: String(text).slice(0, 80), peak: this.recent_peak }); return; }
		const reading = ["playing", "loading", "heard"].includes(this.recite.state) || this.recite.wait_at != null;
		if (!reading) return;
		this.cut(text);
	}

	/** Real owner speech just confirmed (the wire line, or the own-mic Whisper check): cancel the whole queue at
	 *  once (cutting in, 2026-11-03) — no auto-resume, unless `resume_after_cut` is on, which keeps the old manners
	 *  (pause, drop only on a question, otherwise resume once quiet). `close_mic`: trigger()'s own-mic path owns the
	 *  mic once real words are heard (play() reopens it); a wire line never does. */
	cut(text, { close_mic = false } = {}){
		if (close_mic && this.mic) this.close();
		this.heard = text;
		this.note = "heard: " + text;
		if (this.recite.resume_after_cut){
			if (this.recite.state === "playing" || this.recite.state === "loading") this.recite.pause("heard");
			else if (this.recite.state !== "heard") return;   // only a wait_at hold, with nothing playing: nothing to pause into "heard"
			this.state = "heard";
			if (/\?\s*$/.test(text)){
				this.note = "heard a question: " + text;
				this.cancel_resume();
				this.recite.drop_heard();
				this.sync();
			} else this.schedule_resume();
		} else {
			this.cancel_resume();
			this.recite.cancel_unheard();
			this.state = "off";
			this.sync();
		}
		this.recite.changed();
	}

	/** True while the owner is making sound loud enough to count as talking, by the same threshold the fast barge-in
	 *  check uses. Recite asks this before it starts a freshly queued reply, so it never talks over the owner
	 *  (turn-taking, dictation-v3 2026-11-01): it waits for quiet instead of starting, or interrupting. */
	speaking(){ return this.level > this.effective_threshold(); }   // not gated on `on` any more (cutting in, 2026-11-03): Recite.start_or_hold() must hold for quiet whether or not the interrupt ear is on, and the level keeps running either way through the chat's own mic (use_mic())

	/** How long since the owner was last loud enough to count as talking (`last_speech_at`, updated every frame in
	 *  `hear()`) — never "are they loud THIS INSTANT" (`speaking()`), which would read quiet the moment after a
	 *  word ends, with no hold at all (review finding 5, 2026-11-03). Named `silence_ms`, not `quiet_ms` — that
	 *  name is already a field (the resume-after-a-barge-in wait, above). */
	silence_ms(){ return performance.now() - this.last_speech_at; }

	/** The loudness floor a sound must clear to count as the owner talking: raised by `echo_threshold_mult` while
	 *  `recite.echo_active()` (playing, or just stopped), so the read-aloud voice itself and a cough right after it
	 *  don't hold a reply back or fire a barge-in (item 22, dictation-v3 2026-11-01). */
	effective_threshold(){
		const base = Math.max(this.threshold, this.noise_floor * 1.15);
		return this.recite.echo_active() ? base * this.echo_threshold_mult : base;
	}

	/** (Re)starts the quiet timer; each call while still "heard" pushes it further out (hear(), below), so the owner
	 *  can keep talking and the old reply only resumes once they are actually done. */
	schedule_resume(){
		clearTimeout(this.resume_timer);
		this.resume_timer = setTimeout(() => this.try_resume(), this.quiet_ms);
	}

	/** The reply waiting to resume is gone some other way (a question, or Recite.drop_heard() because a new reply
	 *  arrived): stop waiting for quiet, and drop back to "off" so the next real interruption starts clean. */
	cancel_resume(){
		clearTimeout(this.resume_timer); this.resume_timer = null;
		if (this.state === "heard") this.state = "off";
	}

	/** quiet_ms of silence passed: pick the interrupted reply back up, from the START of the sentence the owner cut
	 *  off (resume(true)) — not mid-word, since the owner likely did not hear the first part clearly either. A no-op
	 *  if the owner (or a tap on the bar) already resumed or dropped it some other way. */
	try_resume(){
		this.resume_timer = null;
		if (this.state !== "heard" || this.recite.state !== "heard") return;
		this.state = "off";
		this.note = "";
		this.recite.resume(true);
		this.sync();
	}

	close(){
		this.mic?.stop();
		this.mic = null;
		this.state = "off";
		this.level = 0;   // a stale loud reading, with no more hear() frames coming to refresh it, would make speaking() stick true forever (the next held reply never starts)
		this.recent_peak = 1;   // back to "no mic info yet", so a line arriving after the mic closes is never mistaken for near-silence
		this.loud_since = this.quiet_since = null;
		clearTimeout(this.resume_timer); this.resume_timer = null;
		this.recite.changed();
	}

	/** Recite.play()/speak_browser() calls this the instant a chunk actually starts: the start grace (cutting in,
	 *  2026-11-03) times from here, and remembers whether the owner was already talking as it began (then there is
	 *  no grace to give — quick_hold_ms applies instead, in hear()). */
	chunk_started(){ this.chunk_at = performance.now(); this.chunk_grace_skip = this.speaking(); }

	/** One level frame (about every 8 ms). */
	hear(shown){
		this.level = shown;
		if (shown > this.effective_threshold()) this.last_speech_at = performance.now();   // the one-second hold (Recite.start_or_hold/check_wait) counts from here, not from "is it loud THIS INSTANT" — tracked whatever this.state is, so a reply arriving the moment after the owner stops still waits
		this.recent_peak = Math.max(shown, this.recent_peak * 0.995);   // a decaying max, not a point sample: owner_spoke() reads it well after the loud instant has passed
		this.noise_floor *= 0.9993;
		if (this.state === "checking") this.peak = Math.max(this.peak, shown);
		if (this.state === "heard"){
			if (this.recite.state !== "heard"){ this.state = "off"; this.sync(); }   // resumed or dropped some other way: go back to listening for the next interruption
			else if (shown > this.effective_threshold()) this.schedule_resume();   // still talking: push the quiet window out
			return;
		}
		if (this.state !== "listening" || !["playing", "loading"].includes(this.recite.state)) return;
		const now = performance.now();
		if (shown > this.effective_threshold()){
			if (!this.chunk_grace_skip && now - this.chunk_at < this.grace_ms) return;   // the chunk's own first word, right after it started quiet: wait out the grace, don't even arm the hold
			this.quiet_since = null;
			this.loud_since ??= now;
			const hold = this.chunk_grace_skip ? this.quick_hold_ms : this.hold_ms;   // already talking when it began: no grace was given, so cut fast
			if (now - this.loud_since >= hold) this.trigger();
		} else {
			this.loud_since = null;
			this.quiet_since ??= now;
			if (now - this.quiet_since > 1000){ this.mic?.cut(); this.quiet_since = now; }   // keep only the last second of quiet as the clip's lead-in
		}
	}

	async trigger(){
		const words = this.mode === "words" && this.check;   // without the Whisper check there are no words to wait for: it stays a volume pause
		if (!words) this.recite.pause("heard");
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
		// Whisper can hallucinate a phrase ("Thank you.", "you") out of near-silent audio; `this.peak` already
		// measured how loud the mic actually got while listening, so a text with almost nothing behind it is
		// treated the same as real noise, not real speech (dictation-v3 echo, 2026-11-01).
		const silent = !echo && text && this.peak < this.near_silent;
		this.heard = text;
		if (!text || echo || silent){
			this.note = echo ? "my own voice — resumed" : silent ? "near-silent mic, likely a phantom — resumed" : "noise — resumed";
			if (echo) this.recite.trace("barge: echo dropped", { text: text.slice(0, 80) });
			else if (silent) this.recite.trace("barge: near-silent dropped", { text: text.slice(0, 80), peak: this.peak });
			if (!echo) this.noise_floor = Math.max(this.noise_floor, this.peak);
			this.state = "listening";
			if (this.recite.state === "heard") this.recite.resume();
		} else {
			if (words) this.recite.pause("heard");   // real words, only now: reading kept going through the check
			this.cut(text, { close_mic: true });   // the mic is yours now (dictate) unless resume_after_cut is on and it was a question; play reopens it
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

	/** True when most of what was heard is words of the sentence Recite is reading or just read (its own voice
	 *  leaking into the mic). Checked from two places: the own-mic Whisper check (`trigger()`), and every line
	 *  the chat's own mic sends while `recite.echo_active()` (`owner_spoke()`) — the same fuzzy match either way. */
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

	/** Common Whisper hallucinations, heard alone (not as part of a longer real line) — a plain array, so a new one
	 *  found later is one line to add, not a regex to edit (review note, 2026-11-01). */
	static PHANTOM_PHRASES = ["thank you.", "thank you", "thanks for watching.", "thanks for watching", "you"];

	/** Whisper's own non-speech marks ("[BLANK_AUDIO]", "(wind blowing)", "♪") count as noise, and so do the phrases above. */
	static noise(text){ return !text || /^[\[(♪*].*[\])♪*]$/.test(text) || BargeIn.PHANTOM_PHRASES.includes(String(text).toLowerCase()); }
}
