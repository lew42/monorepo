import Answer from "../Answer.js";
import { input } from "../../../core/View/View.js";

// T16: a time, or with `mode: "datetime"` a date and time. Stored: "18:30" or "2026-12-03T18:30" · null.
export default class TimeAnswer extends Answer {
	static type = "T16";
	static title = "Time / date and time";
	static shape = '"HH:MM" (mode "datetime": "YYYY-MM-DDTHH:MM") · null';
	static native = "<input type=time> · <input type=datetime-local>";
	static use = "scheduling";
	static example = { label: "Start time" };

	render(){
		this.field_of(input().attr("type", this.mode === "datetime" ? "datetime-local" : "time"));
	}
}
