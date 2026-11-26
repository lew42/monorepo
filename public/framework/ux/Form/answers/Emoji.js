import Answer from "../Answer.js";
import { span } from "../../../core/View/View.js";

// T20: one emoji reaction. Stored: the emoji itself, e.g. "😮".
export default class Emoji extends Answer {
	static type = "T20";
	static title = "Emoji reaction";
	static shape = "string, one emoji · null";
	static native = "<input type=radio> group of emoji";
	static use = "instant mood, on video";
	static options = ["😍", "😄", "😮", "😐", "😢", "😡"];
	static example = { label: "How do you feel right now?" };

	render(){
		this.one_of(this.choices, "fm-seg fm-emojis");
	}

	face(val){
		span.c("fm-emoji", val);
	}
}
