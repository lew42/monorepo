import Answer from "../Answer.js";
import { span } from "../../../core/View/View.js";

// T13: one to five stars. The lit run is pure CSS (:has), so there is no paint code. Stored: int 1..5.
export default class Stars extends Answer {
	static type = "T13";
	static title = "Stars";
	static shape = "int 1..5 · null";
	static native = "<input type=radio> ×5 styled as stars";
	static use = "familiar 1–5 rating";
	static options = [1, 2, 3, 4, 5];
	static example = { label: "Rate it" };

	coerce(v){ return v === null || v === undefined || v === "" ? null : Number(v); }

	render(){
		this.one_of(this.choices, "fm-stars");
	}

	face(val){
		span.c("fm-star", "★");
		span.c("fm-vh", val + (val === 1 ? " star" : " stars"));
	}
}
