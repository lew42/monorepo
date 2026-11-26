import Answer from "../Answer.js";
import { textarea } from "../../../core/View/View.js";

// T18: open feedback that a cheap AI model tags later. Stored: the string · null. The tags
// ({sentiment, themes}) are made by the reader of the answers and kept beside it, not in the control.
export default class LongText extends Answer {
	static type = "T18";
	static title = "Long text, AI-read";
	static shape = "string · null (AI tags are added later, beside it)";
	static native = "<textarea>";
	static use = "open feedback; a cheap model tags it";
	static example = { label: "What would you change?" };

	render(){
		this.field_of(textarea().attr("rows", this.rows ?? 4).attr("maxlength", this.maxlength ?? 1000).attr("placeholder", this.placeholder));
	}
}
