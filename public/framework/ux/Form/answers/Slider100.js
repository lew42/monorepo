import Answer from "../Answer.js";

// T11: a continuous amount. Stored: int 0..100, null until touched.
export default class Slider100 extends Answer {
	static type = "T11";
	static title = "Slider 0–100";
	static shape = "int 0..100 · null";
	static native = "<input type=range> + <output>";
	static use = "continuous amount, percent";
	static example = { label: "How much did you understand?" };

	coerce(v){ return v === null || v === undefined || v === "" ? null : Number(v); }

	render(){
		this.range_of({ min: 0, max: 100, fmt: v => v + "%" });
	}

	sync(){
		this.sync_range();
	}
}
