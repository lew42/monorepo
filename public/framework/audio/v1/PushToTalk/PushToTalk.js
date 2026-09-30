import { View, button } from "../../../core/View/View.js";
import track from "../../../core/track/track.js";
import Part from "../../Part.js";

View.stylesheet(import.meta, "PushToTalk.css");

/**
 * class PushToTalk extends Part — DEPRECATED (2026-09-30): hold-to-talk is
 * now `mode: "hold"` on `MicStream` itself (`mic.press()`/`mic.release()`),
 * drawn by `MicStream.Controls`. This class never duplicated any mic-opening
 * logic — it only called `mic.start()`/`mic.stop()` on whatever `MicStream`
 * it was given — so it is unchanged, kept only for the v1 demo pages
 * (`/framework/audio/v1/`). It still holds a button (or a key) to open a
 * `MicStream`; release to close it. Emits `on_start(stream)` / `on_stop()` so
 * a caller can wire a listener panel or a `Recorder` without this class
 * knowing either exists.
 *
 *   const ptt = new PushToTalk({ key: " " });   // spacebar
 *   ptt.press(mic);      // opens `mic`, fires on_start(mic.stream)
 *   ptt.release();        // closes it, fires on_stop()
 */
export default class PushToTalk extends Part {

	active = false;
	key = " ";

	async press(mic){
		if (this.active) return;
		this.active = true;
		this.mic = mic;
		this.on_change?.();
		try {
			await mic.start();
			if (!this.active){ mic.stop(); return; }   // released while opening
			this.on_start?.(mic.stream);
		} catch (e){
			this.active = false;
			this.on_change?.();
			this.on_error?.(e);
		}
	}

	release(){
		if (!this.active) return;
		this.active = false;
		this.mic?.stop();
		this.on_stop?.();
		this.on_change?.();
	}
}

track(PushToTalk);

PushToTalk.View = class extends View {
	render(){
		this.ac("audio-ptt");
		this.$btn = button.c("audio-ptt-btn", "Hold to talk")
			.attr("title", `Hold, or press and hold "${this.subject.key === " " ? "Space" : this.subject.key}"`)
			.on("pointerdown", e => { e.preventDefault(); this.press(); })
			.on("pointerup", () => this.subject.release())
			.on("pointerleave", () => this.subject.release());

		this.keydown = e => {
			if (e.key !== this.subject.key || e.repeat) return;
			e.preventDefault(); this.press();
		};
		this.keyup = e => { if (e.key === this.subject.key) this.subject.release(); };
		document.addEventListener("keydown", this.keydown);
		document.addEventListener("keyup", this.keyup);

		this.subject.on_change = () => this.draw();
		this.draw();
	}

	press(){ this.mic ??= this.mic_factory?.(); if (this.mic) this.subject.press(this.mic); }

	draw(){
		this.$btn.rc("on").ac(this.subject.active ? "on" : "");
		this.$btn.text(this.subject.active ? "● Talking…" : "Hold to talk");
	}
};

export { PushToTalk };
