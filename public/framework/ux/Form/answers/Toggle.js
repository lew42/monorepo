import Answer from "../Answer.js";
import { input, label, span } from "../../../core/View/View.js";

// T02: one checkbox that looks like a switch. Stored: true | false (never null: a switch is always answered).
export default class Toggle extends Answer {
	static type = "T02";
	static title = "Toggle";
	static shape = "true | false";
	static native = '<input type=checkbox role=switch switch>';
	static use = "a setting that takes effect at once";
	static initial = false;
	static example = { label: "Notify me when it goes live" };

	coerce(v){ return !!v; }
	empty(){ return false; }

	render(){
		label.c("fm-switch", () => {
			this.box = input().attr("type", "checkbox").attr("role", "switch").attr("switch", "");
			this.box.on("change", () => { this.value = this.box.el.checked; });
			span.c("fm-track");
			this.state = span.c("fm-text", "Off");
		});
	}

	sync(){
		if (!this.box) return;
		this.box.el.checked = this.value;
		this.state.text(this.value ? "On" : "Off");
	}
}
