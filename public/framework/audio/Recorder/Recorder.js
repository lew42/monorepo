import { View, div, button, audio } from "../../core/View/View.js";
import track from "../../core/track/track.js";
import Part, { PartView } from "../Part.js";

View.stylesheet(import.meta, "Recorder.css");

/**
 * class Recorder extends Part — record, play back, save (download) one clip.
 * `MediaRecorder` is the whole engine (the brief's own call: "MediaRecorder is
 * fine") — this only remembers the state (`idle` → `recording` → `recorded`)
 * and turns the finished chunks into a downloadable file.
 *
 *   const rec = new Recorder();
 *   rec.start(mic_stream.stream);   // any live MediaStream — MicStream's, or getUserMedia's own
 *   rec.stop();                      // → rec.state === "recorded", rec.url is a playable blob: url
 *   rec.save("take-1.webm");
 */
export default class Recorder extends Part {

	state = "idle";   // idle | recording | recorded

	start(stream){
		this.chunks = [];
		this.started_at = performance.now();
		this.seconds = 0;
		this.recorder = new MediaRecorder(stream);
		this.recorder.ondataavailable = e => { if (e.data.size) this.chunks.push(e.data); };
		this.recorder.onstop = () => {
			if (this.url) URL.revokeObjectURL(this.url);
			this.blob = new Blob(this.chunks, { type: this.recorder.mimeType || "audio/webm" });
			this.url = URL.createObjectURL(this.blob);
			this.seconds = (performance.now() - this.started_at) / 1000;
			this.state = "recorded";
			this.on_change?.();
		};
		this.recorder.start();
		this.state = "recording";
		this.on_change?.();
	}

	stop(){
		if (this.state !== "recording") return;
		this.recorder.stop();
	}

	/** Downloads the clip — an `<a download>` click, never a server round trip;
	 *  the whole recording only ever lived in this tab. */
	save(name = "recording.webm"){
		if (!this.url) return;
		const $a = document.createElement("a");
		$a.href = this.url; $a.download = name;
		document.body.append($a); $a.click(); $a.remove();
	}
}

track(Recorder);

/** The interactive controls — Record/Stop/Save + a player. Not `Recorder.View`:
 *  the owner's "every class ships a view of its live state" rule (2026-09-29)
 *  wants `Klass.View` to be the icon/row/panel STATE view (below), so this
 *  keeps its own name and a caller wires both side by side (see any `page.js`
 *  in this folder, or `sound-recorder/page.js`). */
Recorder.Controls = class extends View {
	render(){
		this.ac("audio-recorder flex v gap");
		div.c("flex gap v-center", () => {
			this.$rec = button.c("audio-recorder-btn", "● Record").click(async () => {
				if (this.on_record) return this.on_record();
				// Standalone fallback — no MicStream/MicPicker wired in: open a plain
				// mic with getUserMedia so `Recorder` alone is still a working demo.
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				this.subject.start(stream);
				this.subject.recorder.addEventListener("stop", () => stream.getTracks().forEach(t => t.stop()), { once: true });
			});
			this.$stop = button("■ Stop").click(() => this.subject.stop());
			this.$save = button("↓ Save").click(() => this.subject.save());
		}).style("--gap", "0.4em");
		this.$player = audio().attr("controls", "");
		this.$player.el.hidden = true;
		// Chain, never replace — a `Recorder.View` (the state view) may already
		// be wired to the same `on_change`, in either order.
		const prior = this.subject.on_change;
		this.subject.on_change = () => { prior?.(); this.draw(); };
		this.draw();
	}

	draw(){
		const s = this.subject.state;
		this.$rec.el.disabled = s === "recording";
		this.$stop.el.disabled = s !== "recording";
		this.$save.el.disabled = s !== "recorded";
		this.$rec.rc("on").ac(s === "recording" ? "on" : "");
		if (s === "recorded" && this.subject.url){
			this.$player.el.src = this.subject.url;
			this.$player.el.hidden = false;
		}
	}
};

/** The state view: idle/recording/recorded, a running "recording" flag, the
 *  clip length once there is one, and (panel size) the chunk count and blob
 *  size from `PartView`'s generic property fallback. */
Recorder.View = class extends PartView {
	glyph(){ return "fiber_manual_record"; }
	label(){ return "Recorder — " + this.subject.state; }
	stat(){ return this.subject.state === "recorded" ? this.subject.seconds.toFixed(1) + "s" : ""; }
	flags(){ return [["recording", this.subject.state === "recording"]]; }

	render(){
		super.render();
		const prior = this.subject.on_change;
		this.subject.on_change = () => { prior?.(); this.refresh(); };
	}
};

export { Recorder };
