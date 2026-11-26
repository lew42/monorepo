import Answer from "../Answer.js";
import { div, span } from "../../../core/View/View.js";

// T12: 0–10 (the recommendation score), eleven buttons that wrap to two rows on a phone. Stored: int 0..10.
export default class Likelihood extends Answer {
	static type = "T12";
	static title = "0–10 likelihood";
	static shape = "int 0..10 · null";
	static native = "<input type=radio> ×11";
	static use = "recommendation score";
	static options = Array.from({ length: 11 }, (_, i) => [i, String(i)]);
	static words = ["Not at all likely", "Extremely likely"];
	static example = { label: "Would you recommend it?" };

	coerce(v){ return v === null || v === undefined || v === "" ? null : Number(v); }

	render(){
		this.one_of(this.choices, "fm-seg fm-wrap");
		div.c("fm-ends fm-two", () => {
			span.c("fm-lo", (this.words ?? this.constructor.words)[0]);
			span.c("fm-hi", (this.words ?? this.constructor.words)[1]);
		});
	}
}
