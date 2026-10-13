import { View, div, span } from "../../core/View/View.js";

View.stylesheet(import.meta, "MicIndicator.css");

/** The one "the mic is open" indicator: a red dot, the word "listening" and a level bar. Every mic
 *  surface shows this same class (chat composer in the sheet and the drawer, the floating mic); the
 *  `compact` variant is the dot alone, for a collapsed tab or button. State is global, set by
 *  `Dictate.js` (`set_open`, `set_level`), so any instance anywhere follows it. Doc: doc/surfaces.md. */
export default class MicIndicator extends View {
	static open = false;
	static level = 0;
	static views = new Set();

	static set_open(open){
		if (open === this.open) return;
		this.open = open;
		if (!open) this.level = 0;
		this.views.forEach(v => v.sync());
	}

	static set_level(level){
		this.level = level;
		this.views.forEach(v => v.paint());
	}

	render(){
		this.ac("ux-dictate-mic-indicator" + (this.compact ? " compact" : ""));
		this.attr("role", "status").attr("aria-label", "Microphone open — listening");
		div.c("ux-dictate-mic-indicator-dot");
		if (!this.compact){
			span.c("ux-dictate-mic-indicator-label", "listening");
			div.c("ux-dictate-mic-indicator-bar", () => { this.$fill = div.c("ux-dictate-mic-indicator-fill"); });
		}
		MicIndicator.views.add(this);
		this.sync();
	}

	sync(){
		if (!this.el.isConnected && this.seen){ MicIndicator.views.delete(this); return; }
		if (this.el.isConnected) this.seen = true;
		this.el.classList.toggle("open", MicIndicator.open);
		this.paint();
	}

	paint(){
		this.$fill?.style("--ux-dictate-mic-level", Math.min(1, MicIndicator.level).toFixed(3));
	}
}
