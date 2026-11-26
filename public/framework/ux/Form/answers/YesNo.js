import Answer from "../Answer.js";

// T01: two radios. Stored: true | false.
export default class YesNo extends Answer {
	static type = "T01";
	static title = "Yes / No";
	static shape = "true | false";
	static native = "<input type=radio> ×2";
	static use = "one binary fact";
	static example = { label: "Did the video load?" };

	render(){
		this.one_of([[true, "Yes"], [false, "No"]], "fm-seg");
	}
}
