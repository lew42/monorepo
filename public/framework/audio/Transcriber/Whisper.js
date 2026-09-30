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

const words_of = text => text.trim().split(/\s+/).filter(Boolean);

/** How many WORDS at the front of `a` and `b` are the same, comparing loosely
 *  (case-insensitive, trailing punctuation ignored) — the "local agreement"
 *  whisper_streaming (UFAL) is named for: two consecutive transcripts of
 *  mostly-the-same, slightly-shifted audio should agree on everything except
 *  their very end, and the agreeing PREFIX is safe to commit. */
function agreement_length(a, b){
	const norm = w => w.toLowerCase().replace(/[.,!?;:]+$/, "");
	let i = 0;
	while (i < a.length && i < b.length && norm(a[i]) === norm(b[i])) i++;
	return i;
}

/**
 * class Transcriber.Whisper extends Transcriber — a ROLLING LOCAL-AGREEMENT
 * WINDOW against local whisper-server (the owner's design, 2026-09-29,
 * replacing the cut-and-append engine — which stays reachable as
 * `Transcriber.WhisperSegments`). No segment ever closes on a timer or a cut
 * point; instead:
 *
 * 1. Every `step_ms` (~1s), re-transcribe the WHOLE uncommitted buffer
 *    (`mic.snapshot()`), with the already-committed text as whisper.cpp's
 *    `prompt` for continuity.
 * 2. Compare this transcript's words against the PREVIOUS tick's transcript,
 *    word by word from the front. The words BOTH ticks agree on — the same
 *    audio, seen twice, transcribed the same way twice — are safe to commit:
 *    they become `on_final()`, and the audio behind them is dropped from the
 *    front of the buffer (`mic.cut_at()`), never re-sent.
 * 3. Whatever is left — the tail neither tick has confirmed yet — is
 *    `on_partial()`: shown, never logged, never committed until a later tick
 *    agrees with it too.
 * 4. If the buffer grows past `window_s` without anything agreeing (a very
 *    unstable stretch), the whole guess is force-committed rather than
 *    growing the window forever.
 *
 * **Ephemeral stays in memory only** (the owner's rule, 2026-09-29): the
 * per-tick guess, the raw uncommitted audio and `this.requests`' timings are
 * never written to disk by this class — only `on_final()`'s already-agreed
 * words are a caller's to log. Nothing here calls `fetch` at any address but
 * whisper-server, and nothing here touches `localStorage` or a log file.
 *
 * This is an APPROXIMATION of real local-agreement (`doc/streaming.md` —
 * `whisper_streaming`'s own implementation aligns agreement to word
 * TIMESTAMPS from whisper's own output; whisper-server's plain `/inference`
 * here only returns joined text, so audio is dropped in proportion to how
 * much of the TEXT was committed, not exact per-word timing). Measured
 * against the old engine in `doc/decisions.md`, "Rolling window".
 *
 *   const t = new Transcriber.Whisper();
 *   t.on_partial = guess => …;   // ephemeral — show it, never log it
 *   t.on_final = text => …;       // committed — the only text worth logging
 *   await t.start(mic);
 *   t.stop();
 */
export default class Whisper extends Transcriber {

	whisper_url = default_whisper_url();
	step_ms = 1000;
	window_s = 12;          // force-commit everything past this much uncommitted audio
	speech_floor = 0.02;
	min_speech_ms = 120;
	prompt_chars = 240;      // whisper.cpp's `prompt` is context, not a transcript — cap it

	constructor(...args){
		super(...args);
		this.requests = [];        // in-memory only — timings, never written to disk
		this.inflight = null;
		this.committed_text = "";
		this.prev_tail_words = [];
	}

	async start(mic){
		this.mic = mic;
		this.timer = setInterval(() => this.tick(), this.step_ms);
	}

	/** One last pass, force-committing whatever is still only a guess — a real
	 *  stop is not a moment to leave the tail unsaid. */
	async stop(){
		clearInterval(this.timer);
		if (this.inflight) try { await this.inflight; } catch { /* ignored */ }
		const samples = this.mic.snapshot();
		if (this.worth_sending(samples)){
			let text;
			try { text = await this.transcribe(samples); } catch (e){ this.on_error?.(e); return; }
			if (text && !this.annotation(text)) this.commit_all(text);
		}
		this.mic.cut();
		this.note_partial("");
	}

