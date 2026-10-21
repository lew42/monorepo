import { View, div, span, button, label, input } from "../../core/View/View.js";
import Capture from "./capture.js";
import Revise from "../Revise/Revise.js";
import { servex_url } from "/framework/dev/servex_url.js";
import floor from "./floor.js";
import MicIndicator from "./MicIndicator.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";
import Socket from "/framework/dev/Socket/Socket.js";
import WhisperLog from "/framework/audio/Whisper/WhisperLog.js";

View.stylesheet(import.meta, "Dictate.css");

// The browser's own engine (audio goes to Google); whisper is tried first. see doc/notes.md#browser-engine
const Recognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;

// see doc/notes.md#release-the-mic-when-the-page-is-hidden
const LIVE = new Set();
const PAUSED = new Set();   // live when the page was hidden: restarted when it shows again
const release_on_hide = () => {
	for (const d of [...LIVE]){
		d.stop();
		d.mic?.stop();
		try { d.rec?.abort?.(); } catch {}
	}
};
const resume_on_show = () => {
	if (document.visibilityState !== "visible") return;
	for (const d of [...PAUSED]){
		PAUSED.delete(d);
		if (!d.el?.isConnected || d.state === "listening" || d.state === "connecting") continue;
		if (d.state === "transcribing"){ PAUSED.add(d); setTimeout(resume_on_show, 300); continue; }
		d.resumed = true;
		d.start();
	}
};
if (globalThis.document){
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden"){
			for (const d of LIVE) PAUSED.add(d);
			release_on_hide();
		} else resume_on_show();
	});
	globalThis.addEventListener?.("pagehide", release_on_hide);
}

/** Remembered mic pick, shared by every Dictate. see doc/notes.md#which-microphone */
export const DEVICE_KEY = "lew42.dictate.device";

// Did whisper ever answer in this browser? see doc/notes.md#whisper-seen
const WHISPER_SEEN_KEY = "lew42.dictate.whisper_seen";
function whisper_seen(){ try { return localStorage.getItem(WHISPER_SEEN_KEY) === "1"; } catch { return false; } }
function mark_whisper_seen(){ try { localStorage.setItem(WHISPER_SEEN_KEY, "1"); } catch {} }

/** Remember (or forget) the mic; the NAME is stored too because deviceId changes. see doc/notes.md#device-name-stored-beside-the-id */
export function remember_device(id, label = ""){
	try { id ? localStorage.setItem(DEVICE_KEY, JSON.stringify({ id, label })) : localStorage.removeItem(DEVICE_KEY); } catch { /* private mode */ }
}

export function remembered_device(){
	try {
		const raw = localStorage.getItem(DEVICE_KEY);
		if (!raw) return null;
		return raw.startsWith("{") ? JSON.parse(raw) : { id: raw, label: "" };
	} catch { return null; }
}

async function fetch_timeout(url, opts, ms){
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
	finally { clearTimeout(timer); }
}

// see doc/notes.md#one-health-check-per-tab
let shared_check = null;
function shared_detect_engine(instance){
	if (!shared_check){
		shared_check = instance.detect_engine()
			.then(engine => ({ engine, steps: { ...instance.steps } }))
			.finally(() => { shared_check = null; });
	}
	return shared_check;
}

/** POST to Servex's prompt log: true once it took, false on failure (never throws). see doc/notes.md#post_prompt */
export async function post_prompt(entry, url = servex_url("/log/prompts")){
	floor.stamp(entry);
	try {
		const r = await fetch_timeout(url, {
			method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry),
		}, 1200);
		return r.ok;
	} catch { return false; }
}

/** A 🎤 that dictates into a textarea or a callback: `dictate(() => this.$input, opts)`. Options and behaviour: see doc/notes.md#the-dictate-class */
export default class Dictate extends View {

