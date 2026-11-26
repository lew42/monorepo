import Answer from "../Answer.js";
import { select, option } from "../../../core/View/View.js";

// T04: a native <select>. Stored: the chosen option's value, e.g. "US" · null.
export default class Dropdown extends Answer {
	static type = "T04";
	static title = "Choose one (dropdown)";
	static shape = "string, the option value · null";
	static native = "<select>";
	static use = "6+ options, or a known long list";
	static example = { label: "Country", options: [["US", "United States"], ["CA", "Canada"], ["GB", "United Kingdom"], ["DE", "Germany"], ["FR", "France"], ["JP", "Japan"], ["BR", "Brazil"]] };

	render(){
		this.field_of(select(() => {
			option().attr("value", "").text(this.placeholder ?? "Choose…");
			this.choices.forEach(([val, text]) => option().attr("value", String(val)).text(text));
		}));
	}
}
