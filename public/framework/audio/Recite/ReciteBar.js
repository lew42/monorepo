import { View, div, span, button, select, option, input, icon } from "../../core/View/View.js";
import Voice from "../Voice/Voice.js";

/**
 * class ReciteBar extends View — `Recite.Bar`, the one small control line:
 * read new replies by themselves (on/off), play/pause, back 10 s, restart, the progress line (or the last barge-in
 * note), the voice, and the barge-in mic with its threshold.
 *
 *   new Recite.Bar({ recite });   // or recite.bar
 */
export default class ReciteBar extends View {

	render(){
		const r = this.recite;
		this.ac("audio-recite-bar");
		this.$auto = button.c("audio-recite-btn", () => { this.$auto_icon = icon("record_voice_over"); }).attr("title", "Read new replies aloud by themselves").click(() => r.set_auto(!r.auto));
		this.$play = button.c("audio-recite-btn", () => { this.$play_icon = icon("play_arrow"); }).attr("title", "Play / pause").click(() => r.toggle());
		this.$back = button.c("audio-recite-btn", () => icon("replay_10")).attr("title", "Back 10 seconds").click(() => r.back(10));
		this.$restart = button.c("audio-recite-btn", () => icon("skip_previous")).attr("title", "From the beginning").click(() => r.restart());
		this.$track = div.c("audio-recite-track", () => {
			this.$fill = div.c("audio-recite-fill");
			this.$label = span.c("audio-recite-label", "");
		});
		this.$voice = select.c("audio-recite-voice").attr("title", "Voice").on("change", e => r.pick(e.target.value));
		this.$voice.append(() => Voice.PERSONAS.forEach(p => option(p.name).attr("value", p.name)));
		this.$voice.el.value = r.voice.name;
		this.$mic = button.c("audio-recite-btn", () => { this.$mic_icon = icon("hearing"); }).attr("title", "Pause when I talk (barge-in) — off: manual playback only").click(() => r.barge.set_on(!r.barge.on));
		this.$threshold = input.c("audio-recite-threshold").attr("type", "range").attr("min", "0.05").attr("max", "0.95").attr("step", "0.05")
			.attr("value", String(r.barge.threshold)).attr("title", "How loud counts as talking (the bar behind it is the mic level)")
			.on("input", e => r.barge.set_threshold(e.target.value));

		this.off = r.on(() => {
			if (this.el.isConnected) this.seen = true;
			else if (this.seen) return this.off();   // removed from the page: stop listening
			this.draw();
		});
		this.draw();
	}

	draw(){
		const r = this.recite, b = r.barge;
		const busy = r.state === "playing" || r.state === "loading";
		this.$play_icon.text(busy ? "pause" : "play_arrow");
		this.$play.tc("is-loading", r.state === "loading");
		this.$play.el.disabled = !r.chunks.length;
		this.$back.el.disabled = this.$restart.el.disabled = !r.chunks.length;

		const total = r.duration(), at = r.position();
		this.$fill.style("inlineSize", total ? Math.min(100, at / total * 100).toFixed(1) + "%" : "0");
		const note = r.state === "heard" || b.state === "checking" ? b.note : r.error || (r.chunks.length ? `${ReciteBar.clock(at)} / ${ReciteBar.clock(total)}${r.engine === "browser" ? " · browser voice" : ""}` : "nothing to read yet");
		this.$label.text(note);
		this.$track.attr("title", r.error || b.note || "");
		this.tc("is-heard", r.state === "heard");
		this.tc("is-error", !!r.error && r.state !== "heard");

		this.$auto_icon.text(r.auto ? "record_voice_over" : "voice_over_off");
		this.$auto.tc("is-on", r.auto);
		this.$mic_icon.text(b.on ? "hearing" : "hearing_disabled");
		this.$mic.tc("is-on", b.on).tc("is-open", !!b.mic);
		this.$threshold.tc("audio-recite-hide", !b.on);
		if (b.mic && !this.meter) this.meter = requestAnimationFrame(() => this.draw_level());
	}

	/** The mic level behind the threshold slider, once per frame while the mic is open. */
	draw_level(){
		this.meter = 0;
		const b = this.recite.barge;
		this.$threshold.style("--audio-recite-level", (b.mic ? Math.min(1, b.level) * 100 : 0).toFixed(0) + "%");
		if (b.mic && this.el.isConnected) this.meter = requestAnimationFrame(() => this.draw_level());
	}

	static clock(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
}
