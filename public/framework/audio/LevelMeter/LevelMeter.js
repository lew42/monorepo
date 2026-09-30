import { View, div } from "../../core/View/View.js";
import track from "../../core/track/track.js";
import Part from "../Part.js";

View.stylesheet(import.meta, "LevelMeter.css");

/**
 * class LevelMeter extends Part — a live level bar for any `MicStream`. It
 * does not open a microphone itself; hand it one that is already running (or
 * about to be):
 *
 *   const mic = new MicStream();
 *   const meter = new LevelMeter().watch(mic);
 *   await mic.start();
 *   meter.view          // a bar that moves with mic.on_level()
 */
export default class LevelMeter extends Part {

	level = 0;

	/** Start reading `mic`'s level. Calling this again with a different
	 *  `MicStream` re-points the bar without building a new one. */
	watch(mic){
		this.unsub?.();
		this.mic = mic;
		this.unsub = mic.on_level(level => {
			this.level = level;
			this.on_change?.(level);
		});
		return this;
	}

	stop_watching(){ this.unsub?.(); this.unsub = null; this.mic = null; }
}

track(LevelMeter);

LevelMeter.View = class extends View {
	render(){
		this.ac("audio-levelmeter");
		this.$bar = div.c("audio-levelmeter-bar");
		this.$bar.style("--level", this.subject.level.toFixed(3));
		this.subject.on_change = level => this.$bar.style("--level", level.toFixed(3));
	}
};

export { LevelMeter };
