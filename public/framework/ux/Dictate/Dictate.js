import { View, div, span, button, label, input } from "../../core/View/View.js";
import Capture from "./capture.js";

View.stylesheet(import.meta, "Dictate.css");

/* The browser's own engine: free, needs no install, but the audio leaves the
 * machine — Chrome sends it to Google to recognise it (Firefox and iOS Safari
 * have neither the API nor a polyfill, so `Recognition` is undefined there and
 * this engine is simply unavailable). whisper (below) is tried FIRST because it
 * never leaves the machine and, on this GPU, answers in well under a second. */
const Recognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;

/** `fetch`, but it gives up after `ms` instead of hanging silently forever —
 *  the exact failure mode that made the old dictation look "stuck". */
async function fetch_timeout(url, opts, ms){
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
	finally { clearTimeout(timer); }
}

/**
 * A 🎤 that dictates into one textarea (or hands text to a callback), with a
 * state you can always see and an error said in plain words — the two things
 * the old `ext/Ask/mic.js` control did not have.
 *
 *     import Dictate, { dictate } from "/framework/ux/Dictate/Dictate.js";
 *     dictate(() => this.$input, { on_start: () => this.open() });
 *     // or: new Dictate({ on_text: text => … })   // no box — just the words
 *
 * **Engines, tried in order:** whisper.cpp running locally on this machine
 * (`http://127.0.0.1:8178`, checked with a fast health request) — private, and
 * on an RTX 4070 SUPER an 11-second clip transcribes in about a tenth of a
 * second — then the browser's own `SpeechRecognition`. The one in use is named
 * in small text beside the button; if neither is reachable, no button is drawn
 * at all — see `readme.md`.
 *
 * **Whisper is not streaming**, so this fakes "live": while the owner keeps
 * talking, the growing recording is re-sent to whisper about every 1.5s and
 * shown GREYED after the settled (already-finished) text — the owner sees
 * words appear as they talk, which was the whole complaint that opened this
 * task. A pause of ~700ms (or 15s, whichever comes first) closes that segment:
 * the grey text is replaced by the real answer, it is written into the target
 * box, and a new segment starts while the microphone keeps running. If a
 * re-send is still in flight when the next tick comes due, that tick is
 * SKIPPED, never queued — `doc/decisions.md`.
 *
 * **Ending is always explicit** — the button, or the `Ctrl+Shift+M` shortcut
 * (both say so: the button's tooltip, and the small text beside it once an
 * engine is chosen). Nothing ends a dictation on its own UNLESS the owner
 * turns on the "stop after a pause" checkbox beside the mic — off by default —
 * in which case a *longer* silence (2.5s, separate from the 700ms that only
 * closes one segment) shows a visible countdown and stops for real when it
 * runs out; talking again cancels it. `doc/decisions.md` has the alternative
 * this replaced.
 */
export default class Dictate extends View {

	render(){
		this.ac("ux-dictate flex v-center gap");
		this.state = "idle";
		this.settled = "";
		this.partial_text = "";

		this.$button = button.c("ux-dictate-btn", "🎤").attr("type", "button")
			.attr("title", "dictate — click to start talking, click again to stop (Ctrl+Shift+M)")
			.on("click", e => { e.stopPropagation(); this.toggle(); });

		div.c("ux-dictate-info flex v", () => {
			div.c("flex gap v-center wrap", () => {
				this.$engine = span.c("ux-dictate-engine muted");
				this.$status = span.c("ux-dictate-status muted");
				this.$countdown = span.c("ux-dictate-countdown muted");
				this.$countdown.el.hidden = true;

				label.c("ux-dictate-pause-opt flex v-center muted", () => {
					this.$send_on_pause = input().attr("type", "checkbox")
						.on("change", e => this.toggle_send_on_pause(e.target.checked));
					span("stop after a pause");
				}).style("--gap", "0.3em");
			}).style("--gap", "0.6em");
			this.$caption = div.c("ux-dictate-caption muted");
		}).style("--gap", "0.15em");

		this.$send_on_pause.el.checked = !!this.send_on_pause;
		this.hotkey_bound = e => this.hotkey(e);
		document.addEventListener("keydown", this.hotkey_bound);

		this.init();
	}

