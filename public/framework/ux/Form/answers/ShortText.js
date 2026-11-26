import Answer from "../Answer.js";
import { input } from "../../../core/View/View.js";

// T17: one line of text. Stored: the string · null when empty. Options: maxlength, autocomplete, placeholder.
export default class ShortText extends Answer {
	static type = "T17";
	static title = "Short text";
	static shape = "string · null";
	static native = "<input type=text maxlength autocomplete>";
	static use = "names, one-word answers";
	static example = { label: "One word for it", placeholder: "calm" };

	render(){
		this.field_of(input().attr("type", "text").attr("maxlength", this.maxlength ?? 80)
			.attr("autocomplete", this.autocomplete ?? "off").attr("placeholder", this.placeholder));
	}
}
