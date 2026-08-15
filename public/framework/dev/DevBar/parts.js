import { div, span, h4, label, input } from "../../core/View/View.js";
import { knob } from "./settings.js";

// The rail's rendering vocabulary: a titled block, a key/value line, a checkbox.
// Its own module so a section can live in its own file without importing the array
// it belongs to — dev/DevBar's parent/child import cycle, avoided.

export function section(title, fn){
	div.c("dev-sect flex v", () => {
		h4.c("dev-sect-title", title);
		fn();
	});
}

// Returns the VALUE, which is the half anything live needs to write to.
export function row(key, value, cls){
	let $val;

	div.c("dev-row", () => {
		span.c("dev-key", key);
		$val = span.c("dev-val " + (cls || ""), value);
	});

	return $val;
}

// A checkbox bound to a class on <html>: the class IS the state, so a redraw reads
// it back rather than remembering anything. `knob()` adds surviving a reload.
export function check(text, cls){
	const on = document.documentElement.classList.contains(cls);

	label.c("dev-knob", () => {
		const $box = input().attr("type", "checkbox")
			.on("change", function(){ knob(cls, this.el.checked); });

		if (on) $box.attr("checked", true);

		span(text);
	});
}
