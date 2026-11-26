import Answer from "../Answer.js";

// T07: Never … Always as a segmented row. Stored: int 0..4.
export default class Frequency extends Answer {
	static type = "T07";
	static title = "Frequency";
	static shape = "int 0..4 (0 Never … 4 Always) · null";
	static native = "<input type=radio> group, segmented";
	static use = "Never · Rarely · Sometimes · Often · Always";
	static options = [[0, "Never"], [1, "Rarely"], [2, "Sometimes"], [3, "Often"], [4, "Always"]];
	static example = { label: "How often do you cook?" };

	coerce(v){ return v === null || v === undefined || v === "" ? null : Number(v); }

	render(){
		this.one_of(this.choices, "fm-seg fm-words");
	}
}