	async tick(){
		if (this.inflight) return;   // a request is already in flight — skip this tick, never queue

		const samples = this.mic.snapshot();
		const seconds = samples.length / this.mic.rate();

		if (!this.worth_sending(samples)){
			if (this.prev_tail_words.length){ this.prev_tail_words = []; this.note_partial(""); }
			return;
		}

		this.inflight = this.transcribe(samples);
		let text;
		try { text = await this.inflight; } catch { return; } finally { this.inflight = null; }
		if (!text || this.annotation(text)) return;

		// A very unstable stretch — nothing has agreed for `window_s` straight.
		// Force it through rather than growing the buffer (and the request
		// payload) without bound.
		if (seconds >= this.window_s){ this.commit_all(text); return; }

		const words = words_of(text);
		const agree = agreement_length(this.prev_tail_words, words);

		if (agree > 0){
			const committed = words.slice(0, agree).join(" ");
			const tail = words.slice(agree);

			// Audio is dropped in proportion to how much of the TEXT just
			// committed — an approximation (see the class doc): whisper-server's
			// plain /inference has no per-word timestamp to cut on exactly.
			const ratio = committed.length / text.length;
			this.mic.cut_at(Math.min(samples.length, Math.round(samples.length * ratio)));

			this.committed_text = (this.committed_text + " " + committed).trim();
			this.note_final(committed);
			this.prev_tail_words = tail;
			this.note_partial(tail.join(" "));
		} else {
			this.prev_tail_words = words;
			this.note_partial(text);
		}
	}

	/** The unstable-stretch escape hatch: everything guessed so far becomes
	 *  final, the buffer clears, and agreement starts fresh. */
	commit_all(text){
		this.mic.cut();
		this.committed_text = (this.committed_text + " " + text).trim();
		this.prev_tail_words = [];
		this.note_final(text);
		this.note_partial("");
	}

	worth_sending(samples){
		if (!samples.length) return false;
		const loud = this.mic.loudness(samples, this.speech_floor);
		return loud.loud_ms >= this.min_speech_ms;
	}

	/** The one POST every tick goes through — `this.requests` (in memory
	 *  only) is what `Whisper.View`'s panel size reads for latency. */
	async transcribe(samples){
		const wav = this.mic.wav(samples);
		const form = new FormData();
		form.append("file", wav, "segment.wav");
		form.append("response_format", "json");
		if (this.committed_text) form.append("prompt", this.committed_text.slice(-this.prompt_chars));

		const t0 = performance.now();
		const r = await fetch_timeout(this.whisper_url + "/inference", { method: "POST", body: form }, 20000);
		const ms = performance.now() - t0;

		if (!r.ok){ this.log_request(ms, 0, false); throw new Error("whisper-server answered " + r.status); }
		const body = await r.json();
		const text = (body.text ?? "").replace(/\s+/g, " ").trim();
		this.log_request(ms, text.length, true);
		return text;
	}

	log_request(ms, chars, ok){
		this.requests.push({ at: Date.now(), ms: Math.round(ms), chars, ok });
		if (this.requests.length > 20) this.requests.shift();
	}
}

// Attached here (Whisper.js imports Transcriber.js, never the other way — a
// cycle would leave `Transcriber` in the temporal dead zone the moment this
// file's `class Whisper extends Transcriber` ran, `code` skill's "imports
// flow down" note). `Transcriber/index.js` is the one-import door that gets
// a caller every engine already wired.
Transcriber.Whisper = Whisper;

/** Whisper's own state view: `Transcriber.View`'s row (engine, listening,
 *  segment count) plus what only this engine has — a request in flight right
 *  now, its latency, and how many words are committed so far. Panel size
 *  falls through to `PartView`'s generic property tree, which already shows
 *  `requests` (in memory only) since it is a plain array property. */
Whisper.View = class extends Transcriber.View {
	stat(){
		const last = this.subject.requests.at(-1);
		const latency = last ? last.ms + "ms" : "—";
		const words = this.subject.committed_text ? words_of(this.subject.committed_text).length : 0;
		return (this.subject.inflight ? "sending… " : "") + latency + " · " + words + " words committed";
	}
};

export { Whisper };
