import Answer from "../Answer.js";

// T05: a checkbox group. Stored: the ticked option values, in option order, e.g. ["music","code"]; [] when none.
export default class ChooseMany extends Answer {
	static type = "T05";
	static title = "Choose many";
	static shape = "array of option values · []";
	static native = "<input type=checkbox> group";
	static use = "several can be true";
	static initial = [];
	static look = "fm-list";   // Chips changes only this
	static example = { label: "What do you want more of?", options: [["music", "Music"], ["code", "Code"], ["talks", "Talks"], ["games", "Games"]] };

	coerce(v){ return Array.isArray(v) ? [...v] : []; }

	render(){
		this.many_of(this.choices, this.constructor.look);
	}
}
