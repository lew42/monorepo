import ChooseMany from "./ChooseMany.js";

// T06: the same checkboxes, drawn as round chips. Stored like ChooseMany: ["space","ai"].
export default class Chips extends ChooseMany {
	static type = "T06";
	static title = "Chips";
	static native = "<input type=checkbox> styled as chips";
	static use = "quick multi-select of short tags";
	static look = "fm-chips";
	static example = { label: "Pick topics", options: [["space", "Space"], ["ai", "AI"], ["food", "Food"], ["music", "Music"], ["film", "Film"], ["code", "Code"], ["travel", "Travel"]] };
}