	/* `Ctrl+Shift+M` (or `Cmd+Shift+M`) toggles THIS instance — checked against
	 * the site's other global keys before picking it: `/` and `Ctrl+K` open the
	 * omnibox, `Ctrl+\` toggles the dev bar, none of them "M". Scoped so several
	 * mic buttons on one page (every ask card has one) don't fight: it always
	 * works on the instance that is already listening, and otherwise only on
	 * the one the owner's focus is actually in or on. Self-removes once this
	 * element leaves the page — there is no framework-wide "unmount" hook to
	 * hang a `removeEventListener` on instead (`doc/decisions.md`). */
	hotkey(e){
		if (!this.el.isConnected) return document.removeEventListener("keydown", this.hotkey_bound);
		if (!(e.ctrlKey || e.metaKey) || !e.shiftKey || e.key.toLowerCase() !== "m") return;

		const engaged = this.state === "listening" || this.state === "transcribing";
		const focused_here = this.el.contains(document.activeElement) || this.input()?.el === document.activeElement;
		if (!engaged && !focused_here) return;

		e.preventDefault();
		this.toggle();
	}

	toggle_send_on_pause(on){
		this.send_on_pause = on;
		if (!on) this.hide_countdown();
	}

	/* The box may not exist yet when the button is built (a control draws its
	 * buttons above its box) — same trick as the old `mic.js`. ⚠ Same NAME as
	 * the `input` element factory imported at the top of this file on purpose —
	 * `this.input()` (this method) and the bare `input()` (the factory, used
	 * once above to build the checkbox) never collide, because a method is
	 * always reached through `this.`, but they are two different things. */
	input(){ return typeof this.$input === "function" ? this.$input() : this.$input; }

	/* Runs once, at build time — decides whether there is anything to draw the
	 * button FOR. No DOM is created after this `await`; only the button already
	 * built above is shown, hidden, or labelled (`code` skill §1). */
	async init(){
		this.engine = await this.detect_engine();
		if (!this.engine){
			this.$button.el.hidden = true;
			this.$engine.text("no dictation engine reachable — start whisper, or use Chrome");
			return;
		}
		this.name_engine();
	}

	/* Re-checked on every press, not just once — the owner may start
	 * whisper-server, or it may have been stopped, between two presses of the
	 * same button. */
	async detect_engine(){
		try {
			const r = await fetch_timeout(this.whisper_url + "/", {}, 800);
			if (r.ok) return "whisper";
		} catch { /* not reachable — fall through */ }
		return Recognition ? "browser" : null;
	}

	name_engine(){
		const name = this.engine === "whisper" ? "whisper (local)" : "Chrome's built-in recognition";
		this.$engine.text(name + " · Ctrl+Shift+M stops");
	}

	// ---- the button ---------------------------------------------------------

	toggle(){ (this.state === "idle" || this.state === "error") ? this.start() : this.stop(); }

	async start(){
		this.settled = "";
		this.partial_text = "";
		this.segment_epoch = 0;
		this.inflight = null;
		this.on_start?.();

		this.engine = await this.detect_engine();
		if (!this.engine){
			this.set_error("No microphone engine is reachable right now — start whisper-server, or use Chrome.");
			return;
		}
		this.name_engine();
		this.$button.el.dataset.engine = this.engine;
		this.set_state("listening");

		// One shared clock for both engines: whisper's own segment/resend timing
		// (heartbeat(), whisper-only) AND the "stop after a pause" countdown
		// (either engine, only when the owner has turned it on).
		this.last_loud_at = performance.now();
		this.timer = setInterval(() => this.heartbeat(), 200);

		try {
			this.engine === "whisper" ? await this.start_whisper() : this.start_browser();
		} catch (e){
			this.set_error(this.explain(e));
		}
	}

	async stop(){
		if (this.state !== "listening") return;
		clearInterval(this.timer);
		this.hide_countdown();
		this.set_state("transcribing");

		if (this.engine === "whisper"){
			await this.close_segment();
			this.capture?.stop();
			this.set_state("idle");
		} else {
			this.stop_browser();   // set_state("idle") happens in onend, once Chrome truly stops
		}
		this.on_stop?.();
	}

	explain(e){
		if (e?.name === "NotAllowedError")
			return "The browser is not allowed to use the microphone — allow it for this site and press 🎤 again.";
		if (e?.name === "NotFoundError") return "No microphone was found on this machine.";
		return "The microphone stopped: " + (e?.message ?? e);
	}

	set_state(state){
		this.state = state;
		this.$button.rc("listening transcribing").ac(state === "listening" || state === "transcribing" ? state : "");
		this.$status.rc("error").text(state === "listening" ? "listening…" : state === "transcribing" ? "finishing…" : "");
	}

	set_error(msg){
		clearInterval(this.timer);
		this.hide_countdown();
		this.capture?.stop();
		this.state = "error";
		this.$button.rc("listening transcribing");
		this.$status.ac("error").text(msg);
		console.error("ux/Dictate:", msg);
		this.on_error?.(msg);
	}

