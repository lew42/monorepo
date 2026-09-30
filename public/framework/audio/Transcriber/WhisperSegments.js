import Transcriber from "./Transcriber.js";

/** `fetch`, but it gives up after `ms` instead of hanging silently forever —
 *  copied from `ux/Dictate/Dictate.js`'s own `fetch_timeout()` (not imported:
 *  that file is read-only for this task, and this is four lines). */
async function fetch_timeout(url, opts, ms){
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
	finally { clearTimeout(timer); }
}

/** Where to reach whisper-server — same rule as `Dictate.js`'s
 *  `default_whisper_url()`: direct on this machine, the page's own
 *  `/whisper` proxy (`Server/plugins/Whisper.js`) from anywhere else (a
 *  phone on the LAN, where `127.0.0.1` would mean the phone). */
function default_whisper_url(){
	const h = globalThis.location?.hostname;
	const local = h === "localhost" || h === "127.0.0.1" || h?.endsWith(".localhost");
	return local || !globalThis.location ? "http://127.0.0.1:8178" : globalThis.location.origin + "/whisper";
}

/**
 * class Transcriber.WhisperSegments extends Transcriber — v1 of the Whisper
 * engine, kept reachable after the owner picked a rolling local-agreement
 * window (`Whisper.js`) as `Transcriber.Whisper` instead (2026-09-29,
 * `doc/decisions.md` "Seams"/"Rolling window"). Cut-and-append: a segment
 * closes on a real pause OR a length cap, is sent whole, and the mic's
 * buffer for that segment is gone once it's sent. This is the engine the
 * seam experiment measured problems with — read `doc/decisions.md` before
 * reaching for this one over `Transcriber.Whisper`.
 *
 *   const t = new Transcriber.WhisperSegments();
 *   t.on_partial = text => …; t.on_final = text => …;
 *   await t.start(mic);
 *   t.stop();
 */
export default class WhisperSegments extends Transcriber {

	whisper_url = default_whisper_url();
	pause_ms = 700;
	max_segment_ms = 15000;
	resend_ms = 900;
	skip_partial_after_ms = 300;
	speech_floor = 0.02;
	min_speech_ms = 120;

	/** The seam fix (`doc/decisions.md`, "Seams"): cut a forced (length-cap)
	 *  segment at its quietest recent instant instead of the deadline, and
	 *  carry the previous final as whisper's `prompt`. Superseded by the
	 *  rolling window in `Whisper.js` for new work; left on here since this
	 *  class exists specifically so the OLD behaviour stays comparable. */
	seam_fix = true;

	constructor(...args){
		super(...args);
		this.requests = [];
		this.inflight = null;
		this.last_final_text = "";
	}

	async start(mic){
		this.mic = mic;
		this.segment_epoch = 0;
		this.has_speech = false;
		this.segment_started_at = this.last_partial_at = this.last_loud_at = performance.now();

		this.unsub = mic.on_level(level => {
			if (level > this.speech_floor){ this.has_speech = true; this.last_loud_at = performance.now(); }
		});
		this.timer = setInterval(() => this.heartbeat(), 200);
	}

	stop(){
		clearInterval(this.timer);
		this.unsub?.();
		return this.close_segment("pause");
	}

	heartbeat(){
		const now = performance.now();
		if (this.has_speech && now - this.last_loud_at >= this.pause_ms) this.close_segment("pause");
		else if (now - this.segment_started_at >= this.max_segment_ms) this.close_segment("forced");
		else if (now - this.last_partial_at >= this.resend_ms) this.partial_tick();
	}

	async partial_tick(){
		this.last_partial_at = performance.now();
		if (this.inflight) return;
		if (this.has_speech && performance.now() - this.last_loud_at > this.skip_partial_after_ms) return;

		const epoch = this.segment_epoch;
		const samples = this.mic.snapshot();
		if (!this.worth_sending(samples)) return;

		this.inflight = this.transcribe(samples, "partial");
		let text;
		try { text = await this.inflight; } catch { return; } finally { this.inflight = null; }
		if (epoch === this.segment_epoch) this.note_partial(text);
	}

	async close_segment(why){
		let samples;
		let cut_level = null;

		if (why === "forced" && this.seam_fix){
			const q = this.mic.quietest_split();
			if (q){ samples = this.mic.cut_at(q.sample_at); cut_level = q.level; }
			else { samples = this.mic.snapshot(); this.mic.cut(); }
		} else {
			samples = this.mic.snapshot();
			this.mic.cut();
		}

		this.on_cut?.({ why, at_ms: performance.now(), level: cut_level });

		this.segment_epoch++;
		this.has_speech = false;
		this.segment_started_at = this.last_loud_at = this.last_partial_at = performance.now();
		this.note_partial("");
		if (!this.worth_sending(samples)) return;

		if (this.inflight) try { await this.inflight; } catch { /* ignored — its answer is stale */ }

		this.inflight = this.transcribe(samples, "final");
		let text;
		try { text = await this.inflight; }
		catch (e){
			console.error("audio/Transcriber.WhisperSegments: whisper-server did not answer:", e);
			this.on_error?.(e);
			return;
		} finally { this.inflight = null; }

		if (text && !this.annotation(text)){
			this.last_final_text = text;
			this.note_final(text);
		}
	}

	worth_sending(samples){
		if (!samples.length) return false;
		const loud = this.mic.loudness(samples, this.speech_floor);
		return loud.loud_ms >= this.min_speech_ms;
	}

	async transcribe(samples, kind = "final"){
		const wav = this.mic.wav(samples);
		const form = new FormData();
		form.append("file", wav, "segment.wav");
		form.append("response_format", "json");
		if (this.seam_fix && this.last_final_text && samples.length / this.mic.rate() >= 0.6)
			form.append("prompt", this.last_final_text);

		const t0 = performance.now();
		const r = await fetch_timeout(this.whisper_url + "/inference", { method: "POST", body: form }, 20000);
		const ms = performance.now() - t0;

		if (!r.ok){ this.log_request(kind, ms, 0, false); throw new Error("whisper-server answered " + r.status); }
		const body = await r.json();
		const text = (body.text ?? "").replace(/\s+/g, " ").trim();
		this.log_request(kind, ms, text.length, true);
		return text;
	}

	log_request(kind, ms, chars, ok){
		this.requests.push({ at: Date.now(), kind, ms: Math.round(ms), chars, ok });
		if (this.requests.length > 20) this.requests.shift();
	}
}

Transcriber.WhisperSegments = WhisperSegments;

WhisperSegments.View = class extends Transcriber.View {
	stat(){
		const last = this.subject.requests.at(-1);
		const latency = last ? last.ms + "ms" : "—";
		return (this.subject.inflight ? "sending… " : "") + latency + " · " + super.stat();
	}
};

export { WhisperSegments };
