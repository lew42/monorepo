import { View, div, span, button, label, input } from "../../core/View/View.js";
import Capture from "./capture.js";
import Socket from "/framework/dev/Socket/Socket.js";
import Revise from "../Revise/Revise.js";
import { servex_url } from "/framework/dev/servex_url.js";

View.stylesheet(import.meta, "Dictate.css");

/* The browser's own engine: free, needs no install, but the audio leaves the
 * machine — Chrome sends it to Google to recognise it (Firefox and iOS Safari
 * have neither the API nor a polyfill, so `Recognition` is undefined there and
 * this engine is simply unavailable). whisper (below) is tried FIRST because it
 * never leaves the machine and, on this GPU, answers in well under a second. */
const Recognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;

/** **Which microphone**, remembered in this browser. The test bench at
 *  `ai/2026-09-22/dictate-silence/` writes the owner's pick here, and every
 *  `Dictate` on the site reads it — so choosing a microphone once, in one place,
 *  moves the board's own mic too, with nothing to wire. A caller that needs a
 *  specific device passes `device_id` and that wins over the remembered one. */
export const DEVICE_KEY = "lew42.dictate.device";

/** Remember (or, with no id, forget) the owner's microphone. Never throws —
 *  `localStorage` is unreadable in some privacy modes, and a dictation must not
 *  fail because a preference could not be saved.
 *
 *  ⚠ The NAME is stored beside the id on purpose. A `deviceId` is salted per
 *  origin and is not forever: it changes when the browser clears site data, and
 *  in a fresh automation profile it changes on every page load (measured —
 *  `ai/2026-09-22/dictate-silence/`, where the remembered pick silently reverted
 *  to the default). The id is tried first and is exact; the name is how the pick
 *  is recovered when that id no longer names anything. */
export function remember_device(id, label = ""){
	try { id ? localStorage.setItem(DEVICE_KEY, JSON.stringify({ id, label })) : localStorage.removeItem(DEVICE_KEY); } catch { /* private mode */ }
}

/** The remembered `{ id, label }`, or null. Tolerates the bare id string an
 *  earlier build of this wrote, so nobody's pick is lost to the format change. */
export function remembered_device(){
	try {
		const raw = localStorage.getItem(DEVICE_KEY);
		if (!raw) return null;
		return raw.startsWith("{") ? JSON.parse(raw) : { id: raw, label: "" };
	} catch { return null; }
}

/** `fetch`, but it gives up after `ms` instead of hanging silently forever —
 *  the exact failure mode that made the old dictation look "stuck". */
async function fetch_timeout(url, opts, ms){
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
	finally { clearTimeout(timer); }
}

/** POST one entry to Servex's single-writer prompt log; `true` once it took,
 *  `false` on any failure — never throws, so a caller can fall back with no
 *  try/catch of its own. Shared by `Dictate`'s own `log_prompt()` (below) and
 *  `v/3/compose.js`'s typed `send()` — one shape for "did Servex take this
 *  prompt", not two. */
