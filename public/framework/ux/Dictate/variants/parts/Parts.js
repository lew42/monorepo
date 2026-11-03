import Dictate from "../../Dictate.js";
import MicStream from "/framework/audio/MicStream/MicStream.js";
import Transcriber from "/framework/audio/Transcriber/index.js";

/**
 * **The audio/ parts, wired into Dictate** (2026-09-29) — the whisper half of
 * `Dictate` rebuilt on `MicStream` + `Transcriber.Whisper` (the rolling
 * local-agreement window, `audio/Transcriber/`) instead of this file's own
 * `capture.js` + cut-and-append segments. Everything ELSE is untouched and
 * inherited: `revise:`, `on_text`/`on_guess`/`on_revised`, the log post
 * (`log_prompt`/`log_revision`), the caption (`build_output`/`draw_caption`),
 * every error message, the start sound's real timing. The browser engine
 * (`SpeechRecognition`) is unchanged too — only the whisper path moves.
 *
 * **This is NOT a look-only variant** (`variants/readme.md`'s own rule is
 * "never override `start()`/`stop()` for a look-only variant" — this
 * overrides `start_whisper()`, `heartbeat()`, `stop()` and `on_level()`
 * instead, because the thing being varied here is the MICROPHONE PIPELINE,
 * not the drawing). `v1`/`Cards`/`Compact` stay the model for a look-only
 * variant; this is the model for a pipeline one.
 *
 * **What's different, and why it's better:** the base class cuts a segment
 * on a pause or a 15s cap and sends it once, whole — a forced cut lands
 * mid-word, sometimes into a hallucinated wrong word
 * (`/framework/audio/doc/decisions.md`, "Seams"). The rolling window commits
 * only the words that agree across two consecutive re-transcriptions of the
 * same growing buffer, so nothing is ever finalised from a single guess.
 * Measured against the old approach with a real monologue: 0 hallucinations
 * / 0 lost words vs. 2 hallucinations / 1 lost word
 * (`/framework/audio/doc/decisions.md`, "Rolling window").
 *
 * **Left as it was, on purpose:** this variant does not exist to REPLACE
 * `Dictate`'s default — the owner tries it here first
 * (`variants/parts/page.js`) and switches the default later if it's better
 * in practice. `v1` (today's exact behaviour) stays the default, unchanged,
 * reachable forever.
 */
export default class PartsDictate extends Dictate {

	/** `MicStream` opens the mic and keeps its own buffer; `Transcriber.Whisper`
	 *  reads it and reports only COMMITTED words as `on_final` (→ `commit()`,
	 *  same as the base class's own settled segments — same caption, same log,
	 *  same `revise:`). The still-uncommitted tail is `on_guess`/the grey
	 *  caption text, exactly like the base class's own partial resend. */
	async start_whisper(){
		const { id, label } = this.device();
		this.mic = new MicStream({ device_id: id, device_label: label });
		this.transcriber = new Transcriber.Whisper();

		this.transcriber.on_partial = text => {
			this.partial_text = text;
			this.draw_caption();
			this.on_guess?.(text);
		};
		// "agree" — this segment closed because two consecutive re-transcriptions
		// AGREED on it, never a pause or a length cap (the base class's two
		// reasons). A caller reading `reason` sees a third value here; nobody
		// existing does (`Dictate.commit()`'s own doc says additive-only).
		this.transcriber.on_final = text => this.commit(text, "agree");

		await this.mic.start();
		this.mic_unsub = this.mic.on_level(level => this.on_level(level));
		await this.transcriber.start(this.mic);
	}

	/** `MicStream.on_level()` already hands out a SMOOTHED, SCALED 0..1 number
	 *  (its own `level * 6`, capped) — the base class's `on_level()` expects a
	 *  raw, un-scaled RMS and does that smoothing itself, so calling it
	 *  unchanged here would scale twice. This writes the same CSS var
	 *  (`--ux-dictate-level`, so the button's bar still moves) directly, and
	 *  still updates `last_loud_at` for the opt-in "stop after a pause"
	 *  countdown (`check_end_pause()`, inherited unchanged). */
	on_level(level){
		this.$button.style("--ux-dictate-level", level.toFixed(3));
		this.on_meter?.(level);
		if (level > 0.05) this.last_loud_at = performance.now();
	}

	/** The base class's `heartbeat()` runs the whisper engine's whole
	 *  segment/resend clock (`close_segment()`, `partial_tick()`) — all of
	 *  that is now `Transcriber.Whisper`'s own internal ~1s timer instead, so
	 *  this only keeps the one thing that still applies to EITHER engine: the
	 *  opt-in "stop after a pause" countdown. */
	heartbeat(){
		if (this.send_on_pause) this.check_end_pause(performance.now());
	}

	/** Same shape as the base class's `stop()`, with the whisper branch's two
	 *  lines swapped for this variant's own objects — `close_segment("manual")`
	 *  (which reads `capture.js`'s buffer) has no equivalent to call here;
	 *  `transcriber.stop()` force-commits whatever is still only a guess
	 *  (`Transcriber.Whisper.stop()`'s own doc) before the mic closes. */
	async stop(){
		if (this.state === "connecting"){
			this.cancel_connect = true;
			clearTimeout(this.connect_watchdog);
			clearInterval(this.timer);
			this.hide_countdown();
			this.mic_unsub?.();
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
			this.mic_unsub?.();
			await this.transcriber?.stop();
			this.mic?.stop();
			if (this.state !== "error"){
				this.set_state("idle");
				if (!this.settled)
					this.$status.text("nothing loud enough to transcribe was heard — check the level meter moves while you talk");
			}
		} else {
			this.stop_browser();
		}
		this.on_stop?.();
	}
}