	// ---- whisper: segment, resend, cut ---------------------------------------

	async start_whisper(){
		this.capture = new Capture();
		this.level = 0;
		this.has_speech = false;
		this.segment_started_at = this.last_partial_at = performance.now();
		await this.capture.start(level => this.on_level(level));
	}

	/* A rough, un-calibrated loudness -> `--ux-dictate-level` (0..1), read by
	 * Dictate.css to drive the button's real level meter, and also the pause-cut
	 * clock below. `silence_at` is a starting guess, not a measured threshold —
	 * `doc/decisions.md`. */
	on_level(level){
		this.level = this.level * 0.6 + level * 0.4;
		this.$button.style("--ux-dictate-level", Math.min(1, this.level * 6).toFixed(3));
		if (this.level > this.silence_at){ this.has_speech = true; this.last_loud_at = performance.now(); }
	}

	/* One clock tick (5/sec), shared by both engines. For whisper: a pause
	 * closes the segment, so does hitting the length cap, and otherwise a
	 * resend fires roughly every `resend_ms` (only one of the three per tick).
	 * For either engine: the opt-in "stop after a pause" countdown. */
	heartbeat(){
		const now = performance.now();
		if (this.engine === "whisper"){
			if (this.has_speech && now - this.last_loud_at >= this.pause_ms) this.close_segment();
			else if (now - this.segment_started_at >= this.max_segment_ms) this.close_segment();
			else if (now - this.last_partial_at >= this.resend_ms) this.partial_tick();
		}
		if (this.send_on_pause) this.check_end_pause(now);
	}

	/* Opt-in, off by default (the owner's own comparison to another product:
	 * ending a dictation must be a choice the owner can SEE coming and cancel,
	 * never a silent auto-submit). Counts quiet time since `last_loud_at` —
	 * whisper updates that in `on_level()`, the browser engine in
	 * `heard_browser()` — completely separately from whisper's own 700ms
	 * segment-cut, which never ends the whole dictation by itself. */
	check_end_pause(now){
		const quiet = now - this.last_loud_at;
		if (quiet >= this.end_pause_ms){ this.hide_countdown(); this.stop(); return; }
		if (quiet < 500){ this.hide_countdown(); return; }   // a normal short gap between words — say nothing

		const left = ((this.end_pause_ms - quiet) / 1000).toFixed(1);
		this.$countdown.el.hidden = false;
		this.$countdown.text(`stopping in ${left}s — say something to keep going`);
	}

	hide_countdown(){ this.$countdown.el.hidden = true; }

	async partial_tick(){
		this.last_partial_at = performance.now();
		if (this.inflight) return;   // a resend is already in flight — SKIP this tick, never queue
		const epoch = this.segment_epoch;
		const samples = this.capture.snapshot();
		if (!samples.length) return;

		this.inflight = this.transcribe(samples);
		let text;
		try { text = await this.inflight; } catch { return; } finally { this.inflight = null; }
		// The segment may have closed WHILE this was in flight — a stale partial
		// must never paint over a segment that has already gone final.
		if (epoch === this.segment_epoch){ this.partial_text = text; this.draw_caption(); }
	}

	async close_segment(){
		const samples = this.capture.snapshot();
		this.capture.cut();
		this.segment_epoch++;
		this.has_speech = false;
		this.segment_started_at = this.last_loud_at = this.last_partial_at = performance.now();
		this.partial_text = "";
		this.draw_caption();
		if (!samples.length) return;

		// Let a partial resend for the OLD segment finish first — whisper-server
		// answers one request at a time, and its answer is about to be thrown
		// away anyway (the epoch check above already ignores it).
		if (this.inflight) try { await this.inflight; } catch { /* ignored — see above */ }

		this.inflight = this.transcribe(samples);
		let text;
		try { text = await this.inflight; }
		catch (e){ console.error("ux/Dictate: whisper-server did not answer for a segment:", e); return; }
		finally { this.inflight = null; }
		this.commit(text);
	}

	async transcribe(samples){
		const form = new FormData();
		form.append("file", this.capture.wav(samples), "segment.wav");
		form.append("response_format", "json");
		const r = await fetch_timeout(this.whisper_url + "/inference", { method: "POST", body: form }, 20000);
		if (!r.ok) throw new Error("whisper-server answered " + r.status);
		const body = await r.json();
		return (body.text ?? "").trim();
	}

	// ---- the browser's own engine --------------------------------------------

