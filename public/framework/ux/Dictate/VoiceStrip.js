import { View, div, span } from "../../core/View/View.js";
import Dictate from "./Dictate.js";
import Connection from "./Connection.js";
import ErrorLog from "../../ext/ErrorLog/ErrorLog.js";

View.stylesheet(import.meta, "VoiceStrip.css");

/**
 * class VoiceStrip — the compact dictation panel: a mic, the steps a spoken sentence passes through,
 * and the still-moving guess, in a block whose size never changes while words arrive.
 *
 *   new VoiceStrip({ $input: () => this.$box, template: "full", toolbar: () => button("Refine") });
 *
 * It composes three things that already existed and adds only the glue between them:
 *   - `Dictate`    the mic engine (unchanged; its own info block is hidden here),
 *   - `Connection` the Mic → Level → Whisper → Transcript → Refine row (`template: "full"`),
 *   - a one-line plain status (`template: "compact"`) saying the same thing in one sentence.
 * Options: `$input` (where words land), `template`, `toolbar` (a function drawing extra buttons
 * beside the mic), `refine` (true to show the Refine step), and the Dictate callbacks `on_text`,
 * `on_error`, `on_step`, `on_meter`, `on_guess`, which are called after the strip has used them.
 * Class architecture: `doc/voice-architecture.md`.
 */
export default class VoiceStrip extends View {

	render(){
		this.ac("voice-strip").attr("data-template", this.template ?? "full");
		this.conn = new Connection({ whisper_url: Dictate.prototype.whisper_url,
			steps: this.refine ? Connection.steps : Connection.steps.filter(s => s.id !== "refine") });
		this.$say = span.c("voice-strip-say muted");
		div.c("voice-strip-bar", () => {
			this.dictate = new Dictate({
				$input: this.$input,
				mode: this.mode,
				on_error: e => { if (this.conn.state.mic.state !== "bad") this.conn.set("mic", "bad", "error: " + String(e?.message ?? e).slice(0, 90)); this.said(); ErrorLog.report(e, { where: "VoiceStrip.mic" }); this.on_error?.(e); },
				on_step: (stage, detail) => { this.step(stage, detail); this.on_step?.(stage, detail); },
				on_meter: level => { this.conn.level(level); this.on_meter?.(level); },
				on_guess: text => { this.$guess.text(text); this.on_guess?.(text); },
				on_whisper: line => this.on_whisper?.(line),
				on_text: text => { this.conn.set("transcript", "ok", this.words() + " words"); this.said(); this.on_text?.(text); },
			});
			this.toolbar?.();
		});
		this.$guess = div.c("voice-strip-guess muted");
		this.conn.check_whisper().then(up => { this.said(); if (!up) this.recover(); });
		this.said();
	}

	/** Dictate's short reasons, in words a reader can act on. */
	static plain(reason){
		return { "insecure context": "this address is not https or localhost, so the browser hides the mic (doc/https-lan.md)",
			"permission denied": "the browser has the mic blocked for this site" }[reason] ?? reason;
	}

	/** Words now in the target box (0 when there is none, e.g. a caller using `on_text` only). */
	words(){
		const box = typeof this.$input === "function" ? this.$input() : this.$input;
		const text = (box?.el?.value ?? "") + " " + (this.dictate?.partial_text ?? "");
		return (text.match(/\S+/g) ?? []).length;
	}

	/** One of Dictate's steps changed: turn its words into the connection row's plain ones. */
	step(stage, detail){
		const bad = /^(refused|timed out)|stopped answering|not reachable/.test(detail);
		if (stage === "mic"){
			if (detail === "on, level ok") this.conn.set("level", "ok", "");
			else if (detail === "ok"){ this.conn.set("mic", "ok", "on").set("level", "wait", ""); this.watch_restarts(); }
			else this.conn.set("mic", bad ? "bad" : "wait", bad ? "error: " + VoiceStrip.plain(detail.replace(/^refused: /, "")) : detail);
		} else if (stage === "whisper" && /^(connected, last reply|stopped answering)/.test(detail)){
			this.conn.set("whisper", bad ? "bad" : "ok", bad ? "error: " + detail : detail);
		}
		if (bad && /whisper|answering/i.test(stage + " " + detail)) this.recover();
		this.said();
	}

	/** While the mic is on, look every 5 s whether Servex had to restart Whisper, so a restart in the middle of a sentence is said on the status line.
	 *  The mic being open is the only time it asks; a stream from Servex would be the alternative (`doc/try-it.md`, "Whisper restart"). */
	watch_restarts(){
		clearInterval(this.watching);
		const look = async () => {
			if (!["listening", "connecting"].includes(this.dictate?.state)) return clearInterval(this.watching);
			const line = await Connection.restart_line();
			if (line !== this.conn.note){ this.conn.note = line; this.said(); }
		};
		look();
		this.watching = setInterval(look, 5000);
	}

	/** Whisper is down: ask again every 2 s until it answers (2 minutes at most), so the status line follows Servex's restart (about 25 s: the model reloads).
	 *  A short wait only while it is broken; healthy Whisper is never polled (`doc/try-it.md`). */
	recover(){
		if (this.recovering) return;
		this.recovering = true;
		const t0 = Date.now();
		const tick = async () => {
			const up = await this.conn.check_whisper();
			if (up && this.conn.state.mic.state === "bad") this.conn.set("mic", "idle", "");
			this.said();
			if (up || Date.now() - t0 > 120000){ this.recovering = false; return; }
			setTimeout(tick, 2000);
		};
		setTimeout(tick, 2000);
	}

	/** The one-sentence status, the same facts the row shows: the first red step wins. */
	said(){
		const s = this.conn.state;
		const bad = ["mic", "whisper", "refine"].find(id => s[id]?.state === "bad");
		const note = this.conn.note, whisper = bad === "whisper" || (bad === "mic" && /whisper|answering/i.test(s.mic.why));
		const text = whisper && note ? note + "."
			: bad === "mic" ? "The microphone could not start: " + s.mic.why.replace(/^error: /, "")
			: bad ? `${bad[0].toUpperCase() + bad.slice(1)} has a problem: ${s[bad].why.replace(/^error: /, "")}`
			: s.mic.state === "ok" ? "Listening." + (note ? " " + note + "." : "") : s.whisper.state === "ok" ? "Ready. Press the mic." + (note ? " " + note + "." : "") : "Checking Whisper…";
		this.$say.text(text);
	}
}
