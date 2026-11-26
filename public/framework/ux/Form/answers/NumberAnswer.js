import Answer from "../Answer.js";
import { div, input, button } from "../../../core/View/View.js";

// T14: a number field with − and + buttons. Options: min, max, step, start (where + begins from empty). Stored: a number · null.
export default class NumberAnswer extends Answer {
	static type = "T14";
	static title = "Number";
	static shape = "number · null";
	static native = '<input type=number inputmode=numeric> + − / + buttons';
	static use = "a count or age";
	static example = { label: "How many people?", min: 1, max: 20, start: 1 };

	coerce(v){
		if (v === null || v === undefined || v === "") return null;
		const n = Number(v);
		return Number.isFinite(n) ? n : null;
	}

	render(){
		div.c("fm-number", () => {
			button.c("fm-step", "−").attr("type", "button").attr("aria-label", "less").click(() => this.nudge(-1));
			this.field_of(input().attr("type", "number").attr("inputmode", "numeric")
				.attr("min", this.min).attr("max", this.max).attr("step", this.step));
			button.c("fm-step", "+").attr("type", "button").attr("aria-label", "more").click(() => this.nudge(1));
		});
	}

	nudge(dir){
		const by = Number(this.step) || 1;
		let n = this.value === null ? (this.start ?? this.min ?? 0) : this.value + dir * by;
		if (this.min !== undefined) n = Math.max(this.min, n);
		if (this.max !== undefined) n = Math.min(this.max, n);
		this.value = n;
	}
}