	start_browser(){
		// Chrome sometimes finishes a whole session hearing NOTHING and erroring
		// NOTHING — `onstart` fires, `onend` fires, and no `onresult` ever comes.
		// That silence was the bug the owner reported; this says so instead.
		this.watchdog = setTimeout(() => {
			if (this.state === "listening" && !this.settled && !this.partial_text)
				this.set_error("Chrome's speech recognition has been listening for 6 seconds with no words and no error — the silent failure this was built to catch. Try again, check chrome://settings/content/microphone for this site, or use whisper instead.");
		}, 6000);

		const rec = this.rec = new Recognition();
		rec.lang = this.lang;
		rec.continuous = true;
		rec.interimResults = true;
		rec.onresult = e => this.heard_browser(e);
		rec.onerror = e => { console.error("ux/Dictate: SpeechRecognition error:", e.error); this.browser_error(e.error); };
		// Chrome stops on its own after a few seconds of silence even with
		// `continuous` — restart unless a real press asked to stop (`this.stopping`).
		rec.onend = () => {
			if (this.stopping){ this.stopping = false; this.set_state("idle"); }
			else if (this.state === "listening") rec.start();
		};
		rec.start();
	}

	heard_browser(e){
		clearTimeout(this.watchdog);
		this.last_loud_at = performance.now();   // any result is activity, for the send_on_pause countdown
		let interim = "";
		for (let i = e.resultIndex; i < e.results.length; i++){
			const said = e.results[i][0].transcript;
			e.results[i].isFinal ? this.commit(said.trim()) : (interim += said);
		}
		this.partial_text = interim.trim();
		this.draw_caption();
	}

	browser_error(error){
		this.set_error({
			"not-allowed": "The browser is not allowed to use the microphone — allow it for this site and press 🎤 again.",
			"network": "Chrome's speech recognition needs the internet and that failed — try again, or start whisper for a local, offline path.",
			"no-speech": "No speech was heard — try again, closer to the microphone.",
			"audio-capture": "No microphone could be read — check it is plugged in and not used by another app.",
		}[error] ?? ("The microphone stopped: " + error));
	}

	stop_browser(){
		this.stopping = true;
		clearTimeout(this.watchdog);
		try { this.rec?.stop(); } catch { /* already stopped */ }
	}

	// ---- text: the live caption, then the real box ---------------------------

	/** One finished piece of text — a whisper segment, or a browser `isFinal`
	 *  result — settles into the caption and lands in the real target. */
	commit(text){
		if (!text) return;
		this.settled = this.settled ? this.settled + " " + text : text;
		this.partial_text = "";
		this.draw_caption();
		this.push_to_target(text);
	}

	/** Only the finished text ever reaches the caller — the grey, still-moving
	 *  partial stays in this component's own caption, never the target box.
	 *  This APPENDS to whatever is already in the box (never rewrites it), so
	 *  an edit the owner makes mid-dictation, in a pause, is never clobbered —
	 *  unlike the old `mic.js`, which rewrote the whole value every time. */
	push_to_target(chunk){
		const $in = this.input();
		if ($in){
			const joiner = $in.el.value && !/\s$/.test($in.el.value) ? " " : "";
			$in.el.value += joiner + chunk;
			$in.el.dispatchEvent(new Event("input", { bubbles: true }));
		}
		this.on_text?.(chunk);
	}

	/* Settled text in the page's own ink, the still-moving guess grey after it —
	 * capped so a long dictation does not grow the caption without bound. */
	draw_caption(){
		const shown = this.settled.length > 240 ? "…" + this.settled.slice(-240) : this.settled;
		this.$caption.empty(() => {
			if (shown) span(shown + (this.partial_text ? " " : ""));
			if (this.partial_text) span.c("muted", this.partial_text);
		});
	}
}

Dictate.prototype.whisper_url = "http://127.0.0.1:8178";
Dictate.prototype.lang = "en-US";
Dictate.prototype.pause_ms = 700;        // silence this long closes a segment
Dictate.prototype.max_segment_ms = 15000; // or this much talking, whichever comes first
Dictate.prototype.resend_ms = 1500;       // how often the growing segment is re-sent while listening
Dictate.prototype.silence_at = 0.01;      // rough RMS floor — a starting guess, doc/decisions.md
Dictate.prototype.send_on_pause = false;  // opt-in: a checkbox beside the mic turns this on
Dictate.prototype.end_pause_ms = 2500;    // how long a silence must run before send_on_pause stops it

/** `dictate(() => this.$input, opts)` — the drop-in shape `ext/Ask/mic.js`'s
 *  `mic()` used, for callers that just want the button. */
export function dictate($input, opts = {}){ return new Dictate({ $input, ...opts }); }
