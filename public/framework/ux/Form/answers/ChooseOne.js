import Answer from "../Answer.js";

// T03: a radio group, every option visible. Stored: the chosen option's value, e.g. "friend".
export default class ChooseOne extends Answer {
	static type = "T03";
	static title = "Choose one (list)";
	static shape = 'string, the option value · null';
	static native = "<input type=radio> group";
	static use = "2–5 options, all visible";
	static example = { label: "How did you find us?", options: [["friend", "A friend"], ["search", "Search"], ["video", "A video"], ["other", "Other"]] };

	render(){
		this.one_of(this.choices, "fm-list");
	}
}