	render(){
		this.ac("ux-dictate flex v-center gap");
		this.state = "idle";
		this.settled = "";
		this.partial_text = "";

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
				// see doc/notes.md#always-visible-stages
				this.$diag = span.c("ux-dictate-diag muted");
				this.steps = { mic: "idle", socket: "", whisper: "" };

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

	// Ctrl/Cmd+Shift+M toggles this instance; self-removes when detached. see doc/notes.md#hotkey
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

	// Same name as the imported input() factory on purpose. see doc/notes.md#input-name-clash
	input(){ return typeof this.$input === "function" ? this.$input() : this.$input; }

	async init(){
		const { engine, steps } = await shared_detect_engine(this);
		this.engine = engine;
		this.steps.socket = steps.socket; this.steps.whisper = steps.whisper;
		this.draw_diag();
		if (this.engine === "whisper-down"){
			this.$engine.text("");
			this.$status.rc("error").text("whisper has gone quiet — tap 🎤 to see why");
			return;   // the button stays up: pressing it runs start(), which explains in full
		}
		if (!this.engine){
			this.$button.el.hidden = true;
			this.$engine.text("no dictation engine reachable — start whisper, or use Chrome");
			return;
		}
		this.name_engine();
	}

	/** One stage changed: console-logged, shown in $diag, timed since the press. see doc/notes.md#timed-stage-log */
	log_step(stage, detail){
		const ms = this.connect_started_at ? Math.round(performance.now() - this.connect_started_at) : null;
		this.steps[stage] = detail;
		(this.stage_log ??= []).push({ stage, detail, ms, at: Date.now() });
		if (this.stage_log.length > 12) this.stage_log.shift();
		console.log(`[dictate] ${stage}: ${detail}`);
		this.on_step?.(stage, detail);   // optional: a caller drawing its own connection view (ux/Dictate/Connection)
		this.draw_diag();
		this.draw_stage_tray?.();
		if (this.state === "connecting" && stage === "mic") this.$status?.rc("error").text(this.timed_text("mic"));
	}

	timed_text(stage){
		const text = this.steps?.[stage];
		if (!text) return null;
		const ms = this.stage_log?.findLast?.(s => s.stage === stage)?.ms;
		return ms == null ? text : `${text} (${ms}ms)`;
	}

	draw_diag(){
		if (!this.$diag) return;
		const s = this.steps;
		this.$diag.text(`Mic: ${s.mic || "idle"} · Whisper: ${s.whisper || "—"}`);
	}

	socket_status(){
		try { const s = Socket.singleton?.(); return s ? (s.connected ? "connected" : "retrying") : "—"; }
		catch { return "—"; }
	}

	// 2.5 s timeout and one 400 ms retry are deliberate. see doc/notes.md#detect_engine-timeout-and-retry
	async detect_engine(){
		this.log_step("socket", this.socket_status());
		for (let attempt = 1; attempt <= 2; attempt++){
			this.log_step("whisper", attempt === 1 ? "checking…" : "checking again…");
			try {
				const r = await fetch_timeout(this.whisper_url + "/", {}, 2500);
				if (r.ok){ this.log_step("whisper", "connected"); mark_whisper_seen(); return "whisper"; }
			} catch { /* not reachable — retry once, then fall through */ }
			if (attempt === 1) await new Promise(res => setTimeout(res, 400));
		}
		this.log_step("whisper", "not reachable");
		// Whisper worked before here: never slide silently into the browser recognizer.
		if (whisper_seen()) return "whisper-down";
		return Recognition ? "browser" : null;
	}

	name_engine(){
		this.$engine.text(this.engine === "whisper" ? "" : "the browser's recognizer" + this.keyboard_hint());
	}

	keyboard_hint(){
		try { if (globalThis.matchMedia?.("(pointer: coarse)").matches) return ""; } catch {}
		return " · Ctrl+Shift+M stops";
	}


	toggle(){ (this.state === "idle" || this.state === "error") ? this.start() : this.stop(); }

	/** Instant secure-context check; the Web Speech constructor exists but fails silently off https. see doc/notes.md#insecure-context */
	insecure_context_message(){
		if (globalThis.isSecureContext) return null;
		const port = globalThis.location?.port ? ":" + globalThis.location.port : "";
		return `The mic needs https or localhost: open http://localhost${port} on this machine, or see doc/https-lan.md for https on the LAN.`;
	}

	async start(){
		const insecure = this.insecure_context_message();
		if (insecure){ this.log_step("mic", "refused: insecure context"); this.set_error(insecure); return; }

		// see doc/notes.md#one-microphone-at-a-time
		for (const other of [...LIVE]) if (other !== this) try { await other.stop(); } catch {}

		this.settled = "";
		this.partial_text = "";
		this.segment_epoch = 0;
		this.inflight = null;
		this.connect_started_at = performance.now();
		this.heard_first_sample = false;
		this.heard_first_answer = false;
		// Every request gets a ticket; stale answers are dropped. see doc/notes.md#duplicate-bubble-race
		this.req_seq = 0;
		this.applied_seq = 0;
		this.skipped_silent = false;
		this.cancel_connect = false;
		this.on_start?.();

		this.log_step("mic", "checking the engine…");
		// Shared check, not detect_engine() raw. see doc/notes.md#one-health-check-per-tab
		const { engine, steps } = await shared_detect_engine(this);
		this.engine = engine;
		this.steps.socket = steps.socket; this.steps.whisper = steps.whisper;
		this.draw_diag();
		if (this.engine === "whisper-down"){
			// Never the browser recognizer here: one clear line, nothing started.
			this.log_step("mic", "refused: whisper not reachable");
			this.set_state("idle");
			this.set_error("Whisper has gone quiet — it answered before, but not just now. Check whisper-server is still running (doc/decisions.md), then press 🎤 again. The browser's own recognizer is not used automatically.");
			return;
		}
		if (!this.engine){
			this.log_step("mic", "refused: no engine reachable");
			this.set_error("No microphone engine is reachable right now — start whisper-server, or use Chrome.");
			return;
		}
		this.name_engine();
		this.$button.el.dataset.engine = this.engine;
		// "connecting" until the mic is really on. see doc/notes.md#connecting-vs-listening
		this.set_state("connecting");

		this.last_loud_at = performance.now();
		this.timer = setInterval(() => this.heartbeat(), 200);
		// see doc/notes.md#connect-watchdog
		this.connect_watchdog = setTimeout(() => {
			if (this.state === "connecting"){
				this.log_step("mic", "timed out waiting for the device");
				this.set_error("The microphone never actually started — allow microphone access for this site, or check nothing else is using it, and press 🎤 again.");
			}
		}, 8000);

		this.log_step("mic", "requesting…");
		try {
			await this.open_engine();
		} catch (e){
			this.log_step("mic", "refused: " + (e?.name ?? e?.message ?? e));
			this.set_error(this.explain(e));
			return;
		}
		if (this.cancel_connect){   // stopped while still connecting — release what opened late
			this.mic?.stop();
			try { this.rec?.stop(); } catch {}
			return;
		}
		this.log_step("mic", "ok");
		if (this.engine === "whisper"){ clearTimeout(this.connect_watchdog); this.set_state("listening"); }
	}

	// see doc/notes.md#reload-race
	async open_engine(){
		try { this.engine === "whisper" ? await this.start_whisper() : this.start_browser(); return; }
		catch (e){
			if (e?.name !== "AbortError" || this.cancel_connect) throw e;
		}
		this.log_step("mic", "abort right after reload — retrying once…");
		await new Promise(res => setTimeout(res, 500));
		if (this.cancel_connect) return;
		this.engine === "whisper" ? await this.start_whisper() : this.start_browser();
	}

	async stop(){
		if (this.state === "connecting"){
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
			if (this.state !== "error"){
				this.set_state("idle");
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
		return `The microphone stopped (${e?.name ? e.name + ": " : ""}${e?.message ?? e}) — press 🎤 again, or reload the page if it keeps happening.`;
	}

	// Only a real transition INTO listening fires on_listening(). see doc/notes.md#set_state
	set_state(state){
		const was_listening = this.state === "listening";
		this.state = state;
		if (state === "idle" && this.steps?.mic === "on, level ok") this.log_step("mic", "idle");   // the diag line must not say "on" after stop
		(state === "listening" || state === "connecting") ? LIVE.add(this) : LIVE.delete(this);
		MicIndicator.set_open(LIVE.size > 0);
		if (state === "listening" && !was_listening) floor.mic_on(this);   // the floor: `floor.js`
		else if (state !== "listening" && was_listening) floor.mic_off(this);
		this.$button.rc("listening transcribing connecting").ac(["listening", "transcribing", "connecting"].includes(state) ? state : "");
		const connect_text = this.timed_text("mic") ?? "connecting…";
		this.$status.rc("error").text({ listening: "listening…", transcribing: "finishing…", connecting: connect_text }[state] ?? "");
		if (state === "listening" && this.resumed){ this.resumed = false; this.$status.text("resumed — listening…"); }
		if (state === "listening" && !was_listening) this.on_listening?.();
	}

	set_error(msg){
		clearTimeout(this.connect_watchdog);
		clearInterval(this.timer);
		this.hide_countdown();
		this.mic?.stop();
		floor.mic_off(this);
		LIVE.delete(this);
		MicIndicator.set_open(LIVE.size > 0);
		this.state = "error";
		this.$button.rc("listening transcribing connecting");
		this.$status.ac("error").text(msg);
		console.error("ux/Dictate:", msg);
		this.on_error?.(msg);
	}


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

	// silence_at is an uncalibrated guess. see doc/decisions.md
	on_level(level){
		if (this.state === "idle" || this.state === "error") return;   // a late tick after stop
		if (!this.heard_first_sample){ this.heard_first_sample = true; this.log_step("mic", "on, level ok"); }
		this.level = this.level * 0.6 + level * 0.4;
		this.$button.style("--ux-dictate-level", Math.min(1, this.level * 6).toFixed(3));
		MicIndicator.set_level(Math.min(1, this.level * 6));
		this.on_meter?.(Math.min(1, this.level * 6));   // same smoothed number, for a caller's own bigger bar
		if (this.level > this.silence_at){ this.has_speech = true; this.last_loud_at = performance.now(); }
		floor.level(this, this.level > this.silence_at);   // pauses and speaking time for `entry.cues`
	}

	heartbeat(){
		if (!this.el.isConnected){ this.stop(); this.mic?.stop(); try { this.rec?.abort?.(); } catch {} return; }
		const now = performance.now();
		if (this.engine === "whisper"){
			if (this.has_speech && now - this.last_loud_at >= this.pause_ms) this.close_segment("pause");
			else if (now - this.segment_started_at >= this.max_segment_ms) this.close_segment("forced");
			else if (now - this.last_partial_at >= this.resend_ms) this.partial_tick();
		}
		if (this.send_on_pause) this.check_end_pause(now);
	}

	// Opt-in countdown that ends the whole dictation. see doc/notes.md#stop-after-a-pause
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
		// Quiet already: no guess, the final is next and whisper answers one request at a time. see doc/notes.md#skip-partial-when-quiet
		if (this.has_speech && performance.now() - this.last_loud_at > this.skip_partial_after_ms) return;
		const epoch = this.segment_epoch;
		const samples = this.mic.snapshot();
		if (!this.worth_sending(samples)) return;

		const seq = ++this.req_seq;
		this.inflight = this.transcribe(samples, "interim");
		let text;
		try { text = await this.inflight; } catch { return; } finally { this.inflight = null; }
		// Stale answers are dropped (epoch + ticket). see doc/notes.md#duplicate-bubble-race
		if (epoch !== this.segment_epoch || seq <= this.applied_seq){ this.on_trace?.("stale", { kind: "interim", req: seq, msg: text }); return; }
		this.applied_seq = seq;
		this.partial_text = text; this.draw_caption(); this.on_guess?.(text);
	}

	/** The guess is cleared only in the same draw_caption() that shows the final. see doc/notes.md#never-clear-the-guess-early */
	async close_segment(reason = "pause"){
		const samples = this.mic.snapshot();
		this.mic.cut();
		this.segment_epoch++;
		const epoch = this.segment_epoch;
		this.has_speech = false;
		this.segment_started_at = this.last_loud_at = this.last_partial_at = performance.now();

		if (!this.worth_sending(samples)){
			this.clear_guess();
			return;
		}

		if (this.inflight) try { await this.inflight; } catch { /* ignored — see above */ }

		const seq = ++this.req_seq;
		this.inflight = this.transcribe(samples, "final");
		let text;
		try { text = await this.inflight; }
		catch (e){
			// A stale request failing is not a real failure. see doc/notes.md#duplicate-bubble-race
			if (epoch !== this.segment_epoch || seq <= this.applied_seq) return;
			console.error("ux/Dictate: whisper-server did not answer for a segment:", e);
			this.clear_guess();
			this.log_step("whisper", "stopped answering: " + (e?.message ?? e));
			this.set_error(`Whisper stopped answering (${e.message}) — check whisper-server is still running, or stop and press 🎤 again to use the browser's recognizer instead.`);
			return;
		}
		finally { this.inflight = null; }
		// Never commit a stale or out-of-order answer. see doc/notes.md#duplicate-bubble-race
		if (epoch !== this.segment_epoch || seq <= this.applied_seq){
			this.on_trace?.("stale", { kind: "final", req: seq, msg: text });
			this.clear_guess();
			return;
		}
		this.applied_seq = seq;
		this.commit(text, reason);
	}

	clear_guess(){
		this.partial_text = "";
		this.draw_caption();
		this.on_guess?.("");
	}

	/** Whisper invents "Thank you." from silence, so quiet segments are never sent. see doc/notes.md#is-there-any-speech-in-here; doc/silence.md */
	worth_sending(samples){
		if (!samples.length) return false;
		const loud = this.last_loudness = this.mic.loudness(samples, this.speech_floor);
		if (loud.loud_ms >= this.min_speech_ms) return true;
		this.skipped_silent = true;
		return false;
	}

	async transcribe(samples, kind = "final"){
		const wav = this.mic.wav(samples);
		this.dump(wav, samples);
		const form = new FormData();
		form.append("file", wav, "segment.wav");
		// finals ask for segments + confidence when they will be saved; interims stay text only. see audio/Whisper/doc/raw-log.md
		form.append("response_format", kind === "final" && this.log_raw ? "verbose_json" : this.response_format);
		const req = this.req_seq, segment = kind === "final" ? this.segment_epoch - 1 : this.segment_epoch;   // read before any await
		const t_sent = performance.now();
		const url = this.whisper_url + "/inference";
		let r;
		try { r = await fetch_timeout(url, { method: "POST", body: form }, 20000); }
		catch (e){ throw new Error(`${url}: ${e?.name === "AbortError" ? "timed out after 20 s" : (e?.message || "network error")}`); }
		if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
		const body = await r.json();
		this.t_result = performance.now();   // the delay marks (ComposerMic.draw_caption) start here
		this.whisper_ms = this.t_result - t_sent;
		const reply = `connected, last reply ${(this.whisper_ms / 1000).toFixed(1)} s`;
		if (!this.heard_first_answer){ this.heard_first_answer = true; this.log_step("whisper", reply); }
		else { this.steps.whisper = reply; this.draw_diag(); this.on_step?.("whisper", reply); }   // every answer updates the line; only the first is console-logged
		// Whisper puts "\n" between its own segments; collapse them (real breaks come from real pauses).
		const text = (body.text ?? "").replace(/\s+/g, " ").trim();
		this.on_whisper?.({ kind, ms: Math.round(this.whisper_ms), text, raw: body.text ?? "", bytes: wav.size ?? 0, seconds: samples.length / (this.mic.rate?.() || 16000), req, segment, body });
		if (this.log_raw) this.log_whisper({ kind, ms: Math.round(this.whisper_ms), text, raw: body.text ?? "", bytes: wav.size ?? 0, seconds: samples.length / (this.mic.rate?.() || 16000), req, segment, body });
		return text;
	}

	/** Save the raw Whisper reply: one line in the day file through `WhisperLog.record()`, fire and forget, never throws. see audio/Whisper/doc/demo.md */
	log_whisper({ body, ...line }){
		const session = typeof this.session === "function" ? this.session() : this.session;
		try { WhisperLog.record({ ...line, body, session: session || undefined }); } catch {}
	}

	/** Debug seam: `window.$DICTATE_DUMP = true` also writes each WAV to dump_file. see doc/notes.md#debug-dump */
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
			return FsFile.append(file, { dump: {
				at: new Date().toISOString(), rate: this.mic.rate(), seconds: +loud.seconds.toFixed(3),
				peak: +loud.peak.toFixed(5), rms: +loud.rms.toFixed(5), loud_ms: loud.loud_ms,
				wav_base64: btoa(binary),
			} });
		}).catch(e => console.warn("ux/Dictate: $DICTATE_DUMP could not write:", e));
	}


	start_browser(){
		this.watchdog = setTimeout(() => {
			if (this.state === "listening" && !this.settled && !this.partial_text){
				this.log_step("mic", "browser engine heard nothing in 6s");
				this.set_error("Chrome's speech recognition has been listening for 6 seconds with no words and no error — the silent failure this was built to catch. Try again, check chrome://settings/content/microphone for this site, or use whisper instead.");
			}
		}, 6000);

		const rec = this.rec = new Recognition();
		rec.lang = this.lang;
		rec.continuous = true;
		rec.interimResults = true;
		rec.onstart = () => {
			clearTimeout(this.connect_watchdog);
			if (this.cancel_connect){ try { rec.stop(); } catch {} return; }
			this.browser_last = "";   // a new recognizer session: its results start from nothing again
			this.set_state("listening");
		};
		rec.onresult = e => this.heard_browser(e);
		// "aborted" and "no-speech" are not a stopped mic: onend restarts. see doc/notes.md#aborted-and-no-speech
		rec.onerror = e => {
			if (e.error === "aborted" || e.error === "no-speech") return console.warn("ux/Dictate: SpeechRecognition", e.error, this.stopping ? "(stopping)" : "(restarting)");
			console.error("ux/Dictate: SpeechRecognition error:", e.error); this.browser_error(e.error);
		};
		rec.onend = () => {
			if (this.stopping){ this.stopping = false; this.set_state("idle"); }
			else if (this.state === "listening" || this.state === "connecting") try { rec.start(); } catch (e){ console.warn("ux/Dictate: restart failed:", e); }
		};
		rec.start();
	}

	heard_browser(e){
		clearTimeout(this.watchdog);
		this.last_loud_at = performance.now();   // any result is activity, for the send_on_pause countdown
		floor.level(this, true);   // the browser engine has no level meter: a result is the only "loud" it can report
		let interim = "";
		for (let i = e.resultIndex; i < e.results.length; i++){
			const said = e.results[i][0].transcript.trim();
			if (!e.results[i].isFinal){ interim += " " + said; continue; }
			const fresh = this.browser_fresh(said);
			if (fresh) this.commit(fresh);
		}
		this.partial_text = this.browser_fresh(interim.trim(), true);
		this.draw_caption();
		this.on_guess?.(this.partial_text);
	}

	// Android Chrome repeats the whole phrase in every result. see doc/notes.md#android-repeats-the-phrase
	browser_fresh(said, peek = false){
		const last = this.browser_last ?? "";
		if (!peek && said) this.browser_last = said;
		if (!last || !said) return said;
		if (said.toLowerCase() === last.toLowerCase()) return "";
		if (said.toLowerCase().startsWith(last.toLowerCase())) return said.slice(last.length).trim();
		return said;
	}

	browser_error(error){
		this.log_step("mic", "browser error: " + error);
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


	commit(text, reason){
		if (!text || this.annotation(text)){ this.clear_guess(); return; }
		this.settled = this.settled ? this.settled + " " + text : text;
		(this.settled_lines ??= []).push(text);
		this.partial_text = "";
		this.draw_caption();
		const chunk_id = this.next_chunk_id();
		const chunk_at = new Date().toISOString();
		this.push_to_target(text, reason, chunk_id, chunk_at);
		this.log_prompt(text, chunk_id);
	}

	next_chunk_id(){ return globalThis.crypto?.randomUUID?.() ?? (Date.now() + "-" + Math.random().toString(36).slice(2)); }

	// Servex first, dev-server append as fallback; neither reaches a LAN client. see doc/notes.md#log_prompt
	async log_prompt(text, id){
		// No `at` sent on purpose: Servex stamps its own clock. see doc/notes.md#log_prompt-no-at
		const entry = { type: "prompt", by: "owner", text, via: "whisper", id };
		if (await post_prompt(entry, this.log_url)) return;
		try { if (!await FsFile.append(this.log_fallback_file, { at: new Date().toISOString(), ...entry })) throw new Error("append refused"); }
		catch (e) { console.warn("ux/Dictate: could not log this utterance (Servex down, dev-server fallback also failed):", e); }
	}

	async log_revision(text, level, re){
		const entry = { chat: { at: new Date().toISOString(), from: { kind: "assistant", id: "revise" }, via: "voice", text, re, level } };
		if (await post_prompt(entry, this.log_url)) return;
		try { if (!await FsFile.append(this.log_fallback_file, { at: new Date().toISOString(), ...entry })) throw new Error("append refused"); }
		catch (e) { console.warn("ux/Dictate: could not log this revision (Servex down, dev-server fallback also failed):", e); }
	}

	/** Annotations like *shriek* or [BLANK_AUDIO] are never speech: a rule about shape, not a phrase list. see doc/notes.md#annotations */
	annotation(text){ return /^[\s*([♪_-]*[^\w]*$|^([*([♪])[\s\S]*[*)\]♪]$/.test(text); }

	push_to_target(chunk, reason, chunk_id, chunk_at){
		const $in = this.mode !== "open" && this.input();
		if ($in){
			const joiner = $in.el.value && !/\s$/.test($in.el.value) ? " " : "";
			$in.el.value += joiner + chunk;
			$in.el.dispatchEvent(new Event("input", { bubbles: true }));
		}
		this.on_text?.(chunk, reason);
		this.revise_chunk(chunk, chunk_id, chunk_at);
	}

	// `revise` option and revise_chunk(). see doc/notes.md#revise
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

	// Variants override build_output() and draw_caption() only; see doc/variants.md
	build_output(){ this.$caption = div.c("ux-dictate-caption muted"); }

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

	/** Demo only: feeds sentences into the transcript, no mic, no whisper, nothing logged. see doc/notes.md#sample */
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

// Off-localhost the page origin proxies to whisper-server. see doc/notes.md#whisper-url
function default_whisper_url(){
	const h = globalThis.location?.hostname;
	const local = h === "localhost" || h === "127.0.0.1" || h?.endsWith(".localhost");
	return local || !globalThis.location ? "http://127.0.0.1:8178" : globalThis.location.origin + "/whisper";
}

floor.post = (state, owner) => post_prompt({ type: "floor", state }, owner?.log_url);

Dictate.prototype.whisper_url = default_whisper_url();
Dictate.prototype.log_raw = true;   // save every raw Whisper reply (finals with segments) to the WhisperLog day file: audio/Whisper/doc/demo.md
Dictate.prototype.log_url = servex_url("/log/prompts");       // Servex's single-writer log — not always up yet
Dictate.prototype.log_fallback_file = "framework/ai/prompts.jsonl";    // dev-server rpc:append fallback, relative under public/
Dictate.prototype.lang = "en-US";
Dictate.prototype.response_format = "json";   // text only. "verbose_json" adds segments, word probabilities, no_speech_prob but costs ~70 ms per 8 s of audio (measured 2026-10-16): WhisperLog.attach() switches one mic to it
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

/** `dictate($input, opts)`: the drop-in shape of ext/Ask/mic.js's `mic()`. */
export function dictate($input, opts = {}){ return new Dictate({ $input, ...opts }); }
