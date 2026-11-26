import Answer from "../Answer.js";
import { div, span, button } from "../../../core/View/View.js";

const MINUS = "−";
const FACES = { "-3": "🤮", "-2": "😖", "-1": "🙁", "0": "😐", "1": "🙂", "2": "😄", "3": "🤩" };
const signed = v => v > 0 ? "+" + v : v < 0 ? MINUS + Math.abs(v) : "0";

/**
 * T09, the signature scale: -3 … +3, 0 is typical. Its look is two options, so the owner's pick is a one-line swap:
 *   markers: "numbers" | "faces" | "icons" | "bars"   (one method each below: numbers(v), faces(v), icons(v), bars(v))
 *   input:   "buttons" | "slider"                      (slider = native <input type=range>; `step: 0.5` allowed)
 *   skip:    true | false                              (a Skip control that stores "skip")
 *   words:   ["(awful)", "(average)", "(amazing)"]     (the line under -3, 0 and +3)
 * Three states, never confused: null (not answered), 0 (neutral), "skip" (declined).
 */
export default class Scale7 extends Answer {
	static type = "T09";
	static title = "Seven-point scale −3 … +3";
	static shape = 'int -3..3 (a slider with step 0.5 stores a number) · "skip" · null';
	static native = "<input type=radio> ×7, or <input type=range min=-3 max=3>";
	static use = "symmetric, 0 is typical";
	static markers = "numbers";
	static input = "buttons";
	static skip = true;
	static words = ["(awful)", "(average)", "(amazing)"];
	static example = { label: "How was the intro?" };

	get look(){ return this.markers ?? this.constructor.markers; }
	get kind(){ return this.input ?? this.constructor.input; }
	get can_skip(){ return this.skip ?? this.constructor.skip; }
	get ends(){ return this.words ?? this.constructor.words; }
	get stride(){ return this.step ?? 1; }

	coerce(v){
		if (v === "skip") return "skip";
		if (v === null || v === undefined || v === "") return null;
		const n = Number(v);
		return Number.isFinite(n) ? n : null;
	}

	render(){
		if (this.kind === "slider"){
			this.range_of({ min: -3, max: 3, step: this.stride, ticks: true, fmt: v => this.reading(v) });
		} else {
			this.one_of([-3, -2, -1, 0, 1, 2, 3].map(v => [v, signed(v)]), "fm-seg fm-scale fm-" + this.look);
		}
		div.c("fm-ends", () => {
			span.c("fm-lo", this.ends[0]);
			span.c("fm-mid", this.ends[1]);
			span.c("fm-hi", this.ends[2]);
		});
		if (this.can_skip){
			this.skipper = button.c("fm-skip", "Skip").attr("type", "button");
			this.skipper.click(() => { this.value = this.value === "skip" ? null : "skip"; });
		}
	}

	// A button's content is its marker; the marker set is chosen by `markers`.
	face(val){
		(this[this.look] ?? this.numbers).call(this, val);
	}

	numbers(v){ span.c("fm-num", signed(v)); }

	faces(v){
		span.c("fm-face", FACES[v]);
		span.c("fm-vh", signed(v));
	}

	// The same thumb at growing size, flipped for bad: the size says how strong, the flip which way.
	icons(v){
		span.c("fm-icon" + (v < 0 ? " fm-flip" : ""), v === 0 ? "•" : "👍").style("--k", Math.abs(v));
		span.c("fm-vh", signed(v));
	}

	// Diverging bars, red below zero and green above, height doubling with each step away from 0.
	bars(v){
		const h = v === 0 ? 3 : 6 * 2 ** (Math.abs(v) - 1);
		span.c("fm-bar " + (v < 0 ? "fm-bad" : v > 0 ? "fm-good" : "fm-mid-bar")).style("--h", h + "px");
		span.c("fm-vh", signed(v));
	}

	reading(v){
		const face = this.look === "faces" ? FACES[Math.round(v)] : null;
		return (face ? face + " " : "") + signed(v);
	}

	sync(){
		super.sync();
		this.sync_range();
		if (this.skipper){
			const on = this.value === "skip";
			if (on) this.skipper.ac("on"); else this.skipper.rc("on");
			this.skipper.attr("aria-pressed", String(on));
		}
	}
}
