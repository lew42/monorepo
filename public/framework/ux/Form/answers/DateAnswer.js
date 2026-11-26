import Answer from "../Answer.js";
import { input } from "../../../core/View/View.js";

// T15: the phone's own date picker. Stored: "2026-12-03" · null. Options: min, max (same format).
export default class DateAnswer extends Answer {
	static type = "T15";
	static title = "Date";
	static shape = '"YYYY-MM-DD" · null';
	static native = "<input type=date>";
	static use = "birthdays, deadlines";
	static example = { label: "Pick a day" };

	render(){
		this.field_of(input().attr("type", "date").attr("min", this.min).attr("max", this.max));
	}
}
