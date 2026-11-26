import Answer from "../Answer.js";

// T08: Strongly disagree … Strongly agree as a segmented row. Stored: int -2..2 (0 is neutral).
export default class Agreement extends Answer {
	static type = "T08";
	static title = "Agreement";
	static shape = "int -2..2 · null";
	static native = "<input type=radio> group, segmented";
	static use = "Strongly disagree … Strongly agree";
	static options = [[-2, "Strongly disagree"], [-1, "Disagree"], [0, "Neutral"], [1, "Agree"], [2, "Strongly agree"]];
	static example = { label: "“This was worth my time”" };

	coerce(v){ return v === null || v === undefined || v === "" ? null : Number(v); }

	render(){
		this.one_of(this.choices, "fm-seg fm-words");
	}
}