export async function post_prompt(entry, url = servex_url("/log/prompts")){
	try {
		const r = await fetch_timeout(url, {
			method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry),
		}, 1200);
		return r.ok;
	} catch { return false; }
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
 * **`on_guess(text)`** — optional, does nothing when unset: the still-moving grey
 * guess, fired every partial resend (whisper) or interim result (the browser
 * engine), text `""` the instant a segment closes. `on_text(chunk)` (above) is
 * still the settled-chunk hook — `on_guess` only adds the in-between guess a
 * caller building its own transcript view (`ux/Dictate/playground/`) needs.
 *
 * **`on_meter(level)`** — optional, does nothing when unset: the SAME smoothed
 * 0..1 number `on_level()` already writes to `--ux-dictate-level` (this button's
 * own tiny bar), handed to a caller that wants a bigger meter of its own
 * (`ux/Dictate/playground/`'s audio source panel) — one number, two bars, never
 * two smoothing calculations to keep in sync. whisper only; the browser engine
 * has no raw stream to read a level from (`doc/decisions.md`).
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
 * **`mode: "open"`** — the live open mic (`talk`, AI 2's composer): the mic stays on
 * indefinitely, each finished sentence is its own settled line in the caption (never a
 * truncated blob), and nothing is ever written into or submitted from the target box —
 * the box stays exactly as the owner left it. `doc/decisions.md`.
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

		// The icon is a child, not the button's own text, so a separate LEVEL BAR
		// can sit beside it and inherit `--ux-dictate-level` (set every audio
		// frame in on_level()) without the button itself moving — the owner's own
		// complaint was the button flickering with sound; now only this bar does.
		this.$button = button.c("ux-dictate-btn", () => {
			span.c("ux-dictate-icon", "🎤");
			span.c("ux-dictate-level");
		}).attr("type", "button")
			.attr("title", "dictate — click to start talking, click again to stop (Ctrl+Shift+M)")
			.on("click", e => { e.stopPropagation(); this.toggle(); });

		div.c("ux-dictate-info flex v", () => {
			div.c("flex gap v-center wrap", () => {
				this.$engine = span.c("ux-dictate-engine muted");
				this.$status = span.c("ux-dictate-status muted");
				this.$countdown = span.c("ux-dictate-countdown muted");
				this.$countdown.el.hidden = true;

				if (this.mode !== "open") label.c("ux-dictate-pause-opt flex v-center muted", () => {
					this.$send_on_pause = input().attr("type", "checkbox")
						.on("change", e => this.toggle_send_on_pause(e.target.checked));
					span("stop after a pause");
				}).style("--gap", "0.3em");
			}).style("--gap", "0.6em");
			this.build_output();
		}).style("--gap", "0.15em");

		if (this.$send_on_pause) this.$send_on_pause.el.checked = !!this.send_on_pause;
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

		const engaged = this.state === "listening" || this.state === "transcribing" || this.state === "connecting";
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
		const name = this.engine === "whisper" ? "Whisper on the PC" : "the browser's recognizer";
		this.$engine.text(name + this.keyboard_hint());
	}

	/* "Ctrl+Shift+M stops" only means anything on a machine with a physical keyboard.
	 * `(pointer: coarse)` is true on a phone or tablet (the primary pointer is a finger),
	 * false on a desktop or laptop with a mouse/trackpad — the standard, no-dependency
	 * way to ask "is this mainly a touch device" (found from a mobile screenshot showing
	 * the hint on a phone's own bottom sheet: `ai/2026-09-29/mobile-nav/`). */
	keyboard_hint(){
		try { if (globalThis.matchMedia?.("(pointer: coarse)").matches) return ""; } catch {}
		return " · Ctrl+Shift+M stops";
	}

	// ---- the button ---------------------------------------------------------

	toggle(){ (this.state === "idle" || this.state === "error") ? this.start() : this.stop(); }

	/** An INSTANT, one-line check, before anything else is even tried. A browser only
	 *  hands out a real microphone on a secure context — https, or the special-cased
	 *  `localhost` / `127.0.0.1` / `*.localhost` — and off that, `navigator.mediaDevices`
	 *  is simply `undefined`. But the Web Speech API's own CONSTRUCTOR still exists on an
	 *  insecure page and quietly does nothing useful, so without this check the code would
	 *  sail past `detect_engine()`, pick `"browser"`, and `start()` would return having
	 *  asked Chrome to listen — with no error ever arriving. Proved headless, on a page
	 *  loaded over this machine's own LAN address: `isSecureContext` was `false`,
	 *  `navigator.mediaDevices` was `undefined`, and the state stayed `"listening"` for
	 *  1.5s with no error — while the START SOUND had already played
	 *  (`ai/2026-09-29/mobile-nav/`, `doc/https-lan.md`). */
	insecure_context_message(){
		if (globalThis.isSecureContext) return null;
		const port = globalThis.location?.port ? ":" + globalThis.location.port : "";
		return `The mic needs https or localhost: open http://localhost${port} on this machine, or see doc/https-lan.md for https on the LAN.`;
	}

	async start(){
		const insecure = this.insecure_context_message();
		if (insecure){ this.set_error(insecure); return; }

		this.settled = "";
		this.partial_text = "";
		this.segment_epoch = 0;
		this.inflight = null;
		this.skipped_silent = false;
		this.cancel_connect = false;
		this.on_start?.();

		this.engine = await this.detect_engine();
		if (!this.engine){
			this.set_error("No microphone engine is reachable right now — start whisper-server, or use Chrome.");
			return;
		}
		this.name_engine();
		this.$button.el.dataset.engine = this.engine;
		// "connecting", not "listening" — the mic may still need a permission prompt
		// answered or a device opened. `set_state("listening")` below only runs once the
		// mic is REALLY on: after whisper's own `capture.start()` resolves, or (for the
		// browser engine) from `rec.onstart`, never merely because we asked for it. A
		// caller's "start sound" (`ext/Chat/Mic.js`'s `on_listening()`) is wired to that
		// same real transition, not to this call returning.
		this.set_state("connecting");

		// One shared clock for both engines: whisper's own segment/resend timing
		// (heartbeat(), whisper-only) AND the "stop after a pause" countdown
		// (either engine, only when the owner has turned it on).
		this.last_loud_at = performance.now();
		this.timer = setInterval(() => this.heartbeat(), 200);
		// Nothing genuinely started within a few seconds — a permission dialog nobody
		// answered, or (should the up-front secure-context check above ever miss a case)
		// a browser that fails this quietly. Never leaves the owner without a reason.
		this.connect_watchdog = setTimeout(() => {
			if (this.state === "connecting")
				this.set_error("The microphone never actually started — allow microphone access for this site, or check nothing else is using it, and press 🎤 again.");
		}, 8000);

		try {
			this.engine === "whisper" ? await this.start_whisper() : this.start_browser();
		} catch (e){
			this.set_error(this.explain(e));
			return;
		}
		if (this.cancel_connect){   // stopped while still connecting — release what opened late
			this.mic?.stop();
			try { this.rec?.stop(); } catch {}
			return;
		}
		// The browser engine sets "listening" itself, from `rec.onstart` (below) — its
		// own `.start()` call returns long before recognition is actually live.
		if (this.engine === "whisper"){ clearTimeout(this.connect_watchdog); this.set_state("listening"); }
	}

	async stop(){
		if (this.state === "connecting"){
			// Cancel an attempt still in flight (a permission prompt the owner gave up
			// on) instead of only ever handling "listening" — the button must still work
			// as a stop button in the gap the owner's own bug lived in.
			this.cancel_connect = true;
			clearTimeout(this.connect_watchdog);
			clearInterval(this.timer);
			this.hide_countdown();
			this.mic?.stop();
			try { this.rec?.stop(); } catch {}
			this.set_state("idle");
			this.on_stop?.();
			return;
		}
		if (this.state !== "listening") return;
		clearTimeout(this.connect_watchdog);
		clearInterval(this.timer);
		this.hide_countdown();
		this.set_state("transcribing");

		if (this.engine === "whisper"){
			await this.close_segment("manual");
			this.mic?.stop();
			// close_segment() may itself have set_error()'d (whisper stopped answering
			// mid-session) — never stamp that back to "idle" as if nothing happened.
			if (this.state !== "error"){
				this.set_state("idle");
				// Never silence about silence: a dictation that heard nothing loud
				// enough to send now SAYS so, instead of just ending with an empty box.
				if (!this.settled && this.skipped_silent)
					this.$status.text("nothing loud enough to transcribe was heard — check the level meter moves while you talk");
			}
		} else {
			this.stop_browser();   // set_state("idle") happens in onend, once Chrome truly stops
		}
		this.on_stop?.();
	}

	explain(e){
		if (e?.name === "NotAllowedError")
			return "The browser is not allowed to use the microphone — allow it for this site and press 🎤 again.";
		if (e?.name === "NotFoundError") return "No microphone was found on this machine.";
		if (e?.name === "NotReadableError" || e?.name === "TrackStartError")
			return "The microphone is being used by another app (or another browser tab) — close it and press 🎤 again.";
		if (e?.name === "SecurityError") return this.insecure_context_message() ?? "The browser refused the microphone for security reasons.";
		if (e?.name === "NotSupportedError")
			return "This browser can't run the audio pipeline dictation needs here — try Chrome, or use the browser's own speech recognition instead of Whisper.";
		// Never just echo a raw browser message with no next step — the owner's own
		// complaint was exactly that: an error nobody could act on. Every OTHER case
		// above says what to check; this last resort still says what to try.
		return `The microphone stopped (${e?.name ? e.name + ": " : ""}${e?.message ?? e}) — press 🎤 again, or reload the page if it keeps happening.`;
	}

	/* `"connecting"` is new: set the instant `start()` decides to try, before the mic
	 * is really open — asked-for, not yet on. Only a genuine transition INTO
	 * `"listening"` (never a same-state restatement, which Chrome's own silent
	 * mid-session restarts would otherwise cause) fires `on_listening()` — the hook
	 * `ext/Chat/Mic.js` plays the start sound from. */
	set_state(state){
		const was_listening = this.state === "listening";
		this.state = state;
		this.$button.rc("listening transcribing connecting").ac(["listening", "transcribing", "connecting"].includes(state) ? state : "");
		this.$status.rc("error").text({ listening: "listening…", transcribing: "finishing…", connecting: "connecting…" }[state] ?? "");
		if (state === "listening" && !was_listening) this.on_listening?.();
	}

	set_error(msg){
		clearTimeout(this.connect_watchdog);
		clearInterval(this.timer);
		this.hide_countdown();
		this.mic?.stop();
		this.state = "error";
		this.$button.rc("listening transcribing connecting");
		this.$status.ac("error").text(msg);
		console.error("ux/Dictate:", msg);
		this.on_error?.(msg);
	}

	// ---- whisper: segment, resend, cut ---------------------------------------

	/** The microphone this instance should open: the one the caller named, else
	 *  the one the owner picked on the test bench, else the system default. */
	device(){
		if (this.device_id) return { id: this.device_id, label: this.device_label };
		return remembered_device() ?? { id: null, label: "" };
	}

	async start_whisper(){
		const { id, label } = this.device();
		this.mic = new Capture({ device_id: id, device_label: label });
		this.level = 0;
		this.has_speech = false;
		this.segment_started_at = this.last_partial_at = performance.now();
		await this.mic.start(level => this.on_level(level));
	}

	/* A rough, un-calibrated loudness -> `--ux-dictate-level` (0..1), read by
	 * Dictate.css to drive the button's real level meter, and also the pause-cut
	 * clock below. `silence_at` is a starting guess, not a measured threshold —
	 * `doc/decisions.md`. */
	on_level(level){
		this.level = this.level * 0.6 + level * 0.4;
		this.$button.style("--ux-dictate-level", Math.min(1, this.level * 6).toFixed(3));
		this.on_meter?.(Math.min(1, this.level * 6));   // same smoothed number, for a caller's own bigger bar
		if (this.level > this.silence_at){ this.has_speech = true; this.last_loud_at = performance.now(); }
	}

	/* One clock tick (5/sec), shared by both engines. For whisper: a pause
	 * closes the segment, so does hitting the length cap, and otherwise a
	 * resend fires roughly every `resend_ms` (only one of the three per tick).
	 * For either engine: the opt-in "stop after a pause" countdown. */
	heartbeat(){
		const now = performance.now();
		if (this.engine === "whisper"){
			if (this.has_speech && now - this.last_loud_at >= this.pause_ms) this.close_segment("pause");
			else if (now - this.segment_started_at >= this.max_segment_ms) this.close_segment("forced");
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
		/* ⚠ QUIET ALREADY? DO NOT START A GUESS. The pause that closes this segment is about to fire, and
		   whisper-server answers ONE request at a time — so the final would sit behind this guess
		   (measured 68 ms of a 167 ms wait, about half of all segment ends). */
		if (this.has_speech && performance.now() - this.last_loud_at > this.skip_partial_after_ms) return;
		const epoch = this.segment_epoch;
		const samples = this.mic.snapshot();
		if (!this.worth_sending(samples)) return;

		this.inflight = this.transcribe(samples);
		let text;
		try { text = await this.inflight; } catch { return; } finally { this.inflight = null; }
		// The segment may have closed WHILE this was in flight — a stale partial
		// must never paint over a segment that has already gone final.
		if (epoch === this.segment_epoch){ this.partial_text = text; this.draw_caption(); this.on_guess?.(text); }
	}

	/** ⚠ THE GUESS IS NEVER CLEARED BEFORE THE FINAL TEXT IS READY TO REPLACE IT.
	 *  An earlier version cleared `partial_text` and redrew the caption THE INSTANT
	 *  a segment closed, then redrew AGAIN once `transcribe()`'s await returned —
	 *  two real, separately-painted frames, with the caption visibly SHORTER in
	 *  between (the grey guess gone, the settled text not landed yet) for however
	 *  long Whisper took to answer. That is the flicker the owner saw: "smooth"
	 *  when Whisper was fast enough nobody noticed the gap, "erased and redrawn in
	 *  two steps" when it wasn't (`ai/2026-09-29/audio/b-refine/`, measured with a
	 *  `ResizeObserver` — `doc/decisions.md`). Now the guess is only ever cleared
	 *  in the SAME `draw_caption()` call that either shows the real text (`commit()`)
	 *  or gives up on this segment (nothing worth sending, or Whisper errored) —
	 *  one paint, never a visible dip. */
	async close_segment(reason = "pause"){
		const samples = this.mic.snapshot();
		this.mic.cut();
		this.segment_epoch++;
		this.has_speech = false;
		this.segment_started_at = this.last_loud_at = this.last_partial_at = performance.now();

		if (!this.worth_sending(samples)){
			this.clear_guess();
			return;
		}

		// Let a partial resend for the OLD segment finish first — whisper-server
		// answers one request at a time, and its answer is about to be thrown
		// away anyway (the epoch check above already ignores it).
		if (this.inflight) try { await this.inflight; } catch { /* ignored — see above */ }

		this.inflight = this.transcribe(samples);
		let text;
		try { text = await this.inflight; }
		catch (e){
			// This is the "Whisper server unreachable" case, surfaced where it was only
			// ever a console.error before — the owner's own words: "we don't want users
			// to just have it not work and not know why". Ends the dictation rather than
			// silently dropping every segment from here on.
			console.error("ux/Dictate: whisper-server did not answer for a segment:", e);
			this.clear_guess();
			this.set_error(`Whisper stopped answering (${e.message}) — check whisper-server is still running, or stop and press 🎤 again to use the browser's recognizer instead.`);
			return;
		}
		finally { this.inflight = null; }
		// `commit()` itself clears `partial_text` and redraws WITH the new settled
		// line already in place — see its own comment. No separate clear here.
		this.commit(text, reason);
	}

	/** The still-moving guess is gone with nothing to replace it (a silent segment,
	 *  or Whisper failed) — the one place `close_segment()` clears it on its own. */
	clear_guess(){
		this.partial_text = "";
		this.draw_caption();
		this.on_guess?.("");
	}

	/** **Is there any speech in here at all?** Whisper never answers "nothing" —
	 *  handed silence it invents a plausible sentence, and for this model that
	 *  sentence is almost always "Thank you." So the recording of the quiet gap
	 *  between the owner's last word and their press of the button used to be
	 *  transcribed, committed, typed into the box and logged as a prompt. That
	 *  was the whole "it just says Thank you" bug (`ai/2026-09-22/dictate-silence/`).
	 *
	 *  The test is `Capture.loudness()`'s `loud_ms` — how many milliseconds of the
	 *  segment are above a speaking floor, not how loud the segment is on average.
	 *  Measured on the real dumps: silent segments 0ms, the weakest real sentence
	 *  220ms, so `min_speech_ms` at 120 sits in a gap with nothing in it. */
	worth_sending(samples){
		if (!samples.length) return false;
		const loud = this.last_loudness = this.mic.loudness(samples, this.speech_floor);
		if (loud.loud_ms >= this.min_speech_ms) return true;
		this.skipped_silent = true;
		return false;
	}

	async transcribe(samples){
		const wav = this.mic.wav(samples);
		this.dump(wav, samples);
		const form = new FormData();
		form.append("file", wav, "segment.wav");
		form.append("response_format", "json");
		const t_sent = performance.now();
		const url = this.whisper_url + "/inference";
		let r;
		// Named here, not left for the caller to guess: WHICH url this device tried, and
		// WHY it failed — a timeout (the 20s cap below), a plain network error (nothing
		// there to answer), or an HTTP status (something answered, but not with success).
		try { r = await fetch_timeout(url, { method: "POST", body: form }, 20000); }
		catch (e){ throw new Error(`${url}: ${e?.name === "AbortError" ? "timed out after 20 s" : (e?.message || "network error")}`); }
		if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
		const body = await r.json();
		this.t_result = performance.now();   // the delay marks (ComposerMic.draw_caption) start here
		this.whisper_ms = this.t_result - t_sent;
		// ⚠ Whisper puts "\n" between ITS OWN segments, mid-speech ("Testing, testing.\n My name is…") —
		// left in, every one became a paragraph break in the box. Real breaks come from real pauses only.
		return (body.text ?? "").replace(/\s+/g, " ").trim();
	}

	/** **The debug seam.** Off unless you turn it on, in the console of the tab
	 *  you are dictating in:
	 *
	 *      window.$DICTATE_DUMP = true;   // or a path: "framework/ai/…/dumps.jsonl"
	 *
	 *  Every WAV this posts to whisper is then ALSO written, base64, one line per
	 *  send, into `dump_file` — so the exact bytes the browser sent can be pulled
	 *  apart on disk afterwards: `node public/framework/ai/2026-09-22/dictate-silence/measure.mjs <that file>`
	 *  prints each one's sample rate, duration, peak, RMS and whether the header's
	 *  byte count agrees with the file's real length. Never awaited and never
	 *  throws into the caller — a debug write failing must not disturb a real
	 *  dictation. */
	dump(wav, samples){
		const where = globalThis.$DICTATE_DUMP;
		if (!where) return;
		const file = typeof where === "string" ? where : this.dump_file;
		wav.arrayBuffer().then(buf => {
			const bytes = new Uint8Array(buf);
			let binary = "";
			for (let i = 0; i < bytes.length; i += 0x8000)   // ⚠ one spread of 500KB blows the call stack
				binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
			const loud = this.mic.loudness(samples, this.speech_floor);
			return Socket.singleton().async_rpc("append", file, { dump: {
				at: new Date().toISOString(), rate: this.mic.rate(), seconds: +loud.seconds.toFixed(3),
				peak: +loud.peak.toFixed(5), rms: +loud.rms.toFixed(5), loud_ms: loud.loud_ms,
				wav_base64: btoa(binary),
			} });
		}).catch(e => console.warn("ux/Dictate: $DICTATE_DUMP could not write:", e));
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
		// The ONLY place the browser engine is really live — `rec.start()` below returns
		// long before this fires. This is what `set_state("listening")` (and therefore
		// the start SOUND, via `on_listening()`) now waits for, instead of firing the
		// instant `.start()` was merely called.
		rec.onstart = () => {
			clearTimeout(this.connect_watchdog);
			if (this.cancel_connect){ try { rec.stop(); } catch {} return; }
			this.set_state("listening");
		};
		rec.onresult = e => this.heard_browser(e);
		rec.onerror = e => { console.error("ux/Dictate: SpeechRecognition error:", e.error); this.browser_error(e.error); };
		// Chrome stops on its own after a few seconds of silence even with
		// `continuous` — restart unless a real press asked to stop (`this.stopping`).
		rec.onend = () => {
			if (this.stopping){ this.stopping = false; this.set_state("idle"); }
			else if (this.state === "listening" || this.state === "connecting") rec.start();
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
		this.on_guess?.(this.partial_text);
	}

	browser_error(error){
		if (error === "service-not-allowed" && this.insecure_context_message()) return this.set_error(this.insecure_context_message());
		this.set_error({
			"not-allowed": "The browser is not allowed to use the microphone — allow it for this site and press 🎤 again.",
			"service-not-allowed": "Chrome's speech recognition service refused this page — allow microphone access for this site and press 🎤 again.",
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
	 *  result — settles into the caption and lands in the real target. `reason` says
	 *  WHY this segment closed — `"pause"` (silence), `"forced"` (the 15s cap), or
	 *  `"manual"` (the owner pressed stop) — the browser engine never has one to give
	 *  (its own `isFinal` flag decides on its own), so callers there see `undefined`.
	 *  Additive only: every caller before this task reads one argument and ignores
	 *  the rest, so nothing that only wanted `on_text(text)` changes. */
	commit(text, reason){
		// Discarding (nothing heard, or a whisper annotation like `[BLANK_AUDIO]`) still
		// clears the guess — the one thing `close_segment()` no longer does up front,
		// so a discarded segment must not leave a stale grey guess frozen on screen.
		if (!text || this.annotation(text)){ this.clear_guess(); return; }
		this.settled = this.settled ? this.settled + " " + text : text;
		(this.settled_lines ??= []).push(text);
		this.partial_text = "";
		this.draw_caption();
		// One id per settled chunk, made HERE (never by the server) — it is what lets a
		// later revision line point back at exactly this one, before either has been
		// logged (owner's ask 2026-09-29: "the revision logs its output as its own
		// line pointing back to the raw line it came from"). `chunk_at` is made the
		// same way, at the same moment, so a revision's `re` (the universal chat
		// line's field for "which line this answers") has something to point at —
		// the raw `{type:"prompt"}` line itself still carries no `at` of its own
		// (Servex stamps that on arrival; see `log_prompt`'s own note on why).
		const chunk_id = this.next_chunk_id();
		const chunk_at = new Date().toISOString();
		this.push_to_target(text, reason, chunk_id, chunk_at);
		this.log_prompt(text, chunk_id);
	}

	/* A plain, locally-made id — not cryptographic, just unique enough to tell two
	 * chunks apart in one log. `crypto.randomUUID` where it exists (every browser
	 * this needs to run in); a timestamp+random fallback otherwise. */
	next_chunk_id(){ return globalThis.crypto?.randomUUID?.() ?? (Date.now() + "-" + Math.random().toString(36).slice(2)); }

	/* Every finished utterance becomes one log entry, not just words on screen.
	 * Tried first: Servex's own single-writer log (`POST /log/<name>`, being
	 * built by the sibling `servex-port` task) — once it is up, this is the
	 * only writer of prompt history and every dictation across the whole site
	 * reaches it the same way. Until then, or whenever Servex is down, this
	 * falls back to the dev server's own existing generic append route
	 * (`Server/plugins/SocketServer/Append.js`, `rpc:append`) so a dictation
	 * during today's setup still lands somewhere real instead of vanishing
	 * once it scrolls off screen. Never throws into the caller — a log write
	 * failing must not break the dictation the owner is mid-sentence in.
	 *
	 * ⚠ Neither path can reach anywhere from a LAN client that is not itself
	 * `localhost`/`127.0.0.1`: `log_url` is `127.0.0.1:8090`, which on a phone
	 * means the PHONE, and `Socket` — the dev-server fallback — refuses to even
	 * open a connection off `localhost` by design (`dev/Socket/Socket.js`, "LOCALHOST
	 * ONLY — production is static hosting with nothing to connect to"). Both
	 * failures are already silent-safe (this `catch` only warns), so a dictation
	 * from the phone still shows its words live; they are just never logged.
	 * Left as-is on purpose — see "Voice → log from the LAN" in `doc/https-lan.md`. */
	async log_prompt(text, id){
		// No `at` sent to Servex on purpose — `Log.append()` stamps its own local-offset
		// clock only when the entry arrives without one; a client-side `new Date()` used
		// to override it with a UTC string, so the same log mixed two clocks. The dev-server
		// fallback below has no clock of its own, so that path still stamps one itself.
		// `id` (this chunk's own `next_chunk_id()`) is what a later revision line's `of`
		// points back at — never required by anything that reads this log today.
		const entry = { type: "prompt", by: "owner", text, via: "whisper", id };
		if (await post_prompt(entry, this.log_url)) return;
		try { await Socket.singleton().async_rpc("append", this.log_fallback_file, { at: new Date().toISOString(), ...entry }); }
		catch (e) { console.warn("ux/Dictate: could not log this utterance (Servex down, dev-server fallback also failed):", e); }
	}

	/** The REVISED text becomes its OWN log line — the universal chat line every
	 *  surface (voice, typed, an agent's own reply) shares (`ai/2026-09-29/voice-sessions/design.md`,
	 *  "The universal chat line"), not the old `{type:"revision"}` shape nothing ever
	 *  drew. `re` is the raw chunk's own `at` (`commit()`'s `chunk_at`, made at the
	 *  same moment as the raw line itself) — how a reader (or `ext/Chat`) finds the
	 *  raw line this answers; `level` says which pass ran. Never merged into the raw
	 *  line, and never written until the revision is actually ready (no half-done
	 *  text logged). Same Servex-then-dev-server fallback as `log_prompt`, for the
	 *  same reason: a log write failing must never break the dictation itself. */
	async log_revision(text, level, re){
		const entry = { chat: { at: new Date().toISOString(), from: { kind: "assistant", id: "revise" }, via: "voice", text, re, level } };
		if (await post_prompt(entry, this.log_url)) return;
		try { await Socket.singleton().async_rpc("append", this.log_fallback_file, { at: new Date().toISOString(), ...entry }); }
		catch (e) { console.warn("ux/Dictate: could not log this revision (Servex down, dev-server fallback also failed):", e); }
	}

	/** Whisper does not only return words. A noise that is loud but is not speech
	 *  comes back as an ANNOTATION — `*shriek*`, `(door closes)`, `[BLANK_AUDIO]`,
	 *  `♪` — which is whisper being honest, not a mistake, and which must still
	 *  never be typed into the owner's box or logged as something they said. This
	 *  is a rule about the SHAPE of the answer, not a list of phrases to ban: a
	 *  list would have to grow forever, this does not (a real fan noise came back
	 *  as `*shriek*` while proving this task's fix, 2026-09-22). */
	annotation(text){ return /^[\s*([♪_-]*[^\w]*$|^([*([♪])[\s\S]*[*)\]♪]$/.test(text); }

	/** Only the finished text ever reaches the caller — the grey, still-moving
	 *  partial stays in this component's own caption, never the target box.
	 *  This APPENDS to whatever is already in the box (never rewrites it), so
	 *  an edit the owner makes mid-dictation, in a pause, is never clobbered —
	 *  unlike the old `mic.js`, which rewrote the whole value every time. */
	push_to_target(chunk, reason, chunk_id, chunk_at){
		// Open mode: the box is for typing, never for the mic — a committed sentence
		// only ever reaches `on_text` (the caption stream), the box stays untouched.
		const $in = this.mode !== "open" && this.input();
		if ($in){
			const joiner = $in.el.value && !/\s$/.test($in.el.value) ? " " : "";
			$in.el.value += joiner + chunk;
			$in.el.dispatchEvent(new Event("input", { bubbles: true }));
		}
		this.on_text?.(chunk, reason);
		this.revise_chunk(chunk, chunk_id, chunk_at);
	}

	/** **`revise`** — `"clean" | "edit" | "summary" | false` (default `false`, so
	 *  every caller that never asked for this keeps working with zero change).
	 *  The RAW text has already reached `on_text` above, unchanged, before this even
	 *  starts — a caller that only wants what it always got can ignore `on_revised`
	 *  completely. When `revise` names a level, this runs `ux/Revise` in the
	 *  background (never blocking the box, which already has the raw words) and,
	 *  once it answers OK: logs the REVISED text as its own line (`log_revision()`,
	 *  pointing back at the raw line's own id — never merged into it), and, if the
	 *  caller set one, calls `on_revised(text, {raw, level, chunk_id})` too — the
	 *  revised text, the original raw chunk it came from (so the raw text is always
	 *  kept alongside the revised one, never replaced), and which level ran.
	 *  `on_revised` NEVER fires with a falsy `text` — a Servex that isn't up yet, or
	 *  any other failure, calls the SEPARATE `on_revise_failed({raw, level, chunk_id,
	 *  why})` instead, so an existing caller that only ever handled success (like
	 *  `ext/drawer/rail.js`'s `on_revised: text => this.card(text)`) can never be
	 *  handed `null` to draw a card for. Only the FINISHED revision is ever logged —
	 *  no guess, no in-between chunk, no per-tick timing (those stay in memory only,
	 *  e.g. the playground's Chunks view — `ai/2026-09-29/audio/b-refine/`). */
	/* `before` (ai/2026-09-29/audio/next-clean-transcription/a-clean-mode, deliverable 1)
	 * is the tail of everything already revised in THIS dictation — a little context so
	 * the fast assistant can see the sentence it is joining, same idea as the playground's
	 * own `BEFORE_CHARS`. `revised_so_far` only grows here; nothing else touches it. */
	revise_chunk(raw, chunk_id, chunk_at){
		if (!this.revise || this.sampling) return;   // sample() lines are never something the owner said
		const level = this.revise;
		const before = (this.revised_so_far ?? "").slice(-300);
		Revise.run(raw, level, { before }).then(out => {
			if (!out.ok){   // never call on_revised with a null/empty text — a separate hook for "gave up"
				this.on_revise_failed?.({ raw, level, chunk_id, why: out.why });
				return;   // nothing to log
			}
			this.on_revised?.(out.text, { raw, level, chunk_id });
			this.revised_so_far = ((this.revised_so_far ?? "") + " " + out.text).trim();
			this.log_revision(out.text, level, chunk_at);
		});
	}

	/** **The variant seam.** `build_output()` builds whatever holds the transcript
	 *  (here, one muted line — `this.$caption`); `draw_caption()` repaints it every
	 *  time a segment settles or the live guess changes. A variant with a genuinely
	 *  different user experience — a wall of "prompt item" cards instead of one
	 *  running line, a single-line compact strip for a toolbar — overrides ONLY
	 *  these two methods; the whole state machine above (engines, errors, the start
	 *  sound's real timing) is untouched and every variant inherits it for free. See
	 *  `ux/Dictate/variants/` for the built ones, and `doc/variants.md` for how to
	 *  write another. */
	build_output(){ this.$caption = div.c("ux-dictate-caption muted"); }

	/* Settled text in the page's own ink, the still-moving guess grey after it —
	 * capped so a long dictation does not grow the caption without bound. Open
	 * mode never runs for long unwatched (a mic left on indefinitely), so instead
	 * of one truncated blob it keeps every sentence as its own line, appended,
	 * never moved — the "settled line, never moved" the caption stream promises. */
	draw_caption(){
		if (this.mode === "open"){
			this.$caption.empty(() => {
				for (const line of this.settled_lines ?? []) div.c("ux-dictate-line").text(line);
				if (this.partial_text) div.c("ux-dictate-line muted", this.partial_text);
			});
			return;
		}
		const shown = this.settled.length > 240 ? "…" + this.settled.slice(-240) : this.settled;
		this.$caption.empty(() => {
			if (shown) span(shown + (this.partial_text ? " " : ""));
			if (this.partial_text) span.c("muted", this.partial_text);
		});
	}

	/** **Demo only — no mic, no whisper, nothing logged.** Feeds sentences straight
	 *  into the settled transcript exactly as `commit()` would (same `settled_lines`,
	 *  same `draw_caption()`, same target box), so a variant page can show what makes
	 *  it different the instant it loads, without anyone talking into a real
	 *  microphone first. Skips `log_prompt()` on purpose — sample text is not
	 *  something the owner said, and must never land in the real prompt log. The
	 *  owner's own rule this exists for: "I want to see" (`ai/2026-09-29/mobile-nav/review.md`). */
	async sample(lines){
		this.sampling = true;   // revise_chunk()'s own guard — sample text must never reach a real log or a real model call
		try {
			for (const text of lines){
				this.settled = this.settled ? this.settled + " " + text : text;
				(this.settled_lines ??= []).push(text);
				this.draw_caption();
				this.push_to_target(text);
				await new Promise(r => setTimeout(r, 150));
			}
		} finally { this.sampling = false; }   // a throw mid-loop must never leave this stuck true — deliverable 6
	}
}

/** Where to reach `whisper-server`. On this machine (`localhost`/`127.0.0.1`/`*.localhost`)
 *  that is the direct port, unchanged. From anywhere else — a phone on the LAN — `127.0.0.1`
 *  would mean the PHONE, so the page's own origin is used instead, and
 *  `Server/plugins/Whisper.js`'s `/whisper/inference` + `/whisper/` proxy that same-origin
 *  request on to the real `127.0.0.1:8178` on the machine actually running whisper-server.
 *  This does NOT open the microphone on an insecure LAN page — that is a separate, harder
 *  browser rule `insecure_context_message()` catches — it only means that once the mic
 *  IS open (secure context reached some other way), reaching whisper does not require
 *  hard-coding a loopback address that means a different machine on every device. */
function default_whisper_url(){
	const h = globalThis.location?.hostname;
	const local = h === "localhost" || h === "127.0.0.1" || h?.endsWith(".localhost");
	return local || !globalThis.location ? "http://127.0.0.1:8178" : globalThis.location.origin + "/whisper";
}

Dictate.prototype.whisper_url = default_whisper_url();
Dictate.prototype.log_url = servex_url("/log/prompts");       // Servex's single-writer log — not always up yet
Dictate.prototype.log_fallback_file = "framework/ai/prompts.jsonl";    // dev-server rpc:append fallback, relative under public/
Dictate.prototype.lang = "en-US";
Dictate.prototype.pause_ms = 700;        // silence this long closes a segment
Dictate.prototype.max_segment_ms = 15000; // or this much talking, whichever comes first
Dictate.prototype.skip_partial_after_ms = 300;  // no resend once the speaker has been quiet this long — the final is next
Dictate.prototype.resend_ms = 900;        // how often the growing segment is re-sent while listening (was 1500; measured Whisper answers in ~70 ms, so the wait between guesses WAS the delay)
Dictate.prototype.silence_at = 0.01;      // rough RMS floor — a starting guess, doc/decisions.md
Dictate.prototype.speech_floor = 0.02;    // a 20ms frame louder than this counts as speech
Dictate.prototype.min_speech_ms = 120;    // a segment with less speech than this is never sent — doc/silence.md
Dictate.prototype.dump_file = "framework/ai/dictate-dumps.jsonl";   // where window.$DICTATE_DUMP writes
Dictate.prototype.device_id = null;       // a specific microphone; null = the owner's remembered pick
Dictate.prototype.device_label = "";      // its name, so a stale id can be recovered — capture.js by_label()
Dictate.prototype.send_on_pause = false;  // opt-in: a checkbox beside the mic turns this on
Dictate.prototype.end_pause_ms = 2500;    // how long a silence must run before send_on_pause stops it
Dictate.prototype.mode = null;            // "open" = open-mic: mic stays on, box never written, no auto-stop
Dictate.prototype.revise = false;         // "clean" | "edit" | "summary" | false (default) — see revise_chunk(), on_revised, on_revise_failed
Dictate.prototype.on_revised = null;      // (text, {raw, level, chunk_id}) => … — fires once ux/Revise answers OK; never a falsy text, never required
Dictate.prototype.on_revise_failed = null;   // ({raw, level, chunk_id, why}) => … — fires instead of on_revised when Revise.run couldn't answer; never required

/** `dictate(() => this.$input, opts)` — the drop-in shape `ext/Ask/mic.js`'s
 *  `mic()` used, for callers that just want the button. */
export function dictate($input, opts = {}){ return new Dictate({ $input, ...opts }); }
